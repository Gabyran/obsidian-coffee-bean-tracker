# Code Reuse Thinking Guide

This plugin is small, so duplication becomes visible quickly. Reuse decisions
usually matter more here than heavy abstraction.

## Search First

```bash
rg "keyword-or-field"
```

Look especially at:

- `src/types.ts` for shared model helpers
- `src/data.ts` for existing mutation logic
- `src/views/*` for repeated UI behavior
- `src/modals/*` for repeated form parsing
- `src/utils/beanImage.ts` for image-specific helper needs

## Existing Reuse Points

Use or extend these before adding a new helper:

- `generateId()` in `src/types.ts`
- `getPricePerGram()` in `src/types.ts`
- `DataManager` methods in `src/data.ts`
- `renderBeanImageField()` in `src/utils/beanImage.ts`
- `CoffeeView.refresh()` and renderer `onRefresh()` callbacks

## Duplication Hotspots In This Repo

### Add vs edit forms

`AddBeanModal` and `EditBeanModal` are intentionally similar. When adding or
changing a bean field, update both files together. If the same parsing logic
keeps growing, extract only the repeated part.

### Kanban vs table view

Both renderers expose bean actions. If behavior changes for deduction, history,
or a shared label, search both renderers before finishing.

### Settings and main view

A settings change often needs a matching consumer update in `CoffeeView` or a
renderer. Do not assume saving the setting is enough.

## When To Extract A Helper

Extract when:

- the same logic appears in 3 or more places
- one rule must stay behaviorally identical across files
- the logic is hard enough that a future bug fix should happen once

Do not extract when:

- the duplication is tiny and still local to one file
- the helper name would be less clear than the existing inline code
- the abstraction would leak Obsidian-specific details into unrelated files

## Good Reuse Direction

- pure calculations -> `src/types.ts`
- persistence and mutation rules -> `src/data.ts`
- image-specific multi-step behavior -> `src/utils/beanImage.ts`
- mode-specific rendering -> the relevant renderer class

## Final Check

Before you finish a change, ask:

- Did I update both add and edit flows if the data model changed?
- Did I update both kanban and table flows if the behavior is shared?
- Did I add a helper where a current helper already exists?
