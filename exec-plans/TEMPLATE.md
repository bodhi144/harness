# {{PLAN_NAME}} — ExecPlan

**Created:** {{DATE}}
**Branch:** feature/{{PLAN_NAME}}
**Worktree:** ../worktrees/{{PLAN_NAME}}
**Status:** active

---

## Objective
<!-- One sentence: what does this change accomplish for the user? -->

## Inventory

**Create:**
- `src/`

**Modify:**
- `src/` — reason

**Test files:**
- `src/.../component.test.tsx` (vitest)
- `tests/e2e/feature.spec.ts` (playwright)

## Design
<!-- 2-4 sentences on approach. What pattern? What are the layer boundaries? -->

## Milestones

### Milestone 1: [Name]
- [ ] Implement: [what the code does]
- [ ] Write vitest tests that assert the concrete outputs of the implementation
- [ ] Run tests — confirm they pass; if a test exposes a bug, fix the implementation
- [ ] `bash scripts/harness/post-task.sh`
- [ ] Commit: `git commit -m "feat(...): ..."`

### Milestone 2: [Name]
- [ ] Implement: [what the user-facing behavior does]
- [ ] Write playwright spec that asserts the user flow end to end
- [ ] Run spec — confirm it passes; if it exposes a bug, fix the implementation
- [ ] `bash scripts/harness/post-task.sh`
- [ ] Commit: `git commit -m "feat(...): ..."`

## Verification
- [ ] `bash scripts/harness/post-task.sh` exits 0
- [ ] `npm run test` — all vitest pass
- [ ] `npm run test:e2e` — all playwright pass
- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — 0 errors
- [ ] `bash scripts/harness/validate-arch.sh` — 0 violations

## Decision Log
<!-- Append entries here during implementation. -->
