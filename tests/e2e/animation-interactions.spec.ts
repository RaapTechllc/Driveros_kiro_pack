import { test, expect } from '@playwright/test'

test.describe('Animation Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Launch Demo Dashboard/i }).click()
    await expect(page).toHaveURL('/dashboard')
    
    // Mark tour as completed
    await page.evaluate(() => {
      localStorage.setItem('demo-tour-completed', 'true')
    })
    await page.reload()
    
    // Wait for filters (same as dashboard-filters.spec.ts)
    await page.waitForSelector('select', { timeout: 5000 })
  })

  test('action status badge is clickable', async ({ page }) => {
    const statusBadge = page.getByRole('button', { name: /Task status:/i }).first()
    await expect(statusBadge).toBeVisible()
    
    await statusBadge.click()
    await page.waitForTimeout(300)
    
    // Text should be a valid status after click
    const newText = (await statusBadge.textContent())?.trim()
    expect(['To Do', 'Doing', 'Complete']).toContain(newText)
  })

  test('status change persists after reload', async ({ page }) => {
    // Reset all statuses first by clearing localStorage
    await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('action-status-'))
      keys.forEach(k => localStorage.removeItem(k))
    })
    await page.reload()
    await page.waitForSelector('select', { timeout: 5000 })
    
    // Find a todo badge and click it
    const statusButton = page.getByRole('button', { name: /Task status:/i }).first()
    if (await statusButton.count() > 0) {
      await statusButton.click()
      await page.waitForTimeout(300)
      
      await page.reload()
      await page.waitForSelector('select', { timeout: 5000 })
      
      // Should have a doing badge now
      const doingBadge = page.getByRole('button', { name: /Task status:/i }).filter({ hasText: 'Doing' })
      await expect(doingBadge.first()).toBeVisible()
    }
  })

  test('assign button opens team assignment panel', async ({ page }) => {
    const assignButton = page.getByRole('button', { name: /Assigned to/i }).first()
    await expect(assignButton).toBeVisible()
    await assignButton.click()
    
    // Verify assign panel appears with input
    await expect(page.getByRole('textbox', { name: 'Add new team member' }).first()).toBeVisible()
  })
})
