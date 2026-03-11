---
name: sales-neon
description: >
  Neon PostgreSQL configuration, schema, and operational patterns for the Sales Navigator hub
  (HUB-SALES-NAV-20260130). Use this skill whenever querying, migrating, debugging, or making
  data-layer decisions in the sales-navigator repo. Trigger on: Neon, PostgreSQL, Postgres,
  database, schema, sales_state, sales_factfinder, sales_insurance, sales_systems, sales_quotes,
  column_registry, migration, connection pooling, NEON_DATABASE_URL, VITE_NEON_DATABASE_URL,
  pipeline tracking, prospect data, meeting data, or any reference to the sales data layer.
  Also trigger when discussing CRM intake, 4-meeting process state, quote approval, or
  PROMOTE_TO_CLIENT events. If the question touches relational data in this repo, this skill
  applies even if the user does not mention Neon by name.
master_skill: IMO-Creator/skills/neon/SKILL.md
hub_id: HUB-SALES-NAV-20260130
---

# Sales Navigator -- Neon Skill

Neon is the primary database for Sales Navigator. All prospect, meeting, and quote data lives
in a Neon Serverless PostgreSQL instance under the `sales` schema. There is no Cloudflare layer
in this repo -- the Vite/React frontend talks to Neon via Supabase client bindings and the
Neon serverless driver.

## What This Repo Uses

| Component | Value |
|-----------|-------|
| Hub ID | HUB-SALES-NAV-20260130 |
| Hub Name | sales-navigator |
| Database | Neon Serverless PostgreSQL |
| Schema | `sales` (canonical), `sn_*` prefix (deprecated) |
| ORM / Driver | `@supabase/supabase-js` ^2.75.0 (client-side queries) |
| Secrets Provider | Doppler (`doppler run -- npm run dev`) |
| UI Layer | Lovable.dev (React + Vite) |
| Column Registry | `column_registry.yml` (canonical schema spine) |
| Canonical Migration | `sales/migrations/001_sales_schema.sql` (per ADR-005) |
| Deprecated Migration | `src/data/migrations/001_create_sales_navigator_schema.sql` (sn_* prefix, DO NOT execute) |

## Connection Configuration

All secrets are injected via Doppler. No `.env` files with real values are permitted.

| Variable | Purpose | Injected By |
|----------|---------|-------------|
| `NEON_DATABASE_URL` | Server-side / migration connection string | Doppler |
| `VITE_NEON_DATABASE_URL` | Client-side connection string (exposed to Vite build) | Doppler |
| `COMPOSIO_API_KEY` | External API calls via Composio MCP | Doppler |

**Connection pattern:**
```
# Pooled (application traffic)
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require

# Direct (migrations, admin)
postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Critical:** Use pooled endpoint for all application queries. Use direct endpoint only for
migrations and `pg_dump`. See master skill `IMO-Creator/skills/neon/SKILL.md` for full
connection pooling rules and PgBouncer transaction-mode constraints.

## Schema / Data Model

The canonical schema is defined in `column_registry.yml`. All generated TypeScript types and
Zod schemas are projections of this file and must never be hand-edited.

### Spine Table

| Table | Purpose |
|-------|---------|
| `sales.sales_state` | Phase router -- authoritative identity, gates sub-hub access |

Columns: `sales_id` (UUID PK, universal join key), `legal_name` (TEXT), `domicile_state` (TEXT), `current_phase` (TEXT: factfinder/insurance/systems/quotes), `status` (TEXT), `source` (TEXT), `version` (INT), `created_at`, `updated_at`

### Sub-Hub Tables (4 meetings)

| Sub-Hub | Canonical Table | Error Table | Key Columns |
|---------|----------------|-------------|-------------|
| Meeting 1: FactFinder | `sales.sales_factfinder` | `sales.sales_factfinder_errors` | employer_name, employee_count, renewal_month, prior_broker |
| Meeting 2: Insurance | `sales.sales_insurance` | `sales.sales_insurance_errors` | funding_model, strategy_selected |
| Meeting 3: Systems | `sales.sales_systems` | `sales.sales_systems_errors` | payroll_system, admin_model, compliance_owner |
| Meeting 4: Quotes | `sales.sales_quotes` | `sales.sales_quotes_errors` | quote_version, total_cost (USD_CENTS), approved_flag |

All sub-hub tables join to spine via `sales_id` (TEXT). Each sub-hub has exactly 1 CANONICAL
and 1 ERROR table per OWN-10a/OWN-10b.

For the full column-level schema reference, see `references/schema.md`.

## Operational Patterns

### Phase Progression
The `sales.sales_state.current_phase` column gates which sub-hub is active:
```
factfinder -> insurance -> systems -> quotes -> [PROMOTE_TO_CLIENT]
```

### Query Pattern (Client-Side)
The frontend uses `@supabase/supabase-js` for queries. All data access goes through
Supabase client bindings which connect to the Neon pooled endpoint underneath.

### Schema Changes
1. Update `column_registry.yml`
2. Run `./scripts/codegen-generate.sh`
3. Generated output lands in `src/data/hub/generated/` and `src/data/spokes/generated/`
4. Pre-commit hook enforces sync between registry and generated output

### Error Tables
All error tables are append-only. Columns: `id` (BIGSERIAL), `sales_id` (nullable FK),
`error_code`, `payload` (JSONB), `process_id`, `created_at`.

## Known Issues

- **Deprecated sn_* prefix**: The original migration (`001_create_sales_navigator_schema.sql`)
  used `sn_prospect`, `sn_sales_process`, `sn_meeting`, `sn_meeting_outcome` tables. These
  are superseded by the `sales.*` schema per ADR-005. Do not execute the deprecated migration.
- **No Cloudflare**: This repo has NO Cloudflare Workers, D1, or Hyperdrive. Do not suggest
  Cloudflare integration patterns. The Neon serverless driver or Supabase client handles all
  database access directly.
- **VITE_NEON_DATABASE_URL exposure**: This variable is exposed to the client build. Ensure
  the Neon connection string uses a role with minimal read permissions for client-side access.

## Cost Profile

| Resource | Expected Usage | Plan Consideration |
|----------|---------------|-------------------|
| Compute | Low -- sales process is human-paced, not high-throughput | Free tier likely sufficient during development |
| Storage | < 0.5GB for prospect/meeting data | Free tier covers this |
| Branches | Dev/staging branches for safe migration testing | Launch plan if > default branch limit |

See master skill `IMO-Creator/skills/neon/references/pricing.md` for full pricing breakdown.
