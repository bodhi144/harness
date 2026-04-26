import { test, expect } from '../fixtures/test'

test.describe('Todo subtasks', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.seedTodo('부모 할 일')
    await todoPage.openSubtaskComposer('부모 할 일')
  })

  test('adds a subtask with Enter', async ({ todoPage }) => {
    await todoPage.addSubtask('서브태스크 A')
    await expect(todoPage.todoText('서브태스크 A')).toBeVisible()
  })

  test('adds a subtask with the confirm button', async ({ todoPage }) => {
    await todoPage.addSubtask('서브태스크 B', 'button')
    await expect(todoPage.todoText('서브태스크 B')).toBeVisible()
  })

  test('cancels a subtask with the cancel button', async ({ todoPage }) => {
    await todoPage.cancelSubtask('취소될 서브태스크', 'button')
    await expect(todoPage.todoText('취소될 서브태스크')).not.toBeVisible()
  })

  test('cancels a subtask with Escape', async ({ todoPage }) => {
    await todoPage.cancelSubtask('Escape 취소')
    await expect(todoPage.todoText('Escape 취소')).not.toBeVisible()
  })

  test('toggles a subtask done and undone', async ({ todoPage }) => {
    await todoPage.addSubtask('토글 서브태스크')
    const subtaskCheckbox = todoPage.todoCheckbox('토글 서브태스크')
    await expect(subtaskCheckbox).not.toBeChecked()
    await subtaskCheckbox.click()
    await expect(subtaskCheckbox).toBeChecked()
    await subtaskCheckbox.click()
    await expect(subtaskCheckbox).not.toBeChecked()
  })

  test('deletes a subtask', async ({ todoPage }) => {
    await todoPage.addSubtask('삭제될 서브태스크')
    await expect(todoPage.todoText('삭제될 서브태스크')).toBeVisible()
    await todoPage.deleteButton('삭제될 서브태스크').click()
    await expect(todoPage.todoText('삭제될 서브태스크')).not.toBeVisible()
  })

  test('edits a subtask inline', async ({ todoPage }) => {
    await todoPage.addSubtask('원래 서브태스크')
    await todoPage.startEditingSubtask('원래 서브태스크')
    await todoPage.saveTodoEdit('원래 서브태스크', '수정된 서브태스크')
    await expect(todoPage.todoText('수정된 서브태스크')).toBeVisible()
    await expect(todoPage.todoText('원래 서브태스크')).not.toBeVisible()
  })

  test('persists subtasks across reload', async ({ todoPage, page }) => {
    await todoPage.addSubtask('지속되는 서브태스크')
    await expect(todoPage.todoText('지속되는 서브태스크')).toBeVisible()
    await page.reload()
    await expect(todoPage.todoText('부모 할 일')).toBeVisible()
    await expect(todoPage.todoText('지속되는 서브태스크')).toBeVisible()
  })

  test('closes the subtask input after Enter', async ({ todoPage }) => {
    await todoPage.addSubtask('하나만')
    await expect(todoPage.todoText('하나만')).toBeVisible()
    await expect(todoPage.subtaskInput).not.toBeVisible()
  })

  test('keeps the subtask input open after Shift+Enter', async ({ todoPage }) => {
    await todoPage.addSubtask('첫 번째', 'Shift+Enter')
    await expect(todoPage.todoText('첫 번째')).toBeVisible()
    await expect(todoPage.subtaskInput).toBeVisible()
    await expect(todoPage.subtaskInput).toBeFocused()
    await expect(todoPage.subtaskInput).toHaveValue('')

    await todoPage.addSubtask('두 번째', 'Shift+Enter')
    await expect(todoPage.todoText('두 번째')).toBeVisible()
    await expect(todoPage.subtaskInput).toBeVisible()

    await todoPage.addSubtask('세 번째')
    await expect(todoPage.todoText('세 번째')).toBeVisible()
    await expect(todoPage.subtaskInput).not.toBeVisible()
  })

  test('keeps parent todos and subtasks independent', async ({ todoPage }) => {
    await todoPage.addSubtask('독립 서브태스크')
    await todoPage.todoCheckbox('부모 할 일').click()
    await expect(todoPage.todoText('독립 서브태스크')).toBeVisible()
    await expect(todoPage.todoCheckbox('독립 서브태스크')).not.toBeChecked()
  })
})
