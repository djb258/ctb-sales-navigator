-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: 001_create_sales_navigator_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Hub: HUB-SALES-NAV-20260130
-- Authority: docs/ERD.md
-- CC Layer: CC-04 (Process/Execution)
-- Created: 2026-02-05
--
-- This migration creates the Sales Navigator schema as defined in the canonical ERD.
-- Tables are prefixed with 'sn_' to namespace within the shared Marketing DB.
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────────
-- TABLE: sn_prospect (CAPTURE Pass)
-- ─────────────────────────────────────────────────────────────────────────────────
-- Purpose: Stores raw prospect data ingested from CRM
-- Constant Dependency: prospect_data from CRM Intake Gateway
-- Variable Output: prospect_status
-- Lineage: raw_intake_data preserves original constant
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sn_prospect (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Core prospect data
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT NOT NULL DEFAULT 'manual',

    -- Status tracking (VARIABLE output)
    status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'qualified', 'disqualified', 'deferred')),

    -- Original CRM payload (CONSTANT - immutable after creation)
    raw_intake_data JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Hub traceability
    hub_id TEXT NOT NULL DEFAULT 'HUB-SALES-NAV-20260130'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sn_prospect_status ON sn_prospect(status);
CREATE INDEX IF NOT EXISTS idx_sn_prospect_created_at ON sn_prospect(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sn_prospect_source ON sn_prospect(source);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sn_prospect_email_unique ON sn_prospect(email) WHERE email IS NOT NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_sn_prospect_updated_at ON sn_prospect;
CREATE TRIGGER update_sn_prospect_updated_at
    BEFORE UPDATE ON sn_prospect
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE sn_prospect IS 'Sales Navigator: Prospect intake data (CAPTURE pass)';
COMMENT ON COLUMN sn_prospect.raw_intake_data IS 'CONSTANT: Original CRM payload, immutable after creation';
COMMENT ON COLUMN sn_prospect.status IS 'VARIABLE: Current qualification status';

-- ─────────────────────────────────────────────────────────────────────────────────
-- TABLE: sn_sales_process (COMPUTE Pass)
-- ─────────────────────────────────────────────────────────────────────────────────
-- Purpose: Tracks the 4-meeting sales process for each prospect
-- Constant Dependency: prospect_data via prospect table
-- Variable Output: prospect_status, sales_analytics
-- Lineage: FK to sn_prospect.id
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sn_sales_process (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- FK to prospect (lineage)
    prospect_id UUID NOT NULL REFERENCES sn_prospect(id) ON DELETE CASCADE,

    -- Process state
    current_meeting INTEGER NOT NULL DEFAULT 1 CHECK (current_meeting BETWEEN 1 AND 4),
    overall_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (overall_status IN ('pending', 'in_progress', 'completed', 'abandoned')),

    -- Timeline
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Final outcome (VARIABLE output)
    final_outcome TEXT CHECK (final_outcome IN ('qualified', 'disqualified', 'deferred')),

    -- Hub traceability
    hub_id TEXT NOT NULL DEFAULT 'HUB-SALES-NAV-20260130'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sn_sales_process_prospect_id ON sn_sales_process(prospect_id);
CREATE INDEX IF NOT EXISTS idx_sn_sales_process_status ON sn_sales_process(overall_status);
CREATE INDEX IF NOT EXISTS idx_sn_sales_process_outcome ON sn_sales_process(final_outcome) WHERE final_outcome IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sn_sales_process_one_active ON sn_sales_process(prospect_id) WHERE overall_status IN ('pending', 'in_progress');

DROP TRIGGER IF EXISTS update_sn_sales_process_updated_at ON sn_sales_process;
CREATE TRIGGER update_sn_sales_process_updated_at
    BEFORE UPDATE ON sn_sales_process
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE sn_sales_process IS 'Sales Navigator: 4-meeting sales process tracking (COMPUTE pass)';
COMMENT ON COLUMN sn_sales_process.current_meeting IS 'Current meeting number in 4-meeting sequence';
COMMENT ON COLUMN sn_sales_process.final_outcome IS 'VARIABLE: Final sales decision';

-- ─────────────────────────────────────────────────────────────────────────────────
-- TABLE: sn_meeting (COMPUTE Pass)
-- ─────────────────────────────────────────────────────────────────────────────────
-- Purpose: Individual meeting instances within the sales process
-- Constant Dependency: meeting_templates, prospect_data
-- Variable Output: meeting_outcomes
-- Lineage: FK to sn_prospect.id, sn_sales_process.id
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sn_meeting (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- FK relationships (lineage)
    prospect_id UUID NOT NULL REFERENCES sn_prospect(id) ON DELETE CASCADE,
    sales_process_id UUID NOT NULL REFERENCES sn_sales_process(id) ON DELETE CASCADE,

    -- Meeting identification
    meeting_number INTEGER NOT NULL CHECK (meeting_number BETWEEN 1 AND 4),
    meeting_type TEXT NOT NULL
        CHECK (meeting_type IN ('fact_finder', 'insurance_ed', 'systems_ed', 'financials')),

    -- Meeting state
    status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped', 'cancelled')),

    -- Timeline
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Meeting content
    notes TEXT,

    -- Hub traceability
    hub_id TEXT NOT NULL DEFAULT 'HUB-SALES-NAV-20260130',

    -- One meeting per number per process
    CONSTRAINT sn_meeting_unique_per_process UNIQUE (sales_process_id, meeting_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sn_meeting_prospect_id ON sn_meeting(prospect_id);
CREATE INDEX IF NOT EXISTS idx_sn_meeting_sales_process_id ON sn_meeting(sales_process_id);
CREATE INDEX IF NOT EXISTS idx_sn_meeting_status ON sn_meeting(status);
CREATE INDEX IF NOT EXISTS idx_sn_meeting_scheduled ON sn_meeting(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sn_meeting_type ON sn_meeting(meeting_type);

DROP TRIGGER IF EXISTS update_sn_meeting_updated_at ON sn_meeting;
CREATE TRIGGER update_sn_meeting_updated_at
    BEFORE UPDATE ON sn_meeting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE sn_meeting IS 'Sales Navigator: Individual meeting instances (COMPUTE pass)';
COMMENT ON COLUMN sn_meeting.meeting_type IS 'Meeting type: fact_finder (1), insurance_ed (2), systems_ed (3), financials (4)';

-- ─────────────────────────────────────────────────────────────────────────────────
-- TABLE: sn_meeting_outcome (GOVERN Pass)
-- ─────────────────────────────────────────────────────────────────────────────────
-- Purpose: Documented outcomes and action items from each meeting
-- Constant Dependency: meeting_templates, sales_rules
-- Variable Output: meeting_outcomes, action_items
-- Lineage: FK to sn_meeting.id
-- ─────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sn_meeting_outcome (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- FK to meeting (lineage)
    meeting_id UUID NOT NULL REFERENCES sn_meeting(id) ON DELETE CASCADE,

    -- Outcome classification (VARIABLE output)
    outcome_type TEXT NOT NULL
        CHECK (outcome_type IN ('positive', 'neutral', 'negative', 'deferred')),

    -- Outcome content
    summary TEXT NOT NULL,

    -- Structured data (VARIABLE outputs)
    action_items JSONB DEFAULT '[]'::jsonb,
    collected_data JSONB DEFAULT '{}'::jsonb,

    -- Hub traceability
    hub_id TEXT NOT NULL DEFAULT 'HUB-SALES-NAV-20260130',

    -- One outcome per meeting
    CONSTRAINT sn_meeting_outcome_unique UNIQUE (meeting_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sn_meeting_outcome_meeting_id ON sn_meeting_outcome(meeting_id);
CREATE INDEX IF NOT EXISTS idx_sn_meeting_outcome_type ON sn_meeting_outcome(outcome_type);
CREATE INDEX IF NOT EXISTS idx_sn_meeting_outcome_created ON sn_meeting_outcome(created_at DESC);

DROP TRIGGER IF EXISTS update_sn_meeting_outcome_updated_at ON sn_meeting_outcome;
CREATE TRIGGER update_sn_meeting_outcome_updated_at
    BEFORE UPDATE ON sn_meeting_outcome
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE sn_meeting_outcome IS 'Sales Navigator: Meeting outcomes and action items (GOVERN pass)';
COMMENT ON COLUMN sn_meeting_outcome.action_items IS 'VARIABLE: Array of next steps [{action, due_date, assigned_to}]';
COMMENT ON COLUMN sn_meeting_outcome.collected_data IS 'VARIABLE: Meeting-specific data collected';

-- ─────────────────────────────────────────────────────────────────────────────────
-- MIGRATION LOG ENTRY
-- ─────────────────────────────────────────────────────────────────────────────────

INSERT INTO migration_log (migration_name, step, status, details, executed_at)
VALUES (
    'sn_001_create_sales_navigator_schema',
    'complete',
    'success',
    'Created tables: sn_prospect, sn_sales_process, sn_meeting, sn_meeting_outcome for HUB-SALES-NAV-20260130',
    NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- ─────────────────────────────────────────────────────────────────────────────────

-- Run these to verify the migration succeeded:
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'sn_%';
-- SELECT * FROM migration_log WHERE hub_id = 'HUB-SALES-NAV-20260130';

-- ═══════════════════════════════════════════════════════════════════════════════
-- END MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
