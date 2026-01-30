# UI Constitution — Sales Navigator

**Status**: DERIVED
**Authority**: CONSTITUTION.md
**Version**: 1.0.0
**Hub**: HUB-SALES-NAV-20260130

---

## Derivation

This document is a **derived governance layer** from the supreme Transformation Law declared in `CONSTITUTION.md`:

> Nothing may exist unless it transforms declared constants into declared variables.

The UI is the **presentation layer** — it displays system state and emits user intents. It does NOT own truth.

---

## Authority Chain

```
CONSTITUTION.md (Hub Supreme Law)
        |
        v
UI_CONSTITUTION.md (This Document)
        |
        v
UI_PRD_SALES_NAVIGATOR.md (UI Behavior)
        |
        v
UI_ERD_SALES_NAVIGATOR.md (UI Data Mirrors)
        |
        v
src/ui/ (Implementation)
```

---

## Core Principle

> **The UI is a disposable presentation layer. It owns no truth.**

The UI:
- **Displays** system state (read-only)
- **Captures** user input (pass-through)
- **Emits** user intents (events)

The UI does NOT:
- Own data
- Make decisions
- Store state persistently
- Transform constants into variables

---

## UI-Specific IMO Discipline

| Layer | Role | Allowed Actions |
|-------|------|-----------------|
| **Ingress** | User input capture | Form fields, clicks, gestures |
| **Middle** | Layout + ephemeral state | Component state, UI routing, animations |
| **Egress** | Intent emission | Events, API calls, navigation |

### Key Constraint

> **UI Middle layer is for LAYOUT only, not LOGIC.**

All business logic lives in `src/app/` (the hub's Middle layer), not in UI components.

---

## Explicit Prohibitions

The UI layer is FORBIDDEN from:

| Prohibition | Reason |
|-------------|--------|
| Schema mutation | UI owns no data |
| Table creation | UI owns no persistence |
| Direct database access | Must go through app layer |
| Business logic | Logic lives in hub M layer only |
| State persistence | UI state is ephemeral |
| Cross-hub communication | Must route through owning hub |
| Decision making | Decisions are hub responsibility |

---

## What UI May Do

| Action | Status |
|--------|--------|
| Read data from props/context | ALLOWED |
| Display formatted data | ALLOWED |
| Capture user input | ALLOWED |
| Emit events/intents | ALLOWED |
| Manage ephemeral UI state | ALLOWED |
| Animate and transition | ALLOWED |
| Navigate between views | ALLOWED |

---

## Regenerability Requirement

> **All UI governance artifacts are fully regenerable.**

The `docs/ui/` directory is a derived build artifact. It may be deleted and regenerated from canonical sources (CONSTITUTION.md, PRD.md, ERD) at any time.

UI implementations in `src/ui/` are also disposable — they implement the UI governance artifacts, not the other way around.

---

## Relationship to Hub Governance

| Document | Scope |
|----------|-------|
| CONSTITUTION.md | Hub boundaries, supreme law |
| docs/PRD.md | Hub transformation definition |
| docs/ui/UI_CONSTITUTION.md | UI governance (this) |
| docs/ui/UI_PRD_*.md | UI behavior definition |
| docs/ui/UI_ERD_*.md | UI data structure mirrors |

---

## Validation Criteria

| # | Check | Pass Condition |
|---|-------|----------------|
| 1 | UI has no business logic | All logic in src/app/ |
| 2 | UI has no data mutations | Read-only data access |
| 3 | UI emits intents only | No direct state changes |
| 4 | UI is regenerable | Can rebuild from governance |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | DERIVED |
| Authority | CONSTITUTION.md |
| Hub | HUB-SALES-NAV-20260130 |
