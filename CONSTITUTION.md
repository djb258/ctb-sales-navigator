# Constitution — Sales Navigator Hub

**Status**: ACTIVE
**Authority**: SOVEREIGN (Hub-Level)
**Version**: 1.0.0
**Parent**: imo-creator

---

## The Supreme Law

> **Nothing may exist in this repository unless it transforms declared constants into declared variables.**

This is the foundational law. All code, all data, all processes must serve a declared transformation.

---

## Constitutional Hierarchy

```
IMO-Creator (Parent Sovereign)
    │
    └── Sales Navigator (This Hub)
            │
            ├── CC-01: This Constitution
            ├── CC-02: REGISTRY.yaml, PRD
            ├── CC-03: ADRs, Process Flows
            └── CC-04: Implementation Code
```

---

## Hub Identity

| Field | Value |
|-------|-------|
| **Hub ID** | HUB-SALES-NAV-20260130 |
| **Hub Name** | sales-navigator |
| **Hub Type** | SALES |
| **Sovereign Reference** | SOV-SVG-AGENCY |

---

## Constitutional Boundaries

### What This Hub Governs

1. **4-Meeting Sales Process** — Discovery through Finalization
2. **Prospect Data Transformation** — Raw intake → Qualified outcomes
3. **Meeting Workflow Orchestration** — Sequential process management
4. **Sales Analytics** — Metrics and reporting

### What This Hub Does NOT Govern

1. **CRM Source Data** — Read-only access, no mutations
2. **Payment Processing** — Out of scope
3. **Contract Generation** — Out of scope
4. **Legal Compliance** — Out of scope

---

## Infrastructure Mandates

### Doppler (REQUIRED)

**Doppler is the sole authorized secrets provider for this hub.**

| Mandate | Enforcement |
|---------|-------------|
| All secrets via Doppler | MANDATORY |
| No .env files with secrets | FORBIDDEN |
| No hardcoded credentials | FORBIDDEN |
| Doppler project: `sales-navigator` | REQUIRED |
| Doppler configs: dev/staging/prod | REQUIRED |

### CTB Structure (REQUIRED)

All source code follows Christmas Tree Backbone:

| Branch | Purpose |
|--------|---------|
| `src/sys/` | System infrastructure, Doppler integration |
| `src/data/` | Schemas, data models |
| `src/app/` | Business logic, workflows |
| `src/ai/` | AI agents, prompts |
| `src/ui/` | User interface |

---

## Forbidden Patterns

The following are CONSTITUTIONALLY FORBIDDEN:

| Pattern | Reason |
|---------|--------|
| `src/lib/` | Violates CTB |
| `src/utils/` | Violates CTB |
| `src/helpers/` | Violates CTB |
| `.env` with secrets | Violates Doppler mandate |
| Hardcoded API keys | Security violation |
| Spoke-to-spoke communication | Violates hub-spoke geometry |
| Logic in spokes | Violates IMO model |

---

## Amendment Process

This Constitution may only be amended through:

1. ADR documenting the proposed change
2. Human approval in writing
3. Version increment
4. Audit trail entry

**AI agents may NOT modify this Constitution.**

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Authority | SOVEREIGN (Hub-Level) |
| Parent | imo-creator |
