<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

Use the `/trellis:start` command when starting a new session to:
- Initialize your developer identity
- Understand current project context
- Read relevant guidelines

Use `@/.trellis/` to learn:
- Development workflow (`workflow.md`)
- Project structure guidelines (`spec/`)
- Developer workspace (`workspace/`)

If you're using Codex, project-scoped helpers may also live in:
- `.agents/skills/` for reusable Trellis skills
- `.codex/agents/` for optional custom subagents

Keep this managed block so 'trellis update' can refresh the instructions.

<!-- TRELLIS:END -->

## Project Notes

- This repository is an Obsidian plugin, not a React or web app. The main runtime entry is `src/main.ts`.
- Make source changes in `src/` first. `main.js` is the generated bundle and should only change as a build artifact after `npm run build`.
- Persistent plugin data is stored through Obsidian `loadData()` / `saveData()` and may appear in local `data.json`. Treat `data.json` as local state, not as a fixture to edit or commit.
- The main architecture is:
  - `src/types.ts`: shared data model and defaults
  - `src/data.ts`: persistence and mutation entry point
  - `src/views/*`: main view and renderers
  - `src/modals/*`: create, edit, and history dialogs
  - `src/settings.ts`: plugin settings tab
  - `src/utils/beanImage.ts`: image-path and clipboard image helper
- UI is built with Obsidian DOM helpers such as `createDiv`, `createEl`, `Setting`, `Modal`, and `ItemView`. Do not introduce a new UI framework unless the task explicitly requires it.
- When adding a field to coffee beans or settings, update all affected places together:
  - Type definitions in `src/types.ts`
  - Persistence defaults in `src/types.ts`
  - Read/write logic in `src/data.ts`
  - Input forms in `src/modals/*` or `src/settings.ts`
  - View rendering in `src/views/*`
- Before finishing work, at minimum run `npm run build` if source code changed. For UI or data-flow changes, also do a manual smoke test inside Obsidian.
