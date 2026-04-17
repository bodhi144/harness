import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { TodoList } from '../../components/TodoList'
import type { Todo } from '../../lib/todo-store'


const makeTodo = (id: string, text: string, done = false): Todo => ({
  id,
  text,
  done,
  createdAt: 1000,
  subtasks: [],
})

const noopSubtask = vi.fn()
const defaultSubtaskProps = {
  onAddSubtask: noopSubtask,
  onToggleSubtask: noopSubtask,
  onDeleteSubtask: noopSubtask,
  onEditSubtask: noopSubtask,
}

describe('TodoList', () => {
  it('shows empty message when no todos', () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} {...defaultSubtaskProps} />)
    expect(screen.queryByText('할 일이 없습니다.')).not.toBeNull()
  })

  it('renders all todo items', () => {
    const todos = [makeTodo('1', '할 일 A'), makeTodo('2', '할 일 B')]
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} {...defaultSubtaskProps} />)
    expect(screen.queryByText('할 일 A')).not.toBeNull()
    expect(screen.queryByText('할 일 B')).not.toBeNull()
  })

  it('does not show empty message when todos exist', () => {
    const todos = [makeTodo('1', '할 일 A')]
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} {...defaultSubtaskProps} />)
    expect(screen.queryByText('할 일이 없습니다.')).toBeNull()
  })
})
