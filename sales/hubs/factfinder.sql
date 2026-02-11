-- ═══════════════════════════════════════════════════════════════════════════════
-- SUB-HUB: FactFinder (Meeting 1)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Canonical: sales_factfinder (join anchor on sales_id)
-- Errors:   sales_factfinder_errors (append-only)
-- ═══════════════════════════════════════════════════════════════════════════════

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
