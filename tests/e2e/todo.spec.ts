import { test, expect } from '../fixtures/test'

test.describe('Todo basics', () => {
  test('adds a todo and shows it in the list', async ({ todoPage }) => {
    await todoPage.addTodo('장보기')
    await expect(todoPage.todoText('장보기')).toBeVisible()
  })

  test('adds a todo with the Enter key', async ({ todoPage }) => {
    await todoPage.addTodoWithEnter('독서하기')
    await expect(todoPage.todoText('독서하기')).toBeVisible()
  })

  test('clears the input after adding a todo', async ({ todoPage }) => {
    await todoPage.addTodo('운동하기')
    await expect(todoPage.newTodoInput).toHaveValue('')
  })

  test('does not add an empty todo', async ({ todoPage, page }) => {
    await todoPage.addButton.click()
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(0)
    await expect(todoPage.emptyState).toBeVisible()
  })

  test('marks a todo complete with a strikethrough', async ({ todoPage }) => {
    await todoPage.seedTodo('청소하기')
    await todoPage.todoCheckbox('청소하기').check()
    await expect(todoPage.todoText('청소하기')).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('deletes a todo', async ({ todoPage }) => {
    await todoPage.seedTodo('삭제할 항목')
    await todoPage.deleteButton('삭제할 항목').click()
    await expect(todoPage.todoText('삭제할 항목')).not.toBeVisible()
  })

  test('persists todos after a reload', async ({ todoPage, page }) => {
    await todoPage.seedTodo('유지되는 항목')
    await page.reload()
    await expect(todoPage.todoText('유지되는 항목')).toBeVisible()
  })

  test('updates the remaining count deterministically', async ({ todoPage }) => {
    await todoPage.seedTodo('항목 1')
    await todoPage.seedTodo('항목 2')
    await expect(todoPage.remainingCount(2)).toBeVisible()
    await todoPage.todoCheckbox('항목 1').check()
    await expect(todoPage.remainingCount(1)).toBeVisible()
  })
})
