# Claude Bootstrap — Sales Navigator Hub

**Hub ID**: HUB-SALES-NAV-20260130
**Parent**: imo-creator
**Authority**: CONSTITUTION.md
**Status**: CHILD REPO

---

## Session Startup (Mandatory)

Follow `templates/child/STARTUP_PROTOCOL.md`. In short:

### Tier 1 — Load These Three Files First

```
1. IMO_CONTROL.json — Hub identity, governance contract
2. CC_OPERATIONAL_DIGEST.md — ALL operational rules (~500 lines)
3. CLAUDE.md — This file (AI permissions, repo-specific rules)
```

### Tier 2 — Load On-Demand When Work Requires

```
CONSTITUTION.md — Hub boundaries and mandates
REGISTRY.yaml — Hub identity and configuration
templates/IMO_SYSTEM_SPEC.md — System index
templates/AI_EMPLOYEE_OPERATING_CONTRACT.md — Agent constraints
doctrine/REPO_DOMAIN_SPEC.md — Domain bindings (REQUIRED)
column_registry.yml — Canonical schema spine
docs/PRD.md — Product requirements
docs/ERD.md — Entity relationships
docs/OSAM.md — Query routing
```

### Checkpoint Gate

Before coding, verify `DOCTRINE_CHECKPOINT.yaml` is current (<24 hours). If stale, refresh it.

---

## Parent-Child Relationship

```
IMO-Creator (PARENT)
    │
    └── templates/ — Generic doctrine (READ-ONLY)
            │
            ▼ binds to
            │
Sales Navigator (THIS HUB — CHILD)
    │
    └── doctrine/REPO_DOMAIN_SPEC.md — Domain-specific bindings
```

### Inheritance Rules

| Rule | Enforcement |
|------|-------------|
| Parent doctrine is READ-ONLY | MANDATORY |
| Domain specifics in REPO_DOMAIN_SPEC.md | REQUIRED |
| Parent wins on conflicts | ALWAYS |
| Child cannot modify parent | FORBIDDEN |

---

## Hub Identity

| Field | Value |
|-------|-------|
| Hub ID | HUB-SALES-NAV-20260130 |
| Hub Name | sales-navigator |
| Hub Type | SALES |
| Sovereign Reference | SOV-SVG-AGENCY |
| Parent | imo-creator |

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

## The 4-Meeting Sales Process

| # | Meeting | Purpose | CTB Branch |
|---|---------|---------|------------|
| 1 | Fact Finder | Gather prospect data | app/meetings/ |
| 2 | Insurance Education | Educate on insurance options | app/meetings/ |
| 3 | Systems Education | Present systems/solutions | app/meetings/ |
| 4 | Financials | Review financials, close | app/meetings/ |

---

## CTB Structure (Enforced)

```
src/
├── sys/      # System infrastructure, Doppler integration
├── data/     # Schemas, data models, types
├── app/      # Business logic, workflows, services
├── ai/       # AI agents, prompts, LLM integration
└── ui/       # User interface, components, pages
```

### Forbidden Patterns

| Pattern | Status |
|---------|--------|
| `src/lib/` | FORBIDDEN |
| `src/utils/` | FORBIDDEN |
| `src/helpers/` | FORBIDDEN |
| `src/common/` | FORBIDDEN |
| `src/shared/` | FORBIDDEN |

---

## Infrastructure Mandates

### Doppler (REQUIRED)

**Doppler is the sole authorized secrets provider.**

```bash
# Setup (first time)
doppler setup --project sales-navigator --config dev

# Run commands
doppler run -- npm run dev
doppler run -- npm run build
```

| Mandate | Status |
|---------|--------|
| All secrets via Doppler | MANDATORY |
| No .env files with secrets | FORBIDDEN |
| No hardcoded credentials | FORBIDDEN |

### Composio MCP (REQUIRED)

All external API calls go through Composio MCP server.

```bash
# Start MCP server first
cd path/to/composio-mcp && node server.js

# Then run app
doppler run -- npm run dev
```

---

## Agent System (Planner / Builder / Auditor)

This repo uses a 3-agent governance model. Agents communicate via a folder-based message bus. No direct agent-to-agent communication.

### Agents

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| **Planner** | Generates WORK_PACKETs from user requests | User request + doctrine | `work_packets/outbox/` |
| **Builder** | Executes approved WORK_PACKETs | `work_packets/inbox/` | Code + `changesets/outbox/` |
| **Auditor** | Verifies compliance | `work_packets/inbox/` + `changesets/inbox/` | `audit_reports/outbox/` |
| **Control Panel** | Read-only diagnostic | All inboxes/outboxes | Structured report |

### Message Bus

```
work_packets/inbox/     — Builder reads from here
work_packets/outbox/    — Planner writes here
changesets/inbox/       — Auditor reads from here
changesets/outbox/      — Builder writes here
audit_reports/inbox/    — (reserved)
audit_reports/outbox/   — Auditor writes here
audit/                  — Pressure test reports
```

### Flow

```
User Request → Planner → WORK_PACKET → (human approval if architectural) → Builder → CHANGESET → Auditor → AUDIT_REPORT
```

### Contracts

All artifacts must conform to schemas in `agents/contracts/`:
- `work_packet.schema.json`
- `changeset.schema.json`
- `audit_report.schema.json`
- `arch_pressure_report.schema.json` (when pressure test required)
- `flow_pressure_report.schema.json` (when pressure test required)

---

## What You MUST Do

1. **Read CONSTITUTION.md first** in this repo
2. **Check for violations** before any work
3. **Halt and report** if violations exist
4. **Reference doctrine** — do not interpret it
5. **Use Doppler** for all secrets
6. **Route external APIs through Composio MCP**
7. **Follow agent boundaries** — Planner plans, Builder builds, Auditor audits

---

## What You MUST NOT Do

1. **Modify doctrine files in templates/** — PROHIBITED
2. **Create forbidden folders** — PROHIBITED
3. **Hardcode secrets** — PROHIBITED
4. **Bypass Doppler** — PROHIBITED
5. **Make direct external API calls** — PROHIBITED
6. **Add logic to spokes/UI** — PROHIBITED
7. **Proceed despite violations** — PROHIBITED

---

## Halt Conditions

Stop immediately and report if:

| Condition | Action |
|-----------|--------|
| CONSTITUTION.md missing | HALT |
| IMO_CONTROL.json missing | HALT |
| Forbidden folders exist | HALT |
| Doctrine violation detected | HALT |
| Secrets hardcoded | HALT |
| Asked to modify doctrine | REFUSE |

---

## Quick Commands

```bash
# Development
doppler run -- npm run dev

# Build
doppler run -- npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## Governance Documents

| Document | Purpose | Location |
|----------|---------|----------|
| CONSTITUTION.md | Supreme law | repo root |
| DOCTRINE.md | IMO-Creator conformance | repo root |
| REGISTRY.yaml | Hub identity | repo root |
| IMO_CONTROL.json | Governance contract | repo root |
| CC_OPERATIONAL_DIGEST.md | Operational field manual (Tier 1) | repo root |
| DOCTRINE_CHECKPOINT.yaml | Plan-before-build gate | repo root |
| column_registry.yml | Canonical schema spine | repo root |
| docs/PRD.md | Product requirements | docs/ |
| docs/ERD.md | Entity relationships | docs/ |
| docs/OSAM.md | Query routing | docs/ |
| docs/ADR-*.md | Architecture decisions | docs/ |
| doctrine/REPO_DOMAIN_SPEC.md | Domain bindings | doctrine/ |
| heir.doctrine.yaml | HEIR/2.0 identity record | repo root |
| agents/planner/master_prompt.md | Planner agent prompt | agents/ |
| agents/builder/master_prompt.md | Builder agent prompt | agents/ |
| agents/auditor/master_prompt.md | Auditor agent prompt | agents/ |
| agents/control_panel/master_prompt.md | Control Panel prompt | agents/ |
| agents/contracts/*.schema.json | Agent contract schemas | agents/contracts/ |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-02-25 |
| Version | 2.0.0 |
| Status | ACTIVE |
| Authority | CONSTITUTION.md |
| Parent | imo-creator |
