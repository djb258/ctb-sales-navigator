-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: 003_timestamp_to_timestamptz.sql
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Hub: HUB-SALES-NAV-20260130
-- Authority: column_registry.yml (canonical schema spine)
-- Purpose: Align live DB with column_registry.yml — TIMESTAMP → TIMESTAMPTZ
--
-- The column_registry.yml declares all timestamp columns as TIMESTAMPTZ.
-- Prior migrations (001) used TIMESTAMP (without timezone). This migration
-- corrects the drift. On Neon PostgreSQL this is a metadata-only change
-- (no table rewrite) when the column has no CHECK constraint on the type.
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- Spine table
ALTER TABLE sales.sales_state
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- FactFinder canonical
ALTER TABLE sales.sales_factfinder
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- FactFinder errors
ALTER TABLE sales.sales_factfinder_errors
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

-- Insurance canonical
ALTER TABLE sales.sales_insurance
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Insurance errors
ALTER TABLE sales.sales_insurance_errors
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

-- Systems canonical
ALTER TABLE sales.sales_systems
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Systems errors
ALTER TABLE sales.sales_systems_errors
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

-- Quotes canonical
ALTER TABLE sales.sales_quotes
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Quotes errors
ALTER TABLE sales.sales_quotes_errors
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

-- ═══════════════════════════════════════════════════════════════════════════════
-- END MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
