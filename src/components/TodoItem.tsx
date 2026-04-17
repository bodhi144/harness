// src/components/TodoItem.tsx
import { useState, useRef, useEffect } from 'react'

import type { Todo } from '../lib/todo-store'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [deleteHovered, setDeleteHovered] = useState(false)
  const [editHovered, setEditHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = () => {
    setEditText(todo.text)
    setEditing(true)
  }

  const commitEdit = () => {
    onEdit(todo.id, editText)
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditText(todo.text)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#242424',
        borderRadius: '8px',
        marginBottom: '0.5rem',
      }}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        style={{ accentColor: '#7c6af7', width: '1rem', height: '1rem', cursor: 'pointer' }}
        aria-label={`완료: ${todo.text}`}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') cancelEdit()
          }}
          aria-label={`수정: ${todo.text}`}
          style={{
            flex: 1,
            background: '#1a1a1a',
            border: '1px solid #7c6af7',
            borderRadius: '4px',
            color: '#e0e0e0',
            fontSize: '0.95rem',
            padding: '0.1rem 0.4rem',
            outline: 'none',
          }}
        />
      ) : (
        <span
          style={{
            flex: 1,
            color: todo.done ? '#6b6b6b' : '#e0e0e0',
            textDecoration: todo.done ? 'line-through' : 'none',
            fontSize: '0.95rem',
          }}
        >
          {todo.text}
        </span>
      )}
      {!editing && (
        <button
          onClick={startEdit}
          aria-label={`수정: ${todo.text}`}
          style={{
            background: 'none',
            border: 'none',
            color: editHovered ? '#7c6af7' : '#6b6b6b',
            cursor: 'pointer',
            fontSize: '0.9rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={() => setEditHovered(true)}
          onMouseLeave={() => setEditHovered(false)}
        >
          ✎
        </button>
      )}
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`삭제: ${todo.text}`}
        style={{
          background: 'none',
          border: 'none',
          color: deleteHovered ? '#ff4d4d' : '#6b6b6b',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={() => setDeleteHovered(true)}
        onMouseLeave={() => setDeleteHovered(false)}
      >
        ✕
      </button>
    </div>
  )
}
