# ADR-001: CTB Structure Adoption

## Status

**APPROVED**

## Context

The sales-navigator repository was previously unstructured, with code scattered across non-canonical folders (`components/`, `lib/`, `pages/`, `hooks/`, etc.). This violates IMO-Creator doctrine and makes the codebase difficult to navigate, maintain, and audit.

The repository requires a constitutional rebuild to align with CTB (Christmas Tree Backbone) architecture.

## Decision

We adopt CTB v1.1.0 as the mandatory structural framework for this repository.

### CTB Branches

All source code MUST exist under `src/` in exactly one of these branches:

| Branch | Purpose | Examples |
|--------|---------|----------|
| `src/sys/` | System infrastructure | Doppler integration, env loaders, bootstraps |
| `src/data/` | Data layer | Schemas, queries, repositories (read-only patterns) |
| `src/app/` | Application logic | Meeting workflows, sales process services |
| `src/ai/` | AI components | Agents, prompts, LLM integrations |
| `src/ui/` | User interface | Lovable.dev components, pages, styles |

### Forbidden Folders

The following folder names are FORBIDDEN anywhere under `src/`:

- `utils/`
- `helpers/`
- `common/`
- `shared/`
- `lib/`
- `misc/`

These patterns violate CTB doctrine and MUST be deleted or refactored.

### Loose Files

No loose files are permitted in `src/` root. All files must be placed within a CTB branch.

## Migration Plan

| Current Location | Target Location |
|------------------|-----------------|
| `src/lib/` | DELETE |
| `src/components/` | `src/ui/components/` |
| `src/hooks/` | `src/ui/hooks/` |
| `src/pages/` | `src/ui/pages/` |
| `src/App.tsx` | `src/ui/App.tsx` |
| `src/App.css` | `src/ui/styles/App.css` |
| `src/main.tsx` | `src/ui/main.tsx` |
| `src/index.css` | `src/ui/styles/index.css` |
| `src/integrations/` | `src/sys/integrations/` |
| `src/server/` | `src/app/server/` |

## Consequences

### Positive

- Clear separation of concerns
- Predictable file discovery
- Audit-friendly structure
- Doctrine compliance

### Negative

- Existing import paths will break (must be updated)
- Learning curve for contributors unfamiliar with CTB

### Mitigation

- Update all import paths during migration
- Document CTB structure in README.md
- Enforce via CI validation

## Compliance

| Check | Status |
|-------|--------|
| Doctrine compliant | YES |
| PRD referenced | YES (docs/PRD.md) |
| Human approval | PENDING |

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Author | Claude Opus 4.5 (AI) |
| Status | APPROVED |
| CC Layer | CC-03 |
