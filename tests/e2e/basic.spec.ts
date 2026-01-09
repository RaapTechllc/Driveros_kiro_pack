import { test, expect } from '@playwright/test'

test.describe('DriverOS Basic Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check if page loads
    await expect(page.locator('h1')).toContainText('DriverOS')
    await expect(page.getByText('Turn your North Star into weekly wins')).toBeVisible()
    
    // Check navigation buttons exist
    await expect(page.getByRole('link', { name: 'Start Flash Scan' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Full Audit' })).toBeVisible()
  })
})
