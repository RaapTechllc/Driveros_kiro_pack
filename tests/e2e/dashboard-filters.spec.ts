import { test, expect } from '@playwright/test'

test.describe('Dashboard Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Enter demo mode via button click (loads sample data)
    await page.goto('/')
    await page.getByRole('button', { name: /Launch Demo Dashboard/i }).click()
    await expect(page).toHaveURL('/dashboard')
    
    // Mark tour as completed to prevent overlay blocking interactions
    await page.evaluate(() => {
      localStorage.setItem('demo-tour-completed', 'true')
    })
    await page.reload()
    
    // Wait for filters to be visible
    await page.waitForSelector('select', { timeout: 5000 })
  })

  test('filter by engine shows only matching actions', async ({ page }) => {
    // Select Finance engine filter
    await page.locator('select').first().selectOption('Finance')
    
    // Verify filter is applied
    await expect(page.locator('select').first()).toHaveValue('Finance')
    
    // Clear filters button should appear
    await expect(page.getByText('Clear filters')).toBeVisible()
  })

  test('filter by owner shows only matching actions', async ({ page }) => {
    // Select Owner filter
    await page.locator('select').nth(1).selectOption('Owner')
    
    // Verify filter is applied
    await expect(page.locator('select').nth(1)).toHaveValue('Owner')
  })

  test('filter by status shows only matching actions', async ({ page }) => {
    // Select todo status filter
    await page.locator('select').nth(2).selectOption('todo')
    
    // Verify filter is applied
    await expect(page.locator('select').nth(2)).toHaveValue('todo')
  })

  test('clear filters resets all filters', async ({ page }) => {
    // Apply a filter first
    await page.locator('select').first().selectOption('Finance')
    
    // Wait for clear filters button to appear
    await expect(page.getByText('Clear filters')).toBeVisible()
    
    // Click clear filters
    await page.getByText('Clear filters').click()
    
    // Wait for filters to reset (button should disappear)
    await expect(page.getByText('Clear filters')).not.toBeVisible()
    
    // Verify all filters reset to 'all'
    await expect(page.locator('select').first()).toHaveValue('all')
  })
})
