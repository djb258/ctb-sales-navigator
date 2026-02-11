# PRD — Sales Navigator Hub

## Conformance

| Field | Value |
|-------|-------|
| **Doctrine Version** | 2.0.0 |
| **CTB Version** | 2.0.0 |
| **CC Layer** | CC-02 |
| **HEIR Schema** | HEIR/2.0 |

---

## 1. Sovereign Reference (CC-01)

| Field | Value |
|-------|-------|
| **Sovereign ID** | SOV-SVG-AGENCY |
| **Sovereign Boundary** | SVG Agency Sales Operations |

---

## 2. Hub Identity (CC-02)

| Field | Value |
|-------|-------|
| **Hub Name** | sales-navigator |
| **Hub ID** | HUB-SALES-NAV-20260130 |
| **Owner** | SVG Agency |
| **Version** | 2.0.0 |

---

## 3. Purpose & Transformation Declaration

This hub orchestrates the SVG Agency 4-meeting sales process. It provides a structured workflow for sales representatives to guide prospects through discovery, education, and decision-making phases.

### Transformation Statement (REQUIRED)

> **"This system transforms raw prospect intake data (CONSTANTS) into qualified sales decisions and documented meeting outcomes (VARIABLES)."**

| Field | Value |
|-------|-------|
| **Transformation Summary** | Raw CRM intake → 4-phase meeting progression → Approved quote / promotion to client |

### Constants (Inputs)

| Constant | Source | Description |
|----------|--------|-------------|
| `prospect_data` | CRM Intake Gateway | Raw prospect information from external CRM |
| `meeting_templates` | Doctrine | Structured meeting frameworks per sub-hub |
| `integration_credentials` | Doppler | API keys and secrets (managed externally) |
| `sales_rules` | Doctrine | Business rules for sales process |

### Variables (Outputs)

| Variable | Destination | Description |
|----------|-------------|-------------|
| `current_phase` | `sales.sales_state` | Active meeting phase for the sales process |
| `factfinder_data` | `sales.sales_factfinder` | Employer info, employee count, renewal month |
| `insurance_data` | `sales.sales_insurance` | Funding model, strategy selection |
| `systems_data` | `sales.sales_systems` | Payroll system, admin model, compliance owner |
| `quote_data` | `sales.sales_quotes` | Quote version, total cost, approval flag |
| `error_events` | `sales.*_errors` | Append-only error logs per sub-hub |

### Pass Structure

| Pass | Type | IMO Layer | Description |
|------|------|-----------|-------------|
| Intake | CAPTURE | I (Ingress) | Receive prospect data from CRM, validate schema, mint `sales_id` |
| Process | COMPUTE | M (Middle) | Execute meeting workflows across 4 sub-hubs, apply sales logic |
| Output | GOVERN | O (Egress) | Generate reports, fire `PROMOTE_TO_CLIENT` event on approval |

### Scope Boundary

| Scope | Description |
|-------|-------------|
| **IN SCOPE** | 4-meeting sales process, prospect tracking, meeting documentation, sales analytics, ORBT error logging |
| **OUT OF SCOPE** | CRM source data mutation, payment processing, contract generation, legal compliance |

---

## 4. CTB Placement

| Field | Value | CC Layer |
|-------|-------|----------|
| **Trunk** | sales-navigator | CC-02 |
| **Branch** | sales | CC-02 |
| **Leaf** | meetings | CC-02 |

---

## 5. IMO Structure (CC-02)

| Layer | Role | Description | CC Layer |
|-------|------|-------------|----------|
| **I — Ingress** | Dumb input only | Receives prospect data from CRM; no logic, no state | CC-02 |
| **M — Middle** | Logic, decisions, state | All meeting processing, phase transitions, ORBT logging | CC-02 |
| **O — Egress** | Output only | Emits reports, fires promotion events; no logic, no state | CC-02 |

---

## 6. Spokes (CC-03 Interfaces)

| Spoke Name | Type | Direction | Contract | CC Layer |
|------------|------|-----------|----------|----------|
| CRM Intake Gateway | I | Inbound | Read-only prospect data | CC-03 |
| Composio MCP Interface | I | Inbound | External API access | CC-03 |
| Lovable UI | O | Outbound | Presentation layer | CC-03 |
| Report Generator | O | Outbound | Sales analytics output | CC-03 |

---

## 7. Database Schema (Sales CTB Backbone)

### Spine Table

| Table | PK | Purpose |
|-------|----|---------|
| `sales.sales_state` | `sales_id TEXT` | Phase router — gates which sub-hub is active |

### Sub-Hub Tables (2 per sub-hub: canonical + errors)

| # | Sub-Hub | Canonical Table | Error Table | Meeting |
|---|---------|-----------------|-------------|---------|
| 1 | FactFinder | `sales.sales_factfinder` | `sales.sales_factfinder_errors` | Meeting 1 |
| 2 | Insurance | `sales.sales_insurance` | `sales.sales_insurance_errors` | Meeting 2 |
| 3 | Systems | `sales.sales_systems` | `sales.sales_systems_errors` | Meeting 3 |
| 4 | Quotes | `sales.sales_quotes` | `sales.sales_quotes_errors` | Meeting 4 |

### Universal Join Key

All tables join on `sales_id TEXT`. See `docs/OSAM.md` for allowed join paths.

### Promotion Contract

When `sales.sales_quotes.approved_flag = true`, the `PROMOTE_TO_CLIENT` event fires. See `sales/contracts/promote_to_client.json`.

---

## 8. Meeting Definitions (Domain-Specific)

### Meeting 1: FactFinder

| Field | Value |
|-------|-------|
| **Purpose** | Gather employer information, establish needs |
| **Inputs** | Raw prospect data |
| **Outputs** | Employer name, employee count, renewal month, prior broker |
| **Canonical Table** | `sales.sales_factfinder` |
| **Pass** | CAPTURE → COMPUTE |

### Meeting 2: Insurance Education

| Field | Value |
|-------|-------|
| **Purpose** | Educate prospect on insurance options, select funding model |
| **Inputs** | FactFinder results |
| **Outputs** | Funding model, strategy selection |
| **Canonical Table** | `sales.sales_insurance` |
| **Pass** | COMPUTE |

### Meeting 3: Systems Education

| Field | Value |
|-------|-------|
| **Purpose** | Assess operations, payroll, admin model |
| **Inputs** | Insurance outcomes |
| **Outputs** | Payroll system, admin model, compliance owner |
| **Canonical Table** | `sales.sales_systems` |
| **Pass** | COMPUTE |

### Meeting 4: Financials / Quotes

| Field | Value |
|-------|-------|
| **Purpose** | Present financials, generate quote, close decision |
| **Inputs** | All prior meeting outcomes |
| **Outputs** | Quote version, total cost, approved flag |
| **Canonical Table** | `sales.sales_quotes` |
| **Pass** | COMPUTE → GOVERN |

---

## 9. Constants vs Variables

| Element | Type | Mutability | CC Layer |
|---------|------|------------|----------|
| Hub ID | Constant | Immutable | CC-02 |
| Hub Name | Constant | ADR-gated | CC-02 |
| Meeting Count (4) | Constant | ADR-gated | CC-02 |
| Meeting Order | Constant | ADR-gated | CC-02 |
| Universal Join Key (`sales_id`) | Constant | Immutable | CC-02 |
| 2-Table Pattern | Constant | ADR-gated | CC-02 |
| `current_phase` | Variable | Runtime | CC-04 |
| Sub-hub canonical data | Variable | Runtime | CC-04 |
| Error log entries | Variable | Append-only | CC-04 |

---

## 10. Tools

All tools are scoped strictly INSIDE this hub's M layer. Spokes do not own tools.

| Tool | Solution Type | CC Layer | IMO Layer | ADR Reference |
|------|---------------|----------|-----------|---------------|
| Doppler | Secrets Management | CC-02 | M | ADR-002 |
| Composio MCP | Integration Gateway | CC-02 | M | Inherited |
| Neon | PostgreSQL Database | CC-02 | M | ADR-005 |

---

## 11. OSAM Reference

Query routing for this hub is governed by `docs/OSAM.md`.

| OSAM Element | Value |
|--------------|-------|
| **Spine Table** | `sales.sales_state` |
| **Universal Join Key** | `sales_id TEXT` |
| **Query Surfaces** | 5 (spine + 4 canonical tables) |
| **AUDIT Tables** | 4 (error tables) + ORBT |
| **Forbidden Joins** | Cross-sub-hub direct joins |

**No query may be executed unless routed through OSAM.**

---

## 12. HEIR Reference

Hub identity is declared in `heir.doctrine.yaml`.

| HEIR Element | Value |
|--------------|-------|
| **Schema Version** | HEIR/2.0 |
| **Sovereign** | SOV-SVG-AGENCY |
| **Hub ID** | HUB-SALES-NAV-20260130 |
| **Secrets Provider** | Doppler |
| **ORBT Integration** | Active |

---

## 13. ORBT Reference

Error logging follows the ORBT (Operate, Repair, Build, Train) standard.

| ORBT Element | Value |
|--------------|-------|
| **Error Table** | `shq.orbt_error_log` |
| **Repo Name** | `sales-navigator` |
| **Layers** | System, Operation, Repair, Build, Training |
| **Altitude Levels** | 60k, 40k, 30k, 20k, 10k, 5k |
| **Process ID Pattern** | `PRC-SALES-{EPOCH_TIMESTAMP}` |
| **Unique ID Pattern** | `HEIR-2026-02-SALES-{LAYER}-{SEQ}` |

Sub-hub error tables (`sales.*_errors`) capture domain-specific errors. ORBT captures cross-repo observability.

---

## 14. Guard Rails

| Guard Rail | Type | Threshold | CC Layer |
|------------|------|-----------|----------|
| CRM Read Rate | Rate Limit | 100 req/min | CC-03 |
| Meeting Timeout | Timeout | 30 minutes idle | CC-04 |
| Input Validation | Validation | Schema compliance | CC-03 |
| Error Log Size | Alert | 100 errors/hour | CC-04 |

---

## 15. Kill Switch

| Field | Value |
|-------|-------|
| **Activation Criteria** | Data breach, system abuse, compliance violation |
| **Trigger Authority** | CC-02 (Hub) / CC-01 (Sovereign) |
| **Emergency Contact** | SVG Agency Operations |

---

## 16. Promotion Gates

| Gate | Artifact | CC Layer | Requirement |
|------|----------|----------|-------------|
| G1 | PRD | CC-02 | Hub definition approved |
| G2 | OSAM | CC-02 | Query routing declared |
| G3 | HEIR | CC-02 | Hub identity record created |
| G4 | ADR | CC-03 | Architecture decisions recorded |
| G5 | Work Item | CC-04 | Execution item created |
| G6 | PR | CC-04 | Code reviewed and merged |
| G7 | Checklist | CC-04 | Compliance verification complete |

---

## 17. Failure Modes

| Failure | Severity | CC Layer | ORBT Layer | Remediation |
|---------|----------|----------|------------|-------------|
| CRM connection lost | HIGH | CC-03 | Operation | Retry with backoff, notify user |
| Doppler unavailable | CRITICAL | CC-02 | System | Halt all operations, escalate |
| Phase data corruption | CRITICAL | CC-04 | Operation | Restore from checkpoint, audit |
| ORBT log write failure | HIGH | CC-04 | System | Buffer locally, retry |

---

## 18. PID Scope (CC-04)

| Field | Value |
|-------|-------|
| **PID Pattern** | `HUB-SALES-NAV-20260130-${TIMESTAMP}-${RANDOM_HEX}` |
| **Retry Policy** | New PID per retry |
| **Audit Trail** | Required |

---

## 19. Human Override Rules

- Sales manager may skip meeting (requires reason documentation)
- Hub owner may pause all processes (emergency only)
- Doppler access requires human approval for production

---

## 20. Observability

| Type | Description | CC Layer |
|------|-------------|----------|
| **Logs** | Meeting progress, phase transitions, errors | CC-04 |
| **Metrics** | Meeting completion rates, time-to-close, error rates | CC-04 |
| **Alerts** | Failed meetings, system errors, ORBT threshold breaches | CC-03/CC-04 |
| **ORBT** | Cross-repo error classification by layer and altitude | CC-04 |

---

## Approval

| Role | Name | Date |
|------|------|------|
| Sovereign (CC-01) | SVG Agency | 2026-01-30 |
| Hub Owner (CC-02) | [Pending] | |
| Reviewer | [Pending] | |

---

## Traceability

| Artifact | Reference |
|----------|-----------|
| Canonical Architecture | templates/doctrine/ARCHITECTURE.md |
| OSAM | docs/OSAM.md |
| HEIR | heir.doctrine.yaml |
| Canonical ERD | docs/ERD.md |
| Sales CTB Backbone | sales/doctrine/SALES_CTB.md |
| Doppler Integration | docs/ADR-002-doppler-secrets.md |
| Neon Schema | docs/ADR-005-neon-schema.md |
| Kill Switch | docs/KILL_SWITCH.md |
| Rollback Plan | docs/ROLLBACK_PLAN.md |
| Observability | docs/OBSERVABILITY.md |
| Promotion Contract | sales/contracts/promote_to_client.json |

---

## Gate Declaration

**NO CODE MAY EXIST BEFORE CC-03 GATE IS PASSED.**

This PRD satisfies CC-02. ADRs (CC-03) must be created and approved before any implementation work at CC-04.
