import { test, expect } from '@playwright/test'

test.describe('Weekly Pit Stop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const now = new Date().toISOString()
      localStorage.setItem('demo-mode', 'true')
      localStorage.setItem('north-star', JSON.stringify({
        id: 'north-star-1',
        goal: 'Reach $2M ARR by December 2026',
        vehicle: 'SaaS subscription revenue',
        constraint: 'Limited marketing budget',
        is_active: true,
        created_at: now,
        updated_at: now
      }))
      localStorage.setItem('imported-actions', JSON.stringify([
        {
          id: 'action-1',
          title: 'Launch new pricing page',
          description: null,
          why: 'Increase conversion rate',
          owner: null,
          engine: 'revenue',
          priority: 'do_next',
          status: 'completed',
          effort: null,
          due_date: null,
          source: 'imported',
          created_at: now,
          updated_at: now
        },
        {
          id: 'action-2',
          title: 'Fix checkout bug',
          description: null,
          why: 'Blocking revenue',
          owner: null,
          engine: 'operations',
          priority: 'do_now',
          status: 'blocked',
          effort: null,
          due_date: null,
          source: 'imported',
          created_at: now,
          updated_at: now
        },
        {
          id: 'action-3',
          title: 'Update documentation',
          description: null,
          why: 'Reduce support load',
          owner: null,
          engine: 'operations',
          priority: 'do_next',
          status: 'not_started',
          effort: null,
          due_date: null,
          source: 'imported',
          created_at: now,
          updated_at: now
        }
      ]))
    })
  })

  test('Pit Stop page loads and shows last week summary', async ({ page }) => {
    await page.goto('/pit-stop')

    await expect(page.getByRole('heading', { name: /weekly pit stop/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Last Week Summary' })).toBeVisible()
    await expect(page.getByText('Launch new pricing page')).toBeVisible()
    await expect(page.getByText('Fix checkout bug')).toBeVisible()
  })

  test('Generates weekly plan and prioritizes blocked actions', async ({ page }) => {
    await page.goto('/pit-stop')

    await page.getByRole('button', { name: /generate plan/i }).click()
    await page.waitForTimeout(500)

    const planCard = page.getByRole('heading', { name: 'Proposed Plan' }).locator('..').locator('..')
    await expect(planCard).toBeVisible()

    const firstAction = planCard.locator('.border.rounded-lg.p-3').first()
    await expect(firstAction).toContainText('Fix checkout bug')
  })

  test('Plan respects 3-action weekly limit', async ({ page }) => {
    await page.goto('/pit-stop')

    await page.getByRole('button', { name: /generate plan/i }).click()
    await page.waitForTimeout(500)

    const planCard = page.getByRole('heading', { name: 'Proposed Plan' }).locator('..').locator('..')
    const actionCards = planCard.locator('.border.rounded-lg.p-3')
    const count = await actionCards.count()
    expect(count).toBeLessThanOrEqual(3)
  })

  test('Can approve plan after generation', async ({ page }) => {
    await page.goto('/pit-stop')

    await page.getByRole('button', { name: /generate plan/i }).click()
    await page.waitForTimeout(500)

    page.once('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: /approve plan/i }).click()

    await expect(page.getByRole('button', { name: /generate plan/i })).toBeVisible()
  })
})
