# Claude Bootstrap — Sales Navigator Hub

**Hub ID**: HUB-SALES-NAV-20260130
**Parent**: imo-creator
**Authority**: CONSTITUTION.md
**Status**: CHILD REPO

---

## First Read (Mandatory)

Before any work, read these in order:

```
1. CONSTITUTION.md — Hub boundaries and mandates
2. REGISTRY.yaml — Hub identity and configuration
3. IMO_CONTROL.json — Governance contract
4. templates/IMO_SYSTEM_SPEC.md — System index
5. templates/AI_EMPLOYEE_OPERATING_CONTRACT.md — Agent constraints
6. doctrine/REPO_DOMAIN_SPEC.md — Domain bindings (REQUIRED)
```

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

## What You MUST Do

1. **Read CONSTITUTION.md first** in this repo
2. **Check for violations** before any work
3. **Halt and report** if violations exist
4. **Reference doctrine** — do not interpret it
5. **Use Doppler** for all secrets
6. **Route external APIs through Composio MCP**

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
| docs/PRD.md | Product requirements | docs/ |
| docs/ADR-*.md | Architecture decisions | docs/ |
| doctrine/REPO_DOMAIN_SPEC.md | Domain bindings | doctrine/ |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Authority | CONSTITUTION.md |
| Parent | imo-creator |
