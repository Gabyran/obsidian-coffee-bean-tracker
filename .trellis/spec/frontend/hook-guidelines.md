# Hook Guidelines

This repository does not use React hooks. In this project, "hooks" mainly means
Obsidian lifecycle methods and DOM event wiring.

## Lifecycle Methods Already In Use

### Plugin lifecycle

Reference:

- `src/main.ts`

Use:

- `onload()` to initialize `DataManager`, register the custom view, commands, ribbon icon, and settings tab
- `onunload()` only when cleanup is actually needed

Keep `onload()` readable. If it grows, move logic into small private methods on
the plugin class rather than adding free-floating setup code.

### View lifecycle

Reference:

- `src/views/CoffeeView.ts`

Use:

- `onOpen()` to build the workspace UI
- `onClose()` for cleanup only if the view starts holding disposable resources

`refresh()` is the main redraw entry point for this repository. Prefer calling
it after a successful state change instead of partially mutating DOM in several
places.

### Modal lifecycle

References:

- `src/modals/AddBeanModal.ts`
- `src/modals/EditBeanModal.ts`
- `src/modals/HistoryModal.ts`

Use:

- `onOpen()` to build the modal content from current data
- `onClose()` to clear `contentEl`

## Event Wiring Rules

- Attach event listeners close to the element creation site.
- Keep the handler small: parse input, call one mutation or open one modal, then refresh.
- If a handler becomes hard to read, extract a named method inside the class before creating a helper file.

Current examples:

- toolbar button click in `CoffeeView.buildToolbar()`
- deduction button clicks in both renderers
- `blur` and `keydown` handlers in `TableRenderer.editableCell()`
- clipboard paste handling in `renderBeanImageField()`

## Refresh Rules

- After a persisted mutation, call `this.onRefresh()` in renderers and modals.
- When toggling local display state such as view mode or archived visibility, update local state, persist if needed, then call `refresh()`.
- Do not try to keep many micro-DOM patches in sync when the class already has a clear full-refresh path.

## Dynamic Imports In Current Code

Current code opens modals with `require('../modals/...')` inside click handlers.
That is an existing project pattern. Keep it consistent unless there is a clear
reason to convert the whole code path.

## Anti-Patterns

- Long anonymous handlers with mutation, validation, and DOM updates mixed together
- Rebuilding only part of the UI after a mutation when the class already expects a full refresh
- Adding asynchronous side effects to lifecycle methods without thinking through ordering and error feedback

> How hooks are used in this project.
