# Address Book — Figma-to-Code Project

A Next.js application built from a Figma design source, with a full design-token pipeline and agent-generated YAML structure blueprint.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── .agent/
│   └── structure           # YAML design blueprint (see below)
├── src/
│   └── styles/
│       └── tokens.css      # CSS custom properties from Figma design tokens
└── packages/
    └── sds/                # Internal shared design-system package
        └── src/
            ├── ui/         # UI components, icons, hooks, compositions
            └── data/       # Contexts, providers, hooks, services, types
```

## Design Token Pipeline

### Source

Figma file: [Address Book](https://www.figma.com/design/nHuQyck4BJMI3IqadWrpBp/Address-book?node-id=1-13208)

### `src/styles/tokens.css`

All design tokens extracted from the Figma file are stored as CSS custom properties. The file is the single source of truth for every color, spacing, radius, shadow, border, typography, and sizing value used in the application.

| Metric | Value |
|---|---|
| Total tokens mapped | 91 |
| Sections | 5 (Navigation, Page Header, Metrics Row, Container, Map Container) |
| Hardcoded values flagged | 9 |

Flagged items are documented inside `tokens.css` with inline comments and require designer attention (e.g. binding raw values to Figma variables before the next design handoff).

### Usage in code

```css
/* Reference tokens by their CSS custom property name */
background-color: var(--color-navigation-background);
padding: var(--spacing-navigation-padding-vertical) var(--spacing-navigation-padding-horizontal);
box-shadow: var(--shadow-metrics-row-card);
```

## Design Blueprint

### `.agent/structure`

A 2,364-line YAML file that is the unambiguous implementation contract between the Figma design and the React codebase. It maps every node in the Figma frame to:

- `type` — node classification (`section`, `group`, `component`, `card`, `list`, `text`, `image`, `input`)
- `layout` — direction, alignment, gap, padding (all values resolved to token references)
- `sizing` — width/height intent (`fill-container`, `hug-content`, `fixed-Npx`) and overflow
- `tokens` — CSS custom property references from `tokens.css` for every styled property
- `react` — target component name, HTML element, CSS module, and implementation notes
- `position` — sibling order and layout role within the parent

| Metric | Value |
|---|---|
| Total nodes mapped | 89 |
| Sections | 5 |
| Design-system component instances | 29 |
| Inline hardcoded-value flags (`⚠`) | 23 |
| Designer attention flags | 8 |

#### React component map (derived from structure)

| Component | Role |
|---|---|
| `AddressBookPage` | Root page wrapper |
| `Navigation` | Left sidebar with menu items and user area |
| `PageHeader` | Page title, subtitle, and action buttons |
| `MetricsRow` | Stats summary card |
| `MetricItem` | Individual repeating metric (label + value + icon) |
| `AddressSearch` | Section heading + filter fields panel |
| `MapContainer` | Results area / empty state |

## Design System Package (`packages/sds`)

The `sds` package is an internal shared library that provides:

- **UI components** — compositions (Cards, Footers, Forms, Headers, Sections/Heroes, Sections/Panels)
- **Icons** — 200+ Feather-icon React components
- **UI hooks** — `useMediaQuery`
- **Data layer** — Auth, Pricing, and Products contexts, providers, hooks, and services
- **Theming** — `theme.css`, `reset.css`, `responsive.css`, `icons.css`, `index.css`

## Agent Workflow

The following agent tasks have been completed against the Figma source:

1. **Token extraction** (`tokenparser.md`) — Parsed all Figma variables and styles from the Address Book frame, resolved token references to CSS custom properties, and wrote `src/styles/tokens.css`.
2. **Structure generation** (`structuregenerator.md`) — Walked the full node tree (89 nodes), classified every frame, documented layout and token references, and wrote `.agent/structure` as the implementation blueprint.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js deployment on Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
