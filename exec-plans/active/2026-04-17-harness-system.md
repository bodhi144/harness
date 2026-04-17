# Harness System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully autonomous AI agent execution harness for a web application project — enforcing ExecPlan-driven development, git worktree isolation, vitest/playwright validation gates, and self-correcting feedback loops.

**Architecture:** The harness wraps the Claude Code agent with a "world" layer of shell scripts, hooks, and markdown conventions. Every feature branch gets an isolated git worktree. Feedforward checks gate task entry; feedback loops block completion without verifiable test evidence. On failure, the agent mutates its plan or tools — not its effort level.

**Tech Stack:** Claude Code (hooks via `.claude/settings.json`), git worktrees, bash scripts, vitest (unit), playwright (e2e), eslint, TypeScript (`tsc`), `gh` CLI, Node.js

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        HARNESS SYSTEM                           │
│                                                                 │
│  ┌─────────────┐    ┌──────────────────────────────────────┐   │
│  │  CLAUDE.md  │───▶│          AGENT CORE                  │   │
│  │  (System    │    │  (Claude Code + Harness Rules)       │   │
│  │  Prompt)    │    └──────────────────┬───────────────────┘   │
│  └─────────────┘                       │                        │
│                                        ▼                        │
│  ┌─────────────┐    ┌──────────────────────────────────────┐   │
│  │  exec-plans │◀──▶│         WORKTREE LAYER               │   │
│  │  active/    │    │  git worktree per ExecPlan branch    │   │
│  │  completed/ │    └──────────────────┬───────────────────┘   │
│  └─────────────┘                       │                        │
│                                        ▼                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    TOOL LAYER                            │   │
│  │                                                         │   │
│  │   vitest(unit) │ playwright(e2e) │ eslint │ tsc │ gh   │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
│            ┌────────────────┴────────────────┐                 │
│            ▼                                 ▼                  │
│  ┌──────────────────────┐   ┌──────────────────────────────┐  │
│  │  FEEDFORWARD LOOP    │   │  FEEDBACK LOOP               │  │
│  │  pre-task.sh         │   │  post-task.sh                │  │
│  │  · ExecPlan loaded?  │   │  · vitest passes?            │  │
│  │  · In worktree?      │   │  · playwright passes?        │  │
│  │  · Branch correct?   │   │  · eslint clean?             │  │
│  │  · node_modules OK?  │   │  · tsc clean?                │  │
│  │  · Plan step clear?  │   │  · arch rules OK?            │  │
│  └──────────────────────┘   │  · On fail → mutate plan     │  │
│                              └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent System Prompt (CLAUDE.md content)

The CLAUDE.md created in Task 3 contains the following system instructions:

```
# Harness — Agent System Instructions

## Identity
You are an autonomous web application engineer. You operate inside a Harness:
a structured execution environment with mandatory gates at task entry and exit.
Your task is to implement features correctly and verifiably, not to appear productive.

## The Two Laws
1. **No task without an ExecPlan.** Every non-trivial change starts with a written
   plan in exec-plans/active/. Trivial = one-liner typo fix. Everything else needs a plan.
2. **No completion without evidence.** You may not claim a task is done until
   post-task.sh exits 0. Test output is evidence. "It should work" is not.

## Worktree Rule
All feature work happens in a dedicated git worktree, never on main.
- To start work: `bash scripts/harness/new-plan.sh <feature-name>`
- To finish work: `bash scripts/harness/promote-plan.sh <plan-file>`

## Task Entry (Feedforward)
Before starting any task step, run:
  bash scripts/harness/pre-task.sh

It checks: correct worktree, clean branch, deps installed, plan file present.
If it fails, fix the environment. Do not skip.

## Task Exit (Feedback)
After completing any task step that changes code, run:
  bash scripts/harness/post-task.sh

It runs: vitest (unit), playwright (e2e), eslint, tsc, validate-arch.sh.
If any gate fails:
  - DO NOT retry the same approach harder.
  - Update your ExecPlan with a diagnosis entry.
  - Mutate the approach: change the implementation, fix the tool config,
    or split the task differently.

## Test-as-Verification Protocol
Tests are written to verify that the implementation is correct — not to drive it.
Order: implement first, then write tests that prove the behavior is right.

1. Implement the feature (function, component, or user flow).
2. Write vitest unit tests that assert the concrete outputs of the implementation.
3. Run them — confirm they pass. If they expose a bug, fix the implementation (not the test).
4. Write playwright e2e tests that assert the user-visible behavior works end to end.
5. Run them — confirm they pass. Commit.

Tests are evidence. A test that passes trivially (always true) is not evidence.

## On Failure
Failure modes and correct responses:
| Failure                | Wrong response        | Correct response                    |
|------------------------|-----------------------|-------------------------------------|
| Test exposes a bug     | Weaken the assertion  | Fix the implementation              |
| Test always passes     | Ship it               | Strengthen the assertion to be meaningful |
| Lint fails             | Ignore and continue   | eslint --fix, then fix remaining manually |
| Type error             | Add `as any`          | Fix the type contract               |
| Arch violation         | Refactor the check    | Move the import, enforce the rule   |
| Playwright timeout     | Increase timeout      | Investigate selector/render timing  |

## Commit Convention
git commit -m "<type>(<scope>): <what changed>"
Types: feat, fix, test, refactor, chore, docs
Example: feat(auth): add JWT refresh token endpoint

## Architecture Rules (enforced by validate-arch.sh)
Web app layer order (imports only flow downward):
  pages → components → lib → utils
  
Violations halt commits. Fix the import direction, not the validator.

## Decision Logging
When you make a non-obvious architectural decision during implementation,
append a log entry to the active ExecPlan under ## Decision Log:

### [date] Decision: <title>
**Context:** why this came up
**Choice:** what you decided
**Rationale:** why
**Trade-offs:** what you gave up
```

---

## ExecPlan Sample Template (exec-plans/TEMPLATE.md)

The template created in Task 4 looks like this:

```markdown
# {{PLAN_NAME}} — ExecPlan

**Created:** {{DATE}}
**Branch:** feature/{{PLAN_NAME}}
**Worktree:** ../worktrees/{{PLAN_NAME}}
**Status:** active

---

## Objective
<!-- One sentence: what does this change accomplish for the user? -->

## Inventory
<!-- Files that will be created or modified. Lock this in before coding. -->

**Create:**
- `src/...`
- `tests/...`

**Modify:**
- `src/...` — reason

**Test files:**
- `tests/unit/...` (vitest)
- `tests/e2e/...` (playwright)

## Design
<!-- 2-4 sentences on approach. What pattern? What are the boundaries? -->

## Milestones

### Milestone 1: [Name]
- [ ] Step 1: ...
- [ ] Step 2: ...
- [ ] Commit: `git commit -m "feat(...): ..."`

### Milestone 2: [Name]
- [ ] Step 1: ...
- [ ] Commit: `git commit -m "feat(...): ..."`

## Verification
- [ ] `bash scripts/harness/post-task.sh` exits 0
- [ ] All vitest tests pass: `npx vitest run`
- [ ] All playwright tests pass: `npx playwright test`
- [ ] No lint errors: `npx eslint src/`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Architecture valid: `bash scripts/harness/validate-arch.sh`

## Decision Log
<!-- Append entries here as decisions are made during implementation. -->
```

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `exec-plans/active/.gitkeep` | Create | Keeps directory tracked |
| `exec-plans/completed/.gitkeep` | Create | Keeps directory tracked |
| `exec-plans/TEMPLATE.md` | Create | ExecPlan template for all future plans |
| `CLAUDE.md` | Create | Agent system instructions (harness core) |
| `.claude/settings.json` | Create | Claude Code hooks: Stop → post-task.sh |
| `scripts/harness/pre-task.sh` | Create | Feedforward validator (entry gate) |
| `scripts/harness/post-task.sh` | Create | Feedback validator (exit gate) |
| `scripts/harness/validate-arch.sh` | Create | Architecture rule enforcer |
| `scripts/harness/new-plan.sh` | Create | Creates ExecPlan + worktree in one command |
| `scripts/harness/promote-plan.sh` | Create | Moves plan active → completed after merge |
| `scripts/harness/check-plan.sh` | Create | Validates ExecPlan has required sections |
| `package.json` | Create | Project root with vitest + playwright scripts |
| `vite.config.ts` | Create | Vite config with vitest inline config |
| `playwright.config.ts` | Create | Playwright config pointing to local dev server |
| `.eslintrc.json` | Create | ESLint config with import-order rules |
| `tsconfig.json` | Create | TypeScript config |
| `src/` | Create | Placeholder web app source structure |

---

## Task 1: Worktree Setup for Harness Implementation

**Files:**
- No source files yet — git setup only

- [ ] **Step 1: Commit the initial exec-plans scaffold to main**

```bash
cd /Users/bodhi/work/harness
git add exec-plans/active/.gitkeep exec-plans/completed/.gitkeep
git commit -m "chore: initialize exec-plans directory structure"
```

Expected: commit created on main

- [ ] **Step 2: Create the harness implementation branch and worktree**

```bash
cd /Users/bodhi/work/harness
git checkout -b feature/build-harness-system
git worktree add ../harness-build feature/build-harness-system
```

Expected output:
```
Preparing worktree (new branch 'feature/build-harness-system')
HEAD is now at <sha> chore: initialize exec-plans directory structure
```

- [ ] **Step 3: Verify worktree is isolated**

```bash
git worktree list
```

Expected: two entries — main worktree at `/Users/bodhi/work/harness` and linked worktree at `../harness-build`

- [ ] **Step 4: Switch into the worktree for all remaining tasks**

```bash
cd /Users/bodhi/work/harness-build
pwd
```

Expected: `/Users/bodhi/work/harness-build`

All subsequent steps run from `/Users/bodhi/work/harness-build`.

---

## Task 2: Project Foundation (package.json, tsconfig, vite, playwright)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `playwright.config.ts`
- Create: `.eslintrc.json`

- [ ] **Step 1: Initialize package.json**

```bash
cd /Users/bodhi/work/harness-build
cat > package.json << 'EOF'
{
  "name": "harness",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "validate": "bash scripts/harness/post-task.sh"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "eslint": "^8.57.0",
    "eslint-plugin-import": "^2.29.1",
    "jsdom": "^24.0.0",
    "typescript": "^5.4.5",
    "vite": "^5.2.0",
    "vitest": "^1.6.0"
  }
}
EOF
```

- [ ] **Step 2: Create tsconfig.json**

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "scripts"]
}
EOF
```

- [ ] **Step 3: Create vite.config.ts with vitest config**

```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
EOF
```

- [ ] **Step 4: Create playwright.config.ts**

```bash
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
EOF
```

- [ ] **Step 5: Create .eslintrc.json**

```bash
cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "env": { "browser": true, "es2020": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  "plugins": ["@typescript-eslint", "import"],
  "settings": {
    "import/resolver": {
      "typescript": {
        "project": "./tsconfig.json"
      }
    }
  },
  "rules": {
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }
    ],
    "import/no-cycle": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
EOF
```

- [ ] **Step 6: Create placeholder web app source structure**

```bash
mkdir -p src/pages src/components src/lib src/utils src/test tests/e2e

cat > src/test/setup.ts << 'EOF'
import '@testing-library/react'
EOF

cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div>Harness Web App</div>
  </React.StrictMode>
)
EOF

cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Harness</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
```

- [ ] **Step 7: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors

- [ ] **Step 8: Install Playwright browsers**

```bash
npx playwright install chromium
```

Expected: Chromium downloaded

- [ ] **Step 9: Confirm vitest runs (no tests yet = OK)**

```bash
npm run test 2>&1 | tail -5
```

Expected output includes: `No test files found` or `0 tests passed`

- [ ] **Step 10: Commit foundation**

```bash
git add package.json tsconfig.json vite.config.ts playwright.config.ts .eslintrc.json src/ index.html
git commit -m "chore: add web app project foundation (vite, vitest, playwright, eslint)"
```

---

## Task 3: CLAUDE.md — Agent System Instructions

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

```bash
cat > CLAUDE.md << 'HEREDOC'
# Harness — Agent System Instructions

## Identity
You are an autonomous web application engineer. You operate inside a Harness:
a structured execution environment with mandatory gates at task entry and exit.
Your task is to implement features correctly and verifiably, not to appear productive.

## The Two Laws
1. **No task without an ExecPlan.** Every non-trivial change starts with a written
   plan in `exec-plans/active/`. Trivial = one-liner typo fix. Everything else needs a plan.
2. **No completion without evidence.** You may not claim a task is done until
   `post-task.sh` exits 0. Test output is evidence. "It should work" is not.

## Worktree Rule
All feature work happens in a dedicated git worktree, never on main.
- To start work: `bash scripts/harness/new-plan.sh <feature-name>`
- This creates both the ExecPlan file and the isolated worktree.
- To finish work: `bash scripts/harness/promote-plan.sh <plan-file>`

## Task Entry — Feedforward (run before each milestone)
```bash
bash scripts/harness/pre-task.sh
```
Checks: correct worktree, deps installed, plan file present, branch not main.
If it fails → fix the environment. Do not skip.

## Task Exit — Feedback (run after each milestone changes code)
```bash
bash scripts/harness/post-task.sh
```
Runs: vitest → playwright → eslint → tsc → validate-arch.sh.
If any gate fails:
  - **Do NOT retry the same approach harder.**
  - Write a diagnosis entry in the ExecPlan under `## Decision Log`.
  - Mutate the approach: change the implementation, fix the tool config,
    or restructure the task.

## Test-as-Verification Protocol
Tests are written after implementation to verify the implementation is correct.
Do NOT write tests before implementation. Do NOT write tests that always pass.

1. Implement the feature (function, component, or user flow).
2. Write vitest unit tests that assert the concrete outputs — specific return values,
   state changes, error conditions. If an assertion is trivially true, it is not a test.
3. Run them — confirm they pass. If a test exposes a real bug, fix the implementation.
4. Write playwright e2e tests that assert the user-visible behavior end to end.
5. Run them — confirm they pass. Commit.

## Failure Response Table
| Failure                   | Wrong response          | Correct response                      |
|---------------------------|-------------------------|---------------------------------------|
| Test exposes a bug        | Weaken the assertion    | Fix the implementation                |
| Test passes trivially     | Ship it                 | Strengthen the assertion              |
| vitest fails after fix    | Try harder              | Diagnose → log decision → new approach |
| playwright times out      | Increase timeout        | Investigate selector/render timing    |
| eslint errors             | Add eslint-disable      | eslint --fix, then fix remaining      |
| TypeScript error          | Cast with `as any`      | Fix the type contract                 |
| Architecture violation    | Edit the validator      | Move the import to the correct layer  |

## Architecture Layers (enforced by validate-arch.sh)
Import direction is ONE WAY — from top to bottom only:
```
pages/ → components/ → lib/ → utils/
```
- `utils/` = pure functions, no framework imports
- `lib/` = domain logic, no React imports
- `components/` = UI primitives and composites
- `pages/` = route-level views, composes components

## Commit Convention
```
git commit -m "<type>(<scope>): <description>"
```
Types: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`

## Decision Logging
When you make a non-obvious decision during implementation, append to the active
ExecPlan under `## Decision Log`:

```
### [YYYY-MM-DD] <title>
**Context:** why this came up
**Choice:** what you decided
**Rationale:** why this was best
**Trade-offs:** what was given up
```
HEREDOC
```

- [ ] **Step 2: Commit CLAUDE.md**

```bash
git add CLAUDE.md
git commit -m "docs: add agent system instructions (CLAUDE.md harness core)"
```

---

## Task 4: ExecPlan Template

**Files:**
- Create: `exec-plans/TEMPLATE.md`

- [ ] **Step 1: Write TEMPLATE.md**

```bash
cat > exec-plans/TEMPLATE.md << 'HEREDOC'
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
HEREDOC
```

- [ ] **Step 2: Commit template**

```bash
git add exec-plans/TEMPLATE.md
git commit -m "docs: add ExecPlan template"
```

---

## Task 5: Claude Code Hooks (.claude/settings.json)

**Files:**
- Create: `.claude/settings.json`

- [ ] **Step 1: Create .claude directory and settings.json**

```bash
mkdir -p .claude
cat > .claude/settings.json << 'EOF'
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/harness/post-task.sh --hook-mode 2>&1 | tail -30"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/harness/check-worktree.sh 2>&1"
          }
        ]
      }
    ]
  }
}
EOF
```

- [ ] **Step 2: Commit settings**

```bash
git add .claude/settings.json
git commit -m "chore: add Claude Code hooks for feedforward/feedback gates"
```

---

## Task 6: pre-task.sh — Feedforward Validator

**Files:**
- Create: `scripts/harness/pre-task.sh`

- [ ] **Step 1: Create scripts/harness directory**

```bash
mkdir -p scripts/harness
```

- [ ] **Step 2: Write pre-task.sh**

```bash
cat > scripts/harness/pre-task.sh << 'HEREDOC'
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
HEREDOC
chmod +x scripts/harness/pre-task.sh
```

- [ ] **Step 3: Confirm pre-task.sh is executable and runs**

```bash
bash scripts/harness/pre-task.sh || true
```

Expected: output shows checks, some will fail (no node_modules yet in worktree, no active plan) — that's fine, script should exit non-zero with clear messages.

- [ ] **Step 4: Commit**

```bash
git add scripts/harness/pre-task.sh
git commit -m "feat(harness): add pre-task feedforward validator"
```

---

## Task 7: post-task.sh — Feedback Validator

**Files:**
- Create: `scripts/harness/post-task.sh`

- [ ] **Step 1: Write post-task.sh**

```bash
cat > scripts/harness/post-task.sh << 'HEREDOC'
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
HEREDOC
chmod +x scripts/harness/post-task.sh
```

- [ ] **Step 2: Confirm post-task.sh runs (will fail gates since no tests yet)**

```bash
bash scripts/harness/post-task.sh --quick 2>&1 | head -20
```

Expected: script runs, vitest gate reports no tests or passes, eslint gate may error if no src files — all expected at this stage.

- [ ] **Step 3: Commit**

```bash
git add scripts/harness/post-task.sh
git commit -m "feat(harness): add post-task feedback validator with all gates"
```

---

## Task 8: validate-arch.sh — Architecture Rule Enforcer

**Files:**
- Create: `scripts/harness/validate-arch.sh`

- [ ] **Step 1: Write validate-arch.sh**

```bash
cat > scripts/harness/validate-arch.sh << 'HEREDOC'
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
HEREDOC
chmod +x scripts/harness/validate-arch.sh
```

- [ ] **Step 2: Run against current src/ (should pass — no violations in empty project)**

```bash
bash scripts/harness/validate-arch.sh
```

Expected:
```
=== ARCHITECTURE VALIDATION ===
Layer rules: pages → components → lib → utils

✓ No architecture violations found.
```

- [ ] **Step 3: Commit**

```bash
git add scripts/harness/validate-arch.sh
git commit -m "feat(harness): add architecture layer validator"
```

---

## Task 9: new-plan.sh and promote-plan.sh — Lifecycle Scripts

**Files:**
- Create: `scripts/harness/new-plan.sh`
- Create: `scripts/harness/promote-plan.sh`
- Create: `scripts/harness/check-plan.sh`
- Create: `scripts/harness/check-worktree.sh`

- [ ] **Step 1: Write new-plan.sh**

```bash
cat > scripts/harness/new-plan.sh << 'HEREDOC'
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
HEREDOC
chmod +x scripts/harness/new-plan.sh
```

- [ ] **Step 2: Write promote-plan.sh**

```bash
cat > scripts/harness/promote-plan.sh << 'HEREDOC'
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
  sed -i '' 's/\*\*Status:\*\* active/**Status:** completed/' "${PLAN_FILE}"
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
HEREDOC
chmod +x scripts/harness/promote-plan.sh
```

- [ ] **Step 3: Write check-plan.sh (validates ExecPlan format)**

```bash
cat > scripts/harness/check-plan.sh << 'HEREDOC'
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
HEREDOC
chmod +x scripts/harness/check-plan.sh
```

- [ ] **Step 4: Write check-worktree.sh (PreToolUse hook)**

```bash
cat > scripts/harness/check-worktree.sh << 'HEREDOC'
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
HEREDOC
chmod +x scripts/harness/check-worktree.sh
```

- [ ] **Step 5: Commit all harness scripts**

```bash
git add scripts/harness/
git commit -m "feat(harness): add lifecycle scripts (new-plan, promote-plan, check-plan, check-worktree)"
```

---

## Task 10: Integration Verification

**Files:** None new — verification only

- [ ] **Step 1: Run validate-arch.sh on src/**

```bash
bash scripts/harness/validate-arch.sh
```

Expected: `✓ No architecture violations found.`

- [ ] **Step 2: Run pre-task.sh and inspect output**

```bash
bash scripts/harness/pre-task.sh || true
```

Expected: clear output showing which checks pass/fail with actionable messages

- [ ] **Step 3: Run post-task.sh in quick mode**

```bash
bash scripts/harness/post-task.sh --quick || true
```

Expected: vitest passes (no tests = passes), eslint runs, tsc runs, arch passes

- [ ] **Step 4: Test new-plan.sh dry run (verify it requires being on main)**

```bash
# This should error since we're on feature/build-harness-system, not main
bash scripts/harness/new-plan.sh test-feature 2>&1 | head -5 || true
```

Expected: `ERROR: new-plan.sh must be run from the main worktree on main/master branch.`

- [ ] **Step 5: Check plan validation on TEMPLATE.md**

```bash
bash scripts/harness/check-plan.sh exec-plans/TEMPLATE.md
```

Expected: all sections pass

- [ ] **Step 6: Verify all scripts are executable**

```bash
ls -la scripts/harness/
```

Expected: all `.sh` files show `-rwxr-xr-x` permissions

- [ ] **Step 7: Merge harness branch to main**

```bash
# Switch to main worktree
cd /Users/bodhi/work/harness
git merge feature/build-harness-system --no-ff -m "feat: complete harness system implementation"
```

- [ ] **Step 8: Remove the build worktree**

```bash
git worktree remove /Users/bodhi/work/harness-build
git branch -d feature/build-harness-system
```

- [ ] **Step 9: Verify final state**

```bash
git log --oneline | head -15
git worktree list
```

Expected: clean main branch with all harness commits, single worktree entry

- [ ] **Step 10: Final validation from main**

```bash
bash scripts/harness/post-task.sh --quick
```

Expected: all gates pass, exit 0

---

## Usage Reference (After Implementation)

### Starting a new feature

```bash
# From main worktree on main branch:
bash scripts/harness/new-plan.sh user-authentication

# Switch to the worktree:
cd ../worktrees/user-authentication

# Edit your ExecPlan:
# nano exec-plans/active/2026-04-17-user-authentication.md

# Verify environment:
bash scripts/harness/pre-task.sh

# Implement → verify with tests → post-task gate → commit
```

### Completing a feature

```bash
# After all milestones done and post-task.sh passes:
cd /Users/bodhi/work/harness   # back to main worktree
git merge feature/user-authentication --no-ff
bash scripts/harness/promote-plan.sh exec-plans/active/2026-04-17-user-authentication.md
git worktree remove ../worktrees/user-authentication
git branch -d feature/user-authentication
```

---

## Self-Review

**Spec coverage check:**
- [x] Architecture diagram (text-based) — included above
- [x] Agent system prompt — CLAUDE.md in Task 3
- [x] ExecPlan sample template — exec-plans/TEMPLATE.md in Task 4
- [x] Harness scripts — Tasks 6-9
- [x] Vitest unit test setup — Task 2
- [x] Playwright e2e setup — Task 2
- [x] Worktree enforcement — new-plan.sh, pre-task.sh, check-worktree.sh hook
- [x] Feedforward loop — pre-task.sh (Task 6)
- [x] Feedback loop — post-task.sh (Task 7)
- [x] Self-correction logic — post-task.sh failure protocol + CLAUDE.md failure table
- [x] Architecture validation — validate-arch.sh (Task 8)
- [x] Failure → plan mutation, not effort — CLAUDE.md + post-task.sh messaging
- [x] exec-plans/active/ and exec-plans/completed/ — Task 1

**Placeholder scan:** No TBDs, no "implement later", all steps have actual shell code.

**Type consistency:** No types used across tasks (shell scripts only). N/A.
