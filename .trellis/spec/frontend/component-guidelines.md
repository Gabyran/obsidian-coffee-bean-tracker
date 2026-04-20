# Component Guidelines

This plugin uses class-based Obsidian UI primitives, not React components. The
main reusable units are `ItemView`, renderer classes, `Modal`, and
`PluginSettingTab`.

## Main UI Units In This Repo

### `ItemView`

Use `ItemView` for the main plugin surface.

Reference:

- `src/views/CoffeeView.ts`

Responsibilities:

- create the container
- build the toolbar
- keep short-lived view state such as `currentView` and `showArchived`
- call `refresh()` after mutations

Do not move bean mutation rules into `CoffeeView`; delegate to `DataManager`.

### Renderer Classes

Use renderer classes for alternative presentations of the same data.

References:

- `src/views/KanbanRenderer.ts`
- `src/views/TableRenderer.ts`

Responsibilities:

- receive `container`, `beans`, `plugin`, and `onRefresh`
- render one view mode cleanly
- call `DataManager` methods through `plugin` when the user triggers an action

Keep renderers focused on rendering plus local interaction wiring. If both
renderers need the same logic, extract it instead of re-implementing twice.

### Modals

Use modals for focused editing flows.

References:

- `src/modals/AddBeanModal.ts`
- `src/modals/EditBeanModal.ts`
- `src/modals/HistoryModal.ts`

Patterns already in use:

- initialize the form state in `onOpen()`
- build fields with `Setting`
- on submit, parse and normalize input values
- call the relevant `DataManager` method
- close the modal and trigger the parent refresh callback

### Settings Tab

Use `PluginSettingTab` for plugin-level preferences rather than per-bean data.

Reference:

- `src/settings.ts`

Settings should update plugin state through `this.plugin.dataManager.data.settings`
and then call `save()`.

## Current Interaction Pattern

The repository already uses this interaction chain:

`toolbar or action button -> modal or direct action -> DataManager mutation -> save -> refresh`

Examples:

- `CoffeeView` opens `AddBeanModal`
- `KanbanRenderer` and `TableRenderer` call `deduct()`
- `EditBeanModal` calls `updateBean()` or `deleteBean()`

Follow this chain unless the feature clearly needs a new one.

## UI Consistency Rules

- Use the existing CSS class prefix `coffee-tracker-*`.
- If both kanban and table modes expose the same concept, keep labels and behavior aligned.
- User-facing text in the plugin is currently Chinese; keep new UI copy aligned with that unless the task explicitly changes language.
- Prefer `Notice` for short success or failure feedback triggered by actions.

## Anti-Patterns

- Putting large inline render blocks into `src/main.ts`
- Creating a new renderer when a modal or helper would be enough
- Saving directly through `plugin.saveData()` from many UI files instead of going through `DataManager`
- Updating only the kanban path or only the table path for a shared feature

> How components are built in this project.
