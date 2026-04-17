#!/usr/bin/env bash
# validate-arch.sh — Enforces web app layer import rules.
# Layer order (imports flow DOWN only): pages → components → lib → utils
#
# Rule: lower layers must NOT import from higher layers.
# - utils/ cannot import from lib/, components/, or pages/
# - lib/ cannot import from components/ or pages/
# - components/ cannot import from pages/

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

VIOLATIONS=0
SRC="${1:-src}"

report_violation() {
  local file="$1"
  local layer="$2"
  local imported="$3"
  echo -e "  ${RED}VIOLATION${NC}: ${file}"
  echo -e "    Layer '${layer}' imports from '${imported}' (higher layer)"
  VIOLATIONS=$((VIOLATIONS + 1))
}

check_layer() {
  local from_layer="$1"
  shift
  local forbidden_layers=("$@")

  local layer_dir="${SRC}/${from_layer}"
  [ -d "$layer_dir" ] || return 0

  while IFS= read -r -d '' file; do
    for forbidden in "${forbidden_layers[@]}"; do
      # Check for relative imports going up into forbidden layer
      if grep -qE "from ['\"](@/)?${forbidden}/|from ['\"]\.\..*/${forbidden}/" "$file" 2>/dev/null; then
        report_violation "${file#./}" "$from_layer" "$forbidden"
      fi
      # Check for absolute path imports
      if grep -qE "from ['\"]src/${forbidden}/" "$file" 2>/dev/null; then
        report_violation "${file#./}" "$from_layer" "$forbidden"
      fi
    done
  done < <(find "$layer_dir" -name "*.ts" -o -name "*.tsx" -print0 2>/dev/null)
}

echo ""
echo "=== ARCHITECTURE VALIDATION ==="
echo "Layer rules: pages → components → lib → utils"
echo ""

# utils/ must not import from lib/, components/, or pages/
check_layer "utils" "lib" "components" "pages"

# lib/ must not import from components/ or pages/
check_layer "lib" "components" "pages"

# components/ must not import from pages/
check_layer "components" "pages"

if [ "$VIOLATIONS" -eq "0" ]; then
  echo -e "${GREEN}✓ No architecture violations found.${NC}"
  echo ""
  exit 0
else
  echo ""
  echo -e "${RED}✗ ${VIOLATIONS} violation(s) found.${NC}"
  echo ""
  echo "Fix: Move the import to the correct layer, or restructure the code."
  echo "Do NOT edit this validator to allow the violation."
  echo ""
  exit 1
fi
