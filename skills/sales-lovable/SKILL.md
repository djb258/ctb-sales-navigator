---
name: sales-lovable
description: >
  Lovable.dev configuration, constraints, and operational patterns for the Sales Navigator hub
  (HUB-SALES-NAV-20260130). Use this skill whenever building UI, modifying components, debugging
  the presentation layer, or making frontend architecture decisions in the sales-navigator repo.
  Trigger on: Lovable, lovable.dev, lovable-tagger, Vite, React, component, UI, frontend,
  presentation layer, SalesProcessHub, Meeting1, Meeting2, Meeting3, Meeting4, CRMIntakeGateway,
  Radix UI, shadcn, Tailwind, or any reference to the sales navigator user interface. Also
  trigger when discussing page routing, component structure, UI credit budget, or Lovable export
  workflow. If the question touches the visual layer of this repo, this skill applies even if
  the user does not mention Lovable by name.
master_skill: IMO-Creator/skills/lovable/SKILL.md
hub_id: HUB-SALES-NAV-20260130
---

# Sales Navigator -- Lovable Skill

Lovable.dev is the presentation layer for Sales Navigator. The app was generated via Lovable
and exported to GitHub. Ongoing development happens in Claude Code / Cursor -- Lovable is
Step 1 only, per master skill doctrine.

## What This Repo Uses

| Component | Value |
|-----------|-------|
| Hub ID | HUB-SALES-NAV-20260130 |
| Framework | React 18.3.1 + Vite 5.4.19 |
| Build Tool | `@vitejs/plugin-react-swc` ^3.11.0 |
| Lovable Tagger | `lovable-tagger` ^1.1.10 (dev dependency, development mode only) |
| UI Library | Radix UI primitives (full suite -- see package.json) |
| Styling | Tailwind CSS 3.4.17 + tailwindcss-animate + class-variance-authority |
| Component Patterns | shadcn/ui (via Radix + CVA + tailwind-merge + clsx) |
| Routing | react-router-dom ^6.30.1 |
| Forms | react-hook-form ^7.61.1 + @hookform/resolvers + zod ^3.25.76 |
| Charts | recharts ^2.15.4 |
| Data Fetching | @tanstack/react-query ^5.83.0 |
| Toasts | sonner ^1.7.4 |
| Dev Server | localhost:8080 (`vite --host :: --port 8080`) |
| Database Layer | Neon via @supabase/supabase-js (see sales-neon skill) |

## Lovable Pipeline Position

```
Lovable (generated MVP) -> GitHub (exported) -> Claude Code / Cursor (current development)
```

This repo has ALREADY been exported from Lovable. The `lovable-tagger` remains as a dev
dependency for component tracking in development mode, but all feature work is done in
Claude Code or Cursor. Do NOT send code back to Lovable.

## Page Structure

| Page Component | Route | Purpose |
|---------------|-------|---------|
| Index | `/` | Landing / dashboard |
| SalesProcessHub | `/sales/*` | Main sales process orchestration |
| CRMIntakeGateway | `/sales/intake` | Prospect intake from CRM |
| Meeting1 | `/sales/meeting1` | Fact Finder meeting |
| Meeting2 | `/sales/meeting2` | Insurance Education meeting |
| Meeting2Workbench | `/sales/meeting2/workbench` | Meeting 2 interactive workspace |
| Meeting3 | `/sales/meeting3` | Systems Education meeting |
| Meeting4 | `/sales/meeting4` | Financials / Numbers meeting |
| NotFound | `*` | 404 fallback |

Source files: `src/ui/pages/`

## Component Library

The repo uses the shadcn/ui pattern: Radix UI primitives wrapped with Tailwind + CVA styling.
All components live in `src/ui/components/`. Key primitives available:

accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog,
dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group,
scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip

## Vite Configuration

- Dev server: `host: "::"`, `port: 8080`
- Lovable tagger: active in development mode only (`mode === "development"`)
- Path alias: `@` maps to `./src`
- Build: `vite build` (production), `vite build --mode development` (dev build)

## Operational Patterns

### Adding New Pages
1. Create component in `src/ui/pages/`
2. Add route in router configuration
3. Follow existing page patterns (meeting pages are the reference)

### Component Conventions
- Use existing Radix/shadcn components from `src/ui/components/`
- Style with Tailwind utility classes
- Use `cn()` helper from `src/ui/utils.ts` for conditional classes (clsx + tailwind-merge)
- Form validation via zod schemas + react-hook-form

### Data Flow
- `@tanstack/react-query` for server state management
- `@supabase/supabase-js` for database queries (connects to Neon)
- No direct Neon driver imports on the client side

## Known Issues

- **No Lovable round-trip**: Code has been modified post-export. Importing back into Lovable
  will fail or produce conflicts. One-way export only.
- **Supabase client in package.json**: The repo uses `@supabase/supabase-js` as a query client
  over Neon, not a full Supabase backend. Do not assume Supabase Auth, Storage, or Edge
  Functions are available.
- **No Cloudflare**: There is no Workers layer, no D1, no Hyperdrive. The Vite dev server
  and production build connect to Neon directly.
- **Credit budget**: Lovable credits are no longer consumed since development moved to
  Claude Code. Do not suggest returning to Lovable for UI changes.

## Cost Profile

| Resource | Status |
|----------|--------|
| Lovable subscription | Not actively used -- exported to GitHub |
| Lovable credits | Not being consumed |
| Runtime cost | Zero (Vite build is static; Neon handles compute) |
