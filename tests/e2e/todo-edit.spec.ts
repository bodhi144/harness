import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  // seed one todo
  await page.getByLabel('새 할 일').fill('원래 할 일')
  await page.getByRole('button', { name: '추가' }).click()
  await expect(page.getByText('원래 할 일')).toBeVisible()
})

test('edit button shows inline input with current text', async ({ page }) => {
  await page.getByRole('button', { name: '수정: 원래 할 일' }).click()
  const input = page.getByLabel('수정: 원래 할 일')
  await expect(input).toBeVisible()
  await expect(input).toHaveValue('원래 할 일')
})

test('edit and save with Enter updates the todo text', async ({ page }) => {
  await page.getByRole('button', { name: '수정: 원래 할 일' }).click()
  const input = page.getByLabel('수정: 원래 할 일')
  await input.fill('수정된 할 일')
  await input.press('Enter')
  await expect(page.getByText('수정된 할 일')).toBeVisible()
  await expect(page.getByText('원래 할 일')).not.toBeVisible()
})

test('edit and save on blur updates the todo text', async ({ page }) => {
  await page.getByRole('button', { name: '수정: 원래 할 일' }).click()
  const input = page.getByLabel('수정: 원래 할 일')
  await input.fill('blur로 저장')
  await input.blur()
  await expect(page.getByText('blur로 저장')).toBeVisible()
})

test('Escape cancels edit and restores original text', async ({ page }) => {
  await page.getByRole('button', { name: '수정: 원래 할 일' }).click()
  const input = page.getByLabel('수정: 원래 할 일')
  await input.fill('취소할 내용')
  await input.press('Escape')
  await expect(page.getByText('원래 할 일')).toBeVisible()
  await expect(page.getByText('취소할 내용')).not.toBeVisible()
})

test('edited text persists after page reload', async ({ page }) => {
  await page.getByRole('button', { name: '수정: 원래 할 일' }).click()
  const input = page.getByLabel('수정: 원래 할 일')
  await input.fill('저장되는 수정')
  await input.press('Enter')
  await page.reload()
  await expect(page.getByText('저장되는 수정')).toBeVisible()
})
