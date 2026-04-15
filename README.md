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
│   ├── globals.css                     # Body reset, html/body layout rules, token imports
│   └── layout.tsx                      # Root HTML shell; registers SDS reset + theme globally
│
├── src/
│   ├── api/
│   │   ├── addressApi.ts               # Fetch wrapper for addresses — PROD curl placeholder lives here
│   │   └── warehouseLocationsApi.ts    # Fetch wrapper for warehouse locations — PROD curl placeholder lives here
│   ├── config/
│   │   └── env.ts                      # Centralised environment config (lazy getters)
│   ├── components/
│   │   ├── AddAddressModal/            # Add / Edit address dialog — single entry + bulk CSV upload
│   │   ├── AddressRow/                 # Single vendor row inside a result card
│   │   ├── AddressSearch/              # Filter bar (warehouse, vendor, policy, status)
│   │   ├── AddressSearchContainer/     # Client boundary: holds filter state, runs filtering
│   │   ├── DashboardClient/            # Client state owner: address list + edit-dialog state
│   │   ├── MapContainer/               # Results area / empty-state panel
│   │   ├── MetricsRow/                 # Stats summary card (5 metrics)
│   │   ├── NavigationSidebar/          # Left sidebar with WMS nav and user area
│   │   ├── PageHeader/                 # Page title, subtitle, Download + Add address
│   │   └── SearchResultCard/           # One card per warehouse; wraps AddressRow list
│   ├── data/
│   │   ├── mockAddresses.ts            # 20-record mock dataset (mirrors API shape)
│   │   ├── navItems.ts                 # Sidebar nav item configuration
│   │   └── warehouseLocations.ts       # Typed warehouse location records (mirrors API shape)
│   ├── services/
│   │   ├── addressService.ts           # fetchAddresses() + fetchMetrics()
│   │   └── warehouseLocationsService.ts # fetchWarehouseLocations() — façade over the API wrapper
│   ├── styles/
│   │   └── tokens.css                  # CSS custom properties from Figma design tokens
│   ├── types/
│   │   ├── address.types.ts            # Address, AddressMetrics, AddressSearchFilters interfaces
│   │   └── warehouseLocation.types.ts  # WarehouseLocationRecord, GetWarehouseLocationsParams interfaces
│   └── utils/
│       ├── computeMetrics.ts           # Derives 5 aggregate metrics from Address[]
│       ├── filterAddresses.ts          # Pure client-side filter predicate
│       ├── formatAddress.ts            # formatFullAddress() string helper
│       ├── groupByWarehouse.ts         # Groups Address[] into Map<code, Address[]>
│       └── parseAddress.ts             # parseAddressText() + formatAddressToText() for the address textarea
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
│   └── structure                       # YAML design blueprint (89+ nodes)
├── .env.example                        # API_BASE_URL + API_TOKEN template
├── APICreation.md                      # API layer creation guide
├── architect.md                        # Coding standards constitution
├── tokenparser.md                      # Token extraction agent guide
└── structuregenerator.md               # Structure generation agent guide
```

Each component folder follows the pattern:

```
ComponentName/
├── ComponentName.tsx         # Default export, explicit return type, no data inline
├── ComponentName.module.css  # CSS Modules only — all values reference tokens
└── index.ts                  # Single re-export: export { default } from './ComponentName'
```

---

## Add / Edit Address

Clicking **Add address** in the page header opens `AddAddressModal` in `add` mode (two tabs: Single entry and Bulk upload). When the user submits the single-entry form:

1. The free-text address textarea is parsed by `parseAddressText()` in `src/utils/parseAddress.ts` into `addressLine1`, `addressLine2?`, `city`, `state`, `zip`, and `country`.
2. All other fields (warehouse location, vendor, payment policy, carrier) are taken directly from their select/input controls.
3. A new `Address` object is prepended to the in-memory list owned by `DashboardClient`.

Clicking the **edit icon** on any `AddressRow` opens `AddAddressModal` in `edit` mode:

- The tab bar is hidden — only the single-entry form is shown.
- All fields are pre-filled from the selected vendor's `Address` record (the address text is reconstructed by `formatAddressToText()`).
- Saving merges the edited fields back into the list.

The dialog state is managed by `DashboardClient`, which sits between the server page and its interactive children.

---

## Search Results Flow

When the user enters a value in any filter field, `AddressSearchContainer` runs `filterAddresses()` client-side and passes the matching records to `MapContainer`. `MapContainer` groups them by warehouse code via `groupByWarehouse()` and renders one `SearchResultCard` per group. Each card renders a `AddressRow` per vendor.

```
DashboardClient (client, owns address list + edit state)
├── PageHeader             → "Add address" dialog trigger; onAddAddress callback
├── MetricsRow             → server-fetched metrics display
└── AddressSearchContainer → holds filter results in state
    ├── AddressSearch      → emits AddressSearchFilters on every change
    └── MapContainer       → receives Address[] results + onEditAddress callback
        └── SearchResultCard → one per warehouseCode group
            └── AddressRow   → one per Address; edit button triggers onEdit(id)
```

The server page (`app/page.tsx`) pre-fetches all addresses once with `fetchAddresses()`. No additional API call is made when the user types — filtering is a pure in-memory operation until the API supports server-side query params, at which point only `src/utils/filterAddresses.ts` needs to change.

---

## API Layer

The API layer is structured in three tiers following `APICreation.md`. Two datasources are fully wired:

```
src/config/env.ts                        → reads API_BASE_URL + API_TOKEN from process.env (lazy)

src/api/addressApi.ts                    → low-level fetch wrapper for addresses
src/services/addressService.ts           → fetchAddresses() + fetchMetrics() for page use

src/api/warehouseLocationsApi.ts         → low-level fetch wrapper for warehouse locations
src/services/warehouseLocationsService.ts → fetchWarehouseLocations() for component use
```

Both API wrappers follow the same mock-fallback pattern: when `API_BASE_URL` is absent (local dev without `.env.local`), the wrapper returns data from the typed mock file in `src/data/`. Setting `API_BASE_URL` in `.env.local` switches both to their respective live endpoints automatically — no code change required.

### Switching from mock to live data

When your PROD endpoints are confirmed:

1. Copy `.env.example` → `.env.local` and set `API_BASE_URL` and `API_TOKEN`.
2. The mock fallbacks deactivate automatically — `isMockMode` is driven by `!env.apiBaseUrl`.
3. Verify the response shapes match `Address[]` and `WarehouseLocationRecord[]` in `src/types/`. Adjust field names if needed.

The equivalent curls for both endpoints are documented inline in their respective API files:

```bash
# Addresses
curl -X GET "$API_BASE_URL/addresses" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json"

# Warehouse locations
curl -X GET "$API_BASE_URL/warehouse-locations" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json"
```

---

## Design Token Pipeline

**Figma source:** [Address Book](https://www.figma.com/design/nHuQyck4BJMI3IqadWrpBp/Address-book?node-id=1-13208)

All design tokens are stored as CSS custom properties in `src/styles/tokens.css` — the single source of truth for every colour, spacing, radius, shadow, border, and typography value.

| Metric | Value |
|--------|-------|
| Total tokens mapped | 186 |
| Sections | 8 (Navigation, Page Header, Metrics Row, Container, Map Container, Search Results Card, Add Address Dialog, Bulk Upload Panel) |
| Hardcoded values flagged | 7 (13 of original 20 resolved — see RESOLUTION LOG in `tokens.css`) |
| Fallback `--ld-*` tokens defined | `space-50` → `space-600`, `borderradius-100/200`, caption/heading-small typography (incl. `heading-small-size` 18 px) |

Every `var()` call in every CSS Module includes a hardcoded fallback as the second argument so the UI degrades gracefully if a token fails to resolve.

**Fallback block additions (chronological):**

- `--ld-primitive-scale-space-600` and `--ld-primitive-scale-borderradius-200` added — resolved dropzone collapse and migrated `--radius-bulk-upload-dropzone` off a raw `16px`.
- `--ld-semantic-font-heading-small-size: 1.125rem` (18 px) added — enables `--font-container-heading-size` to reference the heading-small semantic scale.

**Gap corrections (Figma VQA, node 1:13349):**

- `--spacing-search-results-row-gap` — row-level flex gap between column groups (8 px).
- `--spacing-search-results-column-gap` (new) — icon-to-label gap within each column (12 px, `var(--sds-size-space-300)`).

**Token resolution pass (2026-04-15):**

13 of the original 20 raw-value token definitions were replaced with proper token references (e.g. three 20 px icon sizes now use `var(--ld-primitive-scale-space-250)`, the 48 px row height uses `var(--ld-primitive-scale-space-600)`, font sizes map to their SDS typography tokens). The full resolution log is in the `tokens.css` header.

The 7 remaining `⚠ HARDCODED` values have no design-system token equivalent and are documented inline with the reason — they require designer attention before the next Figma variable handoff.

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
--font-search-results-header-family
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
| Utilities | Pure functions live in `src/utils/`; never defined inside a component file |
| Shared types | Canonical definitions in `src/types/`; never duplicated across files |
| Imports | React → third-party → internal components → data/types → styles |
| Lists | Stable `key` props on all `.map()` renders (never index) |
| Data flow | Service layer for fetching; components receive data as props |

---

## Design Blueprint

`.agent/structure` is a YAML file — the unambiguous contract between the Figma design and the React codebase. It maps every node to:

- `type` — classification (`section`, `group`, `component`, `card`, `list`, `text`, `image`, `input`)
- `layout` — direction, alignment, gap, padding (resolved to token references)
- `sizing` — width/height intent (`fill-container`, `hug-content`, `fixed-Npx`) and overflow
- `tokens` — CSS custom property references for every styled property
- `react` — target component name, HTML element, CSS module, and implementation notes

### Component map

| Component | File | Role |
|-----------|------|------|
| `AddressBookPage` | `app/page.tsx` | Root async server component; pre-fetches all addresses + metrics |
| `DashboardClient` | `src/components/DashboardClient/` | Client state owner; bridges server data to interactive children |
| `NavigationSidebar` | `src/components/NavigationSidebar/` | Left sidebar, WMS nav, user area |
| `PageHeader` | `src/components/PageHeader/` | Title, subtitle, Download + Add address |
| `AddAddressModal` | `src/components/AddAddressModal/` | Add / Edit dialog — single-entry form + bulk CSV upload; mode-aware |
| `MetricsRow` | `src/components/MetricsRow/` | Five-metric stats summary card |
| `AddressSearchContainer` | `src/components/AddressSearchContainer/` | Client boundary; holds filter state; forwards edit callback |
| `AddressSearch` | `src/components/AddressSearch/` | Four-field filter bar |
| `MapContainer` | `src/components/MapContainer/` | Toggles empty state / grouped result cards |
| `SearchResultCard` | `src/components/SearchResultCard/` | One card per warehouse group |
| `AddressRow` | `src/components/AddressRow/` | Five-column vendor + address row with copy and edit actions |

---

## SDS Package (`packages/sds`)

The internal design-system package provides all primitive UI building blocks:

- **Primitives** — `Button`, `ButtonGroup`, `Input`, `InputField`, `Select`, `SelectField`, `SelectItem`, `Navigation`, `Avatar`, `Icon`, `IconButton`, `Tag`, `TextSmall`, `TextStrong`, `Search`, `Image`, and more
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

1. **Token extraction** (`tokenparser.md`) — Parsed all Figma variables and styles from the Address Book frame, resolved token references, and wrote `src/styles/tokens.css`. Re-run twice: after adding the Search Results Card (node 12:5949, count grew from 91 → 132) and again after adding the Add Address Dialog + Bulk Upload Panel (nodes 13:7305 + 14:1616, count grew to 185). Added `--ld-primitive-scale-space-600` and `--ld-primitive-scale-borderradius-200` to the fallback `:root` block; dropzone border-radius token migrated off hardcode.
2. **Structure generation** (`structuregenerator.md`) — Walked the full node tree, classified every frame, documented layout and token references, and wrote `.agent/structure`. Extended to include the results state (nodes 11:5556 and 12:5949) and the Add Address Dialog / Bulk Upload Panel (nodes 13:7305 and 14:1616).
3. **API layer creation** (`APICreation.md`) — Created the full `config → api → service` stack for the addresses datasource. Extended to cover the warehouse locations datasource: `warehouseLocationsApi.ts` (with PROD curl comment block) + `warehouseLocationsService.ts` + `src/types/warehouseLocation.types.ts`.
4. **Search results UI** — Implemented `SearchResultCard` and `AddressRow` components from Figma node 12:5949. Added `AddressSearchContainer` as the client state boundary. `MapContainer` now toggles between empty state and grouped result cards.
5. **Add Address dialog UI** — Implemented `AddAddressModal` from Figma nodes 13:7305 (single-entry tab) + 14:1616 (bulk upload tab). Tabbed layout with SDS Dialog, two field rows, full-width textarea, footer buttons on single-entry, and the bulk upload dropzone. Warehouse locations sourced from the new typed data file.
6. **Data file migration** — `src/data/warehouseLocations.json` replaced with `src/data/warehouseLocations.ts` (exports `WarehouseLocation` interface + typed array). JSON files are not permissible data sources under architect rule 3.7.
7. **Architecture audit** (`architect.md`) — Applied all coding standards across the new and modified files: extracted pure utilities into `src/utils/`, consolidated types in `src/types/`, ensured every `var()` in every CSS Module has a hardcoded fallback, added file-level header comments, and verified import order throughout.
8. **Add / Edit address flow** — Introduced `DashboardClient` as the shared state owner for the address list. `AddAddressModal` extended with `mode` / `initialValues` props to support both add and edit without code duplication. `src/utils/parseAddress.ts` created: `parseAddressText()` converts free-text textarea input into structured address fields; `formatAddressToText()` serialises a stored `Address` back into the textarea string for pre-filling. Edit is triggered by the row-level edit icon and opens the modal pre-filled without tabs.
9. **AddressRow gap VQA** — Compared node 1:13349 against the live CSS. Corrected two token mismatches: the row-level flex gap (`.row`) now uses `--spacing-search-results-row-gap` (8 px / `var(--sds-size-space-200)`) and each column's internal icon-to-label gap uses the new `--spacing-search-results-column-gap` token (12 px / `var(--sds-size-space-300)`). Token count updated to 186; `.agent/structure` flags updated.
10. **Token resolution pass** — Resolved 13 of the original 20 flagged hardcoded values by mapping each to the nearest existing design-system token. Added `--ld-semantic-font-heading-small-size` (18 px) to the fallback `:root` block. 7 values remain hardcoded with documented reasons (no DS token equivalent). Flagged count in `tokens.css` header updated 20 → 7; `.agent/structure` sizing flags updated.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Figma Design Source](https://www.figma.com/design/OnGD15bcgBmZ4KWdAR8J38/Address-book?m=auto&t=S9CMarTDAU3HS3LQ-6)
