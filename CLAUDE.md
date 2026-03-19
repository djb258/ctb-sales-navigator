# CLAUDE.md — Sales Navigator Hub

## Identity

This is a **blueprint repo** — schema, doctrine, definitions, meeting process structure. ZERO runtime code.
All executable processes live in **Barton-Processes**.

**Authority**: Inherited from imo-creator-v2 (Sovereign)
**Engine**: `law/doctrine/TIER0_DOCTRINE.md` (in imo-creator-v2)

| Field | Value |
|-------|-------|
| **Repository** | djb258/ctb-sales-navigator |
| **Hub ID** | HUB-SALES-NAV-20260130 |
| **Hub Name** | sales-navigator |
| **Parent Sovereign** | imo-creator-v2 |
| **Doctrine Version** | 2.0.0 |

---

## CANONICAL REFERENCE

| Template | imo-creator-v2 Path | Version |
|----------|---------------------|---------|
| Architecture | law/doctrine/ARCHITECTURE.md | 2.1.0 |
| Tier 0 | law/doctrine/TIER0_DOCTRINE.md | LOCKED |
| Critical Thinking | law/doctrine/CRITICAL_THINKING_FRAMEWORK.md | LOCKED |
| Tools | law/integrations/TOOLS.md | 1.1.0 |
| OSAM | law/semantic/OSAM.md | 1.1.0 |
| PRD | fleet/car-template/docs/PRD_HUB.md | 1.0.0 |
| ADR | fleet/adr-templates/ADR.md | 1.0.0 |
| Checklist | fleet/checklists/HUB_COMPLIANCE.md | 1.0.0 |

---

## Blueprint, Not Muscle

This repo defines WHAT. Barton-Processes defines HOW.

| This Repo (Blueprint) | Barton-Processes (Muscle) |
|------------------------|--------------------------|
| Schema (column registry) | CF Workers |
| OSAM (query routing) | D1 working tables |
| PRD (transformation statement) | Neon vault migrations |
| Meeting process definitions | Runtime execution |
| Doctrine, governance, ADRs | Data movement |

**No executable code belongs here.** If it runs, it goes in Barton-Processes.

---

## Transformation Statement

> **This hub transforms raw prospect data into qualified sales outcomes through a 4-meeting orchestrated process.**

| Constants (Input) | Variables (Output) |
|-------------------|-------------------|
| Raw prospect intake | Qualified/Disqualified status |
| Unstructured notes | Structured meeting summaries |
| Unknown fit signals | Clear decision criteria |
| Manual follow-ups | Automated workflow triggers |

---

## Data Hierarchy

```
CL (Company Lifecycle — sovereign ID)
├── Outreach ID (sub-hub)
├── Sales ID (sub-hub) ← THIS REPO
│   ├── Sales State (SPINE — phase router)
│   ├── FactFinder (Meeting 1)
│   ├── Insurance (Meeting 2)
│   ├── Systems (Meeting 3)
│   └── Quotes (Meeting 4)
└── Client ID (sub-hub)
```

**CL sovereign ID is the spine.** Sales ID is minted when a prospect enters the sales process. When a sale closes, the Sales ID promotes to Client ID via the sovereign.

---

## The 4-Meeting Sales Process

| # | Meeting | Purpose | Sub-Hub |
|---|---------|---------|---------|
| 1 | Fact Finder | Gather prospect data | FactFinder |
| 2 | Insurance Education | Educate on insurance options | Insurance |
| 3 | Systems Education | Present systems/solutions | Systems |
| 4 | Financials | Review financials, close | Quotes |

Each meeting maps to a sub-hub with 1 CANONICAL + 1 ERROR table.

---

## Schema (8 Tables, 4 Sub-Hubs + Spine)

Single source of truth: `column_registry.yml`

| Sub-Hub | CANONICAL | ERROR |
|---------|-----------|-------|
| Spine | sales_state | — |
| FactFinder | sales_factfinder | sales_factfinder_errors |
| Insurance | sales_insurance | sales_insurance_errors |
| Systems | sales_systems | sales_systems_errors |
| Quotes | sales_quotes | sales_quotes_errors |

**Universal join key:** `sales_id` (from sales.sales_state)
**Schema:** `sales`

---

## Infrastructure Layers

| Layer | Technology | Role |
|-------|-----------|------|
| Working | CF D1 | Active sales operations |
| Config | CF KV | Meeting templates, workflow config |
| Compute | CF Workers | All processing logic |
| Vault | Neon PostgreSQL | Long-term canonical storage |
| Secrets | Doppler (imo-creator project) | All runtime configuration |

**CF does the work. Neon is the vault.**

---

## IMO Model

| Layer | Role | Rules |
|-------|------|-------|
| **I - Ingress** | CRM intake, prospect data | No logic, no state, no decisions |
| **M - Middle** | Sales process engine — meetings, state, decisions | ALL logic lives here |
| **O - Egress** | Reports, analytics, UI views | Read-only, no logic |

---

## Governance Files

| File | Purpose |
|------|---------|
| `CONSTITUTION.md` | Boundary declaration |
| `REGISTRY.yaml` | Hub identity |
| `IMO_CONTROL.json` | Governance contract |
| `column_registry.yml` | Canonical schema spine |
| `heir.doctrine.yaml` | HEIR identity record |
| `doctrine/REPO_DOMAIN_SPEC.md` | Domain bindings |
| `docs/PRD.md` | Hub definition |
| `docs/ERD.md` | Entity relationships |
| `docs/OSAM.md` | Query routing |

---

## Sales-Specific Artifacts

| File | Purpose |
|------|---------|
| `sales/hubs/sales_state.sql` | Spine table definition |
| `sales/hubs/factfinder.sql` | Meeting 1 sub-hub |
| `sales/hubs/insurance.sql` | Meeting 2 sub-hub |
| `sales/hubs/systems.sql` | Meeting 3 sub-hub |
| `sales/hubs/quotes.sql` | Meeting 4 sub-hub |
| `sales/contracts/promote_to_client.json` | Promotion contract (sales → client) |
| `sales/migrations/` | Neon vault migrations |

---

## Secrets Management (Doppler)

**All secrets live in the imo-creator Doppler project.** This is the sovereign vault.

Relevant keys:
- `SALES_DATABASE_URL` — Neon connection string
- `SALES_HUB_ID` — HUB-SALES-NAV-20260130
- `SALES_NEON_HOST`, `SALES_NEON_USER`, `SALES_NEON_PASSWORD`, `SALES_NEON_DATABASE`
- `SALES_SOVEREIGN_ID` — SOV-SVG-AGENCY

```
FORBIDDEN:
- .env files (any variant)
- Hardcoded secrets in code
- secrets.json, credentials.json
- Environment variables not from Doppler
```

---

## Never Do These Things

```
HARD PROHIBITIONS:
- Put executable code in this repo (it goes in Barton-Processes)
- Modify parent doctrine (imo-creator-v2)
- Put logic in Ingress or Egress layers
- Use .env files or hardcode secrets
- Create forbidden folders (utils, helpers, lib, etc.)
- Create schema without ADR
- Skip the CC descent sequence
```

---

## Golden Rules

1. **This repo is a blueprint. Barton-Processes is the muscle.**
2. **Tier 0 is the engine. Everything else is fuel.**
3. **CF does the work. Neon is the vault.**
4. **CL sovereign ID is the spine. Sales ID is minted from it.**
5. **4 meetings, 4 sub-hubs. Each has 1 CANONICAL + 1 ERROR.**
6. **Sales closes → promotes to Client via CL sovereign.**
7. **Determinism first. LLM is tail, not spine.**

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-03-19 |
| Version | 2.0.0 |
| Status | ACTIVE |
| Authority | imo-creator-v2 (Inherited) |
