# ADR-004: Supabase as Data Layer

**Status**: APPROVED
**Date**: 2026-01-30
**CC Layer**: CC-03

---

## Context

The Sales Navigator hub requires a data persistence layer to store:
- Prospect data (ingested from CRM)
- Sales process state
- Meeting records and outcomes

We need a solution that:
- Integrates with Doppler for secrets management
- Supports real-time subscriptions for UI updates
- Provides row-level security for multi-tenant scenarios
- Works with the existing Lovable.dev UI stack

---

## Decision

**Use Supabase as the data layer for Sales Navigator.**

Supabase provides:
- PostgreSQL database with REST and real-time APIs
- Row-level security (RLS) for data isolation
- TypeScript client SDK compatible with React
- Managed infrastructure (no DBA overhead)

---

## Tool Registration

| Field | Value |
|-------|-------|
| Tool Name | Supabase |
| Doctrine ID | TOOL-SUPABASE-001 |
| Solution Type | Deterministic |
| CC Layer | CC-02 (Hub M Layer) |
| IMO Layer | M (Middle) |
| ADR Reference | This document |

---

## Integration Pattern

### Secrets (via Doppler)

| Secret | Doppler Key | Purpose |
|--------|-------------|---------|
| Project URL | `SUPABASE_URL` | API endpoint |
| Anon Key | `SUPABASE_ANON_KEY` | Public client key |
| Service Role Key | `SUPABASE_SERVICE_ROLE_KEY` | Server-side operations |

### CTB Placement

| Component | Location |
|-----------|----------|
| Client initialization | `src/sys/supabase/client.ts` |
| Type definitions | `src/data/types/database.ts` |
| Query functions | `src/data/queries/` |
| Migrations | `supabase/migrations/` |

---

## Constraints

| Constraint | Enforcement |
|------------|-------------|
| All secrets from Doppler | MANDATORY |
| No direct SQL in UI components | MANDATORY |
| All queries through data layer | MANDATORY |
| RLS enabled on all tables | MANDATORY |

---

## Consequences

### Positive
- Managed PostgreSQL with automatic backups
- Real-time subscriptions for UI updates
- TypeScript types generated from schema
- Integrates with Doppler secrets model

### Negative
- Vendor dependency on Supabase
- Learning curve for RLS policies
- Cost scales with usage

### Mitigations
- Abstract client behind interface for future migration
- Document RLS patterns in this ADR
- Monitor usage via Supabase dashboard

---

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|-----------------|
| Firebase | Less SQL-friendly, different auth model |
| PlanetScale | No real-time subscriptions |
| Raw PostgreSQL | Operational overhead too high |
| Neon | Considered but Supabase has better DX |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | APPROVED |
| Authority | CC-03 |
