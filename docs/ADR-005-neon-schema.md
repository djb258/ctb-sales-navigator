# ADR-005: Sales Navigator Database Schema

## Conformance

| Field | Value |
|-------|-------|
| **Doctrine Version** | 1.5.0 |
| **CC Layer** | CC-03 (Architecture Decision) |
| **Status** | ACCEPTED |
| **Date** | 2026-02-05 |

---

## Context

The Sales Navigator Hub (HUB-SALES-NAV-20260130) requires persistent storage for:
- Prospect intake data (CAPTURE pass)
- Sales process state (COMPUTE pass)
- Meeting records (COMPUTE pass)
- Meeting outcomes (GOVERN pass)

The canonical ERD (docs/ERD.md) defines 4 tables that must be implemented to support the hub's transformation:

> "This system transforms raw prospect intake data into qualified sales decisions and documented meeting outcomes."

---

## Decision

### 1. Database Platform: Neon PostgreSQL

Use the shared Neon PostgreSQL database (`Marketing DB`) managed via Doppler secrets.

**Rationale**:
- Consistent with imo-creator infrastructure pattern
- Centralized secrets management via Doppler
- Serverless PostgreSQL with auto-scaling
- Shared database reduces operational overhead

### 2. Table Naming Convention

All Sales Navigator tables are prefixed with `sn_` to namespace within the shared database.

| ERD Table | Database Table | Pass |
|-----------|----------------|------|
| PROSPECT | sn_prospect | CAPTURE |
| SALES_PROCESS | sn_sales_process | COMPUTE |
| MEETING | sn_meeting | COMPUTE |
| MEETING_OUTCOME | sn_meeting_outcome | GOVERN |

### 3. Hub Traceability

Every table includes a `hub_id` column defaulting to `HUB-SALES-NAV-20260130` for:
- Cross-hub query isolation
- Audit trail support
- Future multi-tenant capability

### 4. Lineage Preservation

The `sn_prospect.raw_intake_data` JSONB column preserves the original CRM payload as an immutable constant, satisfying the CONST → VAR transformation requirement.

### 5. Referential Integrity

Foreign key constraints enforce the data lineage:
```
sn_prospect
    ↓ FK
sn_sales_process
    ↓ FK
sn_meeting
    ↓ FK
sn_meeting_outcome
```

All FKs use `ON DELETE CASCADE` to maintain consistency.

---

## Schema Details

### sn_prospect (CAPTURE Pass)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMPTZ | Intake timestamp |
| updated_at | TIMESTAMPTZ | Last modification |
| name | TEXT | Prospect full name |
| email | TEXT | Contact email (unique if not null) |
| phone | TEXT | Contact phone |
| source | TEXT | CRM source identifier |
| status | TEXT | new\|contacted\|qualified\|disqualified\|deferred |
| raw_intake_data | JSONB | **CONSTANT**: Original CRM payload |
| hub_id | TEXT | Hub identifier |

### sn_sales_process (COMPUTE Pass)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| prospect_id | UUID | FK to sn_prospect |
| current_meeting | INTEGER | Current meeting (1-4) |
| overall_status | TEXT | pending\|in_progress\|completed\|abandoned |
| started_at | TIMESTAMPTZ | Process start |
| completed_at | TIMESTAMPTZ | Process completion |
| final_outcome | TEXT | **VARIABLE**: qualified\|disqualified\|deferred |
| hub_id | TEXT | Hub identifier |

### sn_meeting (COMPUTE Pass)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| prospect_id | UUID | FK to sn_prospect |
| sales_process_id | UUID | FK to sn_sales_process |
| meeting_number | INTEGER | Sequence (1-4) |
| meeting_type | TEXT | fact_finder\|insurance_ed\|systems_ed\|financials |
| status | TEXT | scheduled\|in_progress\|completed\|skipped\|cancelled |
| scheduled_at | TIMESTAMPTZ | Scheduled time |
| started_at | TIMESTAMPTZ | Actual start |
| completed_at | TIMESTAMPTZ | Completion time |
| notes | TEXT | Meeting notes |
| hub_id | TEXT | Hub identifier |

### sn_meeting_outcome (GOVERN Pass)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| meeting_id | UUID | FK to sn_meeting |
| outcome_type | TEXT | positive\|neutral\|negative\|deferred |
| summary | TEXT | Outcome summary |
| action_items | JSONB | **VARIABLE**: Next steps array |
| collected_data | JSONB | **VARIABLE**: Meeting-specific data |
| hub_id | TEXT | Hub identifier |

---

## Constraints

### Check Constraints

- `sn_prospect.status` must be valid status enum
- `sn_sales_process.current_meeting` must be 1-4
- `sn_sales_process.overall_status` must be valid status enum
- `sn_meeting.meeting_number` must be 1-4
- `sn_meeting.meeting_type` must be valid type enum
- `sn_meeting.status` must be valid status enum
- `sn_meeting_outcome.outcome_type` must be valid type enum

### Unique Constraints

- `sn_prospect.email` unique where not null (partial index)
- `sn_sales_process(prospect_id)` unique where status in ('pending', 'in_progress')
- `sn_meeting(sales_process_id, meeting_number)` unique
- `sn_meeting_outcome(meeting_id)` unique

---

## Migration

| Field | Value |
|-------|-------|
| Migration File | `src/data/migrations/001_create_sales_navigator_schema.sql` |
| Executed | 2026-02-05 |
| Status | COMPLETED |
| Migration Log Entry | `sn_001_create_sales_navigator_schema` |

---

## Consequences

### Positive

- Schema directly implements canonical ERD
- CONST → VAR transformation traceable via `raw_intake_data`
- Hub isolation via `hub_id` column
- Standard PostgreSQL features (UUID, JSONB, triggers)
- Migration logged for audit compliance

### Negative

- Shared database requires namespace prefix (`sn_`)
- Must coordinate with other hubs on schema changes
- Doppler dependency for connection credentials

### Neutral

- Empty tables until data loading phase
- Indexes optimized for expected query patterns

---

## Compliance

| Check | Status |
|-------|--------|
| ERD tables implemented | PASS |
| Pass ownership declared | PASS |
| Lineage mechanism (FK chain) | PASS |
| CONST preserved (raw_intake_data) | PASS |
| Hub traceability (hub_id) | PASS |
| Migration logged | PASS |

---

## References

| Artifact | Location |
|----------|----------|
| Canonical ERD | docs/ERD.md |
| PRD | docs/PRD.md |
| Migration SQL | src/data/migrations/001_create_sales_navigator_schema.sql |
| ERD Metrics | erd/ERD_METRICS.yaml |
| Doppler Project | sales-navigator |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-02-05 |
| Author | claude-code |
| Status | ACCEPTED |
| Hub | HUB-SALES-NAV-20260130 |
