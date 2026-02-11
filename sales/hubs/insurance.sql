-- ═══════════════════════════════════════════════════════════════════════════════
-- SUB-HUB: Insurance (Meeting 2)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Canonical: sales_insurance (join anchor on sales_id)
-- Errors:   sales_insurance_errors (append-only)
-- ═══════════════════════════════════════════════════════════════════════════════

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
