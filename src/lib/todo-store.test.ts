import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  type Todo,
  load,
  save,
  addTodo,
  toggleTodo,
  deleteTodo,
} from './todo-store'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2, 11),
})

describe('todo-store', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('load', () => {
    it('returns empty array when localStorage is empty', () => {
      const result = load()
      expect(result).toEqual([])
    })

    it('loads todos from localStorage', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: false, createdAt: 1000 },
      ]
      localStorage.setItem('harness-todos', JSON.stringify(todos))
      const result = load()
      expect(result).toEqual(todos)
    })

    it('returns empty array on parse error', () => {
      localStorage.setItem('harness-todos', '{invalid json}')
      const result = load()
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('saves todos to localStorage', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: false, createdAt: 1000 },
      ]
      save(todos)
      const stored = localStorage.getItem('harness-todos')
      expect(stored).toBe(JSON.stringify(todos))
    })
  })

  describe('addTodo', () => {
    it('adds a new todo to the list', () => {
      const todos: Todo[] = []
      const result = addTodo(todos, 'New todo')
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('New todo')
      expect(result[0].done).toBe(false)
      expect(result[0].id).toBeDefined()
      expect(result[0].createdAt).toBeDefined()
    })

    it('trims whitespace from text', () => {
      const todos: Todo[] = []
      const result = addTodo(todos, '  Trimmed todo  ')
      expect(result[0].text).toBe('Trimmed todo')
    })

    it('returns unchanged list when text is empty', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Existing', done: false, createdAt: 1000 },
      ]
      const result = addTodo(todos, '   ')
      expect(result).toEqual(todos)
    })

    it('does not mutate the original array', () => {
      const todos: Todo[] = []
      const result = addTodo(todos, 'New todo')
      expect(todos).toHaveLength(0)
      expect(result).toHaveLength(1)
    })
  })

  describe('toggleTodo', () => {
    it('toggles the done status of a todo', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: false, createdAt: 1000 },
      ]
      const result = toggleTodo(todos, '1')
      expect(result[0].done).toBe(true)
    })

    it('toggles back to false', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: true, createdAt: 1000 },
      ]
      const result = toggleTodo(todos, '1')
      expect(result[0].done).toBe(false)
    })

    it('does not affect other todos', () => {
      const todos: Todo[] = [
        { id: '1', text: 'First', done: false, createdAt: 1000 },
        { id: '2', text: 'Second', done: false, createdAt: 2000 },
      ]
      const result = toggleTodo(todos, '1')
      expect(result[0].done).toBe(true)
      expect(result[1].done).toBe(false)
    })

    it('does not mutate the original array', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: false, createdAt: 1000 },
      ]
      const result = toggleTodo(todos, '1')
      expect(todos[0].done).toBe(false)
      expect(result[0].done).toBe(true)
    })

    it('returns unchanged list when id is not found', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: false, createdAt: 1000 },
      ]
      const result = toggleTodo(todos, 'nonexistent')
      expect(result).toEqual(todos)
    })
  })

  describe('deleteTodo', () => {
    it('removes a todo from the list', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: false, createdAt: 1000 },
      ]
      const result = deleteTodo(todos, '1')
      expect(result).toHaveLength(0)
    })

    it('does not affect other todos', () => {
      const todos: Todo[] = [
        { id: '1', text: 'First', done: false, createdAt: 1000 },
        { id: '2', text: 'Second', done: false, createdAt: 2000 },
      ]
      const result = deleteTodo(todos, '1')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('does not mutate the original array', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: false, createdAt: 1000 },
      ]
      const result = deleteTodo(todos, '1')
      expect(todos).toHaveLength(1)
      expect(result).toHaveLength(0)
    })

    it('returns unchanged list when id is not found', () => {
      const todos: Todo[] = [
        { id: '1', text: 'Test', done: false, createdAt: 1000 },
      ]
      const result = deleteTodo(todos, 'nonexistent')
      expect(result).toEqual(todos)
    })
  })
})
