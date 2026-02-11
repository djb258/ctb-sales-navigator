-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: 002_orbt_error_log.sql
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Hub: HUB-SALES-NAV-20260130
-- Authority: HEIR (heir.doctrine.yaml → orbt section)
-- Layer: ORBT — Operate, Repair, Build, Train
--
-- Creates the ORBT error log table for cross-repo observability.
-- Error layers: System, Operation, Repair, Build, Training
-- Altitude levels: 60k, 40k, 30k, 20k, 10k, 5k
--
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS shq;

-- ─────────────────────────────────────────────────────────────────────────────
-- ORBT ERROR LOG (Append-Only)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shq.orbt_error_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp_created TIMESTAMPTZ DEFAULT NOW(),

    -- Identity
    repo_name TEXT NOT NULL,
    process_id TEXT NOT NULL,
    unique_id TEXT NOT NULL,
    agent_id TEXT,
    blueprint_id TEXT,

    -- ORBT Classification
    error_layer TEXT CHECK (error_layer IN ('System', 'Operation', 'Repair', 'Build', 'Training')),
    altitude INT CHECK (altitude IN (60000, 40000, 30000, 20000, 10000, 5000)),

    -- Error Detail
    file_path TEXT,
    error_summary TEXT,
    error_detail TEXT,

    -- Resolution
    resolution_status TEXT DEFAULT 'unresolved',
    resolution_notes TEXT,
    timestamp_resolved TIMESTAMPTZ,
    resolved_by TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orbt_error_log_created ON shq.orbt_error_log (timestamp_created DESC);
CREATE INDEX IF NOT EXISTS idx_orbt_error_log_repo ON shq.orbt_error_log (repo_name);
CREATE INDEX IF NOT EXISTS idx_orbt_error_log_altitude ON shq.orbt_error_log (altitude);
CREATE INDEX IF NOT EXISTS idx_orbt_error_log_process_id ON shq.orbt_error_log (process_id);
CREATE INDEX IF NOT EXISTS idx_orbt_error_log_unique_id ON shq.orbt_error_log (unique_id);
CREATE INDEX IF NOT EXISTS idx_orbt_error_log_resolution_status ON shq.orbt_error_log (resolution_status);
CREATE INDEX IF NOT EXISTS idx_orbt_error_log_error_layer ON shq.orbt_error_log (error_layer);

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE shq.orbt_error_log IS 'ORBT: Cross-repo error log — Operate, Repair, Build, Train';
COMMENT ON COLUMN shq.orbt_error_log.error_layer IS 'ORBT layer: System | Operation | Repair | Build | Training';
COMMENT ON COLUMN shq.orbt_error_log.altitude IS 'CTB altitude: 60000 (strategic) → 5000 (execution)';
COMMENT ON COLUMN shq.orbt_error_log.process_id IS 'Format: PRC-SALES-{EPOCH_TIMESTAMP}';
COMMENT ON COLUMN shq.orbt_error_log.unique_id IS 'Format: HEIR-2026-02-SALES-{LAYER}-{SEQ}';

-- ═══════════════════════════════════════════════════════════════════════════════
-- END MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
