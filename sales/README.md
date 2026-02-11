# Sales CTB Backbone

Structural scaffold for the Sales Navigator 4-meeting process.

## Structure

```
sales/
 ├── README.md                          ← You are here
 ├── doctrine/
 │    └── SALES_CTB.md                  ← Pattern rules (2 tables per sub-hub)
 ├── migrations/
 │    └── 001_sales_schema.sql          ← Full DDL (run once)
 ├── hubs/
 │    ├── sales_state.sql               ← Phase router
 │    ├── factfinder.sql                ← Meeting 1
 │    ├── insurance.sql                 ← Meeting 2
 │    ├── systems.sql                   ← Meeting 3
 │    └── quotes.sql                    ← Meeting 4
 └── contracts/
      └── promote_to_client.json        ← Egress event contract
```

## Pattern

- **Canonical table** = join anchor, keyed on `sales_id TEXT`
- **Error table** = append-only log, keyed on `id BIGSERIAL`
- **Hub state** = `sales.sales_state` gates phase transitions
- **Promotion** = `approved_flag = true` on quotes triggers `PROMOTE_TO_CLIENT`

## Tables (9 total)

| Table | Type |
|-------|------|
| `sales.sales_state` | Hub state |
| `sales.sales_factfinder` | Canonical |
| `sales.sales_factfinder_errors` | Errors |
| `sales.sales_insurance` | Canonical |
| `sales.sales_insurance_errors` | Errors |
| `sales.sales_systems` | Canonical |
| `sales.sales_systems_errors` | Errors |
| `sales.sales_quotes` | Canonical |
| `sales.sales_quotes_errors` | Errors |
