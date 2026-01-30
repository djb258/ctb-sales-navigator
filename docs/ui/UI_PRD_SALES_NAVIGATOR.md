# UI PRD — Sales Navigator

**Status**: DERIVED
**Authority**: UI_CONSTITUTION.md
**Version**: 1.0.0
**Hub**: HUB-SALES-NAV-20260130

---

## 1. UI Identity

| Field | Value |
|-------|-------|
| **UI Name** | Sales Navigator UI |
| **Owning Hub** | HUB-SALES-NAV-20260130 |
| **UI Type** | Web Application (React) |
| **Entry Point** | src/ui/main.tsx |

---

## 2. Transformation Context

This UI supports the hub transformation:

> **Transform raw prospect data into qualified sales outcomes through a 4-meeting orchestrated process.**

### UI Role in Transformation

| Transformation Phase | UI Responsibility |
|---------------------|-------------------|
| Capture prospect data | Display intake forms, emit form submissions |
| Track meeting progress | Display meeting status, emit navigation intents |
| Record meeting outcomes | Display outcome forms, emit completion events |
| Show qualification status | Display final status (read-only) |

---

## 3. Explicit Exclusions

This UI does NOT:

| Exclusion | Reason |
|-----------|--------|
| Calculate lead scores | Business logic (hub M layer) |
| Determine qualification status | Business logic (hub M layer) |
| Store prospect data | Persistence (hub data layer) |
| Make meeting scheduling decisions | Business logic (hub M layer) |
| Access CRM directly | External API (hub sys layer via Composio) |

---

## 4. Screens / Views

| Screen | Purpose | Type | Route |
|--------|---------|------|-------|
| **Sales Process Hub** | Dashboard overview | Read + Event | `/` |
| **CRM Intake Gateway** | Prospect intake form | Event-emitting | `/crm-intake` |
| **Meeting 1: Fact Finder** | Meeting 1 interface | Read + Event | `/meeting/1` |
| **Meeting 2: Insurance Education** | Meeting 2 interface | Read + Event | `/meeting/2` |
| **Meeting 2 Workbench** | Meeting 2 detail view | Read + Event | `/meeting/2/workbench` |
| **Meeting 3: Systems Education** | Meeting 3 interface | Read + Event | `/meeting/3` |
| **Meeting 4: Financials** | Meeting 4 interface | Read + Event | `/meeting/4` |

---

## 5. Canonical Outputs Consumed (Read-Only)

| Output | Source | Display Purpose |
|--------|--------|-----------------|
| Prospect list | Supabase via hub | Show available prospects |
| Meeting status | Supabase via hub | Show progress indicators |
| Prospect profile | Supabase via hub | Show prospect details |
| Meeting notes | Supabase via hub | Show historical notes |
| Qualification status | Hub M layer | Show final outcome |

---

## 6. Events Emitted

| Event | Trigger | Payload |
|-------|---------|---------|
| `prospect.selected` | User selects prospect | `{ prospectId }` |
| `meeting.started` | User starts meeting | `{ meetingNumber, prospectId }` |
| `meeting.completed` | User completes meeting | `{ meetingNumber, prospectId, outcome }` |
| `form.submitted` | User submits form | `{ formType, data }` |
| `navigation.requested` | User navigates | `{ destination }` |

---

## 7. UI-Specific IMO Mapping

| IMO Layer | UI Implementation |
|-----------|-------------------|
| **Ingress** | Form components, input handlers |
| **Middle** | Layout components, React state, routing |
| **Egress** | Event emitters, API call triggers |

---

## 8. Failure States (Display Only)

| Failure | Display Behavior |
|---------|------------------|
| Data load failed | Show error message + retry button |
| Form validation failed | Show field-level errors |
| API call failed | Show toast notification |
| Unauthorized | Redirect to login |
| Not found | Show 404 page |

---

## 9. Read-Only vs Event-Emitting Surfaces

| Surface Type | Components |
|--------------|------------|
| **Read-Only** | ProgressIndicator, MeetingCard (view mode), Status badges |
| **Event-Emitting** | ClientSelector, MeetingNavigation, Form components, Buttons |

---

## 10. Forbidden Behaviors

| Behavior | Status |
|----------|--------|
| Direct Supabase queries in components | FORBIDDEN |
| Business logic in components | FORBIDDEN |
| State persistence beyond session | FORBIDDEN |
| Direct external API calls | FORBIDDEN |
| Cross-hub data access | FORBIDDEN |
| Hardcoded prospect data | FORBIDDEN |

---

## 11. Component Hierarchy

```
src/ui/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component
├── pages/
│   ├── Index.tsx               # Sales Process Hub
│   ├── NotFound.tsx            # 404 page
│   └── sales/
│       ├── SalesProcessHub.tsx # Dashboard
│       ├── CRMIntakeGateway.tsx# Intake form
│       ├── Meeting1.tsx        # Fact Finder
│       ├── Meeting2.tsx        # Insurance Education
│       ├── Meeting2Workbench.tsx
│       ├── Meeting3.tsx        # Systems Education
│       └── Meeting4.tsx        # Financials
├── components/
│   ├── sales/                  # Domain components
│   │   ├── ClientSelector.tsx
│   │   ├── MeetingCard.tsx
│   │   ├── MeetingNavigation.tsx
│   │   └── ProgressIndicator.tsx
│   └── [shadcn-ui components]  # Base components
├── hooks/                      # UI hooks
└── styles/                     # CSS
```

---

## 12. Validation Criteria

| # | Check | Pass Condition |
|---|-------|----------------|
| 1 | All screens map to hub responsibility | 1:1 mapping verified |
| 2 | No business logic in components | Logic in hooks/app layer |
| 3 | Events follow declared schema | All events match spec |
| 4 | Failures display correctly | Error states implemented |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | DERIVED |
| Authority | UI_CONSTITUTION.md |
| Hub | HUB-SALES-NAV-20260130 |
