import { test, expect } from '@playwright/test'

test.describe('Goal Guardrails', () => {
  test.beforeEach(async ({ page }) => {
    // Set up demo mode and North Star
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('demo-mode', 'true')
      localStorage.setItem('north-star', JSON.stringify({
        id: 'north-star-1',
        goal: 'Reach $2M ARR by December 2026',
        vehicle: 'SaaS subscription revenue',
        constraint: 'Limited marketing budget',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    })
  })

  test('CSV import validates actions successfully', async ({ page }) => {
    await page.goto('/import')

    const selectActions = page.getByRole('heading', { name: 'Import Actions' })
      .locator('..')
      .locator('..')
      .locator('..')
      .getByRole('button', { name: 'Select CSV File' })
    await selectActions.click()

    const csvContent = `title,why,owner_role,engine,eta_days,status,due_date
"Increase ARR by 20%","Supports revenue goal",Owner,Leadership,30,todo,"2026-02-15"
"Buy new office furniture","Improve workspace",Ops,Operations,14,todo,"2026-02-01"`

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles({
      name: 'actions.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    await page.getByRole('button', { name: 'Upload CSV' }).click()

    await expect(page.getByText('Validation Successful')).toBeVisible()
  })

  test('Parked ideas page exists and works', async ({ page }) => {
    await page.goto('/parked-ideas')
    await expect(page.getByRole('heading', { name: /parked ideas/i })).toBeVisible()
    await expect(page.getByText('No parked ideas yet.')).toBeVisible()
  })

  test('Meeting actions respect guardrails', async ({ page }) => {
    await page.goto('/meetings')

    await page.getByRole('button', { name: 'Start Meeting' }).first().click()
    await expect(page.getByRole('heading', { name: 'Daily Warm-Up' })).toBeVisible()
    await expect(page.getByRole('button', { name: /complete meeting/i })).toBeVisible()
  })
})
