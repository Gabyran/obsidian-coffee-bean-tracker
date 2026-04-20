# State Management

`DataManager` is the single source of truth for persisted plugin data.

Reference:

- `src/data.ts`

## Current State Model

The persisted root object is:

```ts
interface CoffeeTrackerData {
  settings: CoffeeTrackerSettings;
  beans: CoffeeBean[];
  history: ConsumptionRecord[];
}
```

Shared definitions and defaults live in `src/types.ts`.

## Source Of Truth Rules

- Read persisted data from `plugin.dataManager.data`.
- Mutate persisted data through `DataManager` methods whenever possible.
- After a mutation, persist with `save()` and refresh the relevant UI.

Current mutation methods:

- `addBean()`
- `updateBean()`
- `deleteBean()`
- `deduct()`

Current read helpers:

- `getHistory()`
- `getBeans()`

If a new feature adds repeated filtering or mutation logic, extend `DataManager`
instead of copying logic into views.

## Local UI State

Short-lived display state can stay inside UI classes.

Current examples:

- `CoffeeView.currentView`
- `CoffeeView.showArchived`
- `TableRenderer.sortField`
- `TableRenderer.sortAsc`

Rule:

- keep display-only state local
- keep persisted business state in `DataManager`

## Persistence Rules

- Use Obsidian `loadData()` and `saveData()` through the plugin instance.
- `load()` must merge saved settings with `DEFAULT_SETTINGS` so new settings keys get defaults.
- `data.json` is a byproduct of local plugin runtime and should not be treated as project seed data.

## Cross-File Update Rule

When adding a new bean field or setting:

1. Update the type in `src/types.ts`.
2. Update defaults in `src/types.ts` if needed.
3. Update load/save behavior in `src/data.ts` if the field needs migration or derived handling.
4. Update forms in `src/modals/*` or `src/settings.ts`.
5. Update both display modes in `src/views/*`.
6. Update history or helper logic if the field changes deduction or summaries.

## Archived Semantics

The current meaning of `archived` is "used up" or intentionally hidden from the
default list.

Current behavior:

- `deduct()` marks a bean as archived when remaining amount reaches `0`
- `getBeans(showArchived)` filters archived items by default
- UI exposes a "显示已用完" toggle

Keep that behavior consistent unless the task explicitly changes the product rule.

## Common Mistakes

- Updating `remaining` or settings directly in UI without persisting
- Adding a field to the add modal but not the edit modal
- Updating kanban display and forgetting table display

> How state is managed in this project.
