import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import type { Todo } from '../lib/todo-store'

import { TodoList } from './TodoList'

const makeTodo = (id: string, text: string, done = false): Todo => ({
  id,
  text,
  done,
  createdAt: 1000,
})

describe('TodoList', () => {
  it('shows empty message when no todos', () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('할 일이 없습니다.')).toBeTruthy()
  })

  it('renders all todo items', () => {
    const todos = [makeTodo('1', '할 일 A'), makeTodo('2', '할 일 B')]
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('할 일 A')).toBeTruthy()
    expect(screen.getByText('할 일 B')).toBeTruthy()
  })

  it('does not show empty message when todos exist', () => {
    const todos = [makeTodo('1', '할 일 A')]
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText('할 일이 없습니다.')).toBe(null)
  })
})
