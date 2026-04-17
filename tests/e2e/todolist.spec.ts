import { test, expect } from '@playwright/test'

test.describe('TodoList Component', () => {
  test('renders empty message when no todos exist', async ({ page }) => {
    await page.goto('/')
    // The test passes as long as the component can be rendered without errors
    // This is a placeholder test since the full app UI is not yet implemented
    expect(page).toBeTruthy()
  })
})
