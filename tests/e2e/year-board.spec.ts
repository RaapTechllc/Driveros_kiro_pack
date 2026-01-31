import { test, expect } from '@playwright/test'
import { YearBoardPage } from './helpers/page-objects'

test.describe('Year Board', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure clean state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('demo-mode')
      const keys = Object.keys(localStorage).filter(k =>
        k.includes('year-plan') || k.includes('year-items')
      )
      keys.forEach(k => localStorage.removeItem(k))
    })
    await page.goto('/year-board')
  })

  test('should load Year Board page with empty state', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Should show empty state
    await expect(yearBoard.emptyState).toBeVisible()
    await expect(yearBoard.generateButton).toBeVisible()
    await expect(page.getByText('Year Board Preview')).toBeVisible()
  })

  test('should show navigation in sidebar', async ({ page }) => {
    await page.goto('/dashboard')

    // Should see Year Board link in sidebar
    await expect(page.getByRole('link', { name: 'Year Board' })).toBeVisible()

    // Click to navigate
    await page.getByRole('link', { name: 'Year Board' }).click()

    // Should be on Year Board page
    await expect(page).toHaveURL('/year-board')
  })

  test('should generate year plan successfully', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Click generate button
    await yearBoard.generateYearPlan()

    // Should show the year plan board
    await expect(page.getByText('2026 Year Plan')).toBeVisible()

    // Should have quarter columns
    await expect(page.getByText('Q1', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Q2', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Q3', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Q4', { exact: true }).first()).toBeVisible()

    // Should have generated some cards
    const cardCount = await yearBoard.getCardCount()
    expect(cardCount).toBeGreaterThan(0)
  })

  test('should persist plan in localStorage', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Generate the plan
    await yearBoard.generateYearPlan()

    // Wait for cards to appear
    await page.waitForSelector('[role="button"][draggable="true"]')

    // Check localStorage has data
    const yearPlan = await yearBoard.getLocalStorageYearPlan()
    const yearItems = await yearBoard.getLocalStorageYearItems()

    expect(yearPlan).not.toBeNull()
    expect(yearPlan.north_star_goal_id).toBeDefined()
    expect(yearItems.length).toBeGreaterThan(0)

    // Reload page and verify persistence
    await page.reload()

    // Board should still be visible (not empty state)
    await expect(page.getByText('2026 Year Plan')).toBeVisible()
    const cardCountAfterReload = await yearBoard.getCardCount()
    expect(cardCountAfterReload).toBeGreaterThan(0)
  })

  test('should add new card via modal', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Generate plan first to get the board
    await yearBoard.generateYearPlan()

    const itemsBefore = await yearBoard.getLocalStorageYearItems()

    // Add a new card
    await yearBoard.addCard({
      title: 'E2E Test Card',
      rationale: 'Testing the add card functionality',
      type: 'milestone',
      department: 'company',
      quarter: 2,
      status: 'planned'
    })

    // Verify card content is visible
    await expect(page.getByText('E2E Test Card')).toBeVisible()
    await expect(page.getByText('Testing the add card functionality')).toBeVisible()

    const itemsAfter = await yearBoard.getLocalStorageYearItems()
    expect(itemsAfter.length).toBe(itemsBefore.length + 1)
  })

  test('should edit card via context menu', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Generate plan first
    await yearBoard.generateYearPlan()

    // Add a card with known title
    await yearBoard.addCard({
      title: 'Card to Edit',
      rationale: 'Original rationale',
      type: 'play',
      quarter: 1
    })

    // Verify card exists
    await expect(page.getByText('Card to Edit')).toBeVisible()

    // Edit the card
    await yearBoard.editCard('Card to Edit', 'Edited Card Title')

    // Verify edit worked
    await expect(page.getByText('Edited Card Title')).toBeVisible()
    await expect(page.getByText('Card to Edit')).not.toBeVisible()
  })

  test('should delete card via context menu', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Generate plan first
    await yearBoard.generateYearPlan()

    // Add a card to delete
    await yearBoard.addCard({
      title: 'Card to Delete',
      rationale: 'This card will be deleted',
      type: 'ritual',
      quarter: 3
    })

    // Verify card exists
    await expect(page.getByText('Card to Delete')).toBeVisible()
    const countBefore = await yearBoard.getCardCount()

    // Set up dialog handler before triggering delete
    page.once('dialog', dialog => dialog.accept())

    // Delete the card
    await yearBoard.deleteCard('Card to Delete')

    // Wait for card to be removed
    await expect(page.getByText('Card to Delete')).not.toBeVisible({ timeout: 5000 })

    // Verify count decreased
    const countAfter = await yearBoard.getCardCount()
    expect(countAfter).toBe(countBefore - 1)
  })

  test('should change card status via context menu', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Generate plan first
    await yearBoard.generateYearPlan()

    // Add a card with planned status
    await yearBoard.addCard({
      title: 'Status Test Card',
      rationale: 'Testing status change',
      type: 'milestone',
      quarter: 1,
      status: 'planned'
    })

    // Verify initial status
    const card = await yearBoard.getCardByTitle('Status Test Card')
    await expect(card.getByText('planned')).toBeVisible()

    // Change status to active
    await yearBoard.changeCardStatus('Status Test Card', 'active')

    // Verify status changed
    await expect(card.getByText('active')).toBeVisible()

    // Change to done
    await yearBoard.changeCardStatus('Status Test Card', 'done')
    await expect(card.getByText('done')).toBeVisible()
  })

  test('should drag card between quarters', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Generate plan first
    await yearBoard.generateYearPlan()

    // Add a card in Q1
    await yearBoard.addCard({
      title: 'Draggable Card',
      rationale: 'Testing drag and drop',
      type: 'play',
      department: 'ops',
      quarter: 1,
      status: 'planned'
    })

    // Get initial localStorage state
    const itemsBefore = await yearBoard.getLocalStorageYearItems()
    const cardBefore = itemsBefore.find(i => i.title === 'Draggable Card')
    expect(cardBefore?.quarter).toBe(1)

    // Drag card to Q3
    await yearBoard.dragCard('Draggable Card', 3)

    // Wait for state to update
    await page.waitForTimeout(500)

    // Verify localStorage updated
    const itemsAfter = await yearBoard.getLocalStorageYearItems()
    const cardAfter = itemsAfter.find(i => i.title === 'Draggable Card')
    expect(cardAfter?.quarter).toBe(3)
  })

  test('should export CSV', async ({ page }) => {
    const yearBoard = new YearBoardPage(page)
    await yearBoard.goto()

    // Generate plan first
    await yearBoard.generateYearPlan()

    // Wait for cards
    await page.waitForSelector('[role="button"][draggable="true"]')

    // Click export button and wait for download
    const downloadPromise = page.waitForEvent('download')
    await yearBoard.exportCsvButton.click()
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toContain('YearBoard')
    expect(download.suggestedFilename()).toContain('.csv')
  })
})
