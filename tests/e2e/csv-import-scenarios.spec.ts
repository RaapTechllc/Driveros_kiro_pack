import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('CSV Import Scenarios', () => {
  const fixturesPath = path.join(__dirname, 'fixtures', 'test-csvs')

  test.beforeEach(async ({ page }) => {
    await page.goto('/import')
    // Wait for page to be ready
    await page.waitForLoadState('networkidle')
  })

  test('successful actions CSV import', async ({ page }) => {
    // Click Import Actions button
    await page.getByRole('button', { name: 'Import Actions' }).click()
    
    // Upload valid actions file
    const validActionsPath = path.join(fixturesPath, 'valid-actions.csv')
    await page.locator('input[type="file"]').setInputFiles(validActionsPath)
    await page.getByRole('button', { name: 'Upload CSV' }).click()
    
    // Wait for validation and proceed
    await page.waitForSelector('[data-testid="success-message"]')
    await page.getByRole('button', { name: /Import \d+ actions/ }).click()
    
    // Verify final success
    await expect(page.locator('[data-testid="final-success-message"]')).toBeVisible()
    await expect(page.getByText('Successfully imported')).toBeVisible()
  })

  test('successful goals CSV import', async ({ page }) => {
    // Click Import Goals button
    await page.getByRole('button', { name: 'Import Goals' }).click()
    
    // Upload valid goals file
    const validGoalsPath = path.join(fixturesPath, 'valid-goals.csv')
    await page.locator('input[type="file"]').setInputFiles(validGoalsPath)
    await page.getByRole('button', { name: 'Upload CSV' }).click()
    
    // Wait for validation and proceed
    await page.waitForSelector('[data-testid="success-message"]')
    await page.getByRole('button', { name: /Import \d+ goals/ }).click()
    
    // Verify final success
    await expect(page.locator('[data-testid="final-success-message"]')).toBeVisible()
    await expect(page.getByText('Successfully imported')).toBeVisible()
  })

  test('invalid headers error handling', async ({ page }) => {
    // Click Import Actions button
    await page.getByRole('button', { name: 'Import Actions' }).click()
    
    // Upload file with invalid headers
    const invalidHeadersPath = path.join(fixturesPath, 'invalid-headers.csv')
    await page.locator('input[type="file"]').setInputFiles(invalidHeadersPath)
    await page.getByRole('button', { name: 'Upload CSV' }).click()
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.getByText('Validation Failed')).toBeVisible()
    await expect(page.getByText('Missing required header: title')).toBeVisible()
  })

  test('invalid data error handling', async ({ page }) => {
    // Click Import Actions button
    await page.getByRole('button', { name: 'Import Actions' }).click()
    
    // Upload file with invalid data
    const invalidDataPath = path.join(fixturesPath, 'invalid-data.csv')
    await page.locator('input[type="file"]').setInputFiles(invalidDataPath)
    await page.getByRole('button', { name: 'Upload CSV' }).click()
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.getByText('Validation Failed')).toBeVisible()
    await expect(page.getByText('rows have errors')).toBeVisible()
  })

  test('template download button visible', async ({ page }) => {
    // Click Import Actions button
    await page.getByRole('button', { name: 'Import Actions' }).click()
    
    // Verify template download button is visible
    await expect(page.getByRole('button', { name: 'Download Template' })).toBeVisible()
  })

  test('empty file handling', async ({ page }) => {
    // Click Import Actions button
    await page.getByRole('button', { name: 'Import Actions' }).click()
    
    // Upload empty CSV file
    const emptyPath = path.join(fixturesPath, 'empty.csv')
    await page.locator('input[type="file"]').setInputFiles(emptyPath)
    await page.getByRole('button', { name: 'Upload CSV' }).click()
    
    // Verify error is shown
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('round-trip import flow', async ({ page }) => {
    // Click Import Actions button
    await page.getByRole('button', { name: 'Import Actions' }).click()
    
    // Upload valid actions file
    const validActionsPath = path.join(fixturesPath, 'valid-actions.csv')
    await page.locator('input[type="file"]').setInputFiles(validActionsPath)
    await page.getByRole('button', { name: 'Upload CSV' }).click()
    
    // Wait for validation and proceed
    await page.waitForSelector('[data-testid="success-message"]')
    await page.getByRole('button', { name: /Import \d+ actions/ }).click()
    
    // Verify success and can navigate to dashboard
    await expect(page.locator('[data-testid="final-success-message"]')).toBeVisible()
    await expect(page.getByRole('link', { name: 'View Dashboard' })).toBeVisible()
  })

  test('large file import', async ({ page }) => {
    // Click Import Actions button
    await page.getByRole('button', { name: 'Import Actions' }).click()
    
    // Upload large CSV file
    const largePath = path.join(fixturesPath, 'large-actions.csv')
    await page.locator('input[type="file"]').setInputFiles(largePath)
    await page.getByRole('button', { name: 'Upload CSV' }).click()
    
    // Wait for validation and proceed
    await page.waitForSelector('[data-testid="success-message"]')
    await page.getByRole('button', { name: /Import \d+ actions/ }).click()
    
    // Verify success
    await expect(page.locator('[data-testid="final-success-message"]')).toBeVisible()
  })
})
