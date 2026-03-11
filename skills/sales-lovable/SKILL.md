---
name: sales-lovable
description: >
  Figma UI design and frontend operational patterns for the Sales Navigator hub
  (HUB-SALES-NAV-20260130). Use this skill whenever building UI, modifying components, debugging
  the presentation layer, or making frontend architecture decisions in the sales-navigator repo.
  Trigger on: Figma, Figma UI, UI design, component, UI, frontend,
  presentation layer, SalesProcessHub, Meeting1, Meeting2, Meeting3, Meeting4, CRMIntakeGateway,
  Radix UI, shadcn, Tailwind, CF Pages, CF Workers, or any reference to the sales navigator
  user interface. Also trigger when discussing page routing, component structure, or design
  system. If the question touches the visual layer of this repo, this skill applies even if
  the user does not mention Figma by name.
  NOTE: Lovable.dev is RETIRED (BAR-100). All UI design now originates from Figma.
master_skill: IMO-Creator/skills/lovable/SKILL.md
hub_id: HUB-SALES-NAV-20260130
---

# Sales Navigator -- Figma UI Skill

## Architecture Shift (BAR-100)

Lovable.dev is **RETIRED**. The original app was generated via Lovable and exported to GitHub.
All UI design now originates from **Figma UI**. Development happens in Claude Code / Cursor.
The app is hosted on **CF Workers/Pages** (not Vercel).

| Component | Old (RETIRED) | New (ACTIVE) |
|-----------|--------------|--------------|
| Design Tool | Lovable.dev | Figma UI |
| Hosting | Vercel | CF Workers/Pages |
| Compute | Supabase | CF Workers |
| Working DB | Neon (direct) | CF D1/KV |

## What This Repo Uses

| Component | Value |
|-----------|-------|
| Hub ID | HUB-SALES-NAV-20260130 |
| Framework | React 18.3.1 + Vite 5.4.19 |
| Build Tool | `@vitejs/plugin-react-swc` ^3.11.0 |
| Design System | Figma UI (design source of truth) |
| UI Library | Radix UI primitives (full suite -- see package.json) |
| Styling | Tailwind CSS 3.4.17 + tailwindcss-animate + class-variance-authority |
| Component Patterns | shadcn/ui (via Radix + CVA + tailwind-merge + clsx) |
| Routing | react-router-dom ^6.30.1 |
| Forms | react-hook-form ^7.61.1 + @hookform/resolvers + zod ^3.25.76 |
| Charts | recharts ^2.15.4 |
| Data Fetching | @tanstack/react-query ^5.83.0 |
| Toasts | sonner ^1.7.4 |
| Dev Server | localhost:8080 (`vite --host :: --port 8080`) |
| Working Database | CF D1 via CF Workers |
| Vault Database | Neon PostgreSQL (archive/vault only) |
| Hosting | CF Workers/Pages |

## Design Pipeline Position

```
Figma UI (design source) -> Claude Code / Cursor (implementation) -> CF Workers/Pages (hosting)
```

This repo's UI was originally generated from Lovable.dev and exported. Lovable is now fully
retired. All new design work originates in Figma. The `lovable-tagger` dev dependency is
legacy and will be removed in a future cleanup pass. Do NOT send code to Lovable or use
Lovable for any new work.

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
- Legacy lovable-tagger: still present in config but scheduled for removal
- Path alias: `@` maps to `./src`
- Build: `vite build` (production), `vite build --mode development` (dev build)

## Operational Patterns

### Adding New Pages
1. Create component in `src/ui/pages/`
2. Add route in router configuration
3. Follow existing page patterns (meeting pages are the reference)
4. Reference Figma UI designs for layout and component decisions

### Component Conventions
- Use existing Radix/shadcn components from `src/ui/components/`
- Style with Tailwind utility classes
- Use `cn()` helper from `src/ui/utils.ts` for conditional classes (clsx + tailwind-merge)
- Form validation via zod schemas + react-hook-form

### Data Flow
- `@tanstack/react-query` for server state management
- CF Workers API endpoints for database queries (CF D1 working layer)
- Neon vault accessed only through CF Workers for archive/reporting queries

## Known Issues

- **Lovable is RETIRED**: Lovable.dev is no longer used. Code was modified post-export.
  Do not suggest returning to Lovable for any UI work. All design originates from Figma UI.
- **lovable-tagger legacy**: The `lovable-tagger` dev dependency remains in package.json
  and vite.config.ts as legacy. It will be removed in a future cleanup pass.
- **Supabase client legacy**: The repo still has `@supabase/supabase-js` references in
  package.json from the Lovable era. These are being migrated to CF Workers API calls.
  Do not assume Supabase Auth, Storage, or Edge Functions are available.

## Cost Profile

| Resource | Status |
|----------|--------|
| Lovable subscription | RETIRED -- no longer in use |
| Figma | Active design tool |
| CF Workers/Pages | Hosting (free tier for dev) |
| Runtime cost | CF Workers compute + CF D1 storage |
