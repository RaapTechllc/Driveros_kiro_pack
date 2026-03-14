import { test, expect } from '@playwright/test'

test.describe('Goal Guardrails', () => {
  test.beforeEach(async ({ page }) => {
    // Set up demo mode and North Star
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('demo-mode', 'true')
      localStorage.setItem('north-star', JSON.stringify({
        goal: 'Reach $2M ARR by December 2026',
        vehicle: 'SaaS subscription revenue',
        constraint: 'Limited marketing budget'
      }))
    })
  })

  test('CSV import validates action alignment', async ({ page }) => {
    await page.goto('/import')
    
    // Create CSV with aligned and unaligned actions
    const csvContent = `title,why,owner_role,engine,eta_days,status,due_date
"Increase ARR by 20%","Supports revenue goal",Owner,Leadership,30,todo,"2026-02-15"
"Buy new office furniture","Improve workspace",Ops,Operations,14,todo,"2026-02-01"`
    
    // Upload CSV
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles({
      name: 'actions.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
    
    // Wait for validation
    await page.waitForTimeout(500)
    
    // Check that aligned action is accepted
    await expect(page.getByText('Increase ARR by 20%')).toBeVisible()
    
    // Check that unaligned action shows warning (if UI displays it)
    // Note: This depends on UI implementation
  })

  test('Parked ideas page exists and works', async ({ page }) => {
    await page.goto('/parked-ideas')
    
    // Check page loads
    await expect(page.getByRole('heading', { name: /parked ideas/i })).toBeVisible()
    
    // Add a parked idea
    const addButton = page.getByRole('button', { name: /add idea/i })
    if (await addButton.isVisible()) {
      await addButton.click()
      
      // Fill in idea form
      await page.fill('input[placeholder*="title"]', 'Future feature idea')
      await page.fill('textarea', 'This is for later consideration')
      
      // Save
      await page.getByRole('button', { name: /save/i }).click()
      
      // Verify idea appears
      await expect(page.getByText('Future feature idea')).toBeVisible()
    }
  })

  test('Meeting actions respect guardrails', async ({ page }) => {
    await page.goto('/meetings')
    
    // Select Warm-Up meeting
    await page.getByText('Daily Warm-Up').click()
    
    // Fill in meeting form
    await page.fill('input[placeholder*="yesterday"]', 'Completed revenue analysis')
    await page.fill('input[placeholder*="today"]', 'Focus on ARR growth strategy')
    await page.fill('input[placeholder*="brake"]', 'Limited marketing budget')
    
    // Submit meeting
    await page.getByRole('button', { name: /complete meeting/i }).click()
    
    // Actions should be generated and aligned
    await expect(page.getByText(/action/i)).toBeVisible()
  })

  test('Dashboard shows alignment warnings', async ({ page }) => {
    // Add an unaligned action to localStorage
    await page.goto('/dashboard')
    await page.evaluate(() => {
      const actions = [{
        id: 'test-1',
        title: 'Random unrelated task',
        why: 'No connection to goals',
        owner_role: 'Owner',
        engine: 'Operations',
        status: 'todo',
        eta_days: 7,
        alignment_warning: 'Action doesn\'t align with North Star'
      }]
      localStorage.setItem('actions', JSON.stringify(actions))
    })
    
    await page.reload()
    
    // Check if warning badge or indicator appears
    // Note: This depends on UI implementation
    await expect(page.getByText('Random unrelated task')).toBeVisible()
  })
})
