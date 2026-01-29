import { test, expect } from '@playwright/test'

test.describe('Daily Check-In', () => {
  test.beforeEach(async ({ page }) => {
    // Set up demo mode
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('demo-mode', 'true')
      // Add some actions to check in on
      localStorage.setItem('actions', JSON.stringify([
        {
          id: 'action-1',
          title: 'Complete revenue analysis',
          why: 'Need data for planning',
          owner_role: 'Owner',
          engine: 'Finance',
          status: 'doing',
          eta_days: 1
        },
        {
          id: 'action-2',
          title: 'Update marketing copy',
          why: 'Improve conversion',
          owner_role: 'Sales',
          engine: 'Marketing & Sales',
          status: 'todo',
          eta_days: 3
        }
      ]))
    })
  })

  test('Check-in page loads and displays form', async ({ page }) => {
    await page.goto('/check-in')
    
    // Check page title
    await expect(page.getByRole('heading', { name: /daily check-in/i })).toBeVisible()
    
    // Check form fields are present
    await expect(page.getByText(/actions completed/i)).toBeVisible()
    await expect(page.getByText(/blocker/i)).toBeVisible()
    await expect(page.getByText(/win.*lesson/i)).toBeVisible()
  })

  test('Submit daily check-in successfully', async ({ page }) => {
    await page.goto('/check-in')
    
    // Fill in check-in form
    const yesButton = page.getByRole('button', { name: /yes/i }).first()
    await yesButton.click()
    
    await page.fill('textarea[placeholder*="blocker"]', 'Waiting on client approval')
    await page.fill('textarea[placeholder*="win"]', 'Closed a new deal worth $50k')
    
    // Submit
    await page.getByRole('button', { name: /submit/i }).click()
    
    // Check for success message
    await expect(page.getByText(/check-in saved/i)).toBeVisible({ timeout: 3000 })
  })

  test('Dashboard shows check-in status indicator', async ({ page }) => {
    // First, complete a check-in
    await page.goto('/check-in')
    await page.evaluate(() => {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('check-ins', JSON.stringify([{
        id: 'check-1',
        user_id: 'demo-user',
        date: today,
        actions_completed: true,
        blocker: null,
        win_or_lesson: 'Great progress today',
        created_at: new Date().toISOString()
      }]))
    })
    
    // Go to dashboard
    await page.goto('/dashboard')
    
    // Check for green indicator (completed today)
    await expect(page.getByText(/check-in.*today/i)).toBeVisible()
    
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
    await expect(page.getByText(/no check-in/i)).toBeVisible()
  })

  test('Check-in updates action statuses', async ({ page }) => {
    await page.goto('/check-in')
    
    // Mark actions as completed
    await page.getByRole('button', { name: /yes/i }).first().click()
    
    // Select specific actions to update
    const actionCheckboxes = page.locator('input[type="checkbox"]')
    const count = await actionCheckboxes.count()
    if (count > 0) {
      await actionCheckboxes.first().check()
    }
    
    await page.fill('textarea[placeholder*="win"]', 'Completed key tasks')
    await page.getByRole('button', { name: /submit/i }).click()
    
    // Verify success
    await expect(page.getByText(/check-in saved/i)).toBeVisible({ timeout: 3000 })
  })

  test('Cannot submit duplicate check-in for same day', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0]
    
    // Add existing check-in for today
    await page.goto('/check-in')
    await page.evaluate((date) => {
      localStorage.setItem('check-ins', JSON.stringify([{
        id: 'check-1',
        user_id: 'demo-user',
        date: date,
        actions_completed: true,
        created_at: new Date().toISOString()
      }]))
    }, today)
    
    await page.reload()
    
    // Should show message that check-in already exists
    await expect(page.getByText(/already.*check.*in.*today/i)).toBeVisible()
  })

  test('Check-in streak tracking works', async ({ page }) => {
    // Add multiple check-ins for consecutive days
    await page.goto('/check-in')
    await page.evaluate(() => {
      const checkIns = []
      for (let i = 0; i < 5; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        checkIns.push({
          id: `check-${i}`,
          user_id: 'demo-user',
          date: date.toISOString().split('T')[0],
          actions_completed: true,
          created_at: date.toISOString()
        })
      }
      localStorage.setItem('check-ins', JSON.stringify(checkIns))
    })
    
    await page.reload()
    
    // Check for streak indicator
    await expect(page.getByText(/5.*day.*streak/i)).toBeVisible()
  })
})
