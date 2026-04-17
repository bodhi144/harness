import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { TodoForm } from '../../components/TodoForm'

describe('TodoForm', () => {
  it('calls onAdd with input text when button clicked', () => {
    const onAdd = vi.fn()
    render(<TodoForm onAdd={onAdd} />)
    fireEvent.change(screen.getByLabelText('새 할 일'), { target: { value: '새 할 일' } })
    fireEvent.click(screen.getByRole('button', { name: '추가' }))
    expect(onAdd).toHaveBeenCalledWith('새 할 일')
  })

  it('calls onAdd when Enter key pressed', () => {
    const onAdd = vi.fn()
    render(<TodoForm onAdd={onAdd} />)
    fireEvent.change(screen.getByLabelText('새 할 일'), { target: { value: '엔터 할 일' } })
    fireEvent.keyDown(screen.getByLabelText('새 할 일'), { key: 'Enter' })
    expect(onAdd).toHaveBeenCalledWith('엔터 할 일')
  })

  it('clears input after submit', () => {
    const onAdd = vi.fn()
    render(<TodoForm onAdd={onAdd} />)
    fireEvent.change(screen.getByLabelText('새 할 일'), { target: { value: '지워질 할 일' } })
    fireEvent.click(screen.getByRole('button', { name: '추가' }))
    expect((screen.getByLabelText('새 할 일') as HTMLInputElement).value).toBe('')
  })

  it('does not call onAdd when input is empty', () => {
    const onAdd = vi.fn()
    render(<TodoForm onAdd={onAdd} />)
    fireEvent.click(screen.getByRole('button', { name: '추가' }))
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('does not call onAdd when input is whitespace only', () => {
    const onAdd = vi.fn()
    render(<TodoForm onAdd={onAdd} />)
    fireEvent.change(screen.getByLabelText('새 할 일'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: '추가' }))
    expect(onAdd).not.toHaveBeenCalled()
  })
})
