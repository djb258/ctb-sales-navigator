# Sales CTB Doctrine

**Authority**: CONSTITUTION.md
**Status**: ACTIVE
**Version**: 1.0.0

---

## Structural Pattern

Every sub-hub gets exactly **2 tables**:

| Table | Role | PK | Mutability |
|-------|------|----|------------|
| Canonical | Join anchor, current state | `sales_id TEXT` | Upsert |
| Errors | Append-only error log | `id BIGSERIAL` | Insert only |

---

## Schema: `sales`

### Hub State (phase router)

| Table | Purpose |
|-------|---------|
| `sales.sales_state` | Tracks `current_phase` per `sales_id`. Gates sub-hub access. |

### Sub-Hubs

| # | Sub-Hub | Canonical Table | Error Table |
|---|---------|-----------------|-------------|
| 1 | FactFinder | `sales.sales_factfinder` | `sales.sales_factfinder_errors` |
| 2 | Insurance | `sales.sales_insurance` | `sales.sales_insurance_errors` |
| 3 | Systems | `sales.sales_systems` | `sales.sales_systems_errors` |
| 4 | Quotes | `sales.sales_quotes` | `sales.sales_quotes_errors` |

---

## Join Anchor Rule

All canonical tables share `sales_id TEXT PRIMARY KEY`. Any cross-hub query joins on `sales_id`.

```sql
SELECT s.current_phase, f.employer_name, q.total_cost
FROM sales.sales_state s
JOIN sales.sales_factfinder f USING (sales_id)
JOIN sales.sales_quotes q USING (sales_id);
```

---

## Error Table Contract

All error tables follow the same shape:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `BIGSERIAL` | Auto-increment PK |
| `sales_id` | `TEXT` | Links to canonical row |
| `error_code` | `TEXT` | Machine-readable error identifier |
| `payload` | `JSONB` | Full error context |
| `process_id` | `TEXT` | Originating process/agent |
| `created_at` | `TIMESTAMP` | Append timestamp |

No updates. No deletes. Append only.

---

## Promotion Contract

When `sales.sales_quotes.approved_flag = true`, the `PROMOTE_TO_CLIENT` event fires. See `contracts/promote_to_client.json`.

---

## Guarantees

- Canonical table = join anchor
- Error table = append-only
- `sales_id` is the universal FK across all sub-hubs
- No business logic in this scaffold
