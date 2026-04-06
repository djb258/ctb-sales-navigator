# Slide Library — Reference

## Where The Slides Live

| What | Where |
|------|-------|
| PNG files (236 pages) | R2 bucket `svg-files` at `sales-materials/pages/{Deck}/page-{NN}.png` |
| Full index with metadata | `imo-creator-v2-20260317/docs/SLIDE-LIBRARY-INDEX.txt` |
| R2 storage reference | `imo-creator-v2-20260317/docs/SLIDE-LIBRARY-R2.md` |
| Source PDFs (21 decks) | Dave's local machine (Downloads) |

## Meeting → Deck Mapping

| Meeting | Decks | Total Pages |
|---------|-------|------------|
| M1 — Factfinder / Discovery | Advisor-Presentation (34), Employer-Presentation (37) | 71 |
| M2 — Insurance Education | Breakdown-of-our-industry (22), Self-Insured-101 (1), Stop-Loss-Presentation (17) | 40 |
| M3 — Systems / Implementation | IT-Employer-Presentation (13), Company-Data-Warehouse (11), Hub-and-Spoke-Diagram (1) | 25 |
| M4 — Quotes / Close | SVG-Custom-Presentation (5), PBM-Third-Party-Competitor-Analysis-Report (7), Lite-Version (16) | 28 |
| Close | Letter_of_Authorization (1) | 1 |
| General / Multi-meeting | BA-Health-Insurance-Employer-Presentation (20), Employer-Presentation-Lite (4), Tip-of-the-Spear (22), PartnerVendor-Slide (1), Example-of-Drug-File (1) | 48 |
| Non-sales | INV346038403 (3), Copy-of-Breakdown (18) | 21 |

## How Gate Videos Use Slides

Each gate video (workers/video-pipeline) pulls relevant slides from R2 as NotebookLM sources:
- Gate 1 → M1 decks (show prospect what we know, what we need)
- Gate 2 → M2 decks (insurance education, Monte Carlo, hospital waterfall)
- Gate 3 → M3 decks (dashboards, implementation, HR workload reduction)
- Gate 4 → M4 decks (teaser for quote presentation)

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-04-07 |
| Version | 1.0.0 |
