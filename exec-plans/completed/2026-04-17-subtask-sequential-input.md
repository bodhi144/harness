# subtask-sequential-input — ExecPlan

**Created:** 2026-04-17
**Branch:** feature/subtask-sequential-input
**Worktree:** ../worktrees/subtask-sequential-input
**Status:** completed (2026-04-17)

---

## Objective
서브태스크 입력창에서 Enter는 하나를 추가하고 닫고, Shift+Enter는 추가 후 바로 새 입력창을 열어 연속 입력을 지원한다.

## Inventory

**Modify:**
- `src/components/TodoItem.tsx` — subtask keydown 핸들러에 Shift+Enter 분기 추가

**Test files:**
- `src/test/components/TodoItem.test.tsx` (vitest)
- `tests/e2e/subtask-sequential-input.spec.ts` (playwright)

## Design
`commitAddSubtask`를 `keepOpen` 파라미터를 받도록 수정. Enter → keepOpen=false (닫기), Shift+Enter → keepOpen=true (입력창 유지). `keepOpen=true`이면 `setAddingSubtask`를 false로 설정하지 않고 `subtaskText`만 초기화한다. useEffect가 `addingSubtask`가 true인 동안 계속 포커스를 유지한다.

## Milestones

### Milestone 1: 로직 구현 + vitest
- [ ] Implement: `commitAddSubtask(keepOpen)` 분기, keydown 핸들러 수정
- [ ] Write vitest tests that assert the concrete outputs of the implementation
- [ ] Run tests — confirm they pass; if a test exposes a bug, fix the implementation
- [ ] Commit: `feat(todo): subtask sequential input with Shift+Enter`

### Milestone 2: playwright e2e
- [ ] Implement: playwright spec asserting enter closes, shift+enter stays open
- [ ] Run spec — confirm it passes; if it exposes a bug, fix the implementation
- [ ] Commit: `test(e2e): subtask sequential input`

## Verification
- [ ] `bash scripts/harness/post-task.sh` exits 0
- [ ] `npm run test` — all vitest pass
- [ ] `npm run test:e2e` — all playwright pass
- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — 0 errors
- [ ] `bash scripts/harness/validate-arch.sh` — 0 violations

## Decision Log
<!-- Append entries here during implementation. -->
