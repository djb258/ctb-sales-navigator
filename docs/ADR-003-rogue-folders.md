# ADR-003: Rogue Folder Quarantine

## Status

**APPROVED** — Pending human decision on disposition

## Context

During the constitutional rebuild, six top-level folders were identified as "rogue" — they existed outside the CTB structure without proper governance artifacts (REGISTRY.yaml, PRD, etc.).

These folders contain potentially valuable code but violate doctrine by:
1. Existing at repository root without hub declaration
2. Lacking CC descent artifacts (PRD, ADR)
3. Having unclear ownership and boundaries

## Decision

All rogue folders have been moved to `/quarantine/` pending human decision on their disposition.

**Quarantine is NOT deletion.** The code is preserved but isolated from the main repository structure.

## Quarantined Folders

### 1. calculator-app/

| Field | Value |
|-------|-------|
| **Original Location** | `/calculator-app/` |
| **Current Location** | `/quarantine/calculator-app/` |
| **Description** | IMO Calculator application |
| **Size** | Contains node_modules, functions |
| **Recommendation** | EXTRACT to separate repository OR DELETE if obsolete |

### 2. garage-mcp/

| Field | Value |
|-------|-------|
| **Original Location** | `/garage-mcp/` |
| **Current Location** | `/quarantine/garage-mcp/` |
| **Description** | MCP server implementation with multiple modules |
| **Size** | Significant codebase with packages, services, tests |
| **Recommendation** | EXTRACT to separate hub repository with own REGISTRY/PRD |

### 3. claude-agents-library/

| Field | Value |
|-------|-------|
| **Original Location** | `/claude-agents-library/` |
| **Current Location** | `/quarantine/claude-agents-library/` |
| **Description** | AI agent configurations and MCP config |
| **Size** | Configuration files |
| **Recommendation** | INTEGRATE into `src/ai/` OR EXTRACT to separate AI hub |

### 4. global/

| Field | Value |
|-------|-------|
| **Original Location** | `/global/` |
| **Current Location** | `/quarantine/global/` |
| **Description** | Global assets folder |
| **Size** | Small - assets only |
| **Recommendation** | INTEGRATE assets into `src/ui/assets/` OR DELETE if unused |

### 5. packages/

| Field | Value |
|-------|-------|
| **Original Location** | `/packages/` |
| **Current Location** | `/quarantine/packages/` |
| **Description** | Shared packages (heir, sidecar) |
| **Size** | Contains heir checks and sidecar event emitter |
| **Recommendation** | INTEGRATE into `src/sys/` OR EXTRACT to shared packages repo |

### 6. supabase/

| Field | Value |
|-------|-------|
| **Original Location** | `/supabase/` |
| **Current Location** | `/quarantine/supabase/` |
| **Description** | Supabase functions and migrations |
| **Size** | Edge functions, migration files |
| **Recommendation** | INTEGRATE into `src/data/` with proper schema documentation |

## Human Decision Required

For each quarantined folder, choose ONE action:

| Folder | Option A | Option B | Option C |
|--------|----------|----------|----------|
| calculator-app | Extract to own repo | Delete entirely | — |
| garage-mcp | Extract to own repo | Integrate as subhub | Delete entirely |
| claude-agents-library | Integrate into src/ai | Extract to own repo | Delete entirely |
| global | Integrate into src/ui/assets | Delete entirely | — |
| packages | Integrate into src/sys | Extract to shared repo | Delete entirely |
| supabase | Integrate into src/data | Keep as separate config | Delete entirely |

## Post-Decision Actions

### If EXTRACT:
1. Create new repository
2. Initialize with REGISTRY.yaml, DOCTRINE.md, IMO_CONTROL.json
3. Write PRD for the new hub
4. Move code from quarantine
5. Update any cross-references

### If INTEGRATE:
1. Move files to appropriate CTB branch
2. Update import paths
3. Document in REPO_DOMAIN_SPEC.md
4. Delete quarantine folder

### If DELETE:
1. Confirm no dependencies exist
2. Remove from quarantine
3. Document decision in this ADR

## Consequences

### Positive

- Clear separation of concerns
- Each project has proper governance (if extracted)
- Main repository is CTB-compliant

### Negative

- Temporary code isolation
- May break existing references (requires update)
- Requires human decision and follow-up work

## Compliance

| Check | Status |
|-------|--------|
| Doctrine compliant | YES (quarantine is allowed) |
| PRD referenced | YES (docs/PRD.md) |
| Human decision required | YES |

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Author | Claude Opus 4.5 (AI) |
| Status | APPROVED — Awaiting disposition decision |
| CC Layer | CC-03 |
