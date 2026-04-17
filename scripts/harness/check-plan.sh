#!/usr/bin/env bash
# check-plan.sh — Validates that an ExecPlan has all required sections.
# Usage: bash scripts/harness/check-plan.sh <plan-file>

set -uo pipefail

PLAN_FILE="${1:-}"

if [ -z "$PLAN_FILE" ]; then
  # Auto-detect active plan
  PLAN_FILE=$(ls exec-plans/active/*.md 2>/dev/null | grep -v TEMPLATE | head -1)
  if [ -z "$PLAN_FILE" ]; then
    echo "ERROR: No active plan found and no plan file specified."
    exit 1
  fi
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

FAIL=0

required_section() {
  local section="$1"
  if grep -q "## ${section}" "$PLAN_FILE"; then
    echo -e "  ${GREEN}✓${NC} ## ${section}"
  else
    echo -e "  ${RED}✗${NC} ## ${section} — MISSING"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== ExecPlan Validation: ${PLAN_FILE} ==="
echo ""

required_section "Objective"
required_section "Inventory"
required_section "Design"
required_section "Milestones"
required_section "Verification"
required_section "Decision Log"

echo ""
if [ "$FAIL" -gt "0" ]; then
  echo -e "${RED}Plan is missing ${FAIL} required section(s). Add them before starting.${NC}"
  exit 1
fi
echo -e "${GREEN}Plan structure valid.${NC}"
echo ""
exit 0
