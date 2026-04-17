#!/usr/bin/env bash
# check-worktree.sh — Called by Claude Code PreToolUse hook on Bash tool.
# Silently passes if in a worktree; warns if on main branch.

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
  echo "HARNESS WARNING: You are on '${CURRENT_BRANCH}'. Feature work should be in a worktree."
  echo "Run: bash scripts/harness/new-plan.sh <feature-name>"
fi

# Always exit 0 — this is a warning hook, not a blocking hook
exit 0
