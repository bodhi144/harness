import { useState } from 'react'

import { TodoForm } from '../components/TodoForm'
import { TodoList } from '../components/TodoList'
import {
  load,
  save,
  addTodo,
  toggleTodo,
  deleteTodo,
  editTodo,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  editSubtask,
} from '../lib/todo-store'

export function TodoPage() {
  const [todos, setTodos] = useState(load)

  const mutate = (next: ReturnType<typeof load>) => {
    setTodos(next)
    save(next)
  }

  const handleAdd = (text: string) => mutate(addTodo(todos, text))
  const handleToggle = (id: string) => mutate(toggleTodo(todos, id))
  const handleDelete = (id: string) => mutate(deleteTodo(todos, id))
  const handleEdit = (id: string, text: string) => mutate(editTodo(todos, id, text))

  const handleAddSubtask = (parentId: string, text: string) => mutate(addSubtask(todos, parentId, text))
  const handleToggleSubtask = (parentId: string, subId: string) => mutate(toggleSubtask(todos, parentId, subId))
  const handleDeleteSubtask = (parentId: string, subId: string) => mutate(deleteSubtask(todos, parentId, subId))
  const handleEditSubtask = (parentId: string, subId: string, text: string) =>
    mutate(editSubtask(todos, parentId, subId, text))

  const remaining = todos.filter(t => !t.done).length

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '3rem auto',
        padding: '0 1rem',
      }}
    >
      <h1
        style={{
          color: '#e0e0e0',
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          letterSpacing: '-0.5px',
        }}
      >
        Todo
      </h1>
      <TodoForm onAdd={handleAdd} />
      <TodoList
        todos={todos}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onEditSubtask={handleEditSubtask}
      />
      {todos.length > 0 && (
        <p
          style={{
            color: '#6b6b6b',
            fontSize: '0.8rem',
            marginTop: '1rem',
            textAlign: 'right',
          }}
        >
          {remaining}개 남음
        </p>
      )}
    </div>
  )
}
