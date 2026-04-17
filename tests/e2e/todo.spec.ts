import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // clear localStorage before each test
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('adds a todo and it appears in the list', async ({ page }) => {
  await page.getByLabel('새 할 일').fill('장보기')
  await page.getByRole('button', { name: '추가' }).click()
  await expect(page.getByText('장보기')).toBeVisible()
})

test('adds a todo with Enter key', async ({ page }) => {
  await page.getByLabel('새 할 일').fill('독서하기')
  await page.getByLabel('새 할 일').press('Enter')
  await expect(page.getByText('독서하기')).toBeVisible()
})

test('input clears after adding', async ({ page }) => {
  await page.getByLabel('새 할 일').fill('운동하기')
  await page.getByRole('button', { name: '추가' }).click()
  await expect(page.getByLabel('새 할 일')).toHaveValue('')
})

test('does not add empty todo', async ({ page }) => {
  await page.getByRole('button', { name: '추가' }).click()
  await expect(page.locator('input[type="checkbox"]')).toHaveCount(0)
})

test('completes a todo — shows strikethrough', async ({ page }) => {
  await page.getByLabel('새 할 일').fill('청소하기')
  await page.getByRole('button', { name: '추가' }).click()
  await page.getByLabel('완료: 청소하기').check()
  const text = page.getByText('청소하기')
  await expect(text).toHaveCSS('text-decoration-line', 'line-through')
})

test('deletes a todo', async ({ page }) => {
  await page.getByLabel('새 할 일').fill('삭제할 항목')
  await page.getByRole('button', { name: '추가' }).click()
  await page.getByLabel('삭제: 삭제할 항목').click()
  await expect(page.getByText('삭제할 항목')).not.toBeVisible()
})

test('persists todos after page reload', async ({ page }) => {
  await page.getByLabel('새 할 일').fill('유지되는 항목')
  await page.getByRole('button', { name: '추가' }).click()
  await page.reload()
  await expect(page.getByText('유지되는 항목')).toBeVisible()
})

test('remaining count updates correctly', async ({ page }) => {
  await page.getByLabel('새 할 일').fill('항목 1')
  await page.getByRole('button', { name: '추가' }).click()
  await page.getByLabel('새 할 일').fill('항목 2')
  await page.getByRole('button', { name: '추가' }).click()
  await expect(page.getByText('2개 남음')).toBeVisible()
  await page.getByLabel('완료: 항목 1').check()
  await expect(page.getByText('1개 남음')).toBeVisible()
})
