# Coffee Bean Tracker Spec Index

In this repository, `frontend` means the Obsidian plugin runtime and UI layer.
This is not a React project and it does not use browser-routing or server-state
libraries.

## Read This First

Before changing plugin code, read:

1. [Directory Structure](./directory-structure.md)
2. [Component Guidelines](./component-guidelines.md)
3. [State Management](./state-management.md)
4. [Type Safety](./type-safety.md)
5. [Quality Guidelines](./quality-guidelines.md)

Read [Hook Guidelines](./hook-guidelines.md) when the change touches plugin
lifecycle methods, DOM event handlers, modal opening, or refresh flows.

## What Each Guide Covers

| Guide | Use it for |
|-------|------------|
| [Directory Structure](./directory-structure.md) | Where logic should live and which files are source of truth |
| [Component Guidelines](./component-guidelines.md) | `ItemView`, renderer, modal, and settings-tab patterns |
| [Hook Guidelines](./hook-guidelines.md) | Obsidian lifecycle methods and event wiring |
| [State Management](./state-management.md) | `DataManager`, persistence, refresh rules, archived behavior |
| [Quality Guidelines](./quality-guidelines.md) | Build checks, manual smoke tests, file hygiene |
| [Type Safety](./type-safety.md) | Shared types, coercion boundaries, safe updates |

## Pre-Development Checklist

- [ ] Confirm whether the task changes plugin state, UI, settings, or image handling.
- [ ] If a new bean field or setting is involved, inspect `src/types.ts` and `src/data.ts` first.
- [ ] If a view or modal is involved, inspect the nearest existing class before writing new code.
- [ ] If the task crosses storage and UI boundaries, read `.trellis/spec/guides/cross-layer-thinking-guide.md`.
- [ ] If the task adds a helper or repeats logic, read `.trellis/spec/guides/code-reuse-thinking-guide.md`.

## Source-Of-Truth Reminder

- Edit `src/` and `styles.css`.
- Rebuild `main.js` from source with `npm run build`.
- Do not treat `data.json` as versioned project data.
