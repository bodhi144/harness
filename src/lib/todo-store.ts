export interface SubTodo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
  subtasks: SubTodo[]
}

const STORAGE_KEY = 'harness-todos'

export function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Omit<Todo, 'subtasks'> & { subtasks?: Todo['subtasks'] }>
    // Migrate old todos that don't have subtasks field
    return parsed.map(t => ({ ...t, subtasks: t.subtasks ?? [] }))
  } catch {
    return []
  }
}

export function save(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function addTodo(todos: Todo[], text: string): Todo[] {
  const trimmed = text.trim()
  if (!trimmed) return todos
  const next: Todo = {
    id: crypto.randomUUID(),
    text: trimmed,
    done: false,
    createdAt: Date.now(),
    subtasks: [],
  }
  return [...todos, next]
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter(t => t.id !== id)
}

export function editTodo(todos: Todo[], id: string, text: string): Todo[] {
  const trimmed = text.trim()
  if (!trimmed) return todos
  return todos.map(t => t.id === id ? { ...t, text: trimmed } : t)
}

export function addSubtask(todos: Todo[], parentId: string, text: string): Todo[] {
  const trimmed = text.trim()
  if (!trimmed) return todos
  const sub: SubTodo = {
    id: crypto.randomUUID(),
    text: trimmed,
    done: false,
    createdAt: Date.now(),
  }
  return todos.map(t =>
    t.id === parentId ? { ...t, subtasks: [...t.subtasks, sub] } : t
  )
}

export function toggleSubtask(todos: Todo[], parentId: string, subId: string): Todo[] {
  return todos.map(t =>
    t.id === parentId
      ? {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s),
        }
      : t
  )
}

export function deleteSubtask(todos: Todo[], parentId: string, subId: string): Todo[] {
  return todos.map(t =>
    t.id === parentId
      ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subId) }
      : t
  )
}

export function editSubtask(todos: Todo[], parentId: string, subId: string, text: string): Todo[] {
  const trimmed = text.trim()
  if (!trimmed) return todos
  return todos.map(t =>
    t.id === parentId
      ? {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subId ? { ...s, text: trimmed } : s),
        }
      : t
  )
}
