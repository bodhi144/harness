# todo-subtasks — ExecPlan

**Created:** 2026-04-17
**Branch:** feature/todo-subtasks
**Worktree:** ../worktrees/todo-subtasks
**Status:** completed (2026-04-17)

---

## Objective
Add one level of subtask nesting to todos: each todo can have child subtasks with independent toggle/edit/delete, shown inline below the parent.

## Inventory

**Modify:**
- `src/lib/todo-store.ts` — add `subtasks` field to `Todo`, add addSubtask/toggleSubtask/deleteSubtask/editSubtask functions
- `src/components/TodoItem.tsx` — render subtask list, subtask add input, subtask controls
- `src/components/TodoList.tsx` — pass subtask handlers through
- `src/pages/TodoPage.tsx` — add subtask handler functions, pass to list

**Test files:**
- `src/test/lib/todo-store.test.ts` (vitest) — subtask store functions
- `tests/e2e/todo-subtasks.spec.ts` (playwright) — subtask user flow

## Design
`Todo` gains an optional `subtasks: SubTodo[]` field where `SubTodo = { id, text, done, createdAt }`. All subtask mutations go through new pure functions in todo-store that find the parent by `parentId` and return a new `todos` array. The UI renders subtasks indented inside `TodoItem` with a small "+" button to reveal an inline add input. Layer boundaries remain intact: store functions are pure lib, UI is component-level only.

## Milestones

### Milestone 1: Data model + store functions
- [ ] Add `SubTodo` type and `subtasks` field to `Todo` in todo-store.ts
- [ ] Implement: `addSubtask`, `toggleSubtask`, `deleteSubtask`, `editSubtask`
- [ ] Write vitest tests asserting concrete outputs for all four functions
- [ ] Run tests — confirm they pass
- [ ] Commit: `feat(lib): add subtask support to todo-store`

### Milestone 2: UI — subtask rendering and interaction
- [ ] Update `TodoItem` to render subtasks list, subtask add input, per-subtask toggle/edit/delete
- [ ] Update `TodoList` to pass subtask handlers
- [ ] Update `TodoPage` to wire up subtask handlers
- [ ] Write playwright spec: add subtask, toggle, edit, delete
- [ ] Run spec — confirm passes
- [ ] Commit: `feat(ui): render and manage subtasks in TodoItem`

## Verification
- [ ] `bash scripts/harness/post-task.sh` exits 0
- [ ] `npm run test` — all vitest pass
- [ ] `npm run test:e2e` — all playwright pass
- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — 0 errors
- [ ] `bash scripts/harness/validate-arch.sh` — 0 violations

## Decision Log
<!-- Append entries here during implementation. -->
