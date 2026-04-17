import type { Todo } from '../lib/todo-store'

import { TodoItem } from './TodoItem'

interface Props {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
  onAddSubtask: (parentId: string, text: string) => void
  onToggleSubtask: (parentId: string, subId: string) => void
  onDeleteSubtask: (parentId: string, subId: string) => void
  onEditSubtask: (parentId: string, subId: string, text: string) => void
}

export function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onEditSubtask,
}: Props) {
  if (todos.length === 0) {
    return (
      <p style={{ color: '#6b6b6b', textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
        할 일이 없습니다.
      </p>
    )
  }

  return (
    <div>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onEditSubtask={onEditSubtask}
        />
      ))}
    </div>
  )
}
