-- ═══════════════════════════════════════════════════════════════════════════════
-- HUB STATE — Phase Router
-- ═══════════════════════════════════════════════════════════════════════════════
-- Canonical table for the sales process. Join anchor for all sub-hubs.
-- current_phase gates which sub-hub is active.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE sales.sales_state (
    sales_id TEXT PRIMARY KEY,
    current_phase TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
