-- ═══════════════════════════════════════════════════════════════════════════════
-- SUB-HUB: Systems (Meeting 3)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Canonical: sales_systems (join anchor on sales_id)
-- Errors:   sales_systems_errors (append-only)
-- ═══════════════════════════════════════════════════════════════════════════════

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
