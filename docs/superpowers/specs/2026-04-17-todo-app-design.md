# Todo App Design

**Date:** 2026-04-17  
**Status:** Approved

## Summary

A dark-mode todo list web application built with React + TypeScript, following the harness architecture layers. Data persists in `localStorage`. Features: add, complete (toggle), delete.

---

## Architecture

Import direction strictly follows: `pages/ → components/ → lib/`

```
src/
  lib/
    todo-store.ts          # Pure TS: CRUD + localStorage sync
    todo-store.test.ts     # Vitest unit tests
  components/
    TodoForm.tsx           # Input field + add button
    TodoItem.tsx           # Checkbox + text + delete button
    TodoList.tsx           # Renders list of TodoItems
  pages/
    TodoPage.tsx           # State management, composes components
  main.tsx                 # Entry point (mounts TodoPage)
e2e/
  todo.spec.ts             # Playwright E2E tests
```

---

## Data Model

```ts
interface Todo {
  id: string        // crypto.randomUUID()
  text: string      // non-empty string
  done: boolean     // false on creation
  createdAt: number // Date.now()
}
```

### todo-store.ts API

All functions are pure (no React imports):

| Function | Signature | Description |
|---|---|---|
| `load` | `() => Todo[]` | Read from localStorage, fallback to `[]` |
| `save` | `(todos: Todo[]) => void` | Write to localStorage |
| `addTodo` | `(todos: Todo[], text: string) => Todo[]` | Append new Todo |
| `toggleTodo` | `(todos: Todo[], id: string) => Todo[]` | Flip `done` |
| `deleteTodo` | `(todos: Todo[], id: string) => Todo[]` | Remove by id |

localStorage key: `"harness-todos"`

---

## UI & Styling

**Color palette (dark mode):**

| Role | Value |
|---|---|
| Page background | `#0f0f0f` |
| Card background | `#1a1a1a` |
| Item background | `#242424` |
| Primary text | `#e0e0e0` |
| Done text | `#6b6b6b` + strikethrough |
| Accent (button, checkbox) | `#7c6af7` |
| Delete hover | `#ff4d4d` |

**Layout:**
- Centered, max-width 480px
- Heading: "Todo"
- Input row: text field + "추가" button (full width)
- Scrollable todo list
- Footer: "n개 남음" (count of undone items)

Styles applied via `index.css` global variables + component inline styles where scoped.

---

## Component Responsibilities

### `TodoPage.tsx`
- Owns `todos: Todo[]` state (initialized from `load()`)
- Calls `save()` on every mutation
- Passes handlers down to child components

### `TodoList.tsx`
- Renders `TodoItem` for each todo
- No state of its own

### `TodoItem.tsx`
- Props: `todo: Todo`, `onToggle: (id) => void`, `onDelete: (id) => void`
- Checkbox triggers `onToggle`
- Delete button triggers `onDelete`
- Done state: text gets `#6b6b6b` color + `line-through`

### `TodoForm.tsx`
- Props: `onAdd: (text: string) => void`
- Local state: `text` input value
- Submit via "추가" button click or Enter key press
- Clears input after submit
- Ignores empty/whitespace-only input

---

## Test Plan

### Vitest Unit Tests (`src/lib/todo-store.test.ts`)

1. `addTodo` — returned array has one more item with correct `text`, `done: false`
2. `toggleTodo` — flips `done` from false → true, and true → false
3. `deleteTodo` — removes the item with the given id, others unchanged
4. `load` — returns `[]` when localStorage is empty
5. `save` + `load` — round-trip: saved todos are restored correctly

### Playwright E2E Tests (`e2e/todo.spec.ts`)

1. Add todo → item appears in list with correct text
2. Check todo → text shows strikethrough style
3. Delete todo → item disappears from list
4. Refresh page → todos persist (localStorage)
5. Empty input submit → no item added

---

## Out of Scope

- Edit existing todos
- Filtering (all / active / done)
- Due dates, priorities, categories
- Backend / multi-device sync
- Dark/light mode toggle
