# Structure Generator — Agent Instruction File

> **How to use this file:** Run this after `tokenparser.md` has produced `tokens.css`. Point your agent at both files and say: *"Follow @structuregenerator.md and generate the structure file for [Figma URL]. Use the existing tokens.css as the token reference."*

> **Run order:** `tokenparser.md` → **`structuregenerator.md`** → coding begins

---

## Why this file exists

AI agents hallucinate layout. Not because they are bad at code — because they are filling gaps. When a Figma design is not fully described in a machine-readable way before coding starts, the agent interpolates. It invents component hierarchies, guesses layout relationships, and makes assumptions about sizing intent that look plausible but are wrong.

This file solves that by generating a `structure` file — a complete, unambiguous, YAML-formatted blueprint of the entire Figma design before a single line of code is written. The `structure` file, combined with `tokens.css`, gives the agent zero room to guess. Every component, every layout relationship, every sizing intent, and every token reference is pre-declared. The agent's job during coding becomes assembly — not interpretation.

---

## Output format decision — YAML

The output file is named `structure` with no file extension. Its content is YAML. It is created at `.agent/structure`.

If `.agent/` does not exist, create it. This folder is the canonical home for all pre-build agent planning artifacts. It sits at the project root alongside `.github/`, `.husky/`, and similar tooling folders — outside `src/` because it is not compiled or imported by the application. It works identically in Vite, Next.js, Remix, and any other framework.

**Why YAML:**
- Indentation naturally mirrors component tree hierarchy — the structure maps directly to how React component nesting works
- Sibling relationships are self-evident at the same indentation level
- Parent relationships are implicit through nesting — no need for explicit parent IDs on every node
- AI agents parse YAML reliably and predictably
- Human-readable for design and engineering review before coding starts
- Supports inline comments for flags and warnings
- More compact than JSON for deeply nested structures
- Maps closer to how developers think about layout than any alternative format

---

## Agent instructions — follow these steps in order

### Step 1 — Confirm tokens.css exists

Before proceeding, verify that `tokens.css` exists in the project. If it does not, stop and instruct the user to run `tokenparser.md` first. Do not generate the structure file without a valid `tokens.css` present.

---

### Step 2 — Parse the Figma file

Extract the file key and node ID from the provided Figma URL:

```
https://www.figma.com/design/{FILE_KEY}/...?node-id={NODE_ID}
```

Call `get_design_context` on the node ID. If no node ID is in the URL, call on the root file node. The full node tree will be the source of truth for the entire structure file.

---

### Step 3 — Identify the root frame

The root frame is the outermost container that holds all sections of the design. Record its:
- Figma node ID
- Layer name (exact, no renaming)
- Layout direction (horizontal or vertical)
- Padding values (mapped to token references from `tokens.css` where available)
- Overall sizing intent

This becomes the top-level entry in the `structure` file.

---

### Step 4 — Walk the full node tree and record every frame

For each frame encountered, working from root outward, record the following properties:

#### 4a — Identity

```yaml
id:     "[figma-node-id]"
name:   "[Exact Figma layer name — no renaming]"
type:   "[section | component | group | text | icon | image | input | list | card]"
```

`type` classification rules:
- `section` — a top-level named frame that maps to a React component
- `component` — a Figma component instance (attached to the design system)
- `card` — a frame with elevation/shadow that visually groups content
- `group` — a layout grouping with no visual treatment of its own
- `text` — a text layer
- `icon` — a vector icon or SVG
- `image` — an image or illustration frame
- `input` — an interactive input field component
- `list` — a repeating pattern of identical child frames

#### 4b — Relative position (never absolute coordinates)

```yaml
position:
  order:          [1-based index among siblings]
  sibling_before: "[name of previous sibling, or null]"
  sibling_after:  "[name of next sibling, or null]"
  layout_role:    "[flex-child | overlay | sticky | grid-cell]"
```

`layout_role` rules:
- `flex-child` — participates in parent's auto-layout flow (most common)
- `overlay` — positioned on top of sibling content (absolute in CSS terms)
- `sticky` — fixed relative to scroll position (e.g. header bars)
- `grid-cell` — participates in a grid layout

Do not record x/y absolute coordinates under any circumstances.

#### 4c — Layout model

```yaml
layout:
  direction:  "[horizontal | vertical | none]"
  alignment:  "[start | center | end | stretch | space-between]"
  wrap:        "[true | false]"
  gap:         "[token-ref from tokens.css, or 0]"
  padding:
    top:    "[token-ref or 0]"
    right:  "[token-ref or 0]"
    bottom: "[token-ref or 0]"
    left:   "[token-ref or 0]"
```

Gap and padding values must be mapped to their corresponding token reference from `tokens.css` (e.g. `var(--spacing-header-bar-padding-horizontal)`). If no token exists for the value, record the raw value and append a comment: `# ⚠ no token — raw value`

#### 4d — Sizing intent

```yaml
sizing:
  width:   "[fill-container | hug-content | fixed-[px] | [n]%-of-parent]"
  height:  "[fill-container | hug-content | fixed-[px] | [n]%-of-parent]"
  min_width:   "[token-ref or null]"
  max_width:   "[token-ref or null]"
  overflow:    "[visible | hidden | scroll | auto]"
```

Record sizing as intent, not raw pixels. A frame that is `342px` wide because it was dragged to size should be recorded as `fixed-342px`. A frame that is set to fill its parent in Figma should be recorded as `fill-container`. This is the most important distinction — it is what produces responsive CSS instead of hardcoded dimensions.

#### 4e — Token references

For every visual property on this node, record the corresponding custom property from `tokens.css`:

```yaml
tokens:
  color_background:     "[--color-[section]-background or null]"
  color_text:           "[--color-[section]-[purpose] or null]"
  color_border:         "[--border-[section]-[purpose]-color or null]"
  spacing_padding:      "[--spacing-[section]-[purpose] or null]"
  spacing_gap:          "[--spacing-[section]-[purpose] or null]"
  radius:               "[--radius-[section]-[purpose] or null]"
  shadow:               "[--shadow-[section]-[purpose] or null]"
  font_size:            "[--font-[section]-[purpose]-size or null]"
  font_weight:          "[--font-[section]-[purpose]-weight or null]"
  font_family:          "[--font-[section]-[purpose]-family or null]"
  font_line_height:     "[--font-[section]-[purpose]-line-height or null]"
  opacity:              "[--opacity-[section]-[purpose] or null]"
```

Only include properties that are actually present on this node. Omit null entries.

#### 4f — React mapping hint

```yaml
react:
  component_name: "[PascalCase — suggested React component name]"
  element:        "[div | section | header | nav | aside | ul | li | button | span | p | img]"
  css_module:     "[ComponentName.module.css]"
  notes:          "[Any special implementation notes — e.g. 'uses AG Grid', 'scrollable horizontal', 'hug height — do not stretch']"
```

The `component_name` is suggested by the agent based on the Figma layer name. The user may override this during review.

---

### Step 5 — Recurse into children

For every node, after recording its own properties, record its `children` array recursively using the same schema. Children should be listed in order (matching Figma layer order, top to bottom).

```yaml
children:
  - id: "..."
    name: "..."
    # ... full node schema
    children:
      - ...
```

Leaf nodes (text, icon, image) will have an empty `children` array or the key omitted entirely.

---

### Step 6 — Add a file header

At the very top of the `structure` file, write:

```yaml
# STRUCTURE
# ---------
# Source Figma URL:   [URL]
# Root frame:         [Root frame name]
# Generated:          [Date]
# Companion file:     tokens.css
#
# SUMMARY
# -------
# Total sections:     [n]
# Total nodes mapped: [n]
# Components found:   [n]   (attached design-system components)
# Hardcoded values:   [n]   (sizing or spacing with no token match)
# Flags:              [n]   (issues requiring review before coding)
#
# FLAGS
# -----
# [Section name] > [Layer name]: [description of flag]
# ...
# (or "None — structure is clean." if no flags)
#
# CODING CONTRACT
# ---------------
# The agent must not deviate from this file during implementation.
# Any layout, component, or styling decision not covered here must
# be raised with the user before proceeding — not resolved by assumption.
```

---

### Step 7 — Report back to the user

After generating the `structure` file, provide:

1. Total sections and nodes parsed
2. Number of design-system components identified (these map to library components in code)
3. Number of hardcoded values found with no token reference
4. Any flags that require designer or developer attention before coding starts
5. A recommended React component list derived from the `react.component_name` fields

Ask the user to review the structure file and confirm it before coding begins. This confirmation is the gate.

---

## How the agent uses structure during coding

Once the user confirms the structure file, the agent must use it as follows:

**1. One React component per `type: section` node**
Each top-level section node in the structure file maps to exactly one React component. No additional components should be created unless they correspond to a node in the structure file.

**2. Layout from `layout` fields only**
The `layout.direction`, `layout.alignment`, `layout.gap`, and `layout.padding` fields define the CSS for every container. The agent must not invent layout properties not present in the structure file.

**3. Sizing from `sizing` fields only**
`fill-container` → `flex: 1` or `width: 100%` depending on context. `hug-content` → no explicit width/height (let content determine size). `fixed-[px]` → explicit pixel value. The agent must not set sizing in any other way.

**4. All CSS values from `tokens` fields**
Every CSS property applied to a component must reference the token listed in the node's `tokens` block in the structure file, which in turn comes from `tokens.css`. No raw values. No invented custom properties.

**5. Children rendered in `position.order` sequence**
Children are rendered in their recorded order. The agent must not reorder components unless the user explicitly asks.

**6. Flags stop coding**
If the agent encounters a contradiction between the structure file and the Figma file during implementation (e.g. a node in Figma that has no entry in the structure file), it must stop and raise it with the user — not resolve it by assumption.

---

## Full example output

```yaml
# STRUCTURE
# ---------
# Source Figma URL:   https://www.figma.com/design/IxY9a1IhfYWcCXVe9BltSa/EIV-2.0?node-id=6070-207931
# Root frame:         Dashboard
# Generated:          2026-02-24
# Companion file:     tokens.css
#
# SUMMARY
# -------
# Total sections:     3
# Total nodes mapped: 14
# Components found:   6
# Hardcoded values:   1
# Flags:              1
#
# FLAGS
# -----
# Quick View Card > card-wrapper: corner-radius has no token — raw value 8px used
#
# CODING CONTRACT
# ---------------
# The agent must not deviate from this file during implementation.
# Any layout, component, or styling decision not covered here must
# be raised with the user before proceeding — not resolved by assumption.

root:
  id:   "6070:207931"
  name: "Dashboard"
  type: section
  layout:
    direction: vertical
    alignment: start
    gap: 0
    padding:
      top:    0
      right:  0
      bottom: 0
      left:   0
  sizing:
    width:    fill-container
    height:   fill-container
    overflow: auto
  react:
    component_name: Dashboard
    element:        div
    css_module:     Dashboard.module.css
    notes:          "Root page wrapper — full viewport height"
  children:

    - id:   "6070:210258"
      name: "Header Bar"
      type: section
      position:
        order:          1
        sibling_before: null
        sibling_after:  "Title Section"
        layout_role:    sticky
      layout:
        direction: horizontal
        alignment: center
        wrap:      false
        gap:       "var(--spacing-header-bar-icon-gap)"
        padding:
          top:    "var(--spacing-header-bar-padding-vertical)"
          right:  "var(--spacing-header-bar-padding-horizontal)"
          bottom: "var(--spacing-header-bar-padding-vertical)"
          left:   "var(--spacing-header-bar-padding-horizontal)"
      sizing:
        width:    fill-container
        height:   hug-content
        overflow: visible
      tokens:
        color_background: "var(--color-header-bar-background)"
        color_text:       "var(--color-header-bar-title-text)"
        spacing_padding:  "var(--spacing-header-bar-padding-horizontal)"
        spacing_gap:      "var(--spacing-header-bar-icon-gap)"
      react:
        component_name: HeaderBar
        element:        header
        css_module:     HeaderBar.module.css
        notes:          "Sticky top — spans full width"
      children:

        - id:   "6070:210260"
          name: "Logo Area"
          type: group
          position:
            order:          1
            sibling_before: null
            sibling_after:  "Nav Actions"
            layout_role:    flex-child
          layout:
            direction: horizontal
            alignment: center
            gap: "var(--spacing-header-bar-icon-gap)"
          sizing:
            width:  hug-content
            height: fill-container
          tokens:
            color_text: "var(--color-header-bar-title-text)"
            font_size:  "var(--font-header-bar-title-size)"
            font_weight: "var(--font-header-bar-title-weight)"
          react:
            component_name: null
            element:        div
            css_module:     HeaderBar.module.css
            notes:          "Inline group — no separate component needed"

    - id:   "6070:210170"
      name: "Title Section"
      type: section
      position:
        order:          2
        sibling_before: "Header Bar"
        sibling_after:  "Store Details Panel"
        layout_role:    flex-child
      layout:
        direction: vertical
        alignment: start
        wrap:      false
        gap:       "var(--spacing-title-section-row-gap)"
        padding:
          top:    "var(--spacing-title-section-padding-vertical)"
          right:  "var(--spacing-title-section-padding-horizontal)"
          bottom: "var(--spacing-title-section-padding-vertical)"
          left:   "var(--spacing-title-section-padding-horizontal)"
      sizing:
        width:    fill-container
        height:   hug-content
        overflow: visible
      tokens:
        color_background: "var(--color-title-section-background)"
        spacing_padding:  "var(--spacing-title-section-padding-horizontal)"
        spacing_gap:      "var(--spacing-title-section-row-gap)"
        font_size:        "var(--font-title-section-heading-size)"
        font_weight:      "var(--font-title-section-heading-weight)"
      react:
        component_name: TitleSection
        element:        section
        css_module:     TitleSection.module.css
        notes:          "Contains tab bar and filter controls"

    - id:   "6070:210296"
      name: "Store Details Panel"
      type: card
      position:
        order:          3
        sibling_before: "Title Section"
        sibling_after:  null
        layout_role:    flex-child
      layout:
        direction: horizontal
        alignment: stretch
        wrap:      false
        gap:       0
        padding:
          top:    0
          right:  0
          bottom: 0
          left:   0
      sizing:
        width:    fill-container
        height:   hug-content
        overflow: visible
      tokens:
        shadow: "var(--shadow-store-details-panel)"
        radius: "var(--radius-store-details-panel)"
      react:
        component_name: null
        element:        div
        css_module:     Dashboard.module.css
        notes:          "Layout shell — wraps QuickViewCard and NetworkFlow side by side. No separate component."
      children:

        - id:   "6070:210298"
          name: "Quick View Card"
          type: card
          position:
            order:          1
            sibling_before: null
            sibling_after:  "Network Flow"
            layout_role:    flex-child
          layout:
            direction: vertical
            alignment: start
            gap:       "var(--spacing-quick-view-card-row-gap)"
            padding:
              top:    "var(--spacing-quick-view-card-padding)"
              right:  "var(--spacing-quick-view-card-padding)"
              bottom: "var(--spacing-quick-view-card-padding)"
              left:   "var(--spacing-quick-view-card-padding)"
          sizing:
            width:    fixed-309px
            height:   fill-container
            overflow: auto
          tokens:
            color_background: "var(--color-quick-view-card-background)"
            shadow:           "var(--shadow-quick-view-card)"
            radius: 8px  # ⚠ no token — raw value
            spacing_padding:  "var(--spacing-quick-view-card-padding)"
          react:
            component_name: QuickViewCard
            element:        section
            css_module:     QuickViewCard.module.css
            notes:          "Fixed width 309px. Height fills parent container. Vertically scrollable."

        - id:   "6070:210304"
          name: "Network Flow"
          type: section
          position:
            order:          2
            sibling_before: "Quick View Card"
            sibling_after:  null
            layout_role:    flex-child
          layout:
            direction: vertical
            alignment: start
            gap:       "var(--spacing-network-flow-section-gap)"
            padding:
              top:    "var(--spacing-network-flow-padding-vertical)"
              right:  "var(--spacing-network-flow-padding-horizontal)"
              bottom: "var(--spacing-network-flow-padding-vertical)"
              left:   "var(--spacing-network-flow-padding-horizontal)"
          sizing:
            width:    fill-container
            height:   fill-container
            overflow: hidden
          tokens:
            color_background: "var(--color-network-flow-background)"
            spacing_padding:  "var(--spacing-network-flow-padding-horizontal)"
            spacing_gap:      "var(--spacing-network-flow-section-gap)"
          react:
            component_name: NetworkFlow
            element:        section
            css_module:     NetworkFlow.module.css
            notes:          "Fills remaining horizontal space after QuickViewCard. Height matches QuickViewCard."
```

---

## Quality rules — the agent must enforce these

- **No coding without a confirmed structure file.** If the user asks the agent to start building before the structure file has been generated and reviewed, the agent must pause and generate it first.
- **No deviation from recorded hierarchy.** The agent must not create components, wrappers, or layout elements that are not present in the structure file.
- **No invented layout.** Every `display`, `flex-direction`, `align-items`, `gap`, and `padding` value must come from the `layout` block in the structure file — not from the agent's own interpretation of the design.
- **No uninstructed sizing.** Width and height values must match the `sizing` block. `fill-container` becomes `flex: 1` or `width: 100%`. `hug-content` means no explicit dimension. `fixed-[px]` becomes that exact pixel value.
- **Halt on contradiction.** If during implementation a discrepancy is found between the structure file and the actual Figma design, the agent must stop, describe the contradiction, and ask the user how to resolve it.
- **Structure file is versioned.** If the Figma file changes during the project, the structure file must be regenerated and diffed before implementation resumes.

---

## The three-file coding contract

Once both files are generated and confirmed, the agent operates under this contract for all coding:

```
tokens.css       — what visual values to apply (the palette)
structure        — where everything goes and how it relates (the blueprint)
Figma MCP        — visual reference for VQA only, not as a decision source during coding
```

If a decision cannot be answered by `tokens.css` or `structure`, the agent asks — it does not guess.

---

*This file is an agent instruction file. It does not produce code directly — it defines the standard a coding agent must follow to generate the structure file before any implementation begins.*
