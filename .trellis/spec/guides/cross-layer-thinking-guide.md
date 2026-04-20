# Cross-Layer Thinking Guide

Most bugs in this plugin happen when one change crosses several of these layers
and only some of them get updated:

`types -> DataManager -> view or modal -> Obsidian persistence or vault -> UI refresh`

## The Main Boundaries In This Repo

| Boundary | Real examples | Typical failure |
|----------|---------------|-----------------|
| `src/types.ts` -> `src/data.ts` | new bean field, new setting | field exists in types but is never loaded or saved correctly |
| `src/data.ts` -> `src/views/*` | archived filtering, deduction results | data rule changes but one renderer still shows old behavior |
| `src/data.ts` -> `src/modals/*` | add/edit forms | a field can be created but not edited, or edited but not created |
| `src/utils/beanImage.ts` -> modal forms -> vault | clipboard image save | file saves, but preview/path handling is wrong |
| settings -> main view | default view, preset list, archived toggle | settings are saved but not reflected in the view flow |

## Use This Checklist Before Coding

### If you add a field to `CoffeeBean`

- [ ] add the field to `src/types.ts`
- [ ] decide its default behavior
- [ ] update add modal initialization
- [ ] update edit modal initialization
- [ ] update display in kanban and table if needed
- [ ] check whether history, sorting, or filtering should change

### If you change a setting

- [ ] update `CoffeeTrackerSettings`
- [ ] update `DEFAULT_SETTINGS`
- [ ] merge or migration behavior still works in `DataManager.load()`
- [ ] update `src/settings.ts`
- [ ] update the consuming view or renderer

### If you change image behavior

- [ ] confirm whether the value is a remote URL or vault path
- [ ] confirm preview still resolves correctly
- [ ] confirm pasted images still save under `Coffee Bean Tracker/Images`
- [ ] confirm broken image fallback UI still behaves reasonably

## Validation Placement

Keep validation at the boundary where raw input first appears:

- text inputs are parsed and clamped in modals or settings handlers
- `DataManager` applies persistence and domain rules
- views render already-normalized data

Do not spread the same validation rule across three UI files if one boundary can
own it clearly.

## Round-Trip Questions

Before finishing a cross-layer change, ask:

1. Can the new data be created?
2. Can it be edited later?
3. Is it still present after save and reload?
4. Does every view mode display it correctly?
5. Does the build artifact still load in Obsidian?
