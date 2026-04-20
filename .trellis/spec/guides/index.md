# Thinking Guides

These guides are the short "stop and check" layer for this plugin repository.
Use them when a change is small enough to skip a full design document, but big
enough that structure mistakes are likely.

## Available Guides

| Guide | Read it when |
|-------|--------------|
| [Cross-Layer Thinking Guide](./cross-layer-thinking-guide.md) | a change touches types, persistence, UI, settings, or vault files together |
| [Code Reuse Thinking Guide](./code-reuse-thinking-guide.md) | you are about to add a helper, duplicate UI behavior, or wire the same field in multiple places |

## Common Triggers In This Repo

Read the cross-layer guide when:

- adding a new bean field
- changing deduction rules
- changing archived behavior
- changing image storage or path resolution
- changing how settings affect the main view

Read the code-reuse guide when:

- both kanban and table mode need the same behavior
- add and edit modals start drifting apart
- you want a new helper under `src/utils/`
- you are copying parsing or formatting logic between files

## First Search Rule

Before changing a field name, label, or rule, search the repository first:

```bash
rg "field-or-value"
```

This repository is small, so a fast repo-wide search usually reveals every
place that needs to move together.
