# PRD — Sales Navigator Hub

## Conformance

| Field | Value |
|-------|-------|
| **Doctrine Version** | 1.5.0 |
| **CTB Version** | 1.1.0 |
| **CC Layer** | CC-02 |

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
| **Version** | 1.0.0 |

---

## 3. Purpose & Transformation Declaration

This hub orchestrates the SVG Agency 4-meeting sales process. It provides a structured workflow for sales representatives to guide prospects through discovery, education, and decision-making phases.

### Transformation Statement (REQUIRED)

> **"This system transforms raw prospect intake data (CONSTANTS) into qualified sales decisions and documented meeting outcomes (VARIABLES)."**

| Field | Value |
|-------|-------|
| **Transformation Summary** | Raw CRM intake → Structured meeting progression → Documented outcomes |

### Constants (Inputs)

| Constant | Source | Description |
|----------|--------|-------------|
| `prospect_data` | CRM Intake Gateway | Raw prospect information from external CRM |
| `meeting_templates` | Lovable.dev | Structured meeting frameworks |
| `integration_credentials` | Doppler | API keys and secrets (managed externally) |
| `sales_rules` | Doctrine | Business rules for sales process |

### Variables (Outputs)

| Variable | Destination | Description |
|----------|-------------|-------------|
| `meeting_outcomes` | Database | Documented results of each meeting |
| `prospect_status` | CRM | Updated qualification status |
| `action_items` | Reports | Follow-up tasks per meeting |
| `sales_analytics` | Dashboard | Aggregated sales metrics |

### Pass Structure

| Pass | Type | IMO Layer | Description |
|------|------|-----------|-------------|
| Intake | CAPTURE | I (Ingress) | Receive prospect data from CRM, validate schema |
| Process | COMPUTE | M (Middle) | Execute meeting workflows, apply sales logic |
| Output | GOVERN | O (Egress) | Generate reports, update CRM, enforce governance |

### Scope Boundary

| Scope | Description |
|-------|-------------|
| **IN SCOPE** | 4-meeting sales process, prospect tracking, meeting documentation, sales analytics |
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
| **M — Middle** | Logic, decisions, state | All meeting processing occurs here inside the hub | CC-02 |
| **O — Egress** | Output only | Emits reports and analytics; no logic, no state | CC-02 |

---

## 6. Spokes (CC-03 Interfaces)

| Spoke Name | Type | Direction | Contract | CC Layer |
|------------|------|-----------|----------|----------|
| CRM Intake Gateway | I | Inbound | Read-only prospect data | CC-03 |
| Composio MCP Interface | I | Inbound | External API access | CC-03 |
| Lovable UI | O | Outbound | Presentation layer | CC-03 |
| Report Generator | O | Outbound | Sales analytics output | CC-03 |

---

## 7. Meeting Definitions (Domain-Specific)

### Meeting 1: Fact Finder

| Field | Value |
|-------|-------|
| **Purpose** | Gather prospect information, establish needs |
| **Inputs** | Raw prospect data |
| **Outputs** | Fact finder worksheet, qualification status |
| **Pass** | CAPTURE → COMPUTE |

### Meeting 2: Insurance Education

| Field | Value |
|-------|-------|
| **Purpose** | Educate prospect on insurance options |
| **Inputs** | Fact finder results |
| **Outputs** | Education notes, interest indicators |
| **Pass** | COMPUTE |

### Meeting 3: Systems Education

| Field | Value |
|-------|-------|
| **Purpose** | Present systems and solutions |
| **Inputs** | Education outcomes |
| **Outputs** | System preferences, feature priorities |
| **Pass** | COMPUTE |

### Meeting 4: Financials / Numbers

| Field | Value |
|-------|-------|
| **Purpose** | Present financial details, close decision |
| **Inputs** | All prior meeting outcomes |
| **Outputs** | Decision outcome, next steps |
| **Pass** | COMPUTE → GOVERN |

---

## 8. Constants vs Variables

| Element | Type | Mutability | CC Layer |
|---------|------|------------|----------|
| Hub ID | Constant | Immutable | CC-02 |
| Hub Name | Constant | ADR-gated | CC-02 |
| Meeting Count (4) | Constant | ADR-gated | CC-02 |
| Meeting Order | Constant | ADR-gated | CC-02 |
| Prospect Status | Variable | Runtime | CC-04 |
| Meeting Outcomes | Variable | Runtime | CC-04 |

---

## 9. Tools

All tools are scoped strictly INSIDE this hub's M layer. Spokes do not own tools.

| Tool | Solution Type | CC Layer | IMO Layer | ADR Reference |
|------|---------------|----------|-----------|---------------|
| Doppler | Secrets Management | CC-02 | M | ADR-002 |
| Composio MCP | Integration Gateway | CC-02 | M | Inherited |
| Supabase | Data Layer | CC-02 | M | Pending |

---

## 10. Guard Rails

| Guard Rail | Type | Threshold | CC Layer |
|------------|------|-----------|----------|
| CRM Read Rate | Rate Limit | 100 req/min | CC-03 |
| Meeting Timeout | Timeout | 30 minutes idle | CC-04 |
| Input Validation | Validation | Schema compliance | CC-03 |

---

## 11. Kill Switch

| Field | Value |
|-------|-------|
| **Activation Criteria** | Data breach, system abuse, compliance violation |
| **Trigger Authority** | CC-02 (Hub) / CC-01 (Sovereign) |
| **Emergency Contact** | SVG Agency Operations |

---

## 12. Promotion Gates

| Gate | Artifact | CC Layer | Requirement |
|------|----------|----------|-------------|
| G1 | PRD | CC-02 | Hub definition approved |
| G2 | ADR | CC-03 | Architecture decisions recorded |
| G3 | Work Item | CC-04 | Execution item created |
| G4 | PR | CC-04 | Code reviewed and merged |
| G5 | Checklist | CC-04 | Compliance verification complete |

---

## 13. Failure Modes

| Failure | Severity | CC Layer | Remediation |
|---------|----------|----------|-------------|
| CRM connection lost | HIGH | CC-03 | Retry with backoff, notify user |
| Doppler unavailable | CRITICAL | CC-02 | Halt all operations, escalate |
| Meeting data corruption | CRITICAL | CC-04 | Restore from checkpoint, audit |

---

## 14. PID Scope (CC-04)

| Field | Value |
|-------|-------|
| **PID Pattern** | `SALES-NAV-${TIMESTAMP}-${RANDOM_HEX}` |
| **Retry Policy** | New PID per retry |
| **Audit Trail** | Required |

---

## 15. Human Override Rules

- Sales manager may skip meeting (requires reason documentation)
- Hub owner may pause all processes (emergency only)
- Doppler access requires human approval for production

---

## 16. Observability

| Type | Description | CC Layer |
|------|-------------|----------|
| **Logs** | Meeting progress, errors, decisions | CC-04 |
| **Metrics** | Meeting completion rates, time-to-close | CC-04 |
| **Alerts** | Failed meetings, system errors | CC-03/CC-04 |

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
| Canonical Doctrine | CANONICAL_ARCHITECTURE_DOCTRINE.md |
| Hub/Spoke Geometry | CANONICAL_ARCHITECTURE_DOCTRINE.md §3 |
| Doppler Integration | ADR-002-doppler-secrets.md |

---

## Gate Declaration

**NO CODE MAY EXIST BEFORE CC-03 GATE IS PASSED.**

This PRD satisfies CC-02. ADRs (CC-03) must be created and approved before any implementation work at CC-04.
