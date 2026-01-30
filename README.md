# Sales Navigator Hub

**Hub ID**: HUB-SALES-NAV-20260130
**Authority**: CONSTITUTION.md
**Parent**: imo-creator
**Status**: ACTIVE

---

## Transformation Statement

> **This hub transforms raw prospect data into qualified sales outcomes through a 4-meeting orchestrated process.**

| Constants (Input) | Variables (Output) |
|-------------------|-------------------|
| Raw prospect intake | Qualified/Disqualified status |
| Unstructured notes | Structured meeting summaries |
| Unknown fit signals | Clear decision criteria |
| Manual follow-ups | Automated workflow triggers |

---

## The 4-Meeting Sales Process

| # | Meeting | Purpose | Outcome |
|---|---------|---------|---------|
| 1 | **Fact Finder** | Gather prospect data | Complete profile |
| 2 | **Insurance Education** | Educate on insurance options | Needs assessment |
| 3 | **Systems Education** | Present systems/solutions | Solution fit evaluation |
| 4 | **Financials** | Review financials, close | Win/Loss decision |

---

## Quick Start

### Prerequisites

- Node.js 18+
- [Doppler CLI](https://docs.doppler.com/docs/install-cli) installed
- Access to Doppler project `sales-navigator`

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd sales-navigator

# 2. Install dependencies
npm install

# 3. Configure Doppler (first time only)
doppler setup --project sales-navigator --config dev

# 4. Run with Doppler
doppler run -- npm run dev
```

### Available Commands

| Command | Description |
|---------|-------------|
| `doppler run -- npm run dev` | Start development server |
| `doppler run -- npm run build` | Build for production |
| `doppler run -- npm run preview` | Preview production build |

---

## CTB Structure

This repository follows the Christmas Tree Backbone (CTB) architecture:

```
src/
├── sys/      # System infrastructure, Doppler integration
├── data/     # Schemas, data models, types
├── app/      # Business logic, workflows, services
├── ai/       # AI agents, prompts, LLM integration
└── ui/       # User interface, components, pages
```

### Forbidden Patterns

The following directories are **constitutionally forbidden**:

- `src/lib/` - Use CTB branches instead
- `src/utils/` - Use CTB branches instead
- `src/helpers/` - Use CTB branches instead
- `src/common/` - Use CTB branches instead
- `src/shared/` - Use CTB branches instead

---

## Doppler Mandate

**Doppler is the sole authorized secrets provider for this hub.**

| Rule | Status |
|------|--------|
| All secrets via Doppler | MANDATORY |
| No .env files with secrets | FORBIDDEN |
| No hardcoded credentials | FORBIDDEN |

See [ADR-002: Doppler Secrets](docs/ADR-002-doppler-secrets.md) for details.

---

## Governance Documents

| Document | Purpose |
|----------|---------|
| [CONSTITUTION.md](CONSTITUTION.md) | Supreme law, boundaries, mandates |
| [DOCTRINE.md](DOCTRINE.md) | IMO-Creator conformance |
| [REGISTRY.yaml](REGISTRY.yaml) | Hub identity, configuration |
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/ADR-*.md](docs/) | Architecture decisions |

---

## Technology Stack

- **Framework**: React + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query
- **Routing**: TanStack Router
- **Backend**: Supabase
- **Secrets**: Doppler

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Authority | CONSTITUTION.md |
