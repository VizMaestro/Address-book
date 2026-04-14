# Architect — Agent Coding Standards Context File

> **How to use this file:** Reference this file at the start of any coding session. Say: *"Follow @architect.md for all coding standards throughout this project."* The agent must honour every rule in this file for the entire session — not just when reminded.

> **Run order:** `tokenparser.md` → `structuregenerator.md` → **`architect.md` loaded as context** → coding begins

---

## What this file is

This is the coding constitution for the project. It defines the standards the agent must apply to every file it creates or modifies — without exception and without needing to be reminded. Rules here are not suggestions. They are the baseline.

If a user asks the agent to do something that violates a rule in this file, the agent must flag the conflict before proceeding and ask for explicit confirmation to override the standard.

---

## 1. File and folder organisation

### 1.1 One responsibility per file
Every file has a single, clearly defined responsibility. A file that does two things should be two files.

- One React component per `.tsx` file
- One set of styles per `.module.css` file
- One data model or data set per `.ts` file
- One utility function group per `.ts` file

### 1.2 Collocate related files
Files that belong to the same component live in the same folder:

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
├── ComponentName.VQA.md     (if VQA has been run)
└── index.ts                 (re-export only)
```

The `index.ts` file contains only:
```typescript
export { default } from './ComponentName'
```

Nothing else. No logic, no re-exports of sub-components.

### 1.3 Separate concerns into dedicated folders
```
src/
├── components/     UI components only
├── data/           Data files, types, transformers
├── pages/          Page-level layout components
├── styles/         Global styles, token files
├── utils/          Pure utility functions
├── hooks/          Custom React hooks
└── assets/         Static files (SVG, PNG, fonts)
```

Never put data in `components/`. Never put components in `data/`. Never put utilities in `components/`. The folder name is a contract.

### 1.4 Name files after what they contain
- React components: `PascalCase.tsx` (e.g. `HeaderBar.tsx`)
- CSS Modules: `PascalCase.module.css` (matches component name exactly)
- Data files: `camelCase.ts` (e.g. `inventoryMetrics.ts`)
- Type files: `types.ts` or `ComponentName.types.ts`
- Utility files: `camelCase.ts` (e.g. `formatDate.ts`)
- Hook files: `useHookName.ts` (always prefixed with `use`)

---

## 2. CSS and styling

### 2.1 CSS Modules only — no exceptions
Every component has its own `.module.css` file. Styles are never written inline, never written in JSX, and never written in a global stylesheet unless they are genuinely global (body reset, root tokens, or third-party overrides).

**Prohibited patterns:**
```tsx
// ❌ Inline style — never
<div style={{ padding: '16px', color: '#2e2f32' }}>

// ❌ Tailwind utility classes mixed with modules — never
<div className="flex items-center p-4">

// ❌ Hardcoded class strings — never
<div className="card-header">
```

**Required pattern:**
```tsx
// ✅ CSS Module only
import styles from './ComponentName.module.css'
<div className={styles.cardHeader}>
```

### 2.2 No hardcoded values in CSS
Every colour, spacing value, font size, corner radius, shadow, and border must reference a design token via a CSS custom property. If a token does not exist in `tokens.css`, the value must be flagged and a token created before use.

**Prohibited:**
```css
/* ❌ Raw hex colour */
color: #2e2f32;

/* ❌ Raw pixel spacing */
padding: 16px;

/* ❌ Magic number */
border-radius: 8px;
```

**Required:**
```css
/* ✅ Token reference with fallback */
color: var(--color-header-bar-title-text, #2e2f32);
padding: var(--spacing-card-padding, 16px);
border-radius: var(--radius-card, 8px);
```

Every `var()` call must include a hardcoded fallback as the second argument. Never rely on a token resolving without a fallback.

### 2.3 Class names describe purpose, not appearance
Class names should say what an element *is*, not what it looks like.

**Prohibited:**
```css
/* ❌ Appearance-based names */
.blueText { }
.bigContainer { }
.leftAligned { }
```

**Required:**
```css
/* ✅ Purpose-based names */
.sectionTitle { }
.cardWrapper { }
.filterBar { }
```

### 2.4 No `!important`
The use of `!important` is prohibited. If a specificity conflict requires it, the architecture is wrong and must be fixed at the source.

### 2.5 Mobile-first responsive styles
Media queries must use `min-width` (mobile-first). Write base styles for the smallest viewport first, then override upward.

```css
/* ✅ Mobile-first */
.grid {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .grid {
    flex-direction: row;
  }
}
```

### 2.6 No CSS in JavaScript
Computed styles (e.g. dynamic colours based on state) must use CSS custom properties updated via `style` attributes on the root element only, or CSS classes toggled via `className`. Never compute colour strings or pixel values in JavaScript.

```tsx
// ❌ Dynamic style computation in JSX
<div style={{ backgroundColor: isActive ? '#0053e2' : '#fff' }}>

// ✅ Class toggling
<div className={isActive ? styles.active : styles.inactive}>
```

---

## 3. TypeScript

### 3.1 Strict mode always on
`tsconfig.json` must have `"strict": true`. No exceptions. This enables:
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictPropertyInitialization`

### 3.2 No `any` type
The type `any` is prohibited. If the type is genuinely unknown, use `unknown` and narrow it before use. If a third-party library forces `any`, isolate it in a type adapter file — it must not propagate into component code.

### 3.3 Explicit return types on all functions
Every function must have an explicit return type. Do not rely on inference for public interfaces.

```typescript
// ❌ Inferred return type
function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

// ✅ Explicit return type
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}
```

### 3.4 Interfaces for object shapes, types for unions and aliases
```typescript
// ✅ Interface for data objects
interface MetricCard {
  title: string
  value: number
}

// ✅ Type for unions
type LayoutDirection = 'horizontal' | 'vertical' | 'none'
```

### 3.5 Props interfaces declared above the component
Every React component must have a named props interface declared in the same file, immediately above the component function.

```typescript
// ✅
interface HeaderBarProps {
  storeName: string
  notificationCount: number
  onNotificationClick: () => void
}

export default function HeaderBar({ storeName, notificationCount, onNotificationClick }: HeaderBarProps) {
```

Never use inline anonymous object types for props.

### 3.6 No non-null assertions (`!`) without a comment
The `!` non-null assertion operator may only be used when the agent can prove the value is non-null in context, and it must be accompanied by an inline comment explaining why.

```typescript
// ❌ Silent non-null assertion
const value = map.get(key)!

// ✅ Justified non-null assertion
const value = map.get(key)! // key is guaranteed present — populated in the same function scope above
```

### 3.7 Typed data files
Every data file exports a typed interface alongside its data. The data array must be explicitly typed against that interface.

```typescript
// ✅
export interface DistributorRecord {
  id: string
  name: string
  sellableQty: number
}

export const distributors: DistributorRecord[] = [
  { id: '10000015501', name: 'Hooray Tech Inc', sellableQty: 198 },
]
```

---

## 4. React component standards

### 4.1 Functional components only
Class components are prohibited. All components are written as arrow function expressions or named function declarations. Named function declarations are preferred for top-level components (they appear in React DevTools with their name).

```tsx
// ✅ Named function declaration
export default function HeaderBar({ storeName }: HeaderBarProps) {
  return <header className={styles.root}>{storeName}</header>
}
```

### 4.2 Single responsibility
A component does one thing. If it is doing two things, it should be two components. Signs a component needs splitting:
- The file is longer than ~150 lines
- The component name requires "and" to describe (e.g. `FilterBarAndSearchInput`)
- The component contains conditional rendering for fundamentally different layouts

### 4.3 No data defined inside components
No array, object literal, or constant that represents data belongs inside a component function or module. All data lives in `src/data/` and is imported.

```tsx
// ❌ Data defined in component
export default function InventoryMetrics() {
  const cards = [
    { title: 'Available', value: 540 },
    { title: 'Picked', value: 329 },
  ]
  ...
}

// ✅ Data imported from data file
import { metricCards } from '../../data/inventoryMetrics'

export default function InventoryMetrics() {
  ...
}
```

### 4.4 No direct DOM manipulation
Never use `document.getElementById`, `document.querySelector`, or direct DOM mutations inside a React component. Use `useRef` for DOM references and React state for mutations.

### 4.5 Keys on all lists
Every list rendered with `.map()` must have a stable, unique `key` prop. Never use array index as a key unless the list is static and will never be reordered.

```tsx
// ❌ Index as key
{cards.map((card, index) => <MetricCard key={index} {...card} />)}

// ✅ Stable ID as key
{cards.map((card) => <MetricCard key={card.id} {...card} />)}
```

### 4.6 Event handler naming convention
Event handler props are prefixed with `on`. Handler function names are prefixed with `handle`.

```tsx
// ✅ Prop: onSearchSubmit, Handler: handleSearchSubmit
interface SearchBarProps {
  onSearchSubmit: (query: string) => void
}

function SearchBar({ onSearchSubmit }: SearchBarProps) {
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearchSubmit(query)
  }
  ...
}
```

### 4.7 Avoid prop drilling beyond two levels
If a prop needs to pass through more than two component levels to reach its consumer, introduce a context, a data module, or restructure the component tree. Do not pass props through intermediate components that do not use them.

### 4.8 Memoisation is explicit and justified
`React.memo`, `useMemo`, and `useCallback` are used only when there is a measured or clearly anticipated performance reason. They must not be applied by default to every component. Premature memoisation adds complexity without benefit.

```tsx
// ✅ Justified memoisation — called on every row render in a large AG Grid
const renderEventTag = useCallback((params: ICellRendererParams) => {
  return <EventTagRenderer {...params} />
}, []) // stable reference needed for AG Grid cell renderer
```

---

## 5. Data and state management

### 5.1 Data flows down, events flow up
Props carry data downward. Callback functions carry events upward. Components do not reach into sibling or parent state.

### 5.2 Derive state, do not duplicate it
If a value can be computed from existing state or props, compute it — do not store it in state. Derived state causes synchronisation bugs.

```tsx
// ❌ Duplicated state
const [items, setItems] = useState(rawItems)
const [count, setCount] = useState(rawItems.length) // duplicated

// ✅ Derived value
const [items, setItems] = useState(rawItems)
const count = items.length // derived — no state needed
```

### 5.3 useEffect has explicit, minimal dependency arrays
Every `useEffect` must have a dependency array. An empty array `[]` is acceptable only when the effect is genuinely meant to run once on mount. Never omit the dependency array.

```tsx
// ❌ Missing dependency array — runs on every render
useEffect(() => {
  fetchData(id)
})

// ✅ Explicit dependency
useEffect(() => {
  fetchData(id)
}, [id])
```

### 5.4 Mock data matches production API contract
Mock data files must be structured to match the shape of the real API they will eventually replace. Field names, types, and nesting must be identical. This ensures the migration from mock to real endpoint is a one-line change per source.

### 5.5 No fetch calls inside components
Data fetching logic does not belong inside a component body. It belongs in a custom hook (`useInventoryData`) or a data service module (`src/services/`). Components receive data as props or via hooks — they do not own fetching logic.

---

## 6. Imports and exports

### 6.1 Import order
Imports must follow this order, with a blank line between each group:

```typescript
// 1. React and core libraries
import { useState, useCallback } from 'react'

// 2. Third-party packages
import { AgGridReact } from 'ag-grid-react'

// 3. Internal components
import HeaderBar from '../HeaderBar'

// 4. Data and types
import { metricCards } from '../../data/inventoryMetrics'
import type { MetricCardData } from '../../data/inventoryMetrics'

// 5. Styles (always last)
import styles from './Dashboard.module.css'
```

### 6.2 Default exports for components, named exports for everything else
- React components: `export default function ComponentName`
- Data, types, utilities, hooks: `export const`, `export function`, `export interface`

### 6.3 No barrel re-exports that mask origins
`index.ts` files re-export one thing only — the default export of the file they represent. Do not create barrel files that aggregate dozens of exports. They make tree-shaking harder and debugging slower.

### 6.4 No circular imports
A file must never import from a file that imports from it. If a circular dependency is needed, the shared logic belongs in a third file.

---

## 7. Naming conventions

### 7.1 Universal naming rules

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `HeaderBar.tsx` |
| Component function | PascalCase | `function HeaderBar` |
| CSS Module file | PascalCase | `HeaderBar.module.css` |
| CSS class | camelCase | `.sectionTitle` |
| TypeScript interface | PascalCase | `MetricCardData` |
| TypeScript type alias | PascalCase | `LayoutDirection` |
| Variable / constant | camelCase | `metricCards` |
| Boolean variable | `is` / `has` / `should` prefix | `isExpanded`, `hasError` |
| Event handler prop | `on` prefix | `onSubmit`, `onClick` |
| Handler function | `handle` prefix | `handleSubmit` |
| Custom hook | `use` prefix | `useInventoryData` |
| Data file | camelCase | `inventoryMetrics.ts` |
| Asset file | kebab-case | `delivery-person.svg` |
| Enum value | SCREAMING_SNAKE_CASE | `INVENTORY_STATUS.AVAILABLE` |

### 7.2 Names explain intent, not implementation
A variable name should say what it represents in the business domain, not how it is implemented.

```typescript
// ❌ Implementation-focused
const arr = metricCards.filter(c => c.value > 0)
const temp = formatDate(row.createdAt)

// ✅ Intent-focused
const nonZeroMetrics = metricCards.filter(card => card.value > 0)
const formattedCreatedDate = formatDate(row.createdAt)
```

---

## 8. Comments and documentation

### 8.1 No comments that narrate code
Comments must not describe what the code does — that is the code's job. Comments explain *why* a decision was made, *what constraint* it satisfies, or *what non-obvious consequence* it prevents.

```typescript
// ❌ Narrating comment — adds no value
// Loop through the cards
metricCards.forEach(card => { ... })

// ✅ Explanatory comment — explains the why
// AG Grid requires a stable function reference to avoid re-registering cell renderers on every render
const renderEventTag = useCallback(...)
```

### 8.2 File-level header comments for non-obvious files
Any file that has a non-obvious purpose, contains important constraints, or implements a complex algorithm should have a brief header comment explaining:
- What this file does
- Any Figma node it maps to (for components)
- Any important constraints or known trade-offs

### 8.3 TODO comments must be actionable
A `TODO` comment must include what needs to be done and why it is deferred — not just a flag.

```typescript
// ❌ Vague TODO
// TODO: fix this

// ✅ Actionable TODO
// TODO: replace with live API call once /inventory endpoint is available — mock data mirrors expected response shape
```

---

## 9. Accessibility

### 9.1 Semantic HTML first
Use the correct HTML element for the job before reaching for ARIA attributes. A button is `<button>`, not a `<div onClick>`. Navigation is `<nav>`. A page section is `<section>`. A list is `<ul>` or `<ol>`.

### 9.2 Every interactive element is keyboard accessible
Any element a user can click must be reachable and operable with a keyboard. `<button>` and `<a>` are keyboard accessible by default. Custom interactive elements (`<div>` acting as buttons) must have `role`, `tabIndex`, and keyboard event handlers.

### 9.3 Images have alt text
Every `<img>` has a descriptive `alt` attribute. Decorative images that carry no information have `alt=""` (empty string, not omitted).

### 9.4 Icon-only buttons have accessible labels
Any button or interactive element that contains only an icon must have an `aria-label` that describes its action.

```tsx
// ❌ Icon-only button with no label
<button onClick={handleSearch}><SearchIcon /></button>

// ✅ Labelled icon button
<button onClick={handleSearch} aria-label="Submit search"><SearchIcon /></button>
```

### 9.5 Colour is never the only way to convey information
Status, errors, and states must be communicated through text or icons in addition to colour. Never rely on colour alone.

---

## 10. Performance standards

### 10.1 No unnecessary renders
State updates that do not affect the UI must not trigger renders. Lift state as low as possible — state that is only used by one component lives in that component, not in a parent.

### 10.2 Large lists are virtualised
Any list that may render more than 50 items must use a virtualisation approach (e.g. AG Grid for tables, or a virtual list library for other lists). Never render thousands of DOM nodes.

### 10.3 Heavy components are lazily loaded
Any component that is not needed on initial render (modals, drawers, below-the-fold panels) should be loaded with `React.lazy` and `Suspense`.

### 10.4 Images are sized correctly
Images must not be loaded at sizes larger than their rendered dimensions. Use the correct size asset, or use `srcset` for responsive images.

---

## 11. Error handling

### 11.1 Null and undefined are handled explicitly
Never assume a value is present. Use optional chaining (`?.`) and nullish coalescing (`??`) to handle absent values gracefully.

```typescript
// ❌ Assumes value exists
const name = user.profile.name.toUpperCase()

// ✅ Handles absence
const name = user?.profile?.name?.toUpperCase() ?? 'Unknown'
```

### 11.2 Error boundaries wrap page sections
Every major page section should be wrapped in a React Error Boundary. An error in one section must not crash the entire page.

### 11.3 Network errors are surfaced, not swallowed
Any data fetching error must result in a visible UI state (an error message, a retry option) — not a silently empty component or a console log.

---

## 12. Security

### 12.1 No secrets in source code
API keys, tokens, passwords, and internal service URLs must never appear in source files. They belong in environment variables, accessed via `import.meta.env` in Vite projects.

### 12.2 No `dangerouslySetInnerHTML`
The use of `dangerouslySetInnerHTML` is prohibited unless the content has been sanitised and the reason is explicitly documented with a comment.

### 12.3 User input is never trusted
Any value that originates from user input must be treated as untrusted. Never interpolate user input directly into queries, URLs, or DOM content without validation.

---

## 13. Code cleanliness

### 13.1 No unused code
No unused variables, unused imports, unused CSS classes, or commented-out code blocks. Clean up as you go. The agent must run a cleanup pass before considering any file complete.

### 13.2 No `console.log` in committed code
`console.log`, `console.warn`, and `console.error` calls are for debugging only and must be removed before the file is considered complete. The only exception is intentional error logging inside a catch block, which must use `console.error` and include a descriptive message.

### 13.3 Functions are short and focused
A function should do one thing. If a function is longer than ~30 lines, it likely needs to be broken into smaller functions. Long functions are harder to test, harder to read, and harder to debug.

### 13.4 No magic numbers
Any numeric value with non-obvious meaning must be assigned to a named constant.

```typescript
// ❌ Magic number
if (items.length > 50) { ... }

// ✅ Named constant
const VIRTUALISATION_THRESHOLD = 50
if (items.length > VIRTUALISATION_THRESHOLD) { ... }
```

---

## 14. Git and commit hygiene

### 14.1 One concern per commit
Each commit addresses one thing: a feature, a fix, a refactor, or a documentation update. Mixed commits are harder to review and revert.

### 14.2 Commit message format
```
type: short description in present tense

Types: feat | fix | refactor | style | docs | chore | test
```

Examples:
```
feat: add pagination controls to ProductTable
fix: correct token fallback for header background colour
refactor: extract distributor data to onlineInventory.ts
docs: update VQA.md with full-page audit results
```

### 14.3 Never commit sensitive files
`.env`, credential files, and private instruction files (like this one) must be gitignored. The `.gitignore` must be reviewed before the first commit of any project.

---

## 15. The agent's self-check before marking any task complete

Before the agent considers any file or component complete, it must internally verify:

- [ ] Does this file have a single, clear responsibility?
- [ ] Is every style in a `.module.css` file — no inline styles anywhere?
- [ ] Is every CSS value referencing a token from `tokens.css` with a fallback?
- [ ] Is every TypeScript type explicit — no `any`, no missing return types?
- [ ] Is all data imported from `src/data/` — none defined inside this file?
- [ ] Are all imports in the correct order?
- [ ] Are there any unused imports, variables, or CSS classes?
- [ ] Are there any `console.log` calls?
- [ ] Do all interactive elements have accessible labels or semantic roles?
- [ ] Does the component match the `structure` file hierarchy and sizing intent?
- [ ] Are there any hardcoded hex values, pixel values, or magic numbers?
- [ ] Do all list renders have stable `key` props?

If any item fails, fix it before proceeding.

---

*This file is an agent context file. It does not produce code directly — it defines the engineering standards the agent must uphold for every line of code it writes.*
