import { test, expect } from '@playwright/test'

test.describe('DriverOS Basic Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check if page loads
    await expect(page.locator('h1')).toContainText('Know Your One Thing This Week')
    await expect(page.getByText('5 minutes from now')).toBeVisible()
    
    // Check navigation buttons exist
    await expect(page.getByRole('link', { name: 'Get My 3 Actions' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Deep Dive Audit' })).toBeVisible()
  })
})
