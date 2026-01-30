# Baseline State Snapshot

**Date**: 2026-01-30
**Branch**: ctb-compliance/full-rebuild
**Purpose**: Document pre-remediation state for audit trail

---

## Top-Level Folders (Pre-Remediation)

| Folder | Classification | Action Required |
|--------|----------------|-----------------|
| `.claude/` | Config | KEEP |
| `.git/` | VCS | KEEP |
| `.next/` | Build artifact | IGNORE (gitignored) |
| `.pytest_cache/` | Test cache | IGNORE |
| `.vscode/` | IDE config | KEEP |
| `calculator-app/` | ROGUE PROJECT | QUARANTINE |
| `claude-agents-library/` | ROGUE PROJECT | QUARANTINE |
| `garage-mcp/` | ROGUE PROJECT | QUARANTINE |
| `global/` | ROGUE FOLDER | QUARANTINE |
| `logs/` | Runtime output | IGNORE |
| `node_modules/` | Dependencies | IGNORE |
| `packages/` | ROGUE PROJECT | QUARANTINE |
| `public/` | Static assets | CLASSIFY → src/ui/assets |
| `src/` | Source code | RESTRUCTURE |
| `supabase/` | ROGUE PROJECT | QUARANTINE |
| `templates/` | IMO-Creator templates | KEEP |
| `tests/` | Test files | CLASSIFY |

---

## src/ Contents (Pre-Remediation)

### Loose Files (VIOLATION)
- `App.css` → Move to src/ui/styles/
- `App.tsx` → Move to src/ui/
- `index.css` → Move to src/ui/styles/
- `main.tsx` → Move to src/ui/
- `vite-env.d.ts` → Move to src/sys/

### Folders
| Folder | Status | Target |
|--------|--------|--------|
| `components/` | CTB_VIOLATION | → src/ui/components/ |
| `hooks/` | CTB_VIOLATION | → src/ui/hooks/ |
| `integrations/` | CTB_VIOLATION | → src/sys/integrations/ |
| `lib/` | FORBIDDEN | DELETE |
| `pages/` | CTB_VIOLATION | → src/ui/pages/ |
| `server/` | CTB_VIOLATION | → src/app/server/ |

---

## Governance Files (Pre-Remediation)

| File | Status |
|------|--------|
| `REGISTRY.yaml` | MISSING |
| `IMO_CONTROL.json` | MISSING |
| `DOCTRINE.md` | MISSING |
| `docs/PRD.md` | MISSING |
| `docs/ADR-*.md` | MISSING |
| `doctrine/REPO_DOMAIN_SPEC.md` | MISSING |

---

## Known Violations

### CRITICAL
1. No governance artifacts
2. No CC descent gates satisfied
3. Forbidden folder: src/lib/
4. Code exists before PRD/ADR

### HIGH
1. CTB branches not created
2. Loose files in src/ root
3. 6 rogue top-level folders
4. No Doppler integration declared

---

## Baseline Captured

This document serves as evidence of pre-remediation state.
All remediation actions will be documented against this baseline.

**Captured by**: Claude Opus 4.5 (AI Agent)
**Timestamp**: 2026-01-30T07:00:00Z
