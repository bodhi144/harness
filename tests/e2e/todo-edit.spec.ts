import { test, expect } from '../fixtures/test'

test.describe('Todo editing', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.seedTodo('원래 할 일')
  })

  test('shows the current text in the inline editor', async ({ todoPage }) => {
    await todoPage.startEditingTodo('원래 할 일')
    await expect(todoPage.editInput('원래 할 일')).toHaveValue('원래 할 일')
  })

  test('saves an edit with Enter', async ({ todoPage }) => {
    await todoPage.startEditingTodo('원래 할 일')
    await todoPage.saveTodoEdit('원래 할 일', '수정된 할 일')
    await expect(todoPage.todoText('수정된 할 일')).toBeVisible()
    await expect(todoPage.todoText('원래 할 일')).not.toBeVisible()
  })

  test('saves an edit on blur', async ({ todoPage }) => {
    await todoPage.startEditingTodo('원래 할 일')
    await todoPage.saveTodoEdit('원래 할 일', 'blur로 저장', 'blur')
    await expect(todoPage.todoText('blur로 저장')).toBeVisible()
  })

  test('cancels an edit with Escape', async ({ todoPage }) => {
    await todoPage.startEditingTodo('원래 할 일')
    await todoPage.cancelTodoEdit('원래 할 일', '취소할 내용')
    await expect(todoPage.todoText('원래 할 일')).toBeVisible()
    await expect(todoPage.todoText('취소할 내용')).not.toBeVisible()
  })

  test('persists an edited todo after reload', async ({ todoPage, page }) => {
    await todoPage.startEditingTodo('원래 할 일')
    await todoPage.saveTodoEdit('원래 할 일', '저장되는 수정')
    await page.reload()
    await expect(todoPage.todoText('저장되는 수정')).toBeVisible()
  })
})
