import { test, expect } from '@playwright/test'

test.describe('Weekly Pit Stop', () => {
  test.beforeEach(async ({ page }) => {
    // Set up demo mode with full audit data
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('demo-mode', 'true')
      
      // Set North Star
      localStorage.setItem('north-star', JSON.stringify({
        goal: 'Reach $2M ARR by December 2026',
        vehicle: 'SaaS subscription revenue',
        constraint: 'Limited marketing budget'
      }))
      
      // Set accelerator
      localStorage.setItem('accelerator', JSON.stringify({
        kpi: 'Weekly MRR Growth',
        target: 10000,
        current: 8500,
        cadence: 'weekly'
      }))
      
      // Add some actions
      localStorage.setItem('actions', JSON.stringify([
        {
          id: 'action-1',
          title: 'Launch new pricing page',
          why: 'Increase conversion rate',
          owner_role: 'Sales',
          engine: 'Marketing & Sales',
          status: 'done',
          eta_days: 7
        },
        {
          id: 'action-2',
          title: 'Fix checkout bug',
          why: 'Blocking revenue',
          owner_role: 'Ops',
          engine: 'Operations',
          status: 'blocked',
          eta_days: 2
        },
        {
          id: 'action-3',
          title: 'Update documentation',
          why: 'Reduce support load',
          owner_role: 'Ops',
          engine: 'Operations',
          status: 'todo',
          eta_days: 5
        }
      ]))
    })
  })

  test('Pit Stop page loads and shows last week summary', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Check page title
    await expect(page.getByRole('heading', { name: /weekly pit stop/i })).toBeVisible()
    
    // Check for last week summary section
    await expect(page.getByText(/last week/i)).toBeVisible()
    
    // Should show accelerator status
    await expect(page.getByText(/weekly mrr growth/i)).toBeVisible()
  })

  test('Shows completed and blocked actions from last week', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Should display completed actions
    await expect(page.getByText('Launch new pricing page')).toBeVisible()
    
    // Should display blocked actions
    await expect(page.getByText('Fix checkout bug')).toBeVisible()
    await expect(page.getByText(/blocked/i)).toBeVisible()
  })

  test('Generates weekly plan based on rules engine', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Click generate plan button
    const generateButton = page.getByRole('button', { name: /generate.*plan/i })
    await generateButton.click()
    
    // Wait for plan to be generated
    await page.waitForTimeout(1000)
    
    // Should show recommended actions
    await expect(page.getByText(/recommended.*action/i)).toBeVisible()
    
    // Should prioritize blocked items first
    await expect(page.getByText(/fix checkout bug/i).first()).toBeVisible()
  })

  test('Plan prioritizes blocked actions first', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Generate plan
    await page.getByRole('button', { name: /generate.*plan/i }).click()
    await page.waitForTimeout(1000)
    
    // Get all action cards
    const actionCards = page.locator('[data-testid="action-card"]')
    const firstCard = actionCards.first()
    
    // First card should be the blocked action
    await expect(firstCard).toContainText(/fix checkout bug/i)
  })

  test('Can approve and create actions from plan', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Generate plan
    await page.getByRole('button', { name: /generate.*plan/i }).click()
    await page.waitForTimeout(1000)
    
    // Approve plan
    const approveButton = page.getByRole('button', { name: /approve.*plan/i })
    await approveButton.click()
    
    // Should show success message
    await expect(page.getByText(/plan approved/i)).toBeVisible({ timeout: 3000 })
    
    // Actions should be created
    await page.goto('/dashboard')
    await expect(page.getByText(/action/i)).toBeVisible()
  })

  test('Can edit recommended actions before approval', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Generate plan
    await page.getByRole('button', { name: /generate.*plan/i }).click()
    await page.waitForTimeout(1000)
    
    // Click edit on first action
    const editButton = page.getByRole('button', { name: /edit/i }).first()
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Modify action
      await page.fill('input[name="title"]', 'Updated action title')
      await page.getByRole('button', { name: /save/i }).click()
      
      // Verify change
      await expect(page.getByText('Updated action title')).toBeVisible()
    }
  })

  test('Shows capacity warning when too many actions', async ({ page }) => {
    // Add many existing actions
    await page.goto('/pit-stop')
    await page.evaluate(() => {
      const actions = []
      for (let i = 0; i < 10; i++) {
        actions.push({
          id: `action-${i}`,
          title: `Action ${i}`,
          why: 'Test action',
          owner_role: 'Owner',
          engine: 'Operations',
          status: 'todo',
          eta_days: 7
        })
      }
      localStorage.setItem('actions', JSON.stringify(actions))
    })
    
    await page.reload()
    
    // Generate plan
    await page.getByRole('button', { name: /generate.*plan/i }).click()
    await page.waitForTimeout(1000)
    
    // Should show capacity warning
    await expect(page.getByText(/capacity.*warning|too many.*action/i)).toBeVisible()
  })

  test('Plan respects 3-action weekly limit', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Generate plan
    await page.getByRole('button', { name: /generate.*plan/i }).click()
    await page.waitForTimeout(1000)
    
    // Count recommended actions
    const actionCards = page.locator('[data-testid="recommended-action"]')
    const count = await actionCards.count()
    
    // Should not exceed 3 actions
    expect(count).toBeLessThanOrEqual(3)
  })

  test('Shows accelerator trend and status', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Should display accelerator card
    await expect(page.getByText(/weekly mrr growth/i)).toBeVisible()
    
    // Should show target vs actual
    await expect(page.getByText(/10,?000/)).toBeVisible() // target
    await expect(page.getByText(/8,?500/)).toBeVisible() // current
    
    // Should show status (miss since 8500 < 10000)
    await expect(page.getByText(/miss|behind|below/i)).toBeVisible()
  })

  test('Can navigate back to dashboard', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Click back/cancel button
    const backButton = page.getByRole('button', { name: /back|cancel|dashboard/i })
    await backButton.click()
    
    // Should navigate to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('Saves pit stop meeting notes', async ({ page }) => {
    await page.goto('/pit-stop')
    
    // Generate and approve plan
    await page.getByRole('button', { name: /generate.*plan/i }).click()
    await page.waitForTimeout(1000)
    
    // Add notes
    const notesField = page.locator('textarea[placeholder*="notes"]')
    if (await notesField.isVisible()) {
      await notesField.fill('Great progress this week. Focus on unblocking checkout.')
    }
    
    await page.getByRole('button', { name: /approve.*plan/i }).click()
    
    // Check that meeting was saved
    await page.goto('/meetings')
    await expect(page.getByText(/pit stop/i)).toBeVisible()
  })
})
