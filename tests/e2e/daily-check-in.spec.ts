import { test, expect } from '@playwright/test'

test.describe('Daily Check-In', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const flashResult = {
        schema_version: '1.0',
        confidence_score: 0.6,
        accelerator: {
          kpi: 'Monthly Recurring Revenue (MRR)',
          cadence: 'weekly',
          recommended: true,
          notes: 'Focus on closing new deals.'
        },
        quick_wins: [
          {
            title: 'Ship quick win',
            why: 'Build momentum',
            owner_role: 'Owner',
            eta_days: 3,
            engine: 'Vision'
          }
        ],
        gear_estimate: {
          number: 2,
          label: 'Cruising',
          reason: 'Early traction with repeatable sales.'
        }
      }
      localStorage.setItem('demo-mode', 'true')
      localStorage.setItem('flash-scan-result', JSON.stringify(flashResult))
      localStorage.removeItem('check-ins')
    })
  })

  test('Check-in page loads and displays form', async ({ page }) => {
    await page.goto('/check-in')
    
    // Check page title
    await expect(page.getByRole('heading', { name: /daily check-in/i })).toBeVisible()
    
    // Check form fields are present
    await expect(page.getByLabel('Did you complete your 1-3 actions?')).toBeVisible()
    await expect(page.getByLabel('Any blockers?')).toBeVisible()
    await expect(page.getByLabel('Any win or lesson?')).toBeVisible()
  })

  test('Submit daily check-in successfully', async ({ page }) => {
    await page.goto('/check-in')
    
    // Fill in check-in form
    await page.getByLabel('Did you complete your 1-3 actions?').check()
    
    await page.getByLabel('Any blockers?').fill('Waiting on client approval')
    await page.getByLabel('Any win or lesson?').fill('Closed a new deal worth $50k')
    
    // Submit
    await page.getByRole('button', { name: /complete check-in/i }).click()
    
    // Check for success message
    await expect(page.getByText('Check-in saved successfully!')).toBeVisible({ timeout: 3000 })
  })

  test('Dashboard shows check-in status indicator', async ({ page }) => {
    // First, complete a check-in
    await page.goto('/check-in')
    await page.evaluate(() => {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('check-ins', JSON.stringify([{
        id: 'check-1',
        date: today,
        actions_completed: true,
        blocker: null,
        win_or_lesson: 'Great progress today',
        action_updates: null,
        created_at: new Date().toISOString()
      }]))
    })
    
    // Go to dashboard
    await page.goto('/dashboard')
    
    // Check for green indicator (completed today)
    await expect(page.getByText('Done')).toBeVisible()
    
    // Or check for badge/status indicator
    const statusBadge = page.locator('[data-testid="check-in-status"]')
    if (await statusBadge.isVisible()) {
      await expect(statusBadge).toHaveClass(/green|success|complete/)
    }
  })

  test('Dashboard shows orange indicator when no check-in', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Ensure no check-in for today
    await page.evaluate(() => {
      localStorage.removeItem('check-ins')
    })
    
    await page.reload()
    
    // Check for orange/warning indicator
    await expect(page.getByText('Pending')).toBeVisible()
  })

  test('Existing check-in shows update state', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0]

    await page.goto('/check-in')
    await page.evaluate((date) => {
      localStorage.setItem('check-ins', JSON.stringify([{
        id: 'check-1',
        date: date,
        actions_completed: true,
        blocker: null,
        win_or_lesson: 'Great progress today',
        action_updates: null,
        created_at: new Date().toISOString()
      }]))
    }, today)

    await page.reload()
    await expect(page.getByRole('button', { name: /update check-in/i })).toBeVisible()
  })
})
