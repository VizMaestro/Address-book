# Token Parser — Agent Instruction File

> **How to use this file:** Point your agent at this file and share a Figma link. Say: *"Follow @tokenparser.md and generate the tokens file for [Figma URL]."* The agent will do the rest before writing any code.

---

## Purpose

This file defines the exact behaviour an agent must follow to extract design tokens from a Figma file and produce a structured `tokens.css` file. No code should be written for any component, page, or feature until this process has been completed and `tokens.css` has been generated and reviewed.

The `tokens.css` file becomes the ground truth for all styling decisions in the project. Every colour, spacing value, radius, typography setting, shadow, and border used in any component must trace back to an entry in this file.

---

## Agent instructions — follow these steps in order

### Step 1 — Parse the Figma link

When the user shares a Figma URL, extract the file key and node ID from the URL.

URL format:
```
https://www.figma.com/design/{FILE_KEY}/...?node-id={NODE_ID}
```

Use the Figma MCP to call `get_design_context` on the provided node ID. If no node ID is in the URL, call `get_design_context` on the root file node.

---

### Step 2 — Identify all top-level sections

From the design context response, identify every top-level frame or section. These become the section headings in `tokens.css`.

Use the layer name from Figma exactly as written — do not rename, abbreviate, or invent names. If a layer has no name (e.g. `Frame 42`), flag it and ask the user to name it before proceeding.

---

### Step 3 — For each section, extract all token references

Walk every child node within the section. For each node, extract any design token or variable reference found in the following categories:

| Category | What to look for |
|---|---|
| **Color** | Fill colour, text colour, stroke colour — record the token/variable name, not the raw hex |
| **Spacing** | Padding (top, right, bottom, left), gap between children |
| **Corner radius** | Per-corner or unified radius values |
| **Typography** | Font family, font size, font weight, line height, letter spacing |
| **Shadow / Elevation** | Drop shadow and inner shadow definitions |
| **Border** | Stroke weight, stroke colour token, stroke style |
| **Sizing** | Fixed width or height values where explicitly set (not auto-layout computed values) |
| **Opacity** | Layer or fill opacity where used intentionally |

**Important rules:**
- Only record values that are bound to a token or variable. Do not record raw hardcoded hex values, raw pixel values, or unnamed properties as tokens.
- If a raw value is found where a token should be, flag it in a comment in the output file as `/* ⚠ HARDCODED — no token found: [value] */`.
- If the same token appears multiple times within a section, record it once only.

---

### Step 4 — Generate tokens.css

Create the file at `src/styles/tokens.css`.

If `src/styles/` does not exist, create it. Do not place `tokens.css` in the project root or any other location — `src/styles/` is the canonical home regardless of whether the project uses Vite, Next.js, Remix, or another framework. This ensures the file is always within the source tree and importable by CSS Modules without path gymnastics.

#### Output format

```css
/* ============================================================
   TOKEN MAP — generated from Figma
   Source: [Figma URL]
   Generated: [Date]
   Sections: [comma-separated list of section names]
   ============================================================ */


/* ============================================================
   SECTION: [Exact Figma layer name]
   ============================================================ */

/* Color */
--color-[section-slug]-[purpose]: [token-value];

/* Spacing */
--spacing-[section-slug]-[purpose]: [token-value];

/* Corner radius */
--radius-[section-slug]-[purpose]: [token-value];

/* Typography */
--font-[section-slug]-[purpose]-size: [token-value];
--font-[section-slug]-[purpose]-weight: [token-value];
--font-[section-slug]-[purpose]-family: [token-value];
--font-[section-slug]-[purpose]-line-height: [token-value];

/* Shadow */
--shadow-[section-slug]-[purpose]: [token-value];

/* Border */
--border-[section-slug]-[purpose]-color: [token-value];
--border-[section-slug]-[purpose]-width: [token-value];

/* Sizing */
--size-[section-slug]-[purpose]: [token-value];

/* Opacity */
--opacity-[section-slug]-[purpose]: [token-value];
```

#### Naming rules for custom properties

- `[section-slug]` — the Figma section name converted to kebab-case (e.g. `Header Bar` → `header-bar`)
- `[purpose]` — a short description of what the token is used for in that section (e.g. `background`, `title-text`, `card-padding`, `icon-size`)
- All custom property names must be lowercase kebab-case
- No abbreviations unless the purpose is universally obvious (e.g. `bg` is acceptable for background, `px` is not acceptable for padding)

---

### Step 5 — Add a summary block at the top of the file

At the very top of `tokens.css`, before any section blocks, add:

```css
/*
 * TOKEN SUMMARY
 * -------------
 * Total sections: [n]
 * Total tokens mapped: [n]
 * Hardcoded values flagged: [n]
 *
 * Sections:
 *   - [Section 1 name]
 *   - [Section 2 name]
 *   ...
 *
 * Flagged items requiring designer attention:
 *   - [Section name]: [property] has no token — raw value [x] used
 *   ...
 */
```

If there are no flagged items, write `None — all values are token-bound.`

---

### Step 6 — Report back to the user

After generating `tokens.css`, provide a brief summary:

1. How many sections were parsed
2. How many tokens were mapped
3. How many hardcoded values were found and flagged
4. Any Figma layers that were skipped due to missing names

Ask the user to review the flagged items before any implementation begins.

---

## Quality rules — the agent must enforce these

- **No code before tokens.** If a user asks the agent to build a component before running the token parser, the agent must pause and run the token parser first. Only after `tokens.css` is generated and the user has confirmed it should coding begin.
- **No raw values in components.** Any CSS written in the project must reference a custom property from `tokens.css`, not a raw hex, pixel, or font-size value.
- **No invented tokens.** The agent must not create token names that do not appear in the Figma file. If a Figma property has no token, it must be flagged, not silently invented.
- **Re-run on design changes.** If the user updates the Figma file during the project and shares an updated link, the agent must re-run the parser and flag any tokens that have changed, been removed, or been added.

---

## Example output

```css
/*
 * TOKEN SUMMARY
 * -------------
 * Total sections: 3
 * Total tokens mapped: 24
 * Hardcoded values flagged: 2
 *
 * Sections:
 *   - Header Bar
 *   - Quick View Card
 *   - Network Flow
 *
 * Flagged items requiring designer attention:
 *   - Quick View Card: card border-radius has no token — raw value 8px used
 *   - Network Flow: arrow icon color has no token — raw value #0053e2 used
 */


/* ============================================================
   SECTION: Header Bar
   ============================================================ */

/* Color */
--color-header-bar-background: var(--ld-semantic-color-background-inverse);
--color-header-bar-title-text: var(--ld-semantic-color-text-oncolor);
--color-header-bar-icon: var(--ld-semantic-color-text-oncolor);

/* Spacing */
--spacing-header-bar-padding-horizontal: var(--ld-primitive-scale-space-400);
--spacing-header-bar-padding-vertical: var(--ld-primitive-scale-space-200);
--spacing-header-bar-icon-gap: var(--ld-primitive-scale-space-300);

/* Typography */
--font-header-bar-title-size: var(--ld-semantic-font-heading-medium-size);
--font-header-bar-title-weight: var(--ld-semantic-font-heading-medium-weight);
--font-header-bar-title-family: var(--ld-semantic-font-heading-medium-family);
--font-header-bar-title-line-height: var(--ld-semantic-font-heading-medium-line-height);

/* Sizing */
--size-header-bar-icon: var(--ld-primitive-scale-space-500);
--size-header-bar-logo-height: var(--ld-primitive-scale-space-600);


/* ============================================================
   SECTION: Quick View Card
   ============================================================ */

/* Color */
--color-quick-view-card-background: var(--ld-semantic-color-background-primary);
--color-quick-view-card-label-text: var(--ld-semantic-color-text-subtlest);
--color-quick-view-card-value-text: var(--ld-semantic-color-text);

/* Spacing */
--spacing-quick-view-card-padding: var(--ld-primitive-scale-space-300);
--spacing-quick-view-card-row-gap: var(--ld-primitive-scale-space-200);

/* Corner radius */
/* ⚠ HARDCODED — no token found: 8px */
--radius-quick-view-card: 8px;

/* Shadow */
--shadow-quick-view-card: var(--ld-semantic-elevation-100);

/* Typography */
--font-quick-view-card-label-size: var(--ld-semantic-font-body-small-size);
--font-quick-view-card-label-weight: var(--ld-semantic-font-body-small-weight);
--font-quick-view-card-value-size: var(--ld-semantic-font-body-medium-size);
--font-quick-view-card-value-weight: var(--ld-semantic-font-body-medium-weight);
```

---

## Notes for the agent

- Always prefer a token reference over a raw value. If a token exists in the design system for a property, use it.
- Do not skip sections because they seem simple. Even a section with one component may have spacing or colour tokens that the rest of the project depends on.
- If the Figma file has nested frames within a top-level section, walk all nested children. Tokens used in nested components should be attributed to the parent section.
- If a token appears in more than one section with a different purpose, list it separately in each section under its correct purpose name.

---

*This file is an agent instruction file. It does not produce code directly — it defines the standard a coding agent must follow before any code is written.*
