-- ═══════════════════════════════════════════════════════════════════════════════
-- SUB-HUB: Quotes (Meeting 4)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Canonical: sales_quotes (join anchor on sales_id)
-- Errors:   sales_quotes_errors (append-only)
-- ═══════════════════════════════════════════════════════════════════════════════

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
