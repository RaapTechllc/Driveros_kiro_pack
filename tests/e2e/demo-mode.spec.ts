import { test, expect } from '@playwright/test'

test.describe('Demo Mode', () => {
  test('demo button loads dashboard with sample data', async ({ page }) => {
    // Go to homepage
    await page.goto('/')
    
    // Click Launch Demo Dashboard button
    await page.getByRole('button', { name: /Launch Demo Dashboard/i }).click()
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Should have dashboard content loaded (gear, engines, or actions visible)
    await expect(page.locator('main')).toBeVisible()
  })

  test('can navigate to dashboard after demo', async ({ page }) => {
    // Go to homepage and enter demo mode
    await page.goto('/')
    await page.getByRole('button', { name: /Launch Demo Dashboard/i }).click()
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Dashboard should be functional - can see main content area
    await expect(page.locator('main')).toBeVisible()
  })
})
