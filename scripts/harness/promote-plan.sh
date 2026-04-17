#!/usr/bin/env bash
# promote-plan.sh — Merges the feature branch into main and moves the ExecPlan to completed/.
# Usage: bash scripts/harness/promote-plan.sh <plan-file>
# Example: bash scripts/harness/promote-plan.sh exec-plans/active/2026-04-17-user-auth.md

set -euo pipefail

PLAN_FILE="${1:?Usage: promote-plan.sh <path-to-active-plan>}"

if [ ! -f "$PLAN_FILE" ]; then
  echo "ERROR: Plan file not found: ${PLAN_FILE}"
  exit 1
fi

FILENAME=$(basename "$PLAN_FILE")
COMPLETED_FILE="exec-plans/completed/${FILENAME}"
BRANCH_NAME=$(grep "^\*\*Branch:\*\*" "${PLAN_FILE}" | head -1 | awk '{print $2}')
FEATURE_NAME=$(basename "${PLAN_FILE%.md}" | sed 's/[0-9]*-[0-9]*-[0-9]*-//')
WORKTREE_PATH="$(git rev-parse --show-toplevel)/../worktrees/${FEATURE_NAME}"

# Must be on main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo "ERROR: promote-plan.sh must be run from main. Currently on: ${CURRENT_BRANCH}"
  exit 1
fi

if [ -z "$BRANCH_NAME" ]; then
  echo "ERROR: Could not find **Branch:** in plan file."
  exit 1
fi

if ! git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
  echo "ERROR: Branch '${BRANCH_NAME}' not found locally."
  exit 1
fi

echo ""
echo "=== Running post-task gate (in worktree) ==="
if [ -d "$WORKTREE_PATH" ]; then
  (cd "$WORKTREE_PATH" && bash scripts/harness/post-task.sh)
else
  bash scripts/harness/post-task.sh
fi
echo ""

echo "=== Merging ${BRANCH_NAME} into main ==="
git merge --no-ff "${BRANCH_NAME}" -m "feat: merge ${FEATURE_NAME}"
echo ""

echo "=== Promoting ExecPlan to completed ==="
echo "  From: ${PLAN_FILE}"
echo "  To:   ${COMPLETED_FILE}"
echo ""

# Update status in the plan file
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/\*\*Status:\*\* active/**Status:** completed ($(date +%Y-%m-%d))/" "${PLAN_FILE}"
else
  sed -i "s/\*\*Status:\*\* active/**Status:** completed ($(date +%Y-%m-%d))/" "${PLAN_FILE}"
fi

mv "${PLAN_FILE}" "${COMPLETED_FILE}"
git add "${PLAN_FILE}" "${COMPLETED_FILE}" 2>/dev/null || git add "${COMPLETED_FILE}"
git commit -m "chore: promote ExecPlan ${FILENAME} to completed"

echo "=== Cleaning up worktree and branch ==="
if [ -d "$WORKTREE_PATH" ]; then
  git worktree remove "$WORKTREE_PATH" && echo "  Removed worktree: ${WORKTREE_PATH}"
fi
git branch -d "${BRANCH_NAME}" && echo "  Deleted branch: ${BRANCH_NAME}"

echo ""
echo "Done. Run 'git push' when ready."
echo ""
