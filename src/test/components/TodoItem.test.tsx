import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { TodoItem } from '../../components/TodoItem'
import type { Todo } from '../../lib/todo-store'


const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id',
  text: '테스트 할 일',
  done: false,
  createdAt: 1000,
  subtasks: [],
  ...overrides,
})

const noop = vi.fn()
const noopSubtask = vi.fn()

const defaultProps = {
  onToggle: noop,
  onDelete: noop,
  onEdit: noop,
  onAddSubtask: noopSubtask,
  onToggleSubtask: noopSubtask,
  onDeleteSubtask: noopSubtask,
  onEditSubtask: noopSubtask,
}

describe('TodoItem', () => {
  it('renders todo text', () => {
    render(<TodoItem todo={makeTodo()} {...defaultProps} />)
    expect(screen.getByText('테스트 할 일')).toBeTruthy()
  })

  it('checkbox is unchecked when todo is not done', () => {
    render(<TodoItem todo={makeTodo({ done: false })} {...defaultProps} />)
    const checkbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('checkbox is checked when todo is done', () => {
    render(<TodoItem todo={makeTodo({ done: true })} {...defaultProps} />)
    const checkbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('calls onToggle with todo id when checkbox clicked', () => {
    const onToggle = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} {...defaultProps} onToggle={onToggle} />)
    fireEvent.click(screen.getAllByRole('checkbox')[0])
    expect(onToggle).toHaveBeenCalledWith('abc')
  })

  it('calls onDelete with todo id when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('삭제: 테스트 할 일'))
    expect(onDelete).toHaveBeenCalledWith('abc')
  })

  it('applies line-through style when done', () => {
    render(<TodoItem todo={makeTodo({ done: true })} {...defaultProps} />)
    const text = screen.getByText('테스트 할 일')
    expect(text.style.textDecoration).toBe('line-through')
  })

  it('shows inline input when edit button clicked', () => {
    render(<TodoItem todo={makeTodo()} {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('수정: 테스트 할 일'))
    const input = screen.getByRole('textbox', { name: '수정: 테스트 할 일' }) as HTMLInputElement
    expect(input.value).toBe('테스트 할 일')
  })

  it('calls onEdit with new text on Enter', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} {...defaultProps} onEdit={onEdit} />)
    fireEvent.click(screen.getByLabelText('수정: 테스트 할 일'))
    const input = screen.getByRole('textbox', { name: '수정: 테스트 할 일' })
    fireEvent.change(input, { target: { value: '수정된 내용' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onEdit).toHaveBeenCalledWith('abc', '수정된 내용')
  })

  it('cancels edit on Escape and restores original text', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={makeTodo()} {...defaultProps} onEdit={onEdit} />)
    fireEvent.click(screen.getByLabelText('수정: 테스트 할 일'))
    const input = screen.getByRole('textbox', { name: '수정: 테스트 할 일' })
    fireEvent.change(input, { target: { value: '바뀐 내용' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByText('테스트 할 일')).toBeTruthy()
  })

  it('calls onEdit on blur', () => {
    const onEdit = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} {...defaultProps} onEdit={onEdit} />)
    fireEvent.click(screen.getByLabelText('수정: 테스트 할 일'))
    const input = screen.getByRole('textbox', { name: '수정: 테스트 할 일' })
    fireEvent.change(input, { target: { value: 'blur로 저장' } })
    fireEvent.blur(input)
    expect(onEdit).toHaveBeenCalledWith('abc', 'blur로 저장')
  })

  it('renders existing subtasks', () => {
    const todo = makeTodo({
      subtasks: [{ id: 's1', text: '서브태스크', done: false, createdAt: 2000 }],
    })
    render(<TodoItem todo={todo} {...defaultProps} />)
    expect(screen.getByText('서브태스크')).toBeTruthy()
  })

  it('shows subtask add input when + button clicked', () => {
    render(<TodoItem todo={makeTodo()} {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('서브태스크: 테스트 할 일'))
    expect(screen.getByLabelText('서브태스크 입력')).toBeTruthy()
  })

  it('calls onAddSubtask on Enter in subtask input', () => {
    const onAddSubtask = vi.fn()
    render(<TodoItem todo={makeTodo({ id: 'abc' })} {...defaultProps} onAddSubtask={onAddSubtask} />)
    fireEvent.click(screen.getByLabelText('서브태스크: 테스트 할 일'))
    const input = screen.getByLabelText('서브태스크 입력')
    fireEvent.change(input, { target: { value: '새 서브태스크' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onAddSubtask).toHaveBeenCalledWith('abc', '새 서브태스크')
  })

  it('calls onToggleSubtask when subtask checkbox clicked', () => {
    const onToggleSubtask = vi.fn()
    const todo = makeTodo({
      id: 'p1',
      subtasks: [{ id: 's1', text: '서브', done: false, createdAt: 2000 }],
    })
    render(<TodoItem todo={todo} {...defaultProps} onToggleSubtask={onToggleSubtask} />)
    const checkboxes = screen.getAllByRole('checkbox')
    // Second checkbox is the subtask
    fireEvent.click(checkboxes[1])
    expect(onToggleSubtask).toHaveBeenCalledWith('p1', 's1')
  })

  it('calls onDeleteSubtask when subtask delete button clicked', () => {
    const onDeleteSubtask = vi.fn()
    const todo = makeTodo({
      id: 'p1',
      subtasks: [{ id: 's1', text: '서브', done: false, createdAt: 2000 }],
    })
    render(<TodoItem todo={todo} {...defaultProps} onDeleteSubtask={onDeleteSubtask} />)
    fireEvent.click(screen.getByLabelText('삭제: 서브'))
    expect(onDeleteSubtask).toHaveBeenCalledWith('p1', 's1')
  })
})
