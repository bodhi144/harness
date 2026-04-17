#!/usr/bin/env bash
# pre-task.sh — Feedforward validator. Run before starting any task milestone.
# Exits 0 if environment is ready, non-zero if not.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
  local label="$1"
  local result="$2"  # "ok" or "fail"
  local detail="${3:-}"
  if [ "$result" = "ok" ]; then
    echo -e "  ${GREEN}✓${NC} ${label}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} ${label}: ${detail}"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== HARNESS PRE-TASK (Feedforward) ==="
echo ""

# 1. Not on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  check "Not on protected branch" "ok"
else
  check "Not on protected branch" "fail" "Currently on ${CURRENT_BRANCH} — create a worktree first: bash scripts/harness/new-plan.sh <name>"
fi

# 2. Working directory is a worktree (not main worktree)
MAIN_WORKTREE=$(git worktree list | head -1 | awk '{print $1}')
CURRENT_DIR=$(pwd)
if [ "$CURRENT_DIR" != "$MAIN_WORKTREE" ]; then
  check "Running in a worktree" "ok"
else
  check "Running in a worktree" "fail" "You are in the main worktree. Run: bash scripts/harness/new-plan.sh <name>"
fi

# 3. An ExecPlan exists for this branch
PLAN_PATTERN="exec-plans/active/*${CURRENT_BRANCH##*/}*"
if ls $PLAN_PATTERN 2>/dev/null | head -1 | grep -q .; then
  PLAN_FILE=$(ls $PLAN_PATTERN 2>/dev/null | head -1)
  check "ExecPlan exists" "ok"
  echo -e "    Plan: ${PLAN_FILE}"
else
  # Also allow any active plan (agent may be continuing work)
  ACTIVE_PLANS=$(ls exec-plans/active/*.md 2>/dev/null | grep -v TEMPLATE | wc -l | tr -d ' ')
  if [ "$ACTIVE_PLANS" -gt "0" ]; then
    check "ExecPlan exists" "ok" "(found ${ACTIVE_PLANS} active plan(s))"
  else
    check "ExecPlan exists" "fail" "No active plan found. Create one: bash scripts/harness/new-plan.sh <name>"
  fi
fi

# 4. node_modules exists
if [ -d "node_modules" ]; then
  check "node_modules installed" "ok"
else
  check "node_modules installed" "fail" "Run: npm install"
fi

# 5. No uncommitted changes on tracked files that would pollute the task
UNCOMMITTED=$(git status --porcelain | grep -c "^[AM]" || true)
if [ "$UNCOMMITTED" -eq "0" ]; then
  check "No unexpected staged files" "ok"
else
  check "No unexpected staged files" "fail" "${UNCOMMITTED} staged files — commit or stash before starting"
fi

echo ""
echo "==================================="
echo -e "  ${GREEN}${PASS} passed${NC}  |  ${RED}${FAIL} failed${NC}"
echo "==================================="
echo ""

if [ "$FAIL" -gt "0" ]; then
  echo -e "${YELLOW}Fix the above issues before proceeding.${NC}"
  echo ""
  exit 1
fi

echo -e "${GREEN}Environment ready. Begin task.${NC}"
echo ""
exit 0
