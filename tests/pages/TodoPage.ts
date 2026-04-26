import { expect, type Locator, type Page } from '@playwright/test'

export class TodoPage {
  readonly page: Page
  readonly newTodoInput: Locator
  readonly addButton: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.newTodoInput = page.getByLabel('새 할 일')
    this.addButton = page.getByRole('button', { name: '추가' })
    this.emptyState = page.getByText('할 일이 없습니다.')
  }

  async goto() {
    await this.page.goto('/')
  }

  async resetApp() {
    await this.page.evaluate(() => window.localStorage.clear())
    await this.page.reload()
    await expect(this.newTodoInput).toBeVisible()
  }

  todoText(text: string) {
    return this.page.getByText(text)
  }

  remainingCount(count: number) {
    return this.page.getByText(`${count}개 남음`)
  }

  todoCheckbox(text: string) {
    return this.page.getByLabel(`완료: ${text}`)
  }

  deleteButton(text: string) {
    return this.page.getByLabel(`삭제: ${text}`)
  }

  editButton(text: string) {
    return this.page.getByRole('button', { name: `수정: ${text}` })
  }

  editInput(text: string) {
    return this.page.getByLabel(`수정: ${text}`)
  }

  addSubtaskButton(text: string) {
    return this.page.getByLabel(`서브태스크: ${text}`)
  }

  get subtaskInput() {
    return this.page.getByLabel('서브태스크 입력')
  }

  get confirmSubtaskButton() {
    return this.page.getByLabel('서브태스크 추가 확인')
  }

  get cancelSubtaskButton() {
    return this.page.getByLabel('서브태스크 추가 취소')
  }

  async addTodo(text: string) {
    await this.newTodoInput.fill(text)
    await this.addButton.click()
  }

  async addTodoWithEnter(text: string) {
    await this.newTodoInput.fill(text)
    await this.newTodoInput.press('Enter')
  }

  async seedTodo(text: string) {
    await this.addTodo(text)
    await expect(this.todoText(text)).toBeVisible()
  }

  async startEditingTodo(text: string) {
    await this.editButton(text).click()
    await expect(this.editInput(text)).toBeVisible()
  }

  async saveTodoEdit(currentText: string, nextText: string, trigger: 'Enter' | 'blur' = 'Enter') {
    const input = this.editInput(currentText)
    await input.fill(nextText)

    if (trigger === 'blur') {
      await input.blur()
      return
    }

    await input.press(trigger)
  }

  async cancelTodoEdit(currentText: string, nextText: string) {
    const input = this.editInput(currentText)
    await input.fill(nextText)
    await input.press('Escape')
  }

  async openSubtaskComposer(parentText: string) {
    await this.addSubtaskButton(parentText).click()
    await expect(this.subtaskInput).toBeVisible()
  }

  async addSubtask(text: string, submitWith: 'Enter' | 'button' | 'Shift+Enter' = 'Enter') {
    await this.subtaskInput.fill(text)

    if (submitWith === 'button') {
      await this.confirmSubtaskButton.click()
      return
    }

    await this.subtaskInput.press(submitWith)
  }

  async cancelSubtask(text: string, cancelWith: 'Escape' | 'button' = 'Escape') {
    await this.subtaskInput.fill(text)

    if (cancelWith === 'button') {
      await this.cancelSubtaskButton.click()
      return
    }

    await this.subtaskInput.press(cancelWith)
  }

  async startEditingSubtask(text: string) {
    await this.page.getByLabel(`수정: ${text}`).click()
    await expect(this.editInput(text)).toBeVisible()
  }
}
