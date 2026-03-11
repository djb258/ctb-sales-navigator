# CC Operational Digest

**Purpose**: Single-file extraction of ALL operational rules that affect code-level decisions.
**Authority**: Derived from imo-creator doctrine (READ-ONLY)
**Audience**: AI agents and developers in child repos — read BEFORE writing any code.

| Field | Value |
|-------|-------|
| Derived From | ARCHITECTURE.md v2.1.0, TOOLS.md v1.1.0, OSAM.md v1.1.0, CONSTITUTION.md |
| Digest Version | 1.0.0 |
| Status | GENERATED — do not hand-edit. Regenerate from parent. |
| Hub | HUB-SALES-NAV-20260130 |
| Domain | Sales Process Management |

---

> **This file is a projection of parent doctrine. If this file conflicts with parent, parent wins.**

---

## S1 — Transformation Law (Supreme Principle)

> Nothing may exist unless it transforms declared constants into declared variables.

| Proof | Purpose | Required Before |
|-------|---------|-----------------|
| **PRD** | Behavioral proof — WHY transformation occurs | ERD, Process, Code |
| **ERD** | Structural proof — WHAT artifacts exist | Process, Code |
| **Process** | Execution declaration — HOW transformation runs | Code |

**Code-level rule**: If you cannot state *"This transforms X constants into Y variables"*, the artifact is invalid.

---

## S2 — Axioms

| # | Axiom | Code Impact |
|---|-------|-------------|
| 1 | **Single Placement** — every component at exactly one location | No file may be duplicated across branches |
| 2 | **Static Structure** — determined at design time | No runtime folder creation, no dynamic module loading that alters structure |
| 3 | **Downward Authority** — authority flows down only | Lower layers cannot modify config of higher layers |
| 4 | **Explicit Declaration** — all boundaries declared | No implicit defaults; undeclared = denied |
| 5 | **Immutable Identity** — IDs never change | Renaming is creation of new identity; old ID is dead |

---

## S3 — CTB Placement (Where Files Go)

### Branch Rules

| ID | Rule | Violation |
|----|------|-----------|
| CTB-B01 | Branches exist only under `src/` | CTB_VIOLATION |
| CTB-B02 | Exactly 5 branches: `sys/`, `data/`, `app/`, `ai/`, `ui/` | CTB_VIOLATION |
| CTB-B03 | Every source file maps to exactly one branch | CTB_VIOLATION |
| CTB-B04 | Files outside branches must be DELETED or MOVED | CTB_VIOLATION |

### Branch Definitions (Sales Domain)

| Branch | Contains | Never Contains |
|--------|----------|----------------|
| `sys/` | Doppler integration, CF Workers client, observability | Business logic |
| `data/` | Schemas, migrations, column_registry.yml, repositories | UI components |
| `app/` | Meeting workflows, sales process logic, IMO layers | Infrastructure |
| `ai/` | Sales assistant agents, meeting summarizers, LLM prompts | Raw data access |
| `ui/` | Figma UI pages, shadcn components, layouts, styles | Backend logic |

### Forbidden Folders (Automatic Violation)

| Folder | Reason |
|--------|--------|
| `utils/` | Junk drawer anti-pattern |
| `helpers/` | Junk drawer anti-pattern |
| `common/` | Junk drawer anti-pattern |
| `shared/` | Ownership violation |
| `lib/` | Vendoring anti-pattern |
| `misc/` | Junk drawer anti-pattern |

### Support Folders (Repo Root, NOT CTB Branches)

`docs/` `config/` `scripts/` `ops/`

---

## S4 — CC Authority (Who Governs What)

### Layer Definitions

| Layer | Name | Authority | Scope |
|-------|------|-----------|-------|
| CC-01 | Sovereign | Root authority | External to bounded context |
| CC-02 | Hub | Domain ownership | Within declared boundary |
| CC-03 | Context | Scoped operations | Within hub boundary |
| CC-04 | Process | Execution instance | Runtime only |

### Authorization Matrix

| Source -> Target | Permission |
|-----------------|------------|
| CC-01 -> any | PERMITTED |
| CC-02 -> CC-01 | **DENIED** |
| CC-02 -> CC-02/03/04 (within boundary) | PERMITTED |
| CC-03 -> CC-01/02 | **DENIED** |
| CC-03 -> CC-03/04 (within context) | PERMITTED |
| CC-04 -> CC-01/02/03 | **DENIED** |
| CC-04 -> CC-04 (within PID scope) | PERMITTED |

---

## S5 — Hub-Spoke Geometry (Who Owns Logic)

### Hub Laws

| ID | Law |
|----|-----|
| HS-H01 | Hubs own ALL logic, state, and decisions |
| HS-H02 | Identity mints only at hubs |
| HS-H03 | One hub per declared bounded context |
| HS-H04 | Hub ID is immutable once assigned |

### Spoke Laws

| ID | Law |
|----|-----|
| HS-S01 | Spokes are interfaces ONLY |
| HS-S02 | Spokes typed as Ingress OR Egress (not both) |
| HS-S03 | Spokes carry data only — NO logic |
| HS-S04 | Spokes do NOT own state |

**GOLDEN RULE: Logic lives only inside hubs. Spokes only carry data.**

---

## S6 — IMO Flow (How Data Moves Through Hubs)

| Layer | Name | Owns | Must NOT |
|-------|------|------|----------|
| I | Ingress | Schema validation | Make decisions, mutate business state |
| M | Middle | All logic, decisions, state, tools | Exist outside hub |
| O | Egress | Read-only views, exports | Contain logic |

### Flow Laws

| ID | Law | Violation |
|----|-----|-----------|
| IMO-01 | Ingress MUST NOT make decisions | IMO_VIOLATION |
| IMO-02 | Ingress MUST NOT mutate business state | IMO_VIOLATION |
| IMO-03 | Middle owns ALL logic | IMO_VIOLATION |
| IMO-04 | Middle owns ALL tool invocations | TOOL_VIOLATION |
| IMO-05 | Egress MUST NOT contain logic | IMO_VIOLATION |
| IMO-06 | Egress is read-only | IMO_VIOLATION |

---

## S7 — Descent Gates (What Order to Create Artifacts)

### Gate Conditions

| Gate | Required Before Descent |
|------|-------------------------|
| CC-01 -> CC-02 | Sovereign ID assigned, boundary declared, doctrine version declared |
| CC-02 -> CC-03 | Hub ID assigned, CTB placed, IMO defined, PRD written and approved |
| CC-03 -> CC-04 | ADRs recorded, process flows documented, constants/variables declared |
| CC-04 Execute | PRD exists, ADRs complete, compliance checklist passed |

---

## S8 — Constants vs Variables

| Category | Characteristic | Mutability |
|----------|----------------|------------|
| Constant | Defines meaning and structure | ADR-gated only |
| Variable | Tunes behavior | Runtime-mutable within bounds |

### Inversion Law

| ID | Law |
|----|-----|
| CV-01 | Variables may NEVER redefine constants |
| CV-02 | Variable cannot alter meaning defined by constant |
| CV-03 | Attempted inversion is doctrine violation |

---

## S9 — PID Doctrine (Execution Instances)

PIDs exist at CC-04 only.

| ID | Law |
|----|-----|
| PID-01 | PIDs are unique per execution |
| PID-02 | PIDs operate exclusively at CC-04 |
| PID-03 | PIDs are NEVER reused |
| PID-04 | PIDs are NEVER promoted to higher layers |
| PID-05 | Retries require NEW PID |
| PID-06 | Recovery requires NEW PID |

---

## S10 — Ownership & Table Cardinality

### Data Ownership & Sub-Hub Table Cardinality (ADR-001)

| ID | Constraint |
|----|------------|
| OWN-09 | Tables owned by exactly one hub |
| OWN-10 | Tables owned by exactly one sub-hub (CC-03) |
| **OWN-10a** | Each sub-hub has exactly **one CANONICAL table** |
| **OWN-10b** | Each sub-hub has exactly **one ERROR table** |
| **OWN-10c** | Additional table types (STAGING, MV, REGISTRY) require ADR justification |
| OWN-11 | Cross-lane joins forbidden unless declared |
| OWN-12 | Metadata lives in `data/schema/` |

---

## S11 — Tool Doctrine

### Core Principles

1. **Hub-Scoped Ownership** — All tools owned by exactly one hub, M layer only.
2. **Determinism First** — Deterministic solutions evaluated before ANY alternative.
3. **LLM as Tail** — LLM invoked only after deterministic logic exhausted.

### IMO Layer Constraints for Tools

| Layer | Tools Permitted |
|-------|-----------------|
| I (Ingress) | Data ingestors only — no transformation logic |
| M (Middle) | All processing, decision, and transformation tools |
| O (Egress) | Output formatters only — no decision logic |
| Spokes | **None** |

### LLM Containment

```
ALLOWED:  Deterministic logic -> exhausted -> LLM arbitrates edge case -> output validated -> action
FORBIDDEN: User request -> LLM decides -> action
```

---

## S12 — Query Routing (OSAM)

### Authority Rules

| Rule | Description |
|------|-------------|
| Single Spine | Every hub has exactly ONE spine table |
| Universal Key | All sub-hub tables join to spine via universal join key |
| No Cross-Sub-Hub Joins | Sub-hubs may not join directly to each other |
| Spine Owns Identity | Spine table is authoritative source of entity identity |

### Table Classifications

| Classification | Query Surface | Can Be "FROM" Table |
|----------------|:------------:|:-------------------:|
| QUERY | YES | YES |
| SOURCE | **NO** | **NO** |
| ENRICHMENT | **NO** | **NO** (join-only) |
| AUDIT | **NO** | **NO** |

---

## S13 — Registry-First Enforcement

`column_registry.yml` is the canonical spine for all data schema in a hub.

| Principle | Rule |
|-----------|------|
| Registry is spine | All table definitions originate in `column_registry.yml` |
| Generated files are projections | TypeScript types / Zod schemas are OUTPUT, never hand-edited |
| Registry drives OSAM | Query surfaces must correspond to registry-declared tables |
| Registry drives ERDs | ERD must reflect registry-declared tables |

**Reading order**: OSAM -> column_registry.yml -> Generated files -> Application code

---

## S14 — Violation Categories

| Category | Definition | Severity |
|----------|------------|----------|
| CC_VIOLATION | Unauthorized CC layer interaction | STOP |
| CTB_VIOLATION | Invalid placement or forbidden folder | STOP |
| HUB_SPOKE_VIOLATION | Logic in spoke or spoke-to-spoke | STOP |
| IMO_VIOLATION | Logic in I or O layer | STOP |
| PID_VIOLATION | PID reuse or invalid promotion | STOP |
| AUTH_VIOLATION | Unauthorized write attempt | STOP |
| CONSTANT_VIOLATION | Variable redefining constant | STOP |
| DESCENT_VIOLATION | Out-of-sequence artifact creation | STOP |
| TOOL_VIOLATION | Unapproved tool or tool in wrong layer | STOP |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-02-25 |
| Last Modified | 2026-02-25 |
| Digest Version | 1.0.0 |
| Source Versions | ARCHITECTURE.md v2.1.0, TOOLS.md v1.1.0, OSAM.md v1.1.0 |
| Status | GENERATED |
| Regenerate From | imo-creator parent doctrine |
