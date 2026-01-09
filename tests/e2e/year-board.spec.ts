import { test, expect } from '@playwright/test'

test.describe('Year Board', () => {
  test('should load Year Board page with empty state', async ({ page }) => {
    await page.goto('/year-board')
    
    // Should show empty state
    await expect(page.getByText('Create Your Year Plan')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate my Year Plan' })).toBeVisible()
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
})
