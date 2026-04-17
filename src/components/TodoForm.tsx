import React, { useState } from 'react'

interface Props {
  onAdd: (text: string) => void
}

export function TodoForm({ onAdd }: Props) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    onAdd(text)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit()
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="할 일을 입력하세요..."
        aria-label="새 할 일"
        style={{
          flex: 1,
          padding: '0.6rem 0.9rem',
          borderRadius: '8px',
          border: '1px solid #333',
          background: '#242424',
          color: '#e0e0e0',
          fontSize: '0.95rem',
          outline: 'none',
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          border: 'none',
          background: '#7c6af7',
          color: '#fff',
          fontSize: '0.95rem',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        추가
      </button>
    </div>
  )
}
