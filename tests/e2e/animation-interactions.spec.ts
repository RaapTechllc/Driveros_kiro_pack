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
    // Find a status badge within action cards (not the Exit Demo button)
    const actionCard = page.locator('.border-2.rounded-2xl.p-4').first()
    const statusBadge = actionCard.locator('button.rounded-full', { hasText: /^(todo|doing|done)$/ }).first()
    await expect(statusBadge).toBeVisible()
    
    await statusBadge.click()
    await page.waitForTimeout(300)
    
    // Text should be a valid status after click
    const newText = (await statusBadge.textContent())?.trim()
    expect(['todo', 'doing', 'done']).toContain(newText)
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
    const todoBadge = page.locator('button.rounded-full.text-xs', { hasText: 'todo' }).first()
    if (await todoBadge.count() > 0) {
      await todoBadge.click()
      await page.waitForTimeout(300)
      
      await page.reload()
      await page.waitForSelector('select', { timeout: 5000 })
      
      // Should have a doing badge now
      const doingBadge = page.locator('button.rounded-full.text-xs', { hasText: 'doing' })
      await expect(doingBadge.first()).toBeVisible()
    }
  })

  test('assign button opens team assignment panel', async ({ page }) => {
    const assignButton = page.locator('button', { hasText: 'assign' }).first()
    await expect(assignButton).toBeVisible()
    await assignButton.click()
    
    // Verify assign panel appears with input
    await expect(page.locator('input[placeholder="New team member"]').first()).toBeVisible()
  })
})
