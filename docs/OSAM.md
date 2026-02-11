# OSAM — Sales Navigator Hub

**Status**: LOCKED
**Authority**: CONSTITUTIONAL
**Version**: 1.0.0
**Hub**: HUB-SALES-NAV-20260130
**Change Protocol**: ADR + HUMAN APPROVAL REQUIRED

---

## Purpose

This OSAM is the authoritative query-routing contract for the Sales Navigator hub. It declares:

- Where data is queried from (query surfaces)
- Which tables own which concepts (semantic ownership)
- Which join paths are allowed (relationship contracts)
- When an agent MUST STOP and ask for clarification (halt conditions)

### Hierarchical Position

```
CONSTITUTION.md (Transformation Law)
    │
    ▼
PRD (Behavioral Proof — WHAT transformation occurs)
    │
    ▼
OSAM (Semantic Access Map — WHERE to query, HOW to join) ← THIS DOCUMENT
    │
    ▼
ERD (Structural Proof — WHAT tables implement OSAM contracts)
    │
    ▼
PROCESS (Execution Declaration — HOW transformation executes)
```

---

## Chain of Authority

```
SOV-SVG-AGENCY (CC-01)
    │
    ▼ owns
    │
sales.sales_state (Spine — Universal Join Key: sales_id)
    │
    ├──────────────────┬──────────────────┬──────────────────┐
    ▼                  ▼                  ▼                  ▼
FactFinder (CC-03) Insurance (CC-03) Systems (CC-03)   Quotes (CC-03)
    │                  │                  │                  │
    ▼                  ▼                  ▼                  ▼
[sales_factfinder] [sales_insurance]  [sales_systems]   [sales_quotes]
[  + _errors     ] [  + _errors     ] [  + _errors   ]  [  + _errors  ]
```

### Authority Rules

| Rule | Description |
|------|-------------|
| Single Spine | `sales.sales_state` is the sole spine table |
| Universal Key | All sub-hub tables join to spine via `sales_id` |
| No Cross-Sub-Hub Joins | Sub-hubs may not join directly to each other |
| Spine Owns Identity | `sales.sales_state` is the authoritative source of sales process identity |

---

## Universal Join Key Declaration

```yaml
universal_join_key:
  name: "sales_id"
  type: "TEXT"
  source_table: "sales.sales_state"
  description: "The single key that connects all tables in this hub"
```

### Join Key Rules

| Rule | Enforcement |
|------|-------------|
| Single Source | `sales_id` is minted ONLY in `sales.sales_state` |
| Immutable | Once assigned, a `sales_id` cannot change |
| Propagated | All sub-hub tables receive `sales_id` as PK or FK |
| Required | No table may exist without relationship to `sales_id` |

---

## Query Routing Table

| Question Type | Authoritative Table | Join Path | Notes |
|---------------|---------------------|-----------|-------|
| What phase is a sale in? | `sales.sales_state` | Direct (spine) | Phase router |
| What employer data was captured? | `sales.sales_factfinder` | `sales_state` → `sales_factfinder` | Meeting 1 canonical |
| What funding model was selected? | `sales.sales_insurance` | `sales_state` → `sales_insurance` | Meeting 2 canonical |
| What systems are in use? | `sales.sales_systems` | `sales_state` → `sales_systems` | Meeting 3 canonical |
| What is the quote status? | `sales.sales_quotes` | `sales_state` → `sales_quotes` | Meeting 4 canonical |
| Is the sale approved? | `sales.sales_quotes` | `sales_state` → `sales_quotes` | Check `approved_flag` |
| What errors occurred in factfinding? | `sales.sales_factfinder_errors` | `sales_state` → `sales_factfinder_errors` | Append-only log |
| What errors occurred in insurance? | `sales.sales_insurance_errors` | `sales_state` → `sales_insurance_errors` | Append-only log |
| What errors occurred in systems? | `sales.sales_systems_errors` | `sales_state` → `sales_systems_errors` | Append-only log |
| What errors occurred in quotes? | `sales.sales_quotes_errors` | `sales_state` → `sales_quotes_errors` | Append-only log |

### Routing Rules

| Rule | Description |
|------|-------------|
| One Table Per Question | Each question type has exactly ONE authoritative table |
| Explicit Paths Only | Only declared join paths may be used |
| No Discovery | Agents may not discover new query paths at runtime |
| HALT on Unknown | If a question cannot be routed, agent MUST HALT |

---

## Hub Definitions

### Parent Hub

```yaml
parent_hub:
  name: "sales-navigator"
  cc_layer: CC-02
  spine_table: "sales.sales_state"
  universal_join_key: "sales_id"
  owns:
    - "FactFinder"
    - "Insurance"
    - "Systems"
    - "Quotes"
```

### Spine Table

```yaml
spine_table:
  name: "sales.sales_state"
  purpose: "Authoritative source of sales process identity and phase routing"
  primary_key: "sales_id"
  query_surface: true
  columns:
    - name: "sales_id"
      type: "TEXT"
      role: "Universal join key"
    - name: "current_phase"
      type: "TEXT"
      role: "Active sub-hub gate (factfinder|insurance|systems|quotes)"
    - name: "created_at"
      type: "TIMESTAMP"
      role: "Process inception timestamp"
    - name: "updated_at"
      type: "TIMESTAMP"
      role: "Last state transition timestamp"
```

### Sub-Hubs

```yaml
sub_hubs:
  - name: "FactFinder"
    cc_layer: CC-03
    purpose: "Meeting 1 — employer data capture and qualification"
    joins_to_spine_via: "sales_id"
    tables:
      - "sales.sales_factfinder"
      - "sales.sales_factfinder_errors"

  - name: "Insurance"
    cc_layer: CC-03
    purpose: "Meeting 2 — insurance education, funding model selection"
    joins_to_spine_via: "sales_id"
    tables:
      - "sales.sales_insurance"
      - "sales.sales_insurance_errors"

  - name: "Systems"
    cc_layer: CC-03
    purpose: "Meeting 3 — systems/operations assessment"
    joins_to_spine_via: "sales_id"
    tables:
      - "sales.sales_systems"
      - "sales.sales_systems_errors"

  - name: "Quotes"
    cc_layer: CC-03
    purpose: "Meeting 4 — financials, quoting, approval"
    joins_to_spine_via: "sales_id"
    tables:
      - "sales.sales_quotes"
      - "sales.sales_quotes_errors"
```

---

## Allowed Join Paths

### Declared Joins

Only joins declared in this section are permitted. All other joins are INVALID.

| From Table | To Table | Join Key | Direction | Purpose |
|------------|----------|----------|-----------|---------|
| `sales.sales_state` | `sales.sales_factfinder` | `sales_id` | 1:1 | Spine → FactFinder canonical |
| `sales.sales_state` | `sales.sales_factfinder_errors` | `sales_id` | 1:N | Spine → FactFinder errors |
| `sales.sales_state` | `sales.sales_insurance` | `sales_id` | 1:1 | Spine → Insurance canonical |
| `sales.sales_state` | `sales.sales_insurance_errors` | `sales_id` | 1:N | Spine → Insurance errors |
| `sales.sales_state` | `sales.sales_systems` | `sales_id` | 1:1 | Spine → Systems canonical |
| `sales.sales_state` | `sales.sales_systems_errors` | `sales_id` | 1:N | Spine → Systems errors |
| `sales.sales_state` | `sales.sales_quotes` | `sales_id` | 1:1 | Spine → Quotes canonical |
| `sales.sales_state` | `sales.sales_quotes_errors` | `sales_id` | 1:N | Spine → Quotes errors |

### Join Rules

| Rule | Enforcement |
|------|-------------|
| Declared Only | If a join is not in this table, it is INVALID |
| No Ad-Hoc Joins | Agents may not invent joins at runtime |
| ERD Must Implement | ERDs may only contain joins declared here |
| ADR for New Joins | Adding a new join requires ADR approval |

### Forbidden Joins

| From | To | Reason |
|------|----|--------|
| FactFinder tables | Insurance tables (direct) | Cross-sub-hub isolation |
| FactFinder tables | Systems tables (direct) | Cross-sub-hub isolation |
| FactFinder tables | Quotes tables (direct) | Cross-sub-hub isolation |
| Insurance tables | Systems tables (direct) | Cross-sub-hub isolation |
| Insurance tables | Quotes tables (direct) | Cross-sub-hub isolation |
| Systems tables | Quotes tables (direct) | Cross-sub-hub isolation |
| Any table | `shq.orbt_error_log` (direct) | ORBT is a separate observability surface |

---

## Table Classifications

| Table Name | Classification | Query Surface | Notes |
|------------|----------------|---------------|-------|
| `sales.sales_state` | QUERY | YES | Spine / phase router |
| `sales.sales_factfinder` | QUERY | YES | Meeting 1 canonical |
| `sales.sales_insurance` | QUERY | YES | Meeting 2 canonical |
| `sales.sales_systems` | QUERY | YES | Meeting 3 canonical |
| `sales.sales_quotes` | QUERY | YES | Meeting 4 canonical |
| `sales.sales_factfinder_errors` | AUDIT | NO | Append-only error log |
| `sales.sales_insurance_errors` | AUDIT | NO | Append-only error log |
| `sales.sales_systems_errors` | AUDIT | NO | Append-only error log |
| `sales.sales_quotes_errors` | AUDIT | NO | Append-only error log |
| `shq.orbt_error_log` | AUDIT | NO | Cross-repo ORBT observability |

### Classification Rules

| Rule | Enforcement |
|------|-------------|
| AUDIT tables are NEVER query surfaces | Agent MUST HALT if asked to query AUDIT for business logic |
| QUERY tables are the only valid query surfaces | All questions route to QUERY tables |
| Error tables are for observability only | Never the "FROM" table in business queries |
| Misclassified queries are INVALID | Agent rejects and escalates |

---

## Canonical Cross-Hub Query

The canonical way to view a full sales record across all sub-hubs:

```sql
SELECT
    s.sales_id,
    s.current_phase,
    f.employer_name,
    f.employee_count,
    i.funding_model,
    i.strategy_selected,
    y.payroll_system,
    y.admin_model,
    q.total_cost,
    q.approved_flag
FROM sales.sales_state s
LEFT JOIN sales.sales_factfinder f USING (sales_id)
LEFT JOIN sales.sales_insurance i USING (sales_id)
LEFT JOIN sales.sales_systems y USING (sales_id)
LEFT JOIN sales.sales_quotes q USING (sales_id);
```

This is the ONLY valid cross-sub-hub query pattern — all joins route through the spine.

---

## STOP Conditions

### Query Routing STOP Conditions

| Condition | Action |
|-----------|--------|
| Question cannot be routed to a declared table | HALT — ask human for routing |
| Question requires a join not declared in OSAM | HALT — request ADR |
| Question targets an AUDIT table for business logic | HALT — query surfaces only |
| Question requires cross-sub-hub direct join | HALT — isolation violation |

### Semantic STOP Conditions

| Condition | Action |
|-----------|--------|
| Concept not declared in OSAM | HALT — semantic gap |
| Multiple tables claim ownership of concept | HALT — ambiguity resolution required |
| `sales_id` not found in query path | HALT — structural violation |

### STOP Output Format

```
OSAM HALT
═════════════════════════════════════════════════════════════════════════════

Reason: [QUERY_UNROUTABLE | JOIN_UNDECLARED | AUDIT_QUERY | ISOLATION_VIOLATION | SEMANTIC_GAP | AMBIGUITY | STRUCTURAL]

Question: "<THE_QUESTION_ASKED>"
Attempted Route: [What the agent tried to do]
OSAM Reference: [Section that applies]

Resolution Required:
  [ ] Human must declare new routing
  [ ] ADR required for new join
  [ ] Clarify which table owns this concept

Agent is HALTED. Awaiting resolution.
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-11 | Claude Code | Initial OSAM declaration for sales.* backbone |

---

## Validation Checklist

| Check | Status |
|-------|--------|
| [x] Universal join key declared (`sales_id TEXT`) | PASS |
| [x] Spine table identified (`sales.sales_state`) | PASS |
| [x] All sub-hubs listed with table ownership | PASS |
| [x] All allowed joins explicitly declared | PASS |
| [x] All tables classified (QUERY/AUDIT) | PASS |
| [x] Query routing table complete | PASS |
| [x] STOP conditions understood | PASS |
| [x] No undeclared joins exist in ERD | PASS |

---

## Relationship to Other Artifacts

| Artifact | OSAM Relationship |
|----------|-------------------|
| **PRD** | PRD declares WHAT transformation. OSAM declares WHERE to query. PRD references OSAM. |
| **ERD** | ERD implements OSAM. ERD may not introduce joins not in OSAM. |
| **HEIR** | HEIR declares hub identity. OSAM declares query routing within that hub. |
| **ORBT** | ORBT error logs are AUDIT classification. Not query surfaces. |
| **Process** | Processes query via OSAM routes. No ad-hoc queries. |
| **Agents** | Agents follow OSAM routing strictly. HALT on unknown routes. |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-02-11 |
| Last Modified | 2026-02-11 |
| Version | 1.0.0 |
| Status | LOCKED |
| Authority | CONSTITUTIONAL |
| Derives From | CONSTITUTION.md (Transformation Law) |
| Change Protocol | ADR + HUMAN APPROVAL REQUIRED |
