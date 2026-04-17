#!/usr/bin/env bash
# post-task.sh — Feedback validator. Run after each milestone that changes code.
# Exits 0 only if all gates pass. On failure: mutate your plan, not your effort.
#
# Usage:
#   bash scripts/harness/post-task.sh           # full run
#   bash scripts/harness/post-task.sh --quick   # skip e2e (unit + lint + types + arch)
#   bash scripts/harness/post-task.sh --hook-mode  # compact output for Claude Code hook

set -uo pipefail

QUICK=false
HOOK_MODE=false
for arg in "$@"; do
  case $arg in
    --quick) QUICK=true ;;
    --hook-mode) HOOK_MODE=true ;;
  esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
ERRORS=()

gate() {
  local label="$1"
  local cmd="$2"

  if $HOOK_MODE; then
    echo -n "  Checking ${label}... "
  else
    echo -e "\n${BLUE}── ${label}${NC}"
  fi

  if eval "$cmd" > /tmp/harness-gate-output 2>&1; then
    if $HOOK_MODE; then
      echo -e "${GREEN}✓${NC}"
    else
      echo -e "  ${GREEN}✓ PASSED${NC}"
    fi
    PASS=$((PASS + 1))
  else
    if $HOOK_MODE; then
      echo -e "${RED}✗${NC}"
    else
      echo -e "  ${RED}✗ FAILED${NC}"
      cat /tmp/harness-gate-output | head -30
    fi
    FAIL=$((FAIL + 1))
    ERRORS+=("$label")
  fi
}

echo ""
if $HOOK_MODE; then
  echo "=== HARNESS POST-TASK GATES ==="
else
  echo "╔════════════════════════════════════════╗"
  echo "║   HARNESS FEEDBACK VALIDATION GATES   ║"
  echo "╚════════════════════════════════════════╝"
fi

# Gate 1: Unit tests (vitest)
gate "vitest (unit tests)" "npm run test -- --reporter=verbose 2>&1"

# Gate 2: ESLint
gate "eslint (lint)" "npm run lint 2>&1"

# Gate 3: TypeScript
gate "tsc (type check)" "npm run typecheck 2>&1"

# Gate 4: Architecture validation
gate "validate-arch (layer rules)" "bash scripts/harness/validate-arch.sh 2>&1"

# Gate 5: E2E tests (playwright) — skipped in quick mode
if ! $QUICK; then
  gate "playwright (e2e)" "npm run test:e2e 2>&1"
fi

echo ""
if $HOOK_MODE; then
  echo "Results: ${PASS} passed | ${FAIL} failed"
else
  echo "╔════════════════════════════════════════╗"
  printf "║  ${GREEN}%-3s passed${NC}  |  ${RED}%-3s failed${NC}             ║\n" "$PASS" "$FAIL"
  echo "╚════════════════════════════════════════╝"
fi

if [ "$FAIL" -gt "0" ]; then
  echo ""
  echo -e "${RED}Failed gates:${NC}"
  for err in "${ERRORS[@]}"; do
    echo -e "  ${RED}→${NC} $err"
  done
  echo ""
  echo -e "${YELLOW}HARNESS PROTOCOL: Do not retry harder.${NC}"
  echo -e "${YELLOW}→ Diagnose root cause${NC}"
  echo -e "${YELLOW}→ Log decision in ExecPlan under ## Decision Log${NC}"
  echo -e "${YELLOW}→ Change the approach or tool configuration${NC}"
  echo ""
  exit 1
fi

echo ""
echo -e "${GREEN}All gates passed. Task verified. Safe to commit.${NC}"
echo ""
exit 0
