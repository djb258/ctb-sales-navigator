# Sales Cycle Flow

This visual companion shows the full sales cycle as one gated runtime: calendar booking creates the spine, Gate 1 through Gate 4 execute in order, the vendor loop runs in parallel, and the portal stays live across the entire cycle.

```mermaid
flowchart TB
  CAL[Calendar booking] --> SPINE[Outreach to Sales handoff\nsovereign_id -> sales_id]
  SPINE --> G1[Gate 1 Factfinder\npre-video + meeting + checklist]
  G1 --> G2[Gate 2 Education\npre-video + meeting + quote-it fork]
  G2 --> LOOP[Async vendor pricing loop\ncron-driven]
  G2 --> G3[Gate 3 Service\npre-video + meeting + service state]
  LOOP --> PRE[DB-filled precondition]
  G3 --> PRE
  PRE --> G4[Gate 4 Numbers\npre-video + proposal presentation]
  G4 --> CLOSE{Close}
  CLOSE -->|Won| WON[SALE-WON]
  CLOSE -->|Lost| LOST[SALE-LOST]
  PORTAL[Persistent portal page] --- G1
  PORTAL --- G2
  PORTAL --- G3
  PORTAL --- G4
```

Legend:
- Calendar trigger: the next meeting is booked and the stage advances.
- Cron trigger: the vendor loop runs asynchronously until all invoice-backed rows are parsed.
- Precondition trigger: Gate 4 waits until the database is fully filled.

## Peer Cross-Links (per dispatch DISPATCH_UT_SALES_REPAIR_2026-04-22.md)

| Peer Artifact | Role | Path |
|---------------|------|------|
| Blueprint UT | 30k hub-level manual | `Sales Process/UT_BLUEPRINT.md` |
| Process UT | 10k operational manual | `Barton-Processes/factory/sales/UT_PROCESS.md` |
| Dispatch | Governing work order | `imo-creator-v2/factory/dispatch/DISPATCH_UT_SALES_REPAIR_2026-04-22.md` |
| Audit Report | Gate 3 audit verdict | `imo-creator-v2/law/doctrine/AUDITS/SALES_UT_AUDIT_2026-04-22.md` |
