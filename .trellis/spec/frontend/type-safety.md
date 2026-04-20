# Type Safety

Types are centralized in `src/types.ts`. Keep them there unless a type is truly
local to one file.

## Current Type Boundaries

Shared interfaces:

- `CoffeeBean`
- `ConsumptionRecord`
- `DeductionPreset`
- `CoffeeTrackerSettings`
- `CoffeeTrackerData`

Shared defaults and helpers:

- `DEFAULT_SETTINGS`
- `DEFAULT_DATA`
- `generateId()`
- `getPricePerGram()`

If a new field is part of persisted plugin data, add it to these shared types
first.

## Input Coercion Rules

User input enters the system as strings from Obsidian text components. Parse and
normalize it at the UI boundary before saving.

Current examples:

- `parseFloat(form.price) || 0`
- `parseFloat(form.totalWeight) || 0`
- `Math.min(10, Math.max(1, parseInt(form.rating) || 7))`

Keep that pattern:

- parse in modals or settings handlers
- store typed values in `DataManager`
- render already-normalized values in views

## Defaults And Backward Compatibility

- New settings must be merged through `DEFAULT_SETTINGS` during `load()`.
- New array or object fields should have explicit defaults.
- Avoid optional persisted fields unless there is a real migration reason.

## Dynamic Key Updates

`TableRenderer.editableCell()` currently updates beans with a dynamic key and a
cast:

```ts
await this.plugin.dataManager.updateBean(bean.id, { [field]: newValue } as any);
```

Treat this as a narrow exception caused by the editable-table helper. Do not
spread `as any` usage elsewhere. If you touch this path, prefer narrowing the
field union or helper signature instead of adding more unchecked casts.

## Date And ID Conventions

- IDs are generated with `generateId()` and stored as strings.
- `timestamp` in history records uses `new Date().toISOString()`.
- `purchaseDate` and `roastDate` are stored as plain date strings from input fields.

Be careful not to mix ISO date-times with plain date-only values unless the task
explicitly changes the data contract.

## Common Mistakes

- Adding a new field to `CoffeeBean` but not to add/edit form initialization
- Saving numbers as strings because parsing was skipped
- Introducing a local inline type that duplicates a shared model from `src/types.ts`

> Type safety patterns in this project.
