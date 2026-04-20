# Coffee Bean Tracker Workflow

This repository is a single Obsidian plugin. The Trellis workflow here is meant
to keep future changes aligned with the actual plugin structure, not a generic
web-app template.

## Quick Start

### 1. Initialize or confirm developer identity

```bash
python3 ./.trellis/scripts/get_developer.py
python3 ./.trellis/scripts/init_developer.py <your-name>
```

### 2. Read the current project context

```bash
python3 ./.trellis/scripts/get_context.py
python3 ./.trellis/scripts/task.py list
git status --short
```

### 3. Read the relevant guidelines before editing

For almost every task in this repository, read these files first:

```bash
cat .trellis/spec/frontend/index.md
cat .trellis/spec/guides/index.md
```

Then read the specific guideline files linked from the spec index.

## Project Shape

The plugin is organized around a small set of files:

- `src/main.ts`: Obsidian plugin entry, command registration, view registration
- `src/data.ts`: `DataManager`, the single persistence and mutation layer
- `src/types.ts`: shared data model, defaults, small pure helpers
- `src/views/*`: main panel and renderers
- `src/modals/*`: add, edit, and history dialogs
- `src/settings.ts`: plugin settings tab
- `src/utils/beanImage.ts`: image preview and clipboard-to-vault helper
- `styles.css`: UI styles loaded by Obsidian
- `manifest.json`: plugin metadata
- `main.js`: generated bundle output

## Start-of-Session Process

1. Read the active task list with `python3 ./.trellis/scripts/task.py list`.
2. If the task is new, create one with:

   ```bash
   python3 ./.trellis/scripts/task.py create "<title>" --slug <task-slug>
   ```

3. Start the task:

   ```bash
   python3 ./.trellis/scripts/task.py start <task-slug>
   ```

4. Read the relevant docs under `.trellis/spec/frontend/`.

## Development Rules For This Repo

### Edit the source of truth

- Prefer changes in `src/` and `styles.css`.
- Do not hand-edit `main.js` unless the task is specifically about build output debugging.
- Do not treat `data.json` as committed project data. It is local plugin state.

### Preserve the existing architecture

- Business logic belongs in `DataManager` or shared utilities, not buried inside renderers.
- UI classes should render from existing state and delegate persistence to `DataManager`.
- New bean fields or settings must be wired through `types`, `data`, UI forms, and displays together.

### Use Obsidian-native patterns

- Build UI with `ItemView`, `Modal`, `PluginSettingTab`, `Setting`, `createDiv`, and `createEl`.
- Reuse current renderer and modal patterns before inventing a new abstraction.
- If a feature needs vault file access, use Obsidian APIs rather than direct Node filesystem calls inside UI code.

## Verification

When code changes are involved, use this minimum verification set:

```bash
npm run build
```

Then do manual checks inside Obsidian when the change affects behavior:

- open the plugin view from ribbon or command
- add a bean
- edit a bean
- deduct inventory
- open history
- open plugin settings
- if image logic changed, test path input and clipboard paste

## Session Recording

When work is ready to record:

```bash
python3 ./.trellis/scripts/add_session.py --title "<session title>" --commit "<commit hash>"
```

If the work is done, finish or archive the task:

```bash
python3 ./.trellis/scripts/task.py finish
python3 ./.trellis/scripts/task.py archive <task-slug>
```

## Notes

- This repository currently has no dedicated automated test suite.
- `npm run build` is the required baseline check for implementation work.
- Manual smoke testing matters because most regressions here show up in the Obsidian UI, not in isolated unit logic.

After code is committed, use:

```bash
python3 ./.trellis/scripts/add_session.py \
  --title "Session Title" \
  --commit "abc1234" \
  --summary "Brief summary"
```

This automatically:
1. Detects current journal file
2. Creates new file if 2000-line limit exceeded
3. Appends session content
4. Updates index.md (sessions count, history table)

### Pre-end Checklist

Use `/trellis:finish-work` command to run through:
1. [OK] All code committed, commit message follows convention
2. [OK] Session recorded via `add_session.py`
3. [OK] No lint/test errors
4. [OK] Working directory clean (or WIP noted)
5. [OK] Spec docs updated if needed

---

## File Descriptions

### 1. workspace/ - Developer Workspaces

**Purpose**: Record each AI Agent session's work content

**Structure** (Multi-developer support):
```
workspace/
|-- index.md              # Main index (Active Developers table)
+-- {developer}/          # Per-developer directory
    |-- index.md          # Personal index (with @@@auto markers)
    +-- journal-N.md      # Journal files (sequential: 1, 2, 3...)
```

**When to update**:
- [OK] End of each session
- [OK] Complete important task
- [OK] Fix important bug

### 2. spec/ - Development Guidelines

**Purpose**: Documented standards for consistent development

**Structure** (Multi-doc format):
```
spec/
|-- frontend/           # Frontend docs (if applicable)
|   |-- index.md        # Start here
|   +-- *.md            # Topic-specific docs
|-- backend/            # Backend docs (if applicable)
|   |-- index.md        # Start here
|   +-- *.md            # Topic-specific docs
+-- guides/             # Thinking guides
    |-- index.md        # Start here
    +-- *.md            # Guide-specific docs
```

**When to update**:
- [OK] New pattern discovered
- [OK] Bug fixed that reveals missing guidance
- [OK] New convention established

### 3. Tasks - Task Tracking

Each task is a directory containing `task.json`:

```
tasks/
|-- 01-21-my-task/
|   +-- task.json
+-- archive/
    +-- 2026-01/
        +-- 01-15-old-task/
            +-- task.json
```

**Commands**:
```bash
python3 ./.trellis/scripts/task.py create "<title>" [--slug <name>]   # Create task directory
python3 ./.trellis/scripts/task.py start <name>    # Set as current task (writes .current-task, triggers after_start hooks)
python3 ./.trellis/scripts/task.py finish          # Clear current task (triggers after_finish hooks)
python3 ./.trellis/scripts/task.py archive <name>  # Archive to archive/{year-month}/
python3 ./.trellis/scripts/task.py list            # List active tasks
python3 ./.trellis/scripts/task.py list-archive    # List archived tasks
```

**Current task mechanism**: `task.py start <name>` writes the selected task path to `.trellis/.current-task`. The SessionStart hook reads this file to inject `## CURRENT TASK` into every new session's context, so the AI immediately knows what you're working on without being told. Run `task.py finish` when you're done — subsequent sessions will show `(none)` until you start another task.

---

## Best Practices

### [OK] DO - Should Do

1. **Before session start**:
   - Run `python3 ./.trellis/scripts/get_context.py` for full context
   - [!] **MUST read** relevant `.trellis/spec/` docs

2. **During development**:
   - [!] **Follow** `.trellis/spec/` guidelines
   - For cross-layer features, use `/trellis:check-cross-layer`
   - Develop only one task at a time
   - Run lint and tests frequently

3. **After development complete**:
   - Use `/trellis:finish-work` for completion checklist
   - After fix bug, use `/trellis:break-loop` for deep analysis
   - Human commits after testing passes
   - Use `add_session.py` to record progress

### [X] DON'T - Should Not Do

1. [!] **Don't** skip reading `.trellis/spec/` guidelines
2. [!] **Don't** let journal single file exceed 2000 lines
3. **Don't** develop multiple unrelated tasks simultaneously
4. **Don't** commit code with lint/test errors
5. **Don't** forget to update spec docs after learning something
6. [!] **Don't** execute `git commit` - AI should not commit code

---

## Quick Reference

### Must-read Before Development

| Task Type | Must-read Document |
|-----------|-------------------|
| Frontend work | `frontend/index.md` → relevant docs |
| Backend work | `backend/index.md` → relevant docs |
| Cross-Layer Feature | `guides/cross-layer-thinking-guide.md` |

### Commit Convention

```bash
git commit -m "type(scope): description"
```

**Type**: feat, fix, docs, refactor, test, chore
**Scope**: Module name (e.g., auth, api, ui)

### Common Commands

```bash
# Session management
python3 ./.trellis/scripts/get_context.py    # Get full context
python3 ./.trellis/scripts/add_session.py    # Record session

# Task management
python3 ./.trellis/scripts/task.py list      # List tasks
python3 ./.trellis/scripts/task.py create "<title>" # Create task

# Slash commands
/trellis:finish-work          # Pre-commit checklist
/trellis:break-loop           # Post-debug analysis
/trellis:check-cross-layer    # Cross-layer verification
```

---

## Summary

Following this workflow ensures:
- [OK] Continuity across multiple sessions
- [OK] Consistent code quality
- [OK] Trackable progress
- [OK] Knowledge accumulation in spec docs
- [OK] Transparent team collaboration

**Core Philosophy**: Read before write, follow standards, record promptly, capture learnings
