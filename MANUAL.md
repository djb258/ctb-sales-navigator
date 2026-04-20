# Sales Sub-Hub
## The hub that runs the entire svg-agency sales process — four-gate qualification from prospect to closed, all logic owned here, nothing leaks to the spokes.
### Status: BUILD
### Medium: database + worker (sub-hub)
### Business: svg-agency

---

## 📋 UT Checklist (Pre-Flight — per law/UT_CHECKLIST.md v1.0.0)

| # | Check | Status | Location |
|---|-------|--------|----------|
| 1 | PRD — what / why / who / scope / out-of-scope / success metric | ☑ | §2 |
| 2 | OSAM — READ / WRITE / Process Composition / Join Chain / Forbidden / Query Routing filled | ☑ | §5 |
| 3 | Component Status — every dep 🟢 / 🟡 / 🔴 with 1-line state | ☑ | §3 |
| 4 | Owner — human who fixes this at 2 AM | ☑ | §1 |
| 5 | Live Dashboard — URL or explicit "N/A" | ☑ | §3 |
| 6 | Kill Switch — exact command to stop the process | ☑ | §8 |
| 7 | Logbook — last audit verdict + date (after certification only) | ☐ | §12 |
| 8 | FCEs Attached — which FCE runs structurally back this doc | ☑ | §3c |
| 9 | BARs Referenced — every BAR this doc touches, with status | ☑ | §3d |
| 10 | LBB Subjects Fed — which LBB subject(s) this doc's session logs go to | ☑ | §3e |
| 11 | Geometry — CTB position + Hub-Spoke role + Altitude | ☑ | §1b |
| 12 | Live Verification — every numeric count, cron, URL, command, BAR status grounded against the actual system | ☐ | §9b |

---

# IDENTITY (Thing — what this IS)

_Everything in this cluster answers: what exists? These are constants that don't change regardless of who reads this or when._

## 1. IDENTITY

| Field | Value |
|-------|-------|
| ID | DB-SALES / sales-sub-hub |
| Name | Sales Sub-Hub |
| Medium | database + worker (sub-hub) |
| Business Silo | svg-agency |
| CTB Position | branch — trunk: svg-agency / branch: sales |
| ORBT | BUILD |
| Strikes | 0 |
| Authority | inherited from svg-agency trunk (CC-01) |
| Last Modified | 2026-04-16 |
| BAR Reference | BAR-48 (content taxonomy), BAR-194 (sales presentation engine) |
| Owner | Dave Barton |

### 1b. Geometry (Checklist item 11 — Bedrock §4 + §7)

_Every UT doc must pin its geometry so a reader knows instantly where on the tree it sits, what hub-spoke role it plays, and what altitude it's written at._

**CTB Position:** `trunk → svg-agency → sales` (branch level — tactical through execution, 30k–5k)

**Hub-Spoke Role:** Hub. ALL sales process logic lives here. Spokes are the outreach system (feeding leads in) and the client silo (receiving closed accounts). No logic in the spokes — they carry only. The D1 database is the hub's retained state. Any future sales worker exposes the hub's logic via a rim (I/O boundary with schema validation).

**Altitude:** 30k tactical (gate selection, deal stage routing) down to 5k execution (quote approval, specific numbers, specific contacts).

```mermaid
flowchart LR
  subgraph CTB["CTB Tree"]
    TRUNK[trunk: svg-agency] --> BRANCH[branch: Sales Sub-Hub — THIS DOC]
  end

  subgraph TRACEBACK["Trace-back — Upstream Composition"]
    OUTREACH[Outreach Silo / LCS Hub] --> BRANCH
    VOICE[Voice Library — lcs_voice_library] --> BRANCH
    CTB_DOC[Insurance Informatics CTB doc] --> BRANCH
  end

  subgraph TRANSPORT["Hub-Spoke Transport"]
    RIM_IN[Rim / Input — lead signal / sovereign_company_id] --> HUB[Hub: D1 Sales DB + all gate logic]
    HUB --> RIM_OUT[Rim / Output — closed deal record / sovereign_id]
    HUB --> CLIENT[Spoke: Client Silo — CL Spine]
    HUB --> LBB_OUT[Spoke: LBB session log]
  end
```

_This doc IS the hub. All sales state lives in svg-d1-sales. Spokes feed it; they own no decisions._

### HEIR (8 fields — Aviation Model, Bedrock §8)

| Field | Value |
|-------|-------|
| sovereign_ref | imo-creator |
| hub_id | DB-SALES |
| ctb_placement | branch |
| imo_topology | middle (hub owns all transformation; input = lead signal; output = closed deal or disqualified) |
| cc_layer | CC-03 (context layer — sub-hub of svg-agency trunk) |
| services | Cloudflare D1 (svg-d1-sales, ID: 95835f64-db7f-43d4-b211-899b11a17c96), Doppler (secrets), LBB (session logging) |
| secrets_provider | Doppler — project: imo-creator, config: dev |
| acceptance_criteria | All four gate tables populated for a given sales_id with no errors; sales_state.current_phase advances sequentially; approved_flag=1 on sales_quotes before close |

---

## 2. PURPOSE (PRD)

_What breaks without it. What business outcome it serves. If you can't answer this, it shouldn't exist._

### WHAT

The Sales Sub-Hub is the stateful engine for every svg-agency sales engagement. It holds every prospect's journey through the four-gate qualification process — factfinder, insurance education, systems/service demo, and numbers/quote — and is the single source of truth for where each deal stands. Nothing moves without this hub knowing about it.

This system transforms raw prospect intake data (constants: prospect_data, meeting_templates, integration_credentials, sales_rules) into qualified sales decisions and documented meeting outcomes (variables: current_phase, factfinder_data, insurance_data, systems_data, quote_data, error_events).

**Transformation:** Raw CRM intake → 4-gate meeting progression → Approved quote / promotion to client.

### WHY

Without this hub, the sales process has no state. Gates collapse into each other, deals fall out of sequence, and Dave has no data on which prospects are at which gate or why they stalled. The hub is what turns Dave's four-gate IP into a repeatable, measurable process instead of a series of conversations that live in his head.

The four-gate process is built on the **90/10 rule**: 10% of employees cause 85% of claims cost. The entire sales education chain (Gates 1–4) moves a prospect from "I don't understand insurance costs" to "I see exactly where my money is going and here's how we fix it." Without this hub, that education chain has no backbone and no measurement.

### WHO

- **Dave Barton** — primary operator; reads gate status, pushes deals forward, reviews quote data
- **Sales presentation engine** (BAR-194) — writes gate data as meetings are completed
- **LCS Hub** — upstream feeder; provides the lead signal that opens a new sales_state record
- **Client silo** — downstream consumer; reads closed_won records to initialize client onboarding

### SCOPE (in)

- All four gates of the sales process (factfinder, insurance/Monte Carlo, service demo, quote)
- Prospect state tracking from first signal to closed_won or closed_lost
- Contact management for all decision-makers at a prospect company
- Interaction logging (emails, calls, meetings, notes) tied to gate number
- Quote versioning and approval tracking
- Error capture for every gate table (CQRS pattern — one canonical + one error table per gate)
- Insurance data (funding model, strategy) captured at gate 2
- Systems data (payroll, admin model, compliance owner) captured at gate 3
- Gate video delivery mapping (Gate 1–4 video content routing per prospect context)

### OUT-OF-SCOPE

- **Outreach/prospecting upstream of gate 1** — owned by the outreach silo (svg-d1-outreach-ops, LCS Hub)
- **Client onboarding post-close** — owned by the client silo (CL spine)
- **Content delivery (gate videos, PDFs)** — owned by BAR-194 / the sales presentation engine
- **Voice library content** — owned by `law/VOICE-LIBRARY.md` and `lcs_voice_library` table in spine D1
- **Insurance Informatics content architecture** — owned by `fleet/content/INSURANCE-INFORMATICS-CTB.md`
- **Financial modeling / Monte Carlo computation** — [PENDING — needs Dave input on which system runs the Monte Carlo math and where output is stored]
- **CRM source data mutation** — this hub reads outreach context but never writes back to it
- **Payment processing, contract generation, legal compliance** — outside scope

### SUCCESS METRIC

Gate advancement rate: percentage of prospects who advance from gate N to gate N+1 within 30 days of gate N completion. Target and tolerance [PENDING — needs Dave input on expected conversion rates per gate]. Points at §10a for numeric targets once baselines are established.

---

## 3. RESOURCES

_Everything this depends on. A mechanic reads this and knows exactly what to set up before it can run._

### Component Status Grid (Checklist item 3)

_One row per dependency. Every cross-ref carries HEIR + ORBT so the reader sees where it sits on the tree and how trustworthy it is._

| Component | HEIR (`hub_id · ctb_placement · cc_layer`) | ORBT | Light | State |
|-----------|---------------------------------------------|------|-------|-------|
| svg-d1-sales (D1 database) | DB-SALES · branch · CC-03 | BUILD | 🟢 | Schema deployed, 11 tables live, 0 rows (no deals yet) |
| LCS Hub (signal source) | lcs-hub · branch · CC-03 | OPERATE | 🟢 | Live at lcs-hub.svg-outreach.workers.dev, feeds leads to outreach silo |
| CL spine (client identity) | cl-spine · trunk · CC-02 | OPERATE | 🟢 | cl_company_identity live in svg-d1-spine; sovereign_id FK available |
| Outreach silo (lead source) | DB-OUTREACH · branch · CC-03 | OPERATE | 🟢 | outreach_company_target has 32,702 companies |
| Voice Library (scripts) | VOICE-LIB · leaf · CC-04 | BUILD | 🟡 | VOICE-LIBRARY.md exists; lcs_voice_library table seeded in spine D1 (BAR-285) |
| Insurance Informatics CTB | INS-CTB · branch · CC-03 | BUILD | 🟡 | Document live at fleet/content/INSURANCE-INFORMATICS-CTB.md; content not yet fully compiled into gate videos |
| Sales presentation engine | BAR-194 · leaf · CC-04 | BUILD | 🔴 | BAR-194 open; gate video generation not yet built |
| Doppler (secrets) | doppler · trunk · CC-01 | OPERATE | 🟢 | Project imo-creator, config dev, all keys accessible |
| LBB (session logging) | lbb · branch · CC-03 | OPERATE | 🟢 | lbb.svg-outreach.workers.dev live; svg-sales subject available |

### Live Dashboard (Checklist item 5)

| Resource | URL | What it shows |
|----------|-----|---------------|
| IMO Dashboard | https://imo-dashboard.pages.dev | Hub-spoke layout; sales sub-hub visible as branch node |
| D1 Sales DB (direct) | N/A — D1 only via wrangler CLI or bound worker | Table counts, row data |
| LCS Hub health | https://lcs-hub.svg-outreach.workers.dev/health | Worker up/down, last signal processed |

### Dependencies

| Dependency | Type | What It Provides | Status |
|-----------|------|-----------------|--------|
| svg-d1-sales (95835f64) | D1 database | All sales state storage | DONE |
| svg-d1-spine (641a9a1e) | D1 database | cl_company_identity (sovereign_id FK), lcs_voice_library | DONE |
| svg-d1-outreach-ops (73a285b8) | D1 database | outreach_company_target (lead source, company context) | DONE |
| LCS Hub compiler | Cloudflare Worker | Generates lead signals that trigger new sales_state records | DONE |
| Insurance Informatics CTB | Document | Content architecture for all four gate educations | DONE (doc) |
| Voice Library | Document + D1 table | Scripts for gate 1–4 videos and emails | DONE (doc), DONE (table) |
| Sales presentation engine | Worker (BAR-194) | Renders gate videos, writes gate completion events | PENDING — BAR-194 |
| Monte Carlo model | [PENDING — needs Dave input] | Computes two-path insurance divergence for gate 2 | PENDING |

### Downstream Consumers

| Consumer | What It Needs |
|----------|--------------|
| Client silo (CL spine) | sales_state.sovereign_id when current_phase = closed_won, to initiate onboarding |
| IMO Dashboard | sales_state counts by phase for pipeline view |
| LBB | Session summaries ingested per deal milestone (subject: svg-sales) |
| [PENDING — reporting layer] | Quote data, gate timing, conversion rates for pipeline analytics |

### Tools & Integrations

| Item | Type | Cost Tier | Credentials | What It Does |
|------|------|-----------|-------------|-------------|
| Cloudflare D1 | Database | Free (within Workers plan) | CF_API_TOKEN in Doppler | Hosts svg-d1-sales |
| Doppler | Secrets manager | Cheap | Native | Stores all env vars and API keys |
| LBB Worker | Knowledge store | Free (internal) | LBB_API_KEY in Doppler | Logs session learnings per deal |
| [PENDING — Monte Carlo] | [PENDING] | [PENDING] | [PENDING] | Runs gate 2 simulation |

### Secrets

| Secret | Doppler Project | Config | Used By |
|--------|----------------|--------|---------|
| LBB_API_KEY | imo-creator | dev | LBB session ingest after each gate completion |
| CF_API_TOKEN / GLOBAL_CLOUDFLARE_API_TOKEN | imo-creator | dev | D1 access via wrangler |
| [PENDING — sales worker secrets] | imo-creator | dev | Future sales worker binding to D1 |

### Reference Documents

The following reference materials are stored at `docs/reference/` and inform gate content:

| Document | File | Feeds | Meeting |
|----------|------|-------|---------|
| Product Data Warehouse | docs/reference/01-product-data-warehouse.pdf | Gate 1, Gate 3 | M1, M3 |
| Self-Insured Explained | docs/reference/02-self-insured-explained.pdf | Gate 2 (insurance education) | M2 |
| High-Dollar Claims Strategy | docs/reference/03-high-dollar-claims-strategy.pdf | Gate 2 (concierge model, 501R/RBP/MAP) | M2 |
| Service Model | docs/reference/04-service-model.pdf | Gate 3 (dashboards, ticketing, HR) | M3 |
| 90/15 Plan — The 90% | docs/reference/05-9015-plan-the-90-percent.xlsx | Gate 2 (two-plan structure) | M2 |
| MEC Plan with Prices | docs/reference/Mec Plan with Prices.xlsx | Gate 4 (quote context) | M4 |
| NotebookLM / Gemini Updates | docs/reference/NOTEBOOKLM-GEMINI-UPDATES-2026-04.md | Pipeline tooling | All |
| Voice Library | docs/reference/VOICE-LIBRARY.md | Gate scripts 1–4 | M1–M4 |

### Slide Library

236 slide PNGs stored in R2 bucket `svg-files` at `sales-materials/pages/{Deck}/page-{NN}.png`.

| Meeting | Decks | Total Pages |
|---------|-------|------------|
| M1 — Factfinder / Discovery | Advisor-Presentation (34), Employer-Presentation (37) | 71 |
| M2 — Insurance Education | Breakdown-of-our-industry (22), Self-Insured-101 (1), Stop-Loss-Presentation (17) | 40 |
| M3 — Systems / Implementation | IT-Employer-Presentation (13), Company-Data-Warehouse (11), Hub-and-Spoke-Diagram (1) | 25 |
| M4 — Quotes / Close | SVG-Custom-Presentation (5), PBM-Third-Party-Competitor-Analysis-Report (7), Lite-Version (16) | 28 |
| General / Multi-meeting | BA-Health-Insurance (20), Employer-Presentation-Lite (4), Tip-of-the-Spear (22), other (2) | 48 |

Full index: `imo-creator-v2-20260317/docs/SLIDE-LIBRARY-INDEX.txt`

### 3c. FCEs Attached (Checklist item 8)

_Every FCE whose output this doc relies on. HEIR + ORBT show where each FCE sits on the tree and its maturity._

| FCE Name | HEIR (`hub_id · ctb_placement · cc_layer`) | ORBT | Run Directory | Latest P=1 | Rows | Status |
|----------|---------------------------------------------|------|--------------|------------|------|--------|
| FCE-008 SVG Outreach | fce-008 · branch · CC-03 | OPERATE | factory/agents/up/dyno-runs/ | 2026-04-15 | 34 trunk constants | 🟢 |
| [PENDING — FCE-SALES] | [TBD · branch · CC-03] | BUILD | [TBD] | pending | 0 | 🔴 |

_A dedicated FCE for the sales sub-hub has not yet been run. The outreach FCE covers lead identification upstream; a sales-specific FCE is needed to validate the gate process constants._

### 3d. BARs Referenced (Checklist item 9)

_Every Linear BAR this doc touches. HEIR + ORBT tell you the BAR's placement and maturity._

| BAR | Title | HEIR (`bar-id · ctb_placement · cc_layer`) | ORBT | Status | Relation |
|-----|-------|---------------------------------------------|------|--------|----------|
| BAR-48 | Content taxonomy | bar-48 · branch · CC-04 | BUILD | [PENDING — verify in Linear] | implements — content structure for gate education materials |
| BAR-194 | Sales presentation engine | bar-194 · branch · CC-03 | BUILD | [PENDING — verify in Linear] | implements — gate video generation and delivery |
| BAR-239 | Video pipeline | bar-239 · branch · CC-03 | BUILD | [PENDING — verify in Linear] | dependency — gate videos feed this pipeline |
| BAR-285 | Voice library (lcs_voice_library) | bar-285 · leaf · CC-04 | OPERATE | closed | dependency — voice constants used in gate scripts |

### 3e. LBB Subjects Fed (Checklist item 10)

_Which LBB subject(s) this doc's session logs and retrofit events ingest to. HEIR + ORBT show subject placement and maturity._

| LBB Subject | HEIR (`subject-id · ctb_placement · cc_layer`) | ORBT | What This Doc Writes | Frequency |
|-------------|------------------------------------------------|------|---------------------|-----------|
| svg-sales | svg-sales · branch · CC-03 | BUILD | Session summaries, gate completion events, deal learnings | per session / per gate |
| svg-sales-process | svg-sales-process · leaf · CC-04 | BUILD | Process corrections, gate timing data, conversion observations | on-change |
| svg-sales-pipeline | svg-sales-pipeline · leaf · CC-04 | BUILD | Pipeline state snapshots, stage distribution | daily when active |

---

# CONTRACT (Flow — what flows through this)

_Everything in this cluster answers: what moves? How does data/work enter, get processed, and exit?_

## 4. IMO — Input, Middle, Output (Bedrock §3)

### Two-Question Intake (Bedrock §3)

1. **"What triggers this?"** — A qualified lead signal arrives from the outreach silo (LCS Hub marks a company as a sales-ready prospect), OR Dave manually opens a new deal for a company already in the outreach database.
2. **"How do we get it?"** — Lead signal carries a `sovereign_company_id` that maps to `cl_company_identity.sovereign_id` and links to `outreach_company_target` for company context. Dave or the sales engine writes a new `sales_state` record to open the engagement.

### Input

A qualifying signal — either automated (LCS Hub pipeline promoting a company to sales-ready) or manual (Dave deciding to open a deal) — with a `sovereign_company_id` as the key. Company context (name, domain, employee count, DOL data, carrier, broker, renewal month) flows in from the outreach silo via the sovereign_id FK.

**What the outreach grid already provides at Gate 1 (CID = what we know on arrival):**

| Sub-Hub | Data | Source | Coverage |
|---------|------|--------|----------|
| CT | Company name, domain, city, state, industry | SEED | 100% |
| CT | Employee count | DOL `tot_active_partcp_cnt` | 78% |
| DOL | Current carrier, broker, renewal date, plan year, funding arrangement | Schedule A / DOL filing | 78% |
| People | CEO/CFO/HR name, email, LinkedIn | Processes 200/201/202 | 62–91% |
| SP | About page, company LinkedIn, blog | Process 300 | 71–90% |

**Gate 1 video reads this out to the prospect: "Here's what we already know about you."**

**What Meeting 1 captures (the bill + 2 questions):**

| Data Point | Source | Why We Need It |
|-----------|--------|---------------|
| Tier counts (EE, EE+SP, EE+CH, FAM) | The bill | Monte Carlo input: population distribution |
| Tier costs ($/month per tier) | The bill | Monte Carlo input: current annual spend baseline |
| Funding type confirmation | Ask (DOL may have it) | Fully insured = bigger savings opportunity |
| Payroll platform | Ask | Integration planning, enrollment path |
| Enrollment platform | Ask | Do they have one? What is it? |

### Middle

The four-gate process. Each gate has a canonical table and an error table. State machine is `sales_state.current_phase` — it advances only when the prior gate's canonical table is fully populated with no open errors.

| Step | Input | What Happens | Output | Tool Used |
|------|-------|-------------|--------|-----------|
| 0: Deal Open | sovereign_company_id + company name | New row in sales_state (phase=factfinder) | sales_id created | D1 write |
| 1: Factfinder (Gate 1) | sales_id + meeting outcome + bill | sales_factfinder populated (employer, employee count, renewal month, prior broker, tier data) | Gate 1 complete; phase → insurance | D1 write; Gate 1 video rendered by BAR-194 |
| 2: Insurance/Monte Carlo (Gate 2) | sales_id + bill analysis | sales_insurance populated (funding model, strategy selected); Monte Carlo run | Gate 2 complete; phase → systems | [PENDING — Monte Carlo system]; D1 write |
| 3: Service Demo (Gate 3) | sales_id + meeting outcome | sales_systems populated (payroll_system, admin_model, compliance_owner) | Gate 3 complete; phase → quotes | D1 write; Gate 3 video rendered by BAR-194 |
| 4: Numbers/Quote (Gate 4) | sales_id + quote data | sales_quotes populated (quote_version, total_cost, approved_flag) | Gate 4 complete; deal closes or goes stale | D1 write; Gate 4 video rendered by BAR-194 |
| 5: Close | sales_id + approved_flag=1 (or loss reason) | sales_state.current_phase = closed_won or closed_lost | Downstream signal to client silo | D1 write |
| ERR: Any gate | Any gate write failure | Error row in gate_errors table | Error record for triage | D1 write to error table |

Contacts and interactions are written throughout — every call, email, meeting is logged in `sales_contacts` and `sales_interactions` with `meeting_number` (1–4) mapping to the gate.

**Gate Video Mapping:**

| Gate | Video Topic | Key Data Needed | Duration |
|------|-------------|-----------------|----------|
| 1 — "We Know You" | We have your info, here's what we need (tier costs) | Outreach CID/SID/MID | 5–6 min |
| 2 — "Your Numbers" | Insurance education + Monte Carlo + hospital landscape | Factfinder, M1 transcript, zip hospital map | 5–6 min |
| 3 — "Here's What to Expect" | Address M2 concerns + 5 dashboards + HR workload reduction | M2 transcript, dashboard specs | 5–6 min |
| 4 — "Here's What We Found" | Teaser only — actual numbers presented live | M3 transcript, general findings | 5–6 min |

Video does the heavy lifting. Meeting is cleanup and Q&A. Prospect can exit at any gate.

### Output

For `closed_won`: a complete `sales_id` record with all four gate tables populated, an approved quote, and a known `sovereign_id` ready to hand to the client silo for onboarding.

For `closed_lost`: a complete record of where the deal died and why, for backpropagation into the outreach FCE.

For in-progress deals: the current phase and a timestamp trail of every interaction, error, and gate transition.

### Circle (Bedrock §5)

Closed_lost deals feed back into the outreach silo as updated targeting data — which signals, which gate scripts, which company profiles stall and at what gate. This is the learning loop. Gate 2 conversion (did they show up with the bill?) measures education effectiveness. Gate 4 conversion (did they sign?) measures pricing and competitive positioning. Both feed back to the outreach signal registry and voice library. Without this loop, the sales process is open — same mistakes repeat.

---

## 5. OSAM — DATA SCHEMA (Where the Data Lives)

_The plumbing. Which tables this reads, writes, joins. What's forbidden. How business questions route to tables._

**Authority:** This OSAM is LOCKED. Change protocol: ADR + HUMAN APPROVAL REQUIRED. Version 1.0.0.

**Hierarchical position:** PRD (WHAT) → OSAM (WHERE) → ERD (structural proof) → Process (HOW).

### READ Access

| Source | What It Provides | Join Key |
|--------|-----------------|----------|
| sales_state | Master deal record, current phase, status, bit_score | sales_id (PK) |
| sales_factfinder | Gate 1 data — employer, employee count, renewal month, prior broker, tier data | sales_id (FK → sales_state) |
| sales_insurance | Gate 2 data — funding model, strategy selected | sales_id (FK → sales_state) |
| sales_systems | Gate 3 data — payroll system, admin model, compliance owner | sales_id (FK → sales_state) |
| sales_quotes | Gate 4 data — quote version, total cost, approval flag | sales_id (FK → sales_state) |
| sales_contacts | All contacts per deal, decision-maker flag | contact_id (PK), sales_id (FK) |
| sales_interactions | Full interaction log per deal and contact | interaction_id (PK), sales_id (FK), contact_id (FK) |
| cl_company_identity (spine D1) | Canonical company name, domain, sovereign_id, outreach_id | sovereign_id (on sales_state) |
| outreach_company_target (outreach D1) | Employee count, postal code, carrier, DOL context | outreach_id (via cl_company_identity) |

### WRITE Access

| Target | What It Writes | When |
|--------|---------------|------|
| sales_state | current_phase advance, status change, bit_score | Every gate completion; close event |
| sales_factfinder | employer_name, employee_count, renewal_month, prior_broker, tier_count_*, tier_cost_*, total_monthly_spend, total_annual_spend | Gate 1 meeting complete |
| sales_factfinder_errors | error_code, payload, process_id | Any Gate 1 write failure |
| sales_insurance | funding_model, strategy_selected | Gate 2 meeting complete |
| sales_insurance_errors | error_code, payload, process_id | Any Gate 2 write failure |
| sales_systems | payroll_system, admin_model, compliance_owner | Gate 3 meeting complete |
| sales_systems_errors | error_code, payload, process_id | Any Gate 3 write failure |
| sales_quotes | quote_version, total_cost, approved_flag | Gate 4 meeting; quote approval |
| sales_quotes_errors | error_code, payload, process_id | Any Gate 4 write failure |
| sales_contacts | full_name, email, phone, role, is_decision_maker | Any new contact identified |
| sales_interactions | interaction_type, subject, body_snippet, direction, meeting_number, outcome | Every touchpoint |

### Process Composition

```mermaid
flowchart TD
  OUTREACH[Outreach Silo — LCS Hub] --> SALES
  SUBPROC_G1[Gate 1: Factfinder] --> SALES
  SUBPROC_G2[Gate 2: Insurance + Monte Carlo] --> SALES
  SUBPROC_G3[Gate 3: Service Demo] --> SALES
  SUBPROC_G4[Gate 4: Numbers / Quote] --> SALES
  SALES[Sales Sub-Hub THIS HUB] --> CLIENT[Client Silo — CL Spine]
  SALES --> LBB[LBB — session logging]
```

| Process ID | Name | Role in Composition | Status |
|-----------|------|---------------------|--------|
| — | Outreach Silo / LCS Hub | Upstream feeder — generates the lead signal | 🟢 OPERATE |
| Gate 1 | Factfinder | Sub-process 1 of 4 — establishes company facts, secures bill | 🟡 BUILD (schema ready, no runner) |
| Gate 2 | Insurance Education + Monte Carlo | Sub-process 2 of 4 — educates, runs simulation, selects strategy | 🔴 BUILD (Monte Carlo system pending) |
| Gate 3 | Service Demo | Sub-process 3 of 4 — shows dashboards, implementation, locks operations | 🟡 BUILD (schema ready, no runner) |
| Gate 4 | Numbers / Quote | Sub-process 4 of 4 — presents specific quote, handles competitive objection | 🟡 BUILD (schema ready, no runner) |
| — | Client Silo / CL Spine | Downstream consumer — receives closed_won signal | 🟢 OPERATE |

### Join Chain (this is the ERD in text)

```
sales_state (sales_id — spine of all sales data)
  → sales_factfinder (sales_id, 1:1 — Gate 1 data)
  → sales_factfinder_errors (sales_id, 1:N — Gate 1 errors, append-only)
  → sales_insurance (sales_id, 1:1 — Gate 2 data)
  → sales_insurance_errors (sales_id, 1:N — Gate 2 errors, append-only)
  → sales_systems (sales_id, 1:1 — Gate 3 data)
  → sales_systems_errors (sales_id, 1:N — Gate 3 errors, append-only)
  → sales_quotes (sales_id, 1:1 — Gate 4 data)
  → sales_quotes_errors (sales_id, 1:N — Gate 4 errors, append-only)
  → sales_contacts (sales_id, 1:many — all contacts)
    → sales_interactions (sales_id + contact_id, 1:many — full touchpoint log)
  → sales_state.sovereign_id → cl_company_identity.sovereign_id (spine D1)
    → cl_company_identity.outreach_id → outreach_company_target.outreach_id (outreach D1)
```

**Full ERD (Mermaid):**

```mermaid
erDiagram
    SALES_STATE ||--o| SALES_FACTFINDER : "1:1 via sales_id"
    SALES_STATE ||--o| SALES_INSURANCE : "1:1 via sales_id"
    SALES_STATE ||--o| SALES_SYSTEMS : "1:1 via sales_id"
    SALES_STATE ||--o| SALES_QUOTES : "1:1 via sales_id"
    SALES_STATE ||--o{ SALES_FACTFINDER_ERRORS : "1:N via sales_id"
    SALES_STATE ||--o{ SALES_INSURANCE_ERRORS : "1:N via sales_id"
    SALES_STATE ||--o{ SALES_SYSTEMS_ERRORS : "1:N via sales_id"
    SALES_STATE ||--o{ SALES_QUOTES_ERRORS : "1:N via sales_id"

    SALES_STATE {
        uuid sales_id PK
        text legal_name
        text domicile_state
        text current_phase
        text status
        text source
        text sovereign_id FK
        int version
        timestamp created_at
        timestamp updated_at
    }

    SALES_FACTFINDER {
        uuid sales_id PK
        text employer_name
        int employee_count
        int renewal_month
        text prior_broker
        int tier_count_ee
        int tier_count_ee_spouse
        int tier_count_ee_child
        int tier_count_family
        real tier_cost_ee
        real tier_cost_ee_spouse
        real tier_cost_ee_child
        real tier_cost_family
        real total_monthly_spend
        real total_annual_spend
        text funding_type
        text payroll_platform
        text enrollment_platform
        timestamp created_at
        timestamp updated_at
    }

    SALES_INSURANCE {
        uuid sales_id PK
        text funding_model
        text strategy_selected
        timestamp created_at
        timestamp updated_at
    }

    SALES_SYSTEMS {
        uuid sales_id PK
        text payroll_system
        text admin_model
        text compliance_owner
        timestamp created_at
        timestamp updated_at
    }

    SALES_QUOTES {
        uuid sales_id PK
        int quote_version
        numeric total_cost
        boolean approved_flag
        timestamp created_at
        timestamp updated_at
    }
```

**OSAM Compliance:** All joins route through `sales_state` (spine). No cross-gate direct joins. Error tables are AUDIT classification, never query surfaces.

**Canonical cross-gate query (the ONLY valid cross-sub-hub pattern):**

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
FROM sales_state s
LEFT JOIN sales_factfinder f USING (sales_id)
LEFT JOIN sales_insurance i USING (sales_id)
LEFT JOIN sales_systems y USING (sales_id)
LEFT JOIN sales_quotes q USING (sales_id);
```

### Forbidden Paths

| Action | Why |
|--------|-----|
| Writing gate N+1 data before gate N table is populated | Violates sequential gate dependency — education builds on itself; cannot show gate 2 math without gate 1 facts |
| Direct cross-gate joins (FactFinder → Insurance, etc.) | OSAM isolation — all joins route through sales_state spine |
| Reading sales data from Neon vault | Neon is vault only; all working data lives in D1 (SEED → WORK → PUSH lifecycle) |
| Storing approved_flag=1 without Dave's explicit input | sales_quotes.approved_flag is a human gate — no automation may set this to 1 |
| Cross-silo writes from outreach tables directly to sales tables | Spokes carry signals; hubs own logic — LCS Hub emits signal, sales hub decides what to do |
| Deleting any sales_state or interaction row | Append-only. ORBT to REPAIR or TROUBLESHOOT_TRAIN instead. History is the audit trail. |
| Skipping the error table on a gate write failure | CQRS: every failure goes to the error table. No silent failures. |
| Querying error tables for business logic | Error tables are AUDIT surfaces only — agent MUST HALT if asked to use error tables as query surfaces |

### Query Routing

| Question | Table | Column |
|----------|-------|--------|
| Where is this deal in the process? | sales_state | current_phase |
| How many employees does the prospect have? | sales_factfinder | employee_count |
| When is their renewal? | sales_factfinder | renewal_month |
| Who was their prior broker? | sales_factfinder | prior_broker |
| What are the tier costs from the bill? | sales_factfinder | tier_cost_ee, tier_cost_ee_spouse, tier_cost_ee_child, tier_cost_family |
| What is the annual spend baseline for Monte Carlo? | sales_factfinder | total_annual_spend |
| What insurance strategy did we recommend? | sales_insurance | strategy_selected |
| What payroll system do they use? | sales_systems | payroll_system |
| What is the current quote version and cost? | sales_quotes | quote_version, total_cost |
| Has the quote been approved? | sales_quotes | approved_flag |
| Who is the decision-maker? | sales_contacts | is_decision_maker = 1 |
| What happened at meeting 2? | sales_interactions | meeting_number = 2 |
| Which deals are stalled in gate 1? | sales_state | current_phase = 'factfinder' AND updated_at < [30 days ago] |
| What deals closed won this month? | sales_state | current_phase = 'closed_won' AND updated_at > [month start] |

**OSAM HALT conditions:** If a question cannot be routed to a declared table → HALT. If a join not declared here is required → HALT. If audit table queried for business logic → HALT. If cross-gate direct join requested → HALT.

---

## 6. DMJ — Define, Map, Join (law/doctrine/DMJ.md)

_Three steps. In order. Can't skip. Back-propagate to 6a if join reveals a gap._

### 6a. DEFINE (Build the Key)

| Element | ID | Format | Description | C or V |
|---------|-----|--------|-------------|--------|
| Sales engagement | D-001 | sales_id (TEXT, UUID-like) | One company's full journey through the four gates | C (structure) |
| Gate | D-002 | ENUM: factfinder / insurance / systems / quotes / closed_won / closed_lost | The four mandatory stages plus terminal states | C (structure) |
| Contact | D-003 | contact_id (TEXT, UUID) | A named human at the prospect company | C (structure) |
| Interaction | D-004 | interaction_id (TEXT, UUID) | One touchpoint — email, call, meeting, note | C (structure) |
| Meeting number | D-005 | INTEGER 1–4 | Which of the four gate meetings this interaction belongs to | C (structure) |
| Decision maker flag | D-006 | INTEGER 0/1 | Whether this contact is the one who signs | C (structure) |
| Quote version | D-007 | INTEGER, incrementing | Which iteration of the quote — handles revisions | C (structure) |
| Approved flag | D-008 | INTEGER 0/1 | Human gate — Dave must approve before close | C (structure) |
| 90/10 rule | D-009 | Constant (10% of employees, 85% of claims cost) | The foundational split that drives the two-plan architecture | C (doctrine constant) |
| FCE six failure categories | D-010 | ENUM: 501R / RBP / MAPs / Captive / Zero-Commission / Trend | The six cost-leakage buckets the Monte Carlo addresses | C (structure) |
| Tier structure | D-011 | ENUM: EE / EE+SP / EE+CH / FAM | Four standard coverage tiers — constant across all prospects | C (structure) |
| Funding model | D-012 | TEXT (fully-insured / self-insured / level-funded) | Gate 2 output — what strategy is selected | V (fill — varies per prospect) |
| Strategy selected | D-013 | TEXT (free-form) | Specific vendor/plan configuration selected at gate 2 | V (fill) |
| Employee count | D-014 | INTEGER | Number of employees — determines stop loss tier and gate 2 math | V (fill) |
| Renewal month | D-015 | INTEGER 1–12 | When current contract expires — sets the sales timeline | V (fill) |
| Prior broker | D-016 | TEXT | Who they're coming from — affects gate 1 positioning | V (fill) |
| Tier costs | D-017 | REAL per tier | $/month per coverage tier from the bill | V (fill) |
| Total annual spend | D-018 | REAL | total_monthly × 12 — Year 0 in Monte Carlo | V (fill) |
| Total cost (quote) | D-019 | REAL | The specific dollar number from gate 4 | V (fill) |
| Interaction outcome | D-020 | TEXT | What resulted from this touchpoint — advances gate or stalls it | V (fill) |

### 6b. MAP (Connect Key to Structure)

| Source | Target | Transform |
|--------|--------|-----------|
| LCS Hub lead signal → sovereign_company_id | sales_state.company_name + sales_state.company_domain | Lookup via cl_company_identity |
| outreach_company_target.estimated_employees | sales_factfinder.employee_count | Direct copy at gate 1; overridden by actual count from factfinder meeting |
| Gate 1 meeting — bill + 2 questions | sales_factfinder (employer_name, employee_count, renewal_month, prior_broker, tier counts, tier costs, totals) | Manual entry or structured form write |
| Gate 2 meeting — bill analysis, Monte Carlo | sales_insurance (funding_model, strategy_selected) | Structured form write; Monte Carlo output attached |
| Gate 3 meeting — operations questions | sales_systems (payroll_system, admin_model, compliance_owner) | Structured form write |
| Gate 4 — quote generated | sales_quotes (quote_version, total_cost) | Quote engine write; approved_flag set by Dave |
| Any meeting/call/email | sales_interactions (interaction_type, direction, meeting_number, outcome) | Logged at every touchpoint |
| Voice Library gate scripts | sales_interactions.body_snippet | Scripts used for gate video outreach; not stored verbatim — logged as reference |

### 6c. JOIN (Path to Spine)

| Join Path | Type | Description |
|-----------|------|-------------|
| sales_state.sovereign_id → cl_company_identity.sovereign_id | Direct | Every sales engagement links to the canonical company identity in CL spine — the master VIN |
| cl_company_identity.outreach_id → outreach_company_target.outreach_id | Direct | From spine to outreach context — employee count, DOL data, carrier history |
| sales_state.sales_id → all gate tables | Direct (1:1) | Each gate table is a spoke off the sales_id hub row |
| sales_state.sales_id → sales_contacts, sales_interactions | Direct (1:many) | Contacts and interactions fan out from the deal |

_Back-propagation: if join to cl_company_identity fails (sovereign_id not set on sales_state), the record cannot be certified as closed_won — the client silo has no way to initialize onboarding without the canonical identity._

---

## 7. CONSTANTS & VARIABLES (Bedrock §2)

### Constants (structure — never changes)

- The four gates (factfinder → insurance → systems → quotes) — the sequence is locked. Cannot skip. Cannot reverse. Education builds on itself.
- CQRS pattern — one canonical table + one error table per gate. No exceptions.
- sales_id as the spine — everything in this hub joins to sales_state.sales_id
- sovereign_id FK — every deal must link to the canonical company identity in CL spine before close
- approved_flag as the human gate — no close without Dave's explicit 0→1
- meeting_number 1–4 on sales_interactions — interactions are always tied to a gate
- is_decision_maker flag on contacts — the deal cannot close without at least one contact flagged as decision maker
- The gate-CTB altitude mapping: Gate 1 = 50k/40k (who they are), Gate 2 = 30k/20k (how the money works), Gate 3 = 10k/5k (what life looks like), Gate 4 = 5k (their specific numbers)
- The 90/10 split — 10% of employees cause 85% of claims cost — the foundational constant that drives the high-dollar waterfall logic
- The six FCE failure categories (501R, RBP, MAPs, Captive, Zero-Commission, Trend) — the constant buckets in the Monte Carlo
- The four tier structure (EE, EE+SP, EE+CH, FAM) — standard across all prospects
- Three silo model: Product (zero commission) / Operations (Dave, PEPM) / Service (PEPM) — the business model constant

### Variables (fill — changes every run/cycle)

- company_name, company_domain — different for every deal
- employee_count, renewal_month — specific to each prospect
- tier counts and tier costs — from the bill, unique to each group
- total_annual_spend — the Year 0 number for each prospect's Monte Carlo
- funding_model, strategy_selected — determined by gate 2 analysis
- payroll_system, admin_model, compliance_owner — determined by gate 3 discovery
- total_cost on the quote — specific to each group's census and claims profile
- prior_broker — different for every prospect; affects gate 1 positioning
- bit_score — changes as more data accumulates on the deal
- outcome on each interaction — what actually happened at each meeting

---

## 8. STOP CONDITIONS (Bedrock §6)

| Condition | Action |
|-----------|--------|
| Can't answer two-question intake (no sovereign_company_id, no lead signal) | HALT — do not open a sales_state record |
| Gate N+1 data attempted before gate N table populated | HALT — write to error table, block phase advance |
| sales_quotes.approved_flag = 0 on close attempt | HALT — human gate required; write error, notify Dave |
| sovereign_id FK missing on sales_state at close attempt | HALT — cannot hand off to client silo; back-propagate to find identity gap |
| 5 consecutive errors on a gate write | HALT — flag deal for manual review |
| Monte Carlo system unavailable at gate 2 | HALT on automation — Dave runs gate 2 manually; log the gap |
| Strike 3 on same gate failure pattern | Troubleshoot/Train → Airworthiness Directive — do not patch again |
| Deal in a single phase for more than 60 days with no interaction | FLAG — mark as stalled; surface to Dave's review queue |

### Kill Switch (Checklist item 6)

Pause all automated writes to sales tables (for use if a bug is corrupting deal state):

```bash
# Disable sales automation at the D1 level — set a flag on sales_state to halt progression
npx wrangler d1 execute svg-d1-sales --remote --command \
  "UPDATE sales_state SET orbt_mode = 'REPAIR' WHERE orbt_mode = 'OPERATE';"

# Verify halt
npx wrangler d1 execute svg-d1-sales --remote --json --command \
  "SELECT COUNT(*) as halted FROM sales_state WHERE orbt_mode = 'REPAIR';"
```

**Application kill switch** (if sales worker is deployed):

```bash
# Activate via Doppler
doppler secrets set KILL_SWITCH_ACTIVE=true --project sales-navigator --config prod

# Verify shutdown
curl https://sales-navigator.workers.dev/api/health
# Expected: { "status": "shutdown", "reason": "kill_switch_active" }
```

**Database kill switch** (data corruption or security incident):

```bash
# Disable CF D1 bindings via CF Dashboard → Workers → sales-worker → Disable bindings
# Or pause Neon vault: Neon Dashboard → Branches → Pause Project
```

**Deactivation after incident:**

```bash
doppler secrets set KILL_SWITCH_ACTIVE=false --project sales-navigator --config prod
wrangler deploy --env production
curl https://sales-navigator.workers.dev/api/health  # Expected: { "status": "healthy" }
```

**Kill switch authority:**

| Trigger | Severity | Authority Required |
|---------|----------|-------------------|
| Data breach | CRITICAL | CC-01 (Sovereign) |
| System abuse | CRITICAL | CC-02 (Hub) |
| Database corruption | CRITICAL | CC-02 (Hub) |
| Doppler unavailable >5 min | HIGH | CC-02 (Hub) |
| Production bug affecting users | HIGH | CC-02 (Hub) |

_Worker name [PENDING — no sales worker deployed yet]. Kill switch is partially manual until worker exists._

### Rollback

**Application (CF Workers):** `wrangler deployments list` → `wrangler rollback [DEPLOYMENT_ID]`. RTO < 5 min.

**Database CF D1:** Export current state → restore from backup SQL. `wrangler d1 export svg-d1-sales --output=backup.sql`

**Configuration (Doppler):** `doppler configs rollback --project sales-navigator --config prod --version [VERSION]`. RTO < 2 min.

**Full stack rollback sequence:** Activate kill switch → rollback Doppler → rollback D1 → rollback CF Workers deployment → deactivate kill switch → verify.

**Rollback decision matrix:**

| Issue Type | First Action | Rollback Type | Authority |
|------------|--------------|---------------|-----------|
| UI bug | Hotfix | Application | CC-04 |
| API error | Investigate | Application | CC-04 |
| Data loss | Kill switch | Database | CC-02 |
| Security breach | Kill switch | Full stack | CC-01 |
| Secret exposure | Rotate + kill | Configuration | CC-02 |

---

# GOVERNANCE (Change — how this is controlled)

_Everything in this cluster answers: what transforms? How is quality measured, verified, certified?_

## 9. VERIFICATION

_Executable proof that it works. Run these._

```bash
# 1. Schema check — all 11 tables present:
npx wrangler d1 execute svg-d1-sales --remote --json --command \
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf%'"
# Expected: 11 rows — sales_state, sales_factfinder, sales_factfinder_errors,
# sales_insurance, sales_insurance_errors, sales_systems, sales_systems_errors,
# sales_quotes, sales_quotes_errors, sales_contacts, sales_interactions

# 2. FK integrity — verify sales_state accepts a test record:
# [PENDING — no test runner built yet; verify manually via wrangler CLI]

# 3. Phase gate check — verify CHECK constraint enforces only valid phases:
npx wrangler d1 execute svg-d1-sales --remote --json --command \
  "SELECT DISTINCT current_phase FROM sales_state;"
# Expected: returns only values from (factfinder, insurance, systems, quotes, closed_won, closed_lost) or empty

# 4. Kill switch response:
curl https://sales-navigator.workers.dev/api/health
# Expected: { "status": "healthy" | "shutdown" depending on kill switch state }

# 5. Join to spine — verify a known sovereign_id resolves in cl_company_identity:
# [PENDING — requires cross-D1 query; run via LCS Hub worker or wrangler with both D1 bindings]
```

**Three Primitives Check (Bedrock §1):**
1. **Thing:** Does svg-d1-sales exist with all 11 tables? Yes — schema deployed (verified via D1 query, 2026-04-16).
2. **Flow:** Does the lead signal from LCS Hub reach the sales hub? [PENDING — no sales worker yet; signal flow is documented but not wired]
3. **Change:** Does the phase advance correctly when gate data is written? [PENDING — no test data; verify with first live deal]

---

## 9b. Live Verification Log (Checklist item 12)

_Every numeric count, cron schedule, URL, command, BAR reference, LBB record, and status flag in this doc MUST be grounded against the live system before ☑ can be ticked._

| Claim / Field | Section | Source of Truth | Verification Command / Query | Verified? | Last Check | Value at Check |
|---------------|---------|-----------------|------------------------------|-----------|-----------|----------------|
| D1 database ID: 95835f64-db7f-43d4-b211-899b11a17c96 | §1 | CF dashboard / wrangler.toml | `npx wrangler d1 list` | ☐ | 2026-04-16 | [PENDING] |
| 11 tables deployed | §3 Component Status | D1 sqlite_master | `SELECT name FROM sqlite_master WHERE type='table'` | ☑ | 2026-04-16 | 11 tables confirmed |
| sales_state row count = 0 (no active deals) | §3 | D1 sales_state | `SELECT COUNT(*) FROM sales_state` | ☐ | 2026-04-16 | [PENDING] |
| LCS Hub health | §3 Live Dashboard | Worker endpoint | `curl https://lcs-hub.svg-outreach.workers.dev/health` | ☐ | 2026-04-16 | [PENDING] |
| BAR-48 status | §3d | Linear | Linear MCP or gh api | ☐ | 2026-04-16 | [PENDING] |
| BAR-194 status | §3d | Linear | Linear MCP or gh api | ☐ | 2026-04-16 | [PENDING] |
| BAR-239 status | §3d | Linear | Linear MCP or gh api | ☐ | 2026-04-16 | [PENDING] |
| LBB subject svg-sales exists | §3e | LBB API | `curl -X POST lbb.svg-outreach.workers.dev/query -d '{"query":"svg-sales"}'` | ☐ | 2026-04-16 | [PENDING] |
| sovereign_id FK maps to cl_company_identity | §6c Join Chain | svg-d1-spine | Cross-D1 join via worker | ☐ | 2026-04-16 | [PENDING — no sales worker yet] |
| Outreach company count = 32,702 | §3 Component Status | svg-d1-outreach-ops | `SELECT COUNT(*) FROM outreach_company_target` | ☐ | 2026-04-16 | [PENDING] |

**Rule:** If any row is ☐ at certification time → doc is PROVISIONAL, not CERTIFIED. Cannot move to ORBT=OPERATE until every row is ☑.

**Re-verification cadence:** any claim older than 30 days reverts to ☐ on the next audit pass.

---

## 10. ANALYTICS

_The BUILD→OPERATE gate. Three sub-layers._

### 10a. Metrics

_Define BEFORE build starts._

| Metric | Unit | Baseline | Target | Tolerance |
|--------|------|----------|--------|-----------|
| Gate 1 → Gate 2 conversion | % of gate 1 completions that advance | BASELINE (no data yet) | [PENDING — Dave input] | [PENDING] |
| Gate 2 → Gate 3 conversion | % of gate 2 completions that advance | BASELINE | [PENDING] | [PENDING] |
| Gate 3 → Gate 4 conversion | % of gate 3 completions that advance | BASELINE | [PENDING] | [PENDING] |
| Gate 4 close rate (closed_won) | % of gate 4 completions that become closed_won | BASELINE | [PENDING] | [PENDING] |
| Average days gate 1 → close | Days | BASELINE | [PENDING] | [PENDING] |
| Gate stall rate (>30 days in phase) | % of active deals stalled | BASELINE | < 20% | [PENDING] |
| Error rate per gate write | errors / gate completions | BASELINE | < 1% | [PENDING] |

_All metrics are BASELINE until first deals run through the system. Targets require Dave input based on historical close rates._

### 10b. Sigma Tracking (Bedrock §2)

| Metric | Run 1 | Run 2 | Run 3 | Trend | Action |
|--------|-------|-------|-------|-------|--------|
| Gate conversion (all four) | [PENDING] | [PENDING] | [PENDING] | BASELINE | Set baseline on first 10 deals; track from there |
| Error rate | [PENDING] | [PENDING] | [PENDING] | BASELINE | Any error rate > 5% on first run triggers investigation |
| Time per gate | [PENDING] | [PENDING] | [PENDING] | BASELINE | If gate 2 averages > 30 days, Monte Carlo delivery is the break |

### 10c. ORBT Gate Rules

| From | To | Gate |
|------|-----|------|
| BUILD | OPERATE | All 11 tables populated with test data; gate phase advance verified; sovereign_id FK resolves; no open error table rows; auditor sign-off |
| OPERATE | REPAIR | Any gate write failure rate > 5%; phase advance bug detected; sovereign_id FK breaks |
| REPAIR | OPERATE | Fix verified; error table cleared; gate advance tested; metric back within tolerance |
| Any (Strike 3) | TROUBLESHOOT/TRAIN | Fleet-wide fix → Airworthiness Directive |

**Observability Stack:**

| Component | Tool | Purpose |
|-----------|------|---------|
| Logging | CF Workers Logs + Custom Logger | Application and audit logs |
| Metrics | CF Analytics | Performance and usage metrics |
| Alerting | CF Workers + Doppler | Error and threshold alerts |
| Tracing | Process ID (PID: `SALES-NAV-{TIMESTAMP}-{RANDOM_HEX}`) | Request tracing |

**Alert Definitions:**

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | errors > 10/min | HIGH | Page on-call |
| Database Unavailable | connection failed | CRITICAL | Page + kill switch |
| Doppler Unavailable | secrets fetch failed | CRITICAL | Page + kill switch |
| Slow Response | p95 > 5s | MEDIUM | Notify Slack |
| Meeting Stuck | in_progress > 2h | LOW | Notify Slack |

**Health check endpoint:** `GET /api/health` → `{ status: "healthy" | "degraded" | "unhealthy" | "shutdown", checks: { database, doppler, kill_switch } }`

---

## 11. EXECUTION TRACE

_Append-only. Every action logged. The auditor reads this._

| Field | Format | Required |
|-------|--------|----------|
| trace_id | UUID | Yes |
| run_id | UUID | Yes |
| step | action name (e.g., gate_1_complete, quote_approved, deal_closed_won) | Yes |
| target | measurable (e.g., sales_id, gate, contact_id) | Yes |
| actual | measurable (e.g., phase advanced to insurance, contact flagged as DM) | Yes |
| delta | the gap (e.g., 0 = no unexpected change; 1 = expected phase advance) | Yes |
| status | done / failed / skipped | Yes |
| error_code | text or null | If failed |
| error_message | text or null | If failed |
| tools_used | JSON array (e.g., ["d1-sales", "lbb-ingest"]) | Yes |
| duration_ms | integer | Yes |
| cost_cents | integer | Yes |
| timestamp | ISO-8601 | Yes |
| signed_by | agent or manual (Dave / claude-code / sales-worker) | Yes |

---

## 12. LOGBOOK (After Certification Only)

_Created ONLY when the auditor certifies (BUILD → OPERATE). Append-only. The legal identity._

**No logbook during BUILD.**

### Birth Certificate

_Pending. This doc is in BUILD state. Logbook is created when auditor certifies._

| Field | Value |
|-------|-------|
| heir_ref | [to be stamped at certification] |
| orbt_entered | BUILD |
| orbt_exited | [pending] |
| action | [pending — awaiting auditor sign-off] |
| gates_passed | [pending] |
| signed_by | [must be different engine than builder — Aviation Model] |
| signed_at | [pending] |

---

## 13. FLEET FAILURE REGISTRY

| Pattern ID | Location | Error Code | First Seen | Occurrences | Strike Count | Status |
|-----------|----------|-----------|-----------|-------------|-------------|--------|
| — | — | — | — | — | — | No failures yet — system in BUILD state |

**Strike 1:** Repair. **Strike 2:** Scrutiny. **Strike 3:** Troubleshoot/Train → Airworthiness Directive.

---

## 14. MAINTENANCE LOGBOOK (doc's own logbook — FAA-grade)

_Every touch on this doc is a maintenance action. Every action leaves a signed, timestamped row with evidence. Append-only._

### Action Types

| Type | Meaning |
|------|---------|
| RETROFIT | UT structure / template upgrade applied |
| VERIFY | Claim grounded against live system (§9b row ticked ☑) |
| AUDIT | FAA Inspector (auditor) pass — PASS / FAIL recorded |
| EDIT | Content change (new step added, schema changed, etc.) |
| CERTIFY | Moved ORBT state (e.g., BUILD → OPERATE) |
| REPAIR | Post-strike fix |
| STRIKE | Fleet failure recorded (§13) |
| LBB_INGEST | Session summary written to LBB |

### Logbook (append-only — never edit past rows)

| Date (ISO) | Actor | Action | What Was Done | Evidence | LBB Record |
|-----------|-------|--------|---------------|----------|------------|
| 2026-04-16 08:00 UTC | claude-code (Claude Sonnet 4.6) | RETROFIT | Initial UT document (SALES-SUB-HUB.md) created from UNIFIED_TEMPLATE. Schema pulled from svg-d1-sales live D1 (11 tables confirmed). CTB sourced from INSURANCE-INFORMATICS-CTB.md. Voice Library gates 1–4 sourced from VOICE-LIBRARY.md. | D1 schema query output: 11 tables. Template: law/UNIFIED_TEMPLATE.md v2.6.0. | pending |
| 2026-04-16 [TIME] UTC | claude-code (Claude Sonnet 4.6) | AUDIT | Codex (GPT-5.4) FAA Inspector audit run on SALES-SUB-HUB.md. Verdict: FAIL — checklist block drifted from UT_CHECKLIST.md, ctb vs ctb_placement header mismatch across §3/§3c/§3d/§3e, §1b geometry missing 3-subgraph Mermaid, section heading qualifiers missing. | SALES-SUB-HUB-AUDIT.md audit report. | pending |
| 2026-04-16 [TIME] UTC | claude-code (Claude Sonnet 4.6) | RETROFIT | Consolidated MANUAL.md created. All scattered docs (PRD.md, OSAM.md, ERD.md, KILL_SWITCH.md, OBSERVABILITY.md, ROLLBACK_PLAN.md, SALES-PRESENTATION-NOTES.md, SLIDE-LIBRARY-REFERENCE.md, FACTFINDER-SPEC.md) absorbed into correct UT sections. Audit findings fixed: checklist block updated to UT_CHECKLIST.md v1.0.0 exact text, ctb → ctb_placement on all cross-ref table headers, §1b Geometry updated to 3-subgraph Mermaid, section heading qualifiers added (§4, §6, §10b, §14). | Source files: 10 docs absorbed. Audit report: SALES-SUB-HUB-AUDIT.md. | pending |

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-04-16 |
| Last Modified | 2026-04-16 |
| Version | 0.2.0 |
| Template Version | 2.6.0 |
| Medium | database + worker (sub-hub) |
| US Validated | pending |
| Governing Engine | law/doctrine/FOUNDATIONAL_BEDROCK.md + law/doctrine/DMJ.md |
| Supersedes | docs/SALES-SUB-HUB.md + docs/PRD.md + docs/OSAM.md + docs/ERD.md + docs/KILL_SWITCH.md + docs/OBSERVABILITY.md + docs/ROLLBACK_PLAN.md + docs/marketing/SALES-PRESENTATION-NOTES.md + docs/marketing/SLIDE-LIBRARY-REFERENCE.md + docs/reference/FACTFINDER-SPEC.md |
