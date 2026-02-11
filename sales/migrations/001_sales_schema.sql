-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: 001_sales_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Hub: HUB-SALES-NAV-20260130
-- Authority: doctrine/SALES_CTB.md
-- Layer: Structural scaffold only — no business logic
--
-- Pattern: 2 tables per sub-hub (canonical + append-only errors)
-- Canonical table = join anchor (PK: sales_id)
-- Error table = append-only log (PK: id BIGSERIAL)
--
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS sales;

-- ─────────────────────────────────────────────────────────────────────────────
-- HUB STATE (phase router)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE sales.sales_state (
    sales_id TEXT PRIMARY KEY,
    current_phase TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUB-HUB 1: FactFinder
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE sales.sales_factfinder (
    sales_id TEXT PRIMARY KEY,
    employer_name TEXT,
    employee_count INT,
    renewal_month INT,
    prior_broker TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales.sales_factfinder_errors (
    id BIGSERIAL PRIMARY KEY,
    sales_id TEXT,
    error_code TEXT,
    payload JSONB,
    process_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUB-HUB 2: Insurance
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE sales.sales_insurance (
    sales_id TEXT PRIMARY KEY,
    funding_model TEXT,
    strategy_selected TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales.sales_insurance_errors (
    id BIGSERIAL PRIMARY KEY,
    sales_id TEXT,
    error_code TEXT,
    payload JSONB,
    process_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUB-HUB 3: Systems
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE sales.sales_systems (
    sales_id TEXT PRIMARY KEY,
    payroll_system TEXT,
    admin_model TEXT,
    compliance_owner TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales.sales_systems_errors (
    id BIGSERIAL PRIMARY KEY,
    sales_id TEXT,
    error_code TEXT,
    payload JSONB,
    process_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SUB-HUB 4: Quotes
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE sales.sales_quotes (
    sales_id TEXT PRIMARY KEY,
    quote_version INT,
    total_cost NUMERIC,
    approved_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales.sales_quotes_errors (
    id BIGSERIAL PRIMARY KEY,
    sales_id TEXT,
    error_code TEXT,
    payload JSONB,
    process_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- END MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
