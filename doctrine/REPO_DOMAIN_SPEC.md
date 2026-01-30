# Repository Domain Specification

**Status**: ACTIVE
**Authority**: Derived from IMO-Creator
**Version**: 1.0.0

---

## Domain Binding

This file binds the generic IMO-Creator doctrine to the **SALES** domain.

| Field | Value |
|-------|-------|
| **Domain** | Sales Process Management |
| **Hub Type** | SALES |
| **Data Ownership** | READ-ONLY (does not own source data) |

---

## Domain-Specific Constants

| Generic Role | Sales Binding | Description |
|--------------|---------------|-------------|
| `primary_entity` | `prospect` | The person being sold to |
| `workflow_unit` | `meeting` | The atomic work unit |
| `workflow_count` | `4` | Fixed number of meetings |
| `intake_source` | `CRM` | External system providing prospects |
| `output_destination` | `Reports` | Analytics and documentation |

---

## Meeting Definitions

### Meeting 1: Fact Finder

| Field | Value |
|-------|-------|
| **Sequence** | 1 of 4 |
| **Pass Type** | CAPTURE → COMPUTE |
| **Input Constants** | Raw prospect data from CRM |
| **Output Variables** | Fact finder worksheet, qualification status |
| **Logic Location** | `src/app/meetings/meeting1/` |
| **UI Location** | `src/ui/pages/sales/Meeting1.tsx` |

### Meeting 2: Insurance Education

| Field | Value |
|-------|-------|
| **Sequence** | 2 of 4 |
| **Pass Type** | COMPUTE |
| **Input Constants** | Fact finder results |
| **Output Variables** | Education notes, interest indicators |
| **Logic Location** | `src/app/meetings/meeting2/` |
| **UI Location** | `src/ui/pages/sales/Meeting2.tsx` |

### Meeting 3: Systems Education

| Field | Value |
|-------|-------|
| **Sequence** | 3 of 4 |
| **Pass Type** | COMPUTE |
| **Input Constants** | Education outcomes |
| **Output Variables** | System preferences, feature priorities |
| **Logic Location** | `src/app/meetings/meeting3/` |
| **UI Location** | `src/ui/pages/sales/Meeting3.tsx` |

### Meeting 4: Financials / Numbers

| Field | Value |
|-------|-------|
| **Sequence** | 4 of 4 |
| **Pass Type** | COMPUTE → GOVERN |
| **Input Constants** | All prior meeting outcomes |
| **Output Variables** | Decision outcome, next steps, final report |
| **Logic Location** | `src/app/meetings/meeting4/` |
| **UI Location** | `src/ui/pages/sales/Meeting4.tsx` |

---

## Data Access Patterns

### Source of Truth Declaration

| Data | Source of Truth | This Hub's Access |
|------|-----------------|-------------------|
| Prospect Information | External CRM | READ-ONLY |
| Meeting Templates | This Hub | OWNER |
| Meeting Outcomes | This Hub | OWNER |
| Sales Reports | This Hub | OWNER |
| Integration Credentials | Doppler | READ-ONLY |

### Data Flow

```
CRM (External)
    │
    ▼ [READ-ONLY INGRESS]
┌───────────────────┐
│  Sales Navigator  │
│    (This Hub)     │
│                   │
│  ┌─────────────┐  │
│  │  Meeting 1  │──┼──► Fact Finder Data
│  └─────────────┘  │
│        │          │
│        ▼          │
│  ┌─────────────┐  │
│  │  Meeting 2  │──┼──► Education Data
│  └─────────────┘  │
│        │          │
│        ▼          │
│  ┌─────────────┐  │
│  │  Meeting 3  │──┼──► Systems Data
│  └─────────────┘  │
│        │          │
│        ▼          │
│  ┌─────────────┐  │
│  │  Meeting 4  │──┼──► Decision Data
│  └─────────────┘  │
│        │          │
└────────┼──────────┘
         │
         ▼ [EGRESS]
    Reports + Analytics
```

---

## CTB Branch Mapping (Sales Domain)

| CTB Branch | Sales-Specific Content |
|------------|------------------------|
| `src/sys/` | Doppler integration, Composio MCP setup, env loaders |
| `src/data/` | Meeting schemas, prospect data models, query definitions |
| `src/app/` | Meeting workflows, sales process logic, state management |
| `src/ai/` | Sales assistant agents, meeting summarizers, LLM prompts |
| `src/ui/` | Lovable.dev components, meeting pages, sales dashboard |

---

## Integration Bindings

| Integration | Purpose | Doppler Secret Key |
|-------------|---------|-------------------|
| Composio MCP | External API gateway | `COMPOSIO_API_KEY` |
| Supabase | Data persistence | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| Anthropic | AI processing | `ANTHROPIC_API_KEY` |
| OpenAI | AI processing | `OPENAI_API_KEY` |

---

## Validation Rules (Sales-Specific)

| Rule | Enforcement |
|------|-------------|
| Meeting sequence must be 1→2→3→4 | MANDATORY |
| Prospect data is read-only | MANDATORY |
| All secrets from Doppler | MANDATORY |
| UI via Lovable.dev patterns | RECOMMENDED |

---

## Forbidden in Sales Domain

| Pattern | Reason |
|---------|--------|
| Direct CRM writes | This hub does not own CRM data |
| Hardcoded prospect data | Must come from intake |
| Meeting skip without audit | Process integrity |
| Non-Doppler secrets | Security compliance |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Authority | IMO-Creator (Inherited) |
