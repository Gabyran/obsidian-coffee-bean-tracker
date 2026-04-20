# Quality Guidelines

This repository is checked mainly through build success and manual Obsidian
smoke testing.

## Required Verification For Code Changes

Run:

```bash
npm run build
```

That rebuilds `main.js` from `src/`.

If the change affects UI, settings, data shape, or image handling, also do a
manual smoke test in Obsidian.

## Manual Smoke Test Checklist

Use the smallest relevant set from this list:

- open the plugin from the ribbon icon
- open the plugin from the command palette command
- switch between kanban and table views
- add a bean
- edit a bean
- delete a bean
- deduct with one preset
- open history for one bean
- toggle "显示已用完"
- edit deduction presets in settings
- if image handling changed, test both vault path and clipboard paste

## File Hygiene Rules

- `main.js` should reflect the latest build when source changes.
- `manifest.json` must stay valid for Obsidian to load the plugin.
- `styles.css` changes should preserve existing `coffee-tracker-*` naming.
- Do not commit `node_modules/` or local `data.json`.

## Review Focus For This Repo

When reviewing a change, check these failure-prone areas first:

- field added in one UI path but not another
- data saved but not reloaded with defaults
- kanban and table mode behavior drifting apart
- image path handling for vault paths vs remote URLs
- inline edit behavior in `TableRenderer` losing values on blur or escape

## Known Gaps

- There is no automated unit test suite yet.
- There is no lint script yet.
- Most regressions are integration issues inside Obsidian rather than pure TypeScript syntax errors.

Because of that, do not claim a feature is verified from static reading alone.

## When A Change Is Docs-Only

If only Trellis docs or README changed, a code build is not required. Instead,
verify that links, paths, commands, and source references still match the repo.

> Code quality standards for frontend development.
