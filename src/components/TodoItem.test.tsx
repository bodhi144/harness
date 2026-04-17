import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TodoItem } from './TodoItem'
import type { Todo } from '../lib/todo-store'

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id',
  text: '테스트 할 일',
  done: false,
  createdAt: 1000,
  ...overrides,
})

describe('TodoItem', () => {
  it('renders todo text', () => {
    render(<TodoItem todo={makeTodo()} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('테스트 할 일')).toBeTruthy()
  })

  it('checkbox is unchecked when todo is not done', () => {
    render(<TodoItem todo={makeTodo({ done: false })} onToggle={vi.fn()} onDelete={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('checkbox is checked when todo is done', () => {
    render(<TodoItem todo={makeTodo({ done: true })} onToggle={vi.fn()} onDelete={vi.fn()} />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('calls onToggle with todo id when checkbox clicked', () => {
    const onToggle = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} onToggle={onToggle} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('abc')
  })

  it('calls onDelete with todo id when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} onToggle={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('삭제: 테스트 할 일'))
    expect(onDelete).toHaveBeenCalledWith('abc')
  })

  it('applies line-through style when done', () => {
    render(<TodoItem todo={makeTodo({ done: true })} onToggle={vi.fn()} onDelete={vi.fn()} />)
    const text = screen.getByText('테스트 할 일')
    expect(text.style.textDecoration).toBe('line-through')
  })
})
