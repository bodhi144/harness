#!/usr/bin/env bash
# new-plan.sh — Creates an ExecPlan and an isolated git worktree in one command.
# Usage: bash scripts/harness/new-plan.sh <feature-name>
# Example: bash scripts/harness/new-plan.sh user-auth

set -euo pipefail

PLAN_NAME="${1:?Usage: new-plan.sh <feature-name> (e.g. user-auth)}"
DATE=$(date +%Y-%m-%d)
BRANCH="feature/${PLAN_NAME}"
PLAN_FILE="exec-plans/active/${DATE}-${PLAN_NAME}.md"
REPO_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_PATH="${REPO_ROOT}/../worktrees/${PLAN_NAME}"

echo ""
echo "=== HARNESS: Creating new ExecPlan ==="
echo ""

# Ensure we're on main in the main worktree
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo "ERROR: new-plan.sh must be run from the main worktree on main/master branch."
  echo "Current branch: ${CURRENT_BRANCH}"
  exit 1
fi

# Check branch doesn't already exist
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  echo "ERROR: Branch '${BRANCH}' already exists."
  echo "Use: git worktree add ../worktrees/${PLAN_NAME} ${BRANCH}"
  exit 1
fi

# Check plan file doesn't already exist
if [ -f "$PLAN_FILE" ]; then
  echo "ERROR: Plan file already exists: ${PLAN_FILE}"
  exit 1
fi

# Create branch and worktree
echo "Creating branch: ${BRANCH}"
git checkout -b "${BRANCH}"
git checkout main 2>/dev/null || git checkout master 2>/dev/null

echo "Creating worktree: ${WORKTREE_PATH}"
mkdir -p "$(dirname "$WORKTREE_PATH")"
git worktree add "${WORKTREE_PATH}" "${BRANCH}"

# Copy and customize template
echo "Creating ExecPlan: ${PLAN_FILE}"
cp exec-plans/TEMPLATE.md "${PLAN_FILE}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/{{PLAN_NAME}}/${PLAN_NAME}/g" "${PLAN_FILE}"
  sed -i '' "s/{{DATE}}/${DATE}/g" "${PLAN_FILE}"
else
  sed -i "s/{{PLAN_NAME}}/${PLAN_NAME}/g" "${PLAN_FILE}"
  sed -i "s/{{DATE}}/${DATE}/g" "${PLAN_FILE}"
fi

# Commit the plan file on main so worktree can see it
git add "${PLAN_FILE}"
git commit -m "chore: create ExecPlan for ${PLAN_NAME}"

# Copy plan into worktree
cp "${PLAN_FILE}" "${WORKTREE_PATH}/${PLAN_FILE}"

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║  ExecPlan and worktree created successfully!      ║"
echo "╠═══════════════════════════════════════════════════╣"
printf "║  Plan:     %-39s ║\n" "${PLAN_FILE}"
printf "║  Worktree: %-39s ║\n" "${WORKTREE_PATH}"
printf "║  Branch:   %-39s ║\n" "${BRANCH}"
echo "╠═══════════════════════════════════════════════════╣"
echo "║  Next steps:                                      ║"
printf "║  1. cd %-43s ║\n" "${WORKTREE_PATH}"
echo "║  2. Edit your ExecPlan Objective + Inventory      ║"
echo "║  3. bash scripts/harness/pre-task.sh              ║"
echo "║  4. Begin Milestone 1                             ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
