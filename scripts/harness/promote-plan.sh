#!/usr/bin/env bash
# promote-plan.sh — Moves a completed ExecPlan from active/ to completed/.
# Run this after merging the feature branch into main.
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

echo "ExecPlan promoted. Branch and worktree cleanup:"
BRANCH_NAME=$(grep "Branch:" "${COMPLETED_FILE}" | head -1 | awk '{print $2}')
echo "  git worktree remove ../worktrees/\$(basename ${PLAN_FILE%.md} | sed 's/[0-9]*-[0-9]*-[0-9]*-//')"
echo "  git branch -d ${BRANCH_NAME}"
echo ""
