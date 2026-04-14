# Address Book — Figma-to-Code Project

A Next.js 16 application built 1:1 from a Figma design source. The project uses a full design-token pipeline, an agent-generated YAML structure blueprint, a production-ready API layer, and an internal shared design-system package (`sds`).

---

## Getting Started

Copy the environment template and start the dev server:

```bash
cp .env.example .env.local   # fill in API_BASE_URL and API_TOKEN when ready
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app runs in **mock mode** by default — no environment variables are required. When `API_BASE_URL` is set, the API layer switches from mock data to the live endpoint automatically.

---

## Project Structure

```
.
├── app/
│   ├── page.tsx                        # Address Book page (async server component)
│   ├── AddressBookPage.module.css      # Root layout styles
│   ├── globals.css                     # Body reset + token imports
│   └── layout.tsx
│
├── src/
│   ├── api/
│   │   └── addressApi.ts               # Fetch wrapper — PROD curl placeholder lives here
│   ├── config/
│   │   └── env.ts                      # Centralised environment config (lazy getters)
│   ├── components/
│   │   ├── AddressSearch/              # Filter bar (warehouse, vendor, policy, status)
│   │   ├── MapContainer/               # Results area / empty-state panel
│   │   ├── MetricsRow/                 # Stats summary card (5 metrics)
│   │   ├── NavigationSidebar/          # Left sidebar with WMS nav and user area
│   │   └── PageHeader/                 # Page title, subtitle, Download + Add address
│   ├── data/
│   │   ├── mockAddresses.ts            # 20-record mock dataset (mirrors API shape)
│   │   └── navItems.ts                 # Sidebar nav item configuration
│   ├── services/
│   │   └── addressService.ts           # fetchAddresses() + fetchMetrics()
│   ├── styles/
│   │   └── tokens.css                  # CSS custom properties from Figma design tokens
│   ├── types/
│   │   └── address.types.ts            # Address + AddressMetrics interfaces
│   └── utils/
│       └── computeMetrics.ts           # Pure metric computation function
│
├── packages/
│   └── sds/                            # Internal shared design-system package
│       └── src/ui/
│           ├── icons/                  # 200+ Feather-icon React components
│           ├── primitives/             # Button, Input, Select, Navigation, Avatar, …
│           ├── compositions/           # Cards, Forms, Headers, Sections
│           ├── layout/                 # Flex, Grid, Section
│           └── hooks/                  # useMediaQuery
│
├── .agent/
│   └── structure                       # YAML design blueprint (89 nodes)
├── .env.example                        # API_BASE_URL + API_TOKEN template
├── APICreation.md                      # API layer creation guide
├── architect.md                        # Coding standards constitution
├── tokenparser.md                      # Token extraction agent guide
└── structuregenerator.md               # Structure generation agent guide
```

Each component folder follows the pattern:

```
ComponentName/
├── ComponentName.tsx       # Default export, explicit return type, no data inline
├── ComponentName.module.css  # CSS Modules only — all values reference tokens
└── index.ts                # Single re-export: export { default } from './ComponentName'
```

---

## API Layer

The API layer is structured in three tiers following `APICreation.md`:

```
src/config/env.ts          → reads API_BASE_URL + API_TOKEN from process.env (lazy)
src/api/addressApi.ts      → low-level fetch wrapper; all curl logic lives here
src/services/addressService.ts → fetchAddresses() + fetchMetrics() for page use
```

### Switching from mock to live data

When your PROD endpoint is confirmed:

1. Copy `.env.example` → `.env.local` and set `API_BASE_URL` and `API_TOKEN`.
2. The mock fallback in `addressApi.ts` deactivates automatically when `API_BASE_URL` is present.
3. Verify the response shape matches `Address[]` in `src/types/address.types.ts`. Adjust field names if needed.

The equivalent curl for the GET endpoint is documented inline in `src/api/addressApi.ts`:

```bash
curl -X GET "$API_BASE_URL/addresses" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json"
```

---

## Design Token Pipeline

**Figma source:** [Address Book](https://www.figma.com/design/nHuQyck4BJMI3IqadWrpBp/Address-book?node-id=1-13208)

All design tokens are stored as CSS custom properties in `src/styles/tokens.css` — the single source of truth for every colour, spacing, radius, shadow, border, and typography value.

| Metric | Value |
|--------|-------|
| Total tokens mapped | 91 |
| Sections | 5 (Navigation, Page Header, Metrics Row, Container, Map Container) |
| Hardcoded values flagged | 9 |

Every `var()` call in every CSS Module includes a hardcoded fallback as the second argument so the UI degrades gracefully if a token fails to resolve.

Flagged items are documented inline in `tokens.css` with `⚠ HARDCODED` comments and require Figma variable bindings before the next design handoff.

### Token naming convention

```
--{category}-{section}-{property}
```

Examples:

```css
--color-navigation-menu-item-active-background
--spacing-metrics-row-card-padding
--font-page-header-title-size
--radius-container-filter-panel
--shadow-metrics-row-card
```

---

## Architecture Standards

All code follows `architect.md` — the project's coding constitution. Key rules enforced:

| Rule | Standard |
|------|----------|
| File responsibility | One component, one style file, one data set per file |
| CSS | CSS Modules only; no inline styles; no `!important`; every `var()` has a fallback |
| TypeScript | Strict mode; no `any`; explicit return types on every function; `interface` for object shapes |
| React | Functional components; default exports; data imported from `src/data/`, never defined inline |
| Imports | React → third-party → internal components → data/types → styles |
| Lists | Stable `key` props on all `.map()` renders (never index) |
| Data flow | Service layer for fetching; components receive data as props |

---

## Design Blueprint

`.agent/structure` is a 2,364-line YAML file — the unambiguous contract between the Figma design and the React codebase. It maps every node to:

- `type` — classification (`section`, `group`, `component`, `card`, `list`, `text`, `image`, `input`)
- `layout` — direction, alignment, gap, padding (resolved to token references)
- `sizing` — width/height intent (`fill-container`, `hug-content`, `fixed-Npx`) and overflow
- `tokens` — CSS custom property references for every styled property
- `react` — target component name, HTML element, CSS module, and implementation notes

| Metric | Value |
|--------|-------|
| Total nodes mapped | 89 |
| Sections | 5 |
| Design-system component instances | 29 |
| Inline hardcoded-value flags (`⚠`) | 23 |

### Component map

| Component | File | Role |
|-----------|------|------|
| `AddressBookPage` | `app/page.tsx` | Root async server component |
| `NavigationSidebar` | `src/components/NavigationSidebar/` | Left sidebar, WMS nav, user area |
| `PageHeader` | `src/components/PageHeader/` | Title, subtitle, Download + Add address |
| `MetricsRow` | `src/components/MetricsRow/` | Five-metric stats summary card |
| `AddressSearch` | `src/components/AddressSearch/` | Four-field filter bar |
| `MapContainer` | `src/components/MapContainer/` | Results area / empty-state panel |

---

## SDS Package (`packages/sds`)

The internal design-system package provides all primitive UI building blocks:

- **Primitives** — `Button`, `ButtonGroup`, `Input`, `InputField`, `Select`, `SelectField`, `SelectItem`, `Navigation`, `Avatar`, `Icon`, `IconButton`, `Search`, `Image`, and more
- **Icons** — 200+ Feather-icon React components (all use `stroke="var(--svg-stroke-color)"` — set this custom property to control icon colour)
- **Compositions** — `Cards`, `Forms`, `Headers`, `Sections`
- **Layout** — `Flex`, `Grid`, `Section`
- **Hooks** — `useMediaQuery` with `isMobile`, `isTablet`, `isDesktop` breakpoints
- **Theming** — `theme.css`, `reset.css`, `responsive.css`, `icons.css`

### Controlling icon colour

SDS icons render SVG paths with `stroke="var(--svg-stroke-color)"`. Set this property on the icon's container:

```css
.myContainer {
  --svg-stroke-color: var(--color-navigation-menu-item-text, #303030);
}

.myContainer.active {
  --svg-stroke-color: var(--color-navigation-menu-item-active-text, #f3f3f3);
}
```

---

## Agent Workflow

The following agent tasks have been completed against the Figma source:

1. **Token extraction** (`tokenparser.md`) — Parsed all Figma variables and styles from the Address Book frame, resolved token references, and wrote `src/styles/tokens.css`.
2. **Structure generation** (`structuregenerator.md`) — Walked the full node tree (89 nodes), classified every frame, documented layout and token references, and wrote `.agent/structure`.
3. **API layer creation** (`APICreation.md`) — Created the full `config → api → service` stack with typed interfaces, environment config, fetch wrapper with PROD curl placeholder, and service functions.
4. **Architecture refactor** (`architect.md`) — Applied all coding standards across every file: CSS token fallbacks, no `!important`, TypeScript strict types, default exports, `index.ts` barrels, correct import order, and data/component separation.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Figma Design Source](https://www.figma.com/design/nHuQyck4BJMI3IqadWrpBp/Address-book?node-id=1-13208)
