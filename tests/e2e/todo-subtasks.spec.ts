import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  // Add a parent todo to work with
  await page.getByLabel('새 할 일').fill('부모 할 일')
  await page.getByRole('button', { name: '추가' }).click()
  await expect(page.getByText('부모 할 일')).toBeVisible()
})

test('adds a subtask via + button and Enter', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('서브태스크 A')
  await page.getByLabel('서브태스크 입력').press('Enter')
  await expect(page.getByText('서브태스크 A')).toBeVisible()
})

test('adds a subtask via 추가 button', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('서브태스크 B')
  await page.getByLabel('서브태스크 추가 확인').click()
  await expect(page.getByText('서브태스크 B')).toBeVisible()
})

test('cancels subtask add with 취소 button', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('취소될 서브태스크')
  await page.getByLabel('서브태스크 추가 취소').click()
  await expect(page.getByText('취소될 서브태스크')).not.toBeVisible()
})

test('cancels subtask add with Escape key', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('Escape 취소')
  await page.getByLabel('서브태스크 입력').press('Escape')
  await expect(page.getByText('Escape 취소')).not.toBeVisible()
})

test('toggles a subtask done/undone', async ({ page }) => {
  // Add subtask
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('토글 서브태스크')
  await page.getByLabel('서브태스크 입력').press('Enter')

  const subtaskCheckbox = page.getByLabel('완료: 토글 서브태스크')
  await expect(subtaskCheckbox).not.toBeChecked()
  await subtaskCheckbox.click()
  await expect(subtaskCheckbox).toBeChecked()
  await subtaskCheckbox.click()
  await expect(subtaskCheckbox).not.toBeChecked()
})

test('deletes a subtask', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('삭제될 서브태스크')
  await page.getByLabel('서브태스크 입력').press('Enter')
  await expect(page.getByText('삭제될 서브태스크')).toBeVisible()

  await page.getByLabel('삭제: 삭제될 서브태스크').click()
  await expect(page.getByText('삭제될 서브태스크')).not.toBeVisible()
})

test('edits a subtask inline', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('원래 서브태스크')
  await page.getByLabel('서브태스크 입력').press('Enter')

  await page.getByLabel('수정: 원래 서브태스크').click()
  const editInput = page.getByLabel('수정: 원래 서브태스크')
  await editInput.fill('수정된 서브태스크')
  await editInput.press('Enter')
  await expect(page.getByText('수정된 서브태스크')).toBeVisible()
  await expect(page.getByText('원래 서브태스크')).not.toBeVisible()
})

test('subtasks persist across page reload', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('지속되는 서브태스크')
  await page.getByLabel('서브태스크 입력').press('Enter')
  await expect(page.getByText('지속되는 서브태스크')).toBeVisible()

  await page.reload()
  await expect(page.getByText('부모 할 일')).toBeVisible()
  await expect(page.getByText('지속되는 서브태스크')).toBeVisible()
})

test('Enter closes subtask input after adding', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('하나만')
  await page.getByLabel('서브태스크 입력').press('Enter')
  await expect(page.getByText('하나만')).toBeVisible()
  await expect(page.getByLabel('서브태스크 입력')).not.toBeVisible()
})

test('Shift+Enter adds subtask and keeps input open', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  const input = page.getByLabel('서브태스크 입력')
  await input.fill('첫 번째')
  await input.press('Shift+Enter')
  await expect(page.getByText('첫 번째')).toBeVisible()
  await expect(input).toBeVisible()
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('')

  await input.fill('두 번째')
  await input.press('Shift+Enter')
  await expect(page.getByText('두 번째')).toBeVisible()
  await expect(input).toBeVisible()

  await input.fill('세 번째')
  await input.press('Enter')
  await expect(page.getByText('세 번째')).toBeVisible()
  await expect(input).not.toBeVisible()
})

test('parent todo and subtask are independent', async ({ page }) => {
  await page.getByLabel('서브태스크: 부모 할 일').click()
  await page.getByLabel('서브태스크 입력').fill('독립 서브태스크')
  await page.getByLabel('서브태스크 입력').press('Enter')

  // Toggle parent
  await page.getByLabel('완료: 부모 할 일').click()
  // Subtask should still be visible and independently togglable
  await expect(page.getByText('독립 서브태스크')).toBeVisible()
  const subCheckbox = page.getByLabel('완료: 독립 서브태스크')
  await expect(subCheckbox).not.toBeChecked()
})
