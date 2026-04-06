# Factfinder Spec — What Meeting 1 Captures
## The grid tells us what we know. The bill tells us what we don't.
### Status: BUILD
### Authority: Dave Barton

---

## What We Walk Into Meeting 1 With (Grid = CID)

The outreach grid (`company_grid` view in svg-d1-outreach-ops) already has this per company:

| Sub-Hub | Data | Source | Coverage |
|---------|------|--------|----------|
| CT | Company name, domain, city, state, industry | SEED | 100% |
| CT | Employee count | DOL `tot_active_partcp_cnt` | 78% (EIN-linked) |
| CT | EIN | DOL filing | 78% |
| DOL | Current carrier | Schedule A | 78% |
| DOL | Current broker | Schedule A | 78% |
| DOL | Renewal date | `plan_eff_date` / `form_tax_prd` | 78% |
| DOL | Plan year | `form_year` | 78% |
| DOL | Participants | `tot_active_partcp_cnt` | 78% |
| DOL | Funding/benefit arrangement | `funding_arrangement` / `benefit_arrangement` | 78% |
| People | CEO name, email, LinkedIn | Processes 200/201/202 | 91% name, 49% verified email, 71% LinkedIn |
| People | CFO name, email, LinkedIn | Processes 200/201/202 | 62% name, 51% verified email, 50% LinkedIn |
| People | HR name, email, LinkedIn | Processes 200/201/202 | 62% name, 50% verified email, 50% LinkedIn |
| SP | About page, blog, company LinkedIn, platforms | Process 300 | 71% about, 90% LinkedIn |

**This is what the Gate 1 video reads out to the prospect: "Here's what we already know about you."**

---

## What Meeting 1 Captures (The Bill + 2 Questions)

| Data Point | Where It Comes From | Why We Need It |
|-----------|-------------------|---------------|
| Tier counts — how many EE, EE+SP, EE+CH, FAM | The bill | Monte Carlo input: population distribution |
| Tier costs — $/month per tier | The bill | Monte Carlo input: current annual spend baseline |
| Funding type confirmation | Ask (DOL may already show it) | Fully insured = bigger savings opportunity |
| Payroll platform | Ask | Integration planning, enrollment path |
| Enrollment platform | Ask | Do they have one? What is it? |

**That's it. Five data points. One document (the bill) + two questions.**

---

## What the Factfinder Does NOT Need

- Census (tier counts on the bill are sufficient)
- Company name, location, industry (grid has it)
- Employee count (DOL has it)
- Carrier, broker (DOL has it)
- Renewal date (DOL `plan_eff_date` has it)
- Contact info (People sub-hub has it)

---

## The Math From the Bill

```
Tier counts x Tier costs = Total monthly spend
Total monthly x 12 = Annual baseline (THE number for Monte Carlo)

Example (95-life group):
  50 EE     x $600   = $30,000/mo
  20 EE+SP  x $1,200 = $24,000/mo
  10 EE+CH  x $900   = $9,000/mo
  15 FAM    x $1,800  = $27,000/mo
  ────────────────────────────────
  95 lives              $90,000/mo = $1,080,000/year
```

That $1,080,000 is Year 0 in the Monte Carlo.

---

## Monte Carlo FCE (Failure Classification Engine)

The Monte Carlo is an **education vehicle, not a prediction.** You can't dictate next year's claims. But you can show the mechanics of compounding off a lower base.

### The Six Failure Categories

| Failure (Cost Leakage) | Classification (Program) | Resource (What Fixes It) | Savings Range |
|----------------------|------------------------|------------------------|--------------|
| Hospital overpayment — nonprofit hospitals | 501R | Route to 501(c)(3) hospitals — financial assistance, can go to $0 | 10-40% on hospital claims |
| Hospital overpayment — non-501R facilities | RBP (reference-based pricing) | Pay based on % of Medicare rate vs PPO retail | 15-30% on hospital claims |
| Drug overpayment — high-dollar specialty | MAPs / International / 340B | Concierge routes to cheapest source per drug, recurring monthly | 40-100% per drug |
| Surplus loss — premiums paid, never spent | Captive insurance | Pool with other groups, unspent premiums come back | Variable — depends on claims |
| Commission leakage — baked into premium | Zero commission model | PEPM replaces embedded commission | 3-5% of total premium |
| Trend compounding — inflated baseline | All programs combined | Reduce Year 0 base, trend compounds off lower number | The divergence story |

### The Two Paths

**Path A — Do Nothing (current trajectory):**
```
Year 0: $1,080,000 (actual spend from the bill)
Year 1: $1,080,000 x 1.08 = $1,166,400
Year 2: $1,166,400 x 1.08 = $1,259,712
Year 3: $1,259,712 x 1.08 = $1,360,489
Year 4: $1,360,489 x 1.08 = $1,469,328
Year 5: $1,469,328 x 1.08 = $1,586,874
```

**Path B — With Us (reduced base, same trend):**
```
Year 0: $1,080,000 x 0.65 = $702,000 (35% savings from programs)
Year 1: $702,000 x 1.08 = $758,160
Year 2: $758,160 x 1.08 = $818,813
Year 3: $818,813 x 1.08 = $884,318
Year 4: $884,318 x 1.08 = $955,063
Year 5: $955,063 x 1.08 = $1,031,468
```

**The gap by Year 5: $555,406 — and it widens every year.**

The Monte Carlo runs 1,000 iterations with randomized trend rate (5-12%) and savings factor (25-45%), producing fan charts with confidence bands. Conservative, likely, and optimistic scenarios. Their numbers, not generic.

---

## Hospital Waterfall (Vendor Data — Coming)

Deterministic gate per hospital near the prospect's zip code:

```
Hospital within radius of prospect's zip
  |-- 501R eligible (nonprofit 501(c)(3))? --> BEST: financial assistance, can go to $0
  |     No -->
  |-- Accepts RBP (reference-based pricing)? --> BETTER: % of Medicare rate
  |     No -->
  |-- PPO network (retail) --> BASELINE: full negotiated rate
```

Vendor API: zip code + radius = classified hospital list. Tightens Monte Carlo from randomized ranges to calculated savings based on actual hospital map.

Gate 2 video shows: "Here are the hospitals near your office. These are 501R, these accept RBP, these are retail. Here's what that means for your claims."

---

## The Flow

```
Grid (what we know)
  --> Gate 1 video (readout + "bring the bill")
    --> Meeting 1 (collect bill + payroll + enrollment)
      --> Grid complete (all 0s flipped to 1s)
        --> Monte Carlo FCE (annual spend x savings x trend)
          --> Hospital waterfall (zip --> 501R/RBP/PPO per hospital)
            --> Gate 2 video (personalized divergence + hospital map)
```

---

## Factfinder Data Schema

These fields get added to the prospect record after Meeting 1:

| Field | Type | Source | C or V |
|-------|------|--------|--------|
| tier_count_ee | INTEGER | Bill | V |
| tier_count_ee_spouse | INTEGER | Bill | V |
| tier_count_ee_child | INTEGER | Bill | V |
| tier_count_family | INTEGER | Bill | V |
| tier_cost_ee | REAL | Bill | V |
| tier_cost_ee_spouse | REAL | Bill | V |
| tier_cost_ee_child | REAL | Bill | V |
| tier_cost_family | REAL | Bill | V |
| total_monthly_spend | REAL | Calculated (counts x costs) | V |
| total_annual_spend | REAL | Calculated (monthly x 12) | V |
| funding_type | TEXT | Ask / DOL confirm | V |
| payroll_platform | TEXT | Ask | V |
| enrollment_platform | TEXT | Ask (may be null) | V |

**Constants:** The tier structure (4 tiers), the FCE categories (6), the trend rate range (actuarial), the savings ranges per program. These never change prospect to prospect.

**Variables:** The fill values above. Different for every company.

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-04-07 |
| Version | 1.0.0 |
| Authority | Dave Barton |
| Grid View | `company_grid` in svg-d1-outreach-ops (workers/lcs-hub/src/migrations/003_company_grid.sql) |
| Video Pipeline | workers/video-pipeline/MANUAL.md |
| Sales Presentation | docs/marketing/SALES-PRESENTATION-NOTES.md |
