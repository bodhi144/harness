// src/components/TodoItem.tsx
import type { Todo } from '../lib/todo-store'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: Props) {
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
      <button
        onClick={() => onDelete(todo.id)}
        aria-label={`삭제: ${todo.text}`}
        style={{
          background: 'none',
          border: 'none',
          color: '#6b6b6b',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ff4d4d')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6b6b6b')}
      >
        ✕
      </button>
    </div>
  )
}
