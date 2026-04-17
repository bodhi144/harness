export interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

const STORAGE_KEY = 'harness-todos'

export function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Todo[]) : []
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
  }
  return [...todos, next]
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter(t => t.id !== id)
}
