// src/components/TodoItem.tsx
import { useState, useRef, useEffect } from 'react'

import type { Todo, SubTodo } from '../lib/todo-store'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
  onAddSubtask: (parentId: string, text: string) => void
  onToggleSubtask: (parentId: string, subId: string) => void
  onDeleteSubtask: (parentId: string, subId: string) => void
  onEditSubtask: (parentId: string, subId: string, text: string) => void
}

interface SubtaskItemProps {
  parentId: string
  sub: SubTodo
  onToggle: (parentId: string, subId: string) => void
  onDelete: (parentId: string, subId: string) => void
  onEdit: (parentId: string, subId: string, text: string) => void
}

function SubtaskItem({ parentId, sub, onToggle, onDelete, onEdit }: SubtaskItemProps) {
  const [deleteHovered, setDeleteHovered] = useState(false)
  const [editHovered, setEditHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(sub.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = () => {
    setEditText(sub.text)
    setEditing(true)
  }

  const commitEdit = () => {
    onEdit(parentId, sub.id, editText)
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditText(sub.text)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.75rem',
        background: '#1e1e1e',
        borderRadius: '6px',
        marginBottom: '0.25rem',
      }}
    >
      <input
        type="checkbox"
        checked={sub.done}
        onChange={() => onToggle(parentId, sub.id)}
        style={{ accentColor: '#7c6af7', width: '0.85rem', height: '0.85rem', cursor: 'pointer' }}
        aria-label={`완료: ${sub.text}`}
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
          aria-label={`수정: ${sub.text}`}
          style={{
            flex: 1,
            background: '#1a1a1a',
            border: '1px solid #7c6af7',
            borderRadius: '4px',
            color: '#e0e0e0',
            fontSize: '0.85rem',
            padding: '0.1rem 0.4rem',
            outline: 'none',
          }}
        />
      ) : (
        <span
          style={{
            flex: 1,
            color: sub.done ? '#6b6b6b' : '#c0c0c0',
            textDecoration: sub.done ? 'line-through' : 'none',
            fontSize: '0.85rem',
          }}
        >
          {sub.text}
        </span>
      )}
      {!editing && (
        <button
          onClick={startEdit}
          aria-label={`수정: ${sub.text}`}
          style={{
            background: 'none',
            border: 'none',
            color: editHovered ? '#7c6af7' : '#555',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: '0.15rem 0.4rem',
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
        onClick={() => onDelete(parentId, sub.id)}
        aria-label={`삭제: ${sub.text}`}
        style={{
          background: 'none',
          border: 'none',
          color: deleteHovered ? '#ff4d4d' : '#555',
          cursor: 'pointer',
          fontSize: '0.85rem',
          padding: '0.15rem 0.4rem',
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

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onEditSubtask,
}: Props) {
  const [deleteHovered, setDeleteHovered] = useState(false)
  const [editHovered, setEditHovered] = useState(false)
  const [addHovered, setAddHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [subtaskText, setSubtaskText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const subtaskInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  useEffect(() => {
    if (addingSubtask) {
      subtaskInputRef.current?.focus()
    }
  }, [addingSubtask])

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

  const commitAddSubtask = () => {
    if (subtaskText.trim()) {
      onAddSubtask(todo.id, subtaskText)
    }
    setSubtaskText('')
    setAddingSubtask(false)
  }

  const cancelAddSubtask = () => {
    setSubtaskText('')
    setAddingSubtask(false)
  }

  return (
    <div
      style={{
        background: '#242424',
        borderRadius: '8px',
        marginBottom: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
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
          <>
            <button
              onClick={() => setAddingSubtask(true)}
              aria-label={`서브태스크: ${todo.text}`}
              style={{
                background: 'none',
                border: 'none',
                color: addHovered ? '#7c6af7' : '#6b6b6b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={() => setAddHovered(true)}
              onMouseLeave={() => setAddHovered(false)}
            >
              +
            </button>
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
          </>
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

      {(todo.subtasks.length > 0 || addingSubtask) && (
        <div style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingBottom: '0.75rem' }}>
          {todo.subtasks.map(sub => (
            <SubtaskItem
              key={sub.id}
              parentId={todo.id}
              sub={sub}
              onToggle={onToggleSubtask}
              onDelete={onDeleteSubtask}
              onEdit={onEditSubtask}
            />
          ))}
          {addingSubtask && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                ref={subtaskInputRef}
                value={subtaskText}
                onChange={e => setSubtaskText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitAddSubtask()
                  if (e.key === 'Escape') cancelAddSubtask()
                }}
                placeholder="서브태스크 입력..."
                aria-label="서브태스크 입력"
                style={{
                  flex: 1,
                  background: '#1a1a1a',
                  border: '1px solid #7c6af7',
                  borderRadius: '4px',
                  color: '#e0e0e0',
                  fontSize: '0.85rem',
                  padding: '0.3rem 0.5rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={commitAddSubtask}
                aria-label="서브태스크 추가 확인"
                style={{
                  background: '#7c6af7',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.6rem',
                }}
              >
                추가
              </button>
              <button
                onClick={cancelAddSubtask}
                aria-label="서브태스크 추가 취소"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b6b6b',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.5rem',
                }}
              >
                취소
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
