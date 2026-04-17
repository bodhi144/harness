import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import {
  type Todo,
  load,
  save,
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  editSubtask,
} from '../../lib/todo-store'

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2, 11),
})

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '1',
  text: 'Test',
  done: false,
  createdAt: 1000,
  subtasks: [],
  ...overrides,
})

describe('todo-store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('load', () => {
    it('returns empty array when localStorage is empty', () => {
      const result = load()
      expect(result).toEqual([])
    })

    it('loads todos from localStorage', () => {
      const todos: Todo[] = [makeTodo()]
      localStorage.setItem('harness-todos', JSON.stringify(todos))
      const result = load()
      expect(result).toEqual(todos)
    })

    it('migrates old todos without subtasks field', () => {
      const oldTodos = [{ id: '1', text: 'Old', done: false, createdAt: 1000 }]
      localStorage.setItem('harness-todos', JSON.stringify(oldTodos))
      const result = load()
      expect(result[0].subtasks).toEqual([])
    })

    it('returns empty array on parse error', () => {
      localStorage.setItem('harness-todos', '{invalid json}')
      const result = load()
      expect(result).toEqual([])
    })
  })

  describe('save', () => {
    it('saves todos to localStorage', () => {
      const todos: Todo[] = [makeTodo()]
      save(todos)
      const stored = localStorage.getItem('harness-todos')
      expect(stored).toBe(JSON.stringify(todos))
    })
  })

  describe('addTodo', () => {
    it('adds a new todo with empty subtasks', () => {
      const result = addTodo([], 'New todo')
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('New todo')
      expect(result[0].done).toBe(false)
      expect(result[0].subtasks).toEqual([])
      expect(result[0].id).toBeDefined()
      expect(result[0].createdAt).toBeDefined()
    })

    it('trims whitespace from text', () => {
      const result = addTodo([], '  Trimmed todo  ')
      expect(result[0].text).toBe('Trimmed todo')
    })

    it('returns unchanged list when text is empty', () => {
      const todos = [makeTodo()]
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
      const todos = [makeTodo({ done: false })]
      expect(toggleTodo(todos, '1')[0].done).toBe(true)
    })

    it('toggles back to false', () => {
      const todos = [makeTodo({ done: true })]
      expect(toggleTodo(todos, '1')[0].done).toBe(false)
    })

    it('does not affect other todos', () => {
      const todos = [makeTodo({ id: '1' }), makeTodo({ id: '2', createdAt: 2000 })]
      const result = toggleTodo(todos, '1')
      expect(result[0].done).toBe(true)
      expect(result[1].done).toBe(false)
    })

    it('does not mutate the original array', () => {
      const todos = [makeTodo()]
      const result = toggleTodo(todos, '1')
      expect(todos[0].done).toBe(false)
      expect(result[0].done).toBe(true)
    })

    it('returns unchanged list when id is not found', () => {
      const todos = [makeTodo()]
      expect(toggleTodo(todos, 'nonexistent')).toEqual(todos)
    })
  })

  describe('deleteTodo', () => {
    it('removes a todo from the list', () => {
      expect(deleteTodo([makeTodo()], '1')).toHaveLength(0)
    })

    it('does not affect other todos', () => {
      const todos = [makeTodo({ id: '1' }), makeTodo({ id: '2', createdAt: 2000 })]
      const result = deleteTodo(todos, '1')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('does not mutate the original array', () => {
      const todos = [makeTodo()]
      const result = deleteTodo(todos, '1')
      expect(todos).toHaveLength(1)
      expect(result).toHaveLength(0)
    })

    it('returns unchanged list when id is not found', () => {
      const todos = [makeTodo()]
      expect(deleteTodo(todos, 'nonexistent')).toEqual(todos)
    })
  })

  describe('editTodo', () => {
    it('updates the text of the matching todo', () => {
      expect(editTodo([makeTodo({ text: 'Old' })], '1', 'New')[0].text).toBe('New')
    })

    it('trims whitespace from new text', () => {
      expect(editTodo([makeTodo()], '1', '  Trimmed  ')[0].text).toBe('Trimmed')
    })

    it('returns unchanged list when new text is empty', () => {
      expect(editTodo([makeTodo({ text: 'Old' })], '1', '   ')[0].text).toBe('Old')
    })

    it('does not affect other todos', () => {
      const todos = [makeTodo({ id: '1', text: 'First' }), makeTodo({ id: '2', text: 'Second', createdAt: 2000 })]
      const result = editTodo(todos, '1', 'Updated')
      expect(result[0].text).toBe('Updated')
      expect(result[1].text).toBe('Second')
    })

    it('does not mutate the original array', () => {
      const todos = [makeTodo({ text: 'Original' })]
      const result = editTodo(todos, '1', 'Changed')
      expect(todos[0].text).toBe('Original')
      expect(result[0].text).toBe('Changed')
    })

    it('returns unchanged list when id is not found', () => {
      const todos = [makeTodo()]
      expect(editTodo(todos, 'nonexistent', 'New text')).toEqual(todos)
    })
  })

  describe('addSubtask', () => {
    it('adds a subtask to the matching parent', () => {
      const todos = [makeTodo()]
      const result = addSubtask(todos, '1', 'Sub task')
      expect(result[0].subtasks).toHaveLength(1)
      expect(result[0].subtasks[0].text).toBe('Sub task')
      expect(result[0].subtasks[0].done).toBe(false)
      expect(result[0].subtasks[0].id).toBeDefined()
    })

    it('trims whitespace from subtask text', () => {
      const result = addSubtask([makeTodo()], '1', '  trimmed  ')
      expect(result[0].subtasks[0].text).toBe('trimmed')
    })

    it('returns unchanged list when text is empty', () => {
      const todos = [makeTodo()]
      expect(addSubtask(todos, '1', '   ')).toEqual(todos)
    })

    it('does not affect other todos', () => {
      const todos = [makeTodo({ id: '1' }), makeTodo({ id: '2', createdAt: 2000 })]
      const result = addSubtask(todos, '1', 'Sub')
      expect(result[0].subtasks).toHaveLength(1)
      expect(result[1].subtasks).toHaveLength(0)
    })

    it('does not mutate the original array', () => {
      const todos = [makeTodo()]
      addSubtask(todos, '1', 'Sub')
      expect(todos[0].subtasks).toHaveLength(0)
    })
  })

  describe('toggleSubtask', () => {
    it('toggles the done status of the matching subtask', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Sub', done: false, createdAt: 2000 }] })]
      const result = toggleSubtask(todos, '1', 's1')
      expect(result[0].subtasks[0].done).toBe(true)
    })

    it('toggles back to false', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Sub', done: true, createdAt: 2000 }] })]
      expect(toggleSubtask(todos, '1', 's1')[0].subtasks[0].done).toBe(false)
    })

    it('does not affect other subtasks', () => {
      const todos = [makeTodo({
        subtasks: [
          { id: 's1', text: 'A', done: false, createdAt: 2000 },
          { id: 's2', text: 'B', done: false, createdAt: 3000 },
        ],
      })]
      const result = toggleSubtask(todos, '1', 's1')
      expect(result[0].subtasks[0].done).toBe(true)
      expect(result[0].subtasks[1].done).toBe(false)
    })

    it('does not mutate the original array', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Sub', done: false, createdAt: 2000 }] })]
      const result = toggleSubtask(todos, '1', 's1')
      expect(todos[0].subtasks[0].done).toBe(false)
      expect(result[0].subtasks[0].done).toBe(true)
    })
  })

  describe('deleteSubtask', () => {
    it('removes the matching subtask', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Sub', done: false, createdAt: 2000 }] })]
      expect(deleteSubtask(todos, '1', 's1')[0].subtasks).toHaveLength(0)
    })

    it('does not affect other subtasks', () => {
      const todos = [makeTodo({
        subtasks: [
          { id: 's1', text: 'A', done: false, createdAt: 2000 },
          { id: 's2', text: 'B', done: false, createdAt: 3000 },
        ],
      })]
      const result = deleteSubtask(todos, '1', 's1')
      expect(result[0].subtasks).toHaveLength(1)
      expect(result[0].subtasks[0].id).toBe('s2')
    })

    it('does not mutate the original array', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Sub', done: false, createdAt: 2000 }] })]
      deleteSubtask(todos, '1', 's1')
      expect(todos[0].subtasks).toHaveLength(1)
    })
  })

  describe('editSubtask', () => {
    it('updates the text of the matching subtask', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Old', done: false, createdAt: 2000 }] })]
      expect(editSubtask(todos, '1', 's1', 'New')[0].subtasks[0].text).toBe('New')
    })

    it('trims whitespace', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Old', done: false, createdAt: 2000 }] })]
      expect(editSubtask(todos, '1', 's1', '  trimmed  ')[0].subtasks[0].text).toBe('trimmed')
    })

    it('returns unchanged when text is empty', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Old', done: false, createdAt: 2000 }] })]
      expect(editSubtask(todos, '1', 's1', '   ')[0].subtasks[0].text).toBe('Old')
    })

    it('does not affect other subtasks', () => {
      const todos = [makeTodo({
        subtasks: [
          { id: 's1', text: 'A', done: false, createdAt: 2000 },
          { id: 's2', text: 'B', done: false, createdAt: 3000 },
        ],
      })]
      const result = editSubtask(todos, '1', 's1', 'Updated')
      expect(result[0].subtasks[0].text).toBe('Updated')
      expect(result[0].subtasks[1].text).toBe('B')
    })

    it('does not mutate the original array', () => {
      const todos = [makeTodo({ subtasks: [{ id: 's1', text: 'Original', done: false, createdAt: 2000 }] })]
      editSubtask(todos, '1', 's1', 'Changed')
      expect(todos[0].subtasks[0].text).toBe('Original')
    })
  })
})
