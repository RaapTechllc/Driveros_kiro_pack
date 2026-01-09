import { Page, Locator } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly flashScanButton: Locator
  readonly fullAuditButton: Locator

  constructor(page: Page) {
    this.page = page
    this.flashScanButton = page.getByRole('link', { name: 'Start Flash Scan' })
    this.fullAuditButton = page.getByRole('link', { name: 'Full Audit' })
  }

  async goto() {
    await this.page.goto('/')
  }

  async startFlashScan() {
    await this.flashScanButton.click()
  }

  async startFullAudit() {
    await this.fullAuditButton.click()
  }
}

export class FlashScanPage {
  readonly page: Page
  readonly industrySelect: Locator
  readonly sizeSelect: Locator
  readonly roleSelect: Locator
  readonly northStarInput: Locator
  readonly constraintInput: Locator
  readonly submitButton: Locator
  readonly upgradeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.industrySelect = page.locator('select[name="industry"]')
    this.sizeSelect = page.locator('select[name="size_band"]')
    this.roleSelect = page.locator('select[name="role"]')
    this.northStarInput = page.locator('input[name="north_star"]')
    this.constraintInput = page.locator('input[aria-label="Biggest Constraint"], input[placeholder*="blocking"]')
    // Fallback if name attr is missing on input, component showed Input without name prop
    // Actually Component code: <Input ... value={formData.top_constraint} ...>
    // It doesn't have a name attribute!
    // I should check the component code again or add name attribute.
    // Component code: <Input placeholder="What's blocking you most right now?" ... />
    // It has no name attribute. I'll rely on the placeholder.
    this.submitButton = page.getByRole('button', { name: 'Get Instant Analysis' })
    this.upgradeButton = page.getByRole('link', { name: 'Upgrade to Full Audit' })
  }

  async fillForm(data: {
    industry: string
    size_band: string
    role: string
    north_star: string
    top_constraint: string
  }) {
    await this.industrySelect.selectOption(data.industry)
    await this.sizeSelect.selectOption(data.size_band)
    await this.roleSelect.selectOption(data.role)
    await this.northStarInput.fill(data.north_star)
    await this.constraintInput.fill(data.top_constraint)
  }

  async submit() {
    await this.submitButton.click()
  }

  async upgradeToFullAudit() {
    await this.upgradeButton.click()
  }
}

export class FullAuditPage {
  readonly page: Page
  readonly submitButton: Locator
  readonly dashboardButton: Locator

  constructor(page: Page) {
    this.page = page
    // Matches "Generate Full Analysis" when ready, or we can use a regex or ID if needed.
    // Given the component logic, it shows "Generate Full Analysis" when complete.
    this.submitButton = page.getByRole('button', { name: 'Generate Full Analysis' })
    this.dashboardButton = page.getByRole('link', { name: 'Go to Dashboard' })
  }

  async fillForm(data: Record<string, number>) {
    // Fill all audit form fields
    for (const [key, value] of Object.entries(data)) {
      const select = this.page.locator(`select[name="${key}"]`)
      await select.selectOption(value.toString())
    }
  }

  async submit() {
    await this.submitButton.click()
  }

  async goToDashboard() {
    await this.dashboardButton.click()
  }
}

export class DashboardPage {
  readonly page: Page
  readonly exportActionsButton: Locator
  readonly exportGoalsButton: Locator
  readonly importDataButton: Locator
  readonly meetingTemplatesButton: Locator
  readonly gearDisplay: Locator
  readonly engineCards: Locator

  constructor(page: Page) {
    this.page = page
    this.exportActionsButton = page.getByRole('button', { name: 'Actions CSV' })
    this.exportGoalsButton = page.getByRole('button', { name: 'Goals CSV' })
    // Use .first() to handle potential duplicates between Sidebar and Dashboard body
    this.importDataButton = page.getByRole('link', { name: 'Import Data' }).first()
    // "Meeting Templates" is unique to the Dashboard card (Sidebar is "Meetings")
    this.meetingTemplatesButton = page.getByRole('link', { name: 'Meeting Templates' })
    // Gear indicator wrapper
    this.gearDisplay = page.locator('[data-tour="gear"]')
    // Engine cards might not have testid, targeting by class logic or title
    this.engineCards = page.locator('.space-y-6[data-tour="engines"] > div > div')
  }

  async exportActions() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.exportActionsButton.click()
    return await downloadPromise
  }

  async exportGoals() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.exportGoalsButton.click()
    return await downloadPromise
  }

  async goToImport() {
    await this.importDataButton.click()
  }

  async goToMeetings() {
    await this.meetingTemplatesButton.click()
  }
}

export class ImportPage {
  readonly page: Page
  readonly importActionsButton: Locator
  readonly importGoalsButton: Locator
  readonly downloadTemplateButton: Locator
  readonly fileInput: Locator
  readonly uploadButton: Locator
  readonly successMessage: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.importActionsButton = page.getByRole('button', { name: 'Import Actions' })
    this.importGoalsButton = page.getByRole('button', { name: 'Import Goals' })
    this.downloadTemplateButton = page.getByRole('button', { name: 'Download Template' }).first()
    this.fileInput = page.locator('input[type="file"]')
    this.uploadButton = page.getByRole('button', { name: 'Upload CSV' })
    this.successMessage = page.locator('[data-testid="final-success-message"]')
    this.errorMessage = page.locator('[data-testid="error-message"]')
  }

  async selectActionsImport() {
    await this.importActionsButton.click()
  }

  async selectGoalsImport() {
    await this.importGoalsButton.click()
  }

  async downloadTemplate() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.downloadTemplateButton.click()
    return await downloadPromise
  }

  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath)
    await this.uploadButton.click()
  }

  async proceedWithImport() {
    // Click the "Import X actions/goals" button after validation success
    const importButton = this.page.getByRole('button', { name: /Import \d+ (actions|goals)/ })
    await importButton.click()
  }

  async dragAndDropFile(filePath: string) {
    // Create a file input element for drag and drop simulation
    await this.page.evaluate(() => {
      const input = document.createElement('input')
      input.type = 'file'
      input.style.display = 'none'
      document.body.appendChild(input)
    })

    await this.page.locator('input[type="file"]').last().setInputFiles(filePath)

    // Simulate drag and drop to the drop zone
    const dropZone = this.page.locator('[data-testid="drop-zone"]')
    await dropZone.dispatchEvent('drop', {
      dataTransfer: {
        files: [{ name: filePath.split('/').pop() }]
      }
    })
  }

  async waitForSuccess() {
    await this.successMessage.waitFor({ state: 'visible' })
  }

  async waitForError() {
    await this.errorMessage.waitFor({ state: 'visible' })
  }

  async getErrorText() {
    return await this.errorMessage.textContent()
  }
}

export class MeetingsPage {
  readonly page: Page
  readonly warmUpButton: Locator
  readonly pitStopButton: Locator
  readonly fullTuneUpButton: Locator

  constructor(page: Page) {
    this.page = page
    this.warmUpButton = page.getByRole('button', { name: 'Start Meeting' }).first()
    this.pitStopButton = page.getByRole('button', { name: 'Start Meeting' }).nth(1)
    this.fullTuneUpButton = page.getByRole('button', { name: 'Start Meeting' }).nth(2)
  }

  async startWarmUp() {
    await this.warmUpButton.click()
  }

  async startPitStop() {
    await this.pitStopButton.click()
  }

  async startFullTuneUp() {
    await this.fullTuneUpButton.click()
  }
}
