# Directory Structure

This repository is small enough that placement discipline matters more than deep
folder nesting. Keep new code close to the existing architecture.

## Current Layout

```text
src/
  main.ts                 Plugin entry and view registration
  data.ts                 DataManager persistence and mutations
  types.ts                Shared interfaces, defaults, pure helpers
  settings.ts             Plugin settings tab
  views/
    CoffeeView.ts         Main workspace view
    KanbanRenderer.ts     Card-style bean rendering
    TableRenderer.ts      Table-style bean rendering
  modals/
    AddBeanModal.ts       Add form
    EditBeanModal.ts      Edit and delete form
    HistoryModal.ts       Consumption history modal
  utils/
    beanImage.ts          Image save/preview helper
styles.css                Plugin styles
manifest.json             Obsidian plugin metadata
main.js                   Generated bundle
```

## Placement Rules

### `src/main.ts`

Put only plugin bootstrap responsibilities here:

- instantiate managers
- register views
- register ribbon icons and commands
- attach the settings tab
- open the plugin view

Do not place field validation or bean mutation logic here.

### `src/data.ts`

Use `DataManager` for:

- loading and saving plugin data
- creating, updating, deleting beans
- deduction logic
- history lookup
- filtering archived beans

If a change affects persisted data, start here.

### `src/types.ts`

Keep shared model definitions, defaults, and tiny pure helpers here.

Current examples:

- `CoffeeBean`
- `CoffeeTrackerData`
- `DEFAULT_SETTINGS`
- `DEFAULT_DATA`
- `generateId()`
- `getPricePerGram()`

If several files need the same type or pure calculation, add it here before
creating a new ad hoc helper elsewhere.

### `src/views/*`

Use `views/` for the main workspace surface.

- `CoffeeView.ts` owns toolbar state and decides which renderer to use.
- `KanbanRenderer.ts` and `TableRenderer.ts` only render the bean list and UI actions for one presentation mode.

Do not move persistence logic into renderers beyond calling `DataManager`.

### `src/modals/*`

Put form-heavy interactions in modals.

- create/edit flows belong here
- field parsing from text inputs belongs here
- submit handlers may call `DataManager`, then close and refresh

If a feature needs a focused dialog, prefer a new modal over inflating `CoffeeView`.

### `src/utils/*`

Only add a utility when it is genuinely shared or complex enough to deserve a
separate file.

Current shared example:

- `src/utils/beanImage.ts` handles path normalization, vault folder creation, clipboard image extraction, preview rendering, and file saving.

## File Hygiene

- `main.js` is build output. Regenerate it; do not maintain duplicate manual edits there.
- `data.json` is runtime data and should stay local.
- Keep new top-level files rare. Most feature work should fit in `src/`, `styles.css`, `manifest.json`, or Trellis docs.

## Common Mistakes To Avoid

- Adding new persisted fields in a modal without updating `src/types.ts`
- Adding display-only logic in one renderer and forgetting the other renderer
- Creating one-off helpers inside a modal that should live in `src/utils/` or `src/types.ts`

> How frontend code is organized in this project.
