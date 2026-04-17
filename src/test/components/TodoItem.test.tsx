import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { TodoItem } from '../../components/TodoItem'
import type { Todo } from '../../lib/todo-store'


const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id',
  text: '테스트 할 일',
  done: false,
  createdAt: 1000,
  ...overrides,
})

const noop = vi.fn()

describe('TodoItem', () => {
  it('renders todo text', () => {
    render(<TodoItem todo={makeTodo()} onToggle={noop} onDelete={noop} onEdit={noop} />)
    expect(screen.getByText('테스트 할 일')).toBeTruthy()
  })

  it('checkbox is unchecked when todo is not done', () => {
    render(<TodoItem todo={makeTodo({ done: false })} onToggle={noop} onDelete={noop} onEdit={noop} />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('checkbox is checked when todo is done', () => {
    render(<TodoItem todo={makeTodo({ done: true })} onToggle={noop} onDelete={noop} onEdit={noop} />)
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('calls onToggle with todo id when checkbox clicked', () => {
    const onToggle = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} onToggle={onToggle} onDelete={noop} onEdit={noop} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('abc')
  })

  it('calls onDelete with todo id when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} onToggle={noop} onDelete={onDelete} onEdit={noop} />)
    fireEvent.click(screen.getByLabelText('삭제: 테스트 할 일'))
    expect(onDelete).toHaveBeenCalledWith('abc')
  })

  it('applies line-through style when done', () => {
    render(<TodoItem todo={makeTodo({ done: true })} onToggle={noop} onDelete={noop} onEdit={noop} />)
    const text = screen.getByText('테스트 할 일')
    expect(text.style.textDecoration).toBe('line-through')
  })

  it('shows inline input when edit button clicked', () => {
    render(<TodoItem todo={makeTodo()} onToggle={noop} onDelete={noop} onEdit={noop} />)
    fireEvent.click(screen.getByLabelText('수정: 테스트 할 일'))
    const input = screen.getByRole('textbox', { name: '수정: 테스트 할 일' }) as HTMLInputElement
    expect(input.value).toBe('테스트 할 일')
  })

  it('calls onEdit with new text on Enter', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} onToggle={noop} onDelete={noop} onEdit={onEdit} />)
    fireEvent.click(screen.getByLabelText('수정: 테스트 할 일'))
    const input = screen.getByRole('textbox', { name: '수정: 테스트 할 일' })
    fireEvent.change(input, { target: { value: '수정된 내용' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onEdit).toHaveBeenCalledWith('abc', '수정된 내용')
  })

  it('cancels edit on Escape and restores original text', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={makeTodo()} onToggle={noop} onDelete={noop} onEdit={onEdit} />)
    fireEvent.click(screen.getByLabelText('수정: 테스트 할 일'))
    const input = screen.getByRole('textbox', { name: '수정: 테스트 할 일' })
    fireEvent.change(input, { target: { value: '바뀐 내용' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByText('테스트 할 일')).toBeTruthy()
  })

  it('calls onEdit on blur', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} onToggle={noop} onDelete={noop} onEdit={onEdit} />)
    fireEvent.click(screen.getByLabelText('수정: 테스트 할 일'))
    const input = screen.getByRole('textbox', { name: '수정: 테스트 할 일' })
    fireEvent.change(input, { target: { value: 'blur로 저장' } })
    fireEvent.blur(input)
    expect(onEdit).toHaveBeenCalledWith('abc', 'blur로 저장')
  })
})
