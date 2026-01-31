import { test, expect } from '@playwright/test'
import { HomePage, FlashScanPage, FullAuditPage, DashboardPage, MeetingsPage, ImportPage } from './helpers/page-objects'
import { testData, expectedResults } from './helpers/test-data'

test.describe('DriverOS Complete Flow', () => {
  test('complete user journey: Flash Scan → Full Audit → Dashboard → Export', async ({ page }) => {
    const homePage = new HomePage(page)
    const flashScanPage = new FlashScanPage(page)
    const fullAuditPage = new FullAuditPage(page)
    const dashboardPage = new DashboardPage(page)

    // 1. Start from homepage
    await homePage.goto()
    await expect(page).toHaveTitle(/DriverOS/)
    await expect(page.getByText('5 minutes from now')).toBeVisible()

    // 2. Start Flash Scan
    await homePage.startFlashScan()
    await expect(page).toHaveURL('/flash-scan')

    // 3. Complete Flash Scan
    await flashScanPage.fillForm(testData.flashScan)
    await flashScanPage.submit()

    // 4. Verify Flash Scan results - check for key elements
    await expect(page.getByText('Your Instant Analysis')).toBeVisible()
    await expect(page.getByText('Quick Wins')).toBeVisible()

    // 5. Upgrade to Full Audit
    await flashScanPage.upgradeToFullAudit()
    await expect(page).toHaveURL('/full-audit')

    // 6. Complete Full Audit
    await fullAuditPage.fillForm(testData.fullAudit)
    await fullAuditPage.submit()

    // 6.5. Go to dashboard from results
    await fullAuditPage.goToDashboard()

    // 7. Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // 8. Verify dashboard content
    await expect(dashboardPage.gearDisplay).toBeVisible()
    await expect(dashboardPage.engineCards).toHaveCount(expectedResults.fullAudit.engineCount)

    // 9. Test CSV exports
    const actionsDownload = await dashboardPage.exportActions()
    expect(actionsDownload.suggestedFilename()).toMatch(/driveros-actions-\d{4}-\d{2}-\d{2}\.csv/)

    const goalsDownload = await dashboardPage.exportGoals()
    expect(goalsDownload.suggestedFilename()).toMatch(/driveros-goals-\d{4}-\d{2}-\d{2}\.csv/)
  })

  test('Flash Scan only path', async ({ page }) => {
    const homePage = new HomePage(page)
    const flashScanPage = new FlashScanPage(page)

    // 1. Complete Flash Scan
    await homePage.goto()
    await homePage.startFlashScan()
    await flashScanPage.fillForm(testData.flashScan)
    await flashScanPage.submit()

    // 2. Verify results without upgrade
    await expect(page.getByText('Quick Wins')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Weekly Accelerator', exact: true })).toBeVisible()
    await expect(flashScanPage.upgradeButton).toBeVisible()
  })

  test('Direct Full Audit path', async ({ page }) => {
    const homePage = new HomePage(page)
    const fullAuditPage = new FullAuditPage(page)

    // 1. Start Full Audit directly
    await homePage.goto()
    await homePage.startFullAudit()
    await expect(page).toHaveURL('/full-audit')

    // 2. Complete audit
    await fullAuditPage.fillForm(testData.fullAudit)
    await fullAuditPage.submit()

    // 3. Wait for results to render, then navigate to dashboard
    await expect(page.getByText('Strategic Architecture Report')).toBeVisible({ timeout: 10000 })
    await page.getByRole('link', { name: 'Launch DriverOS Dashboard' }).click()

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Signal Board')).toBeVisible()
  })

  test('CSV import functionality', async ({ page }) => {
    const homePage = new HomePage(page)
    const flashScanPage = new FlashScanPage(page)
    const dashboardPage = new DashboardPage(page)
    const importPage = new ImportPage(page)

    // Complete Flash Scan to get to dashboard
    await homePage.goto()
    await homePage.startFlashScan()
    await flashScanPage.fillForm(testData.flashScan)
    await flashScanPage.submit()
    await flashScanPage.upgradeToFullAudit()

    // Skip full audit for this test, go directly to dashboard
    await page.goto('/dashboard')

    // Navigate to import
    await dashboardPage.goToImport()
    await expect(page).toHaveURL('/import')

    // Verify import options are displayed
    await expect(page.getByRole('heading', { name: 'Import Actions' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Import Goals' })).toBeVisible()

    // Test template download
    await importPage.selectActionsImport()
    await expect(page).toHaveURL('/import')
    await expect(page.getByRole('heading', { name: 'Import Actions' })).toBeVisible()

    // Test template download functionality
    const download = await importPage.downloadTemplate()
    expect(download.suggestedFilename()).toBe('actions-template.csv')
  })

  test('meeting templates integration', async ({ page }) => {
    const homePage = new HomePage(page)
    const flashScanPage = new FlashScanPage(page)
    const dashboardPage = new DashboardPage(page)
    const meetingsPage = new MeetingsPage(page)

    // Complete Flash Scan to get to dashboard
    await homePage.goto()
    await homePage.startFlashScan()
    await flashScanPage.fillForm(testData.flashScan)
    await flashScanPage.submit()
    await flashScanPage.upgradeToFullAudit()

    // Skip full audit for this test, go directly to dashboard
    await page.goto('/dashboard')

    // Navigate to meetings
    await dashboardPage.goToMeetings()
    await expect(page).toHaveURL('/meetings')

    // Verify meeting templates are displayed
    await expect(page.getByRole('heading', { name: 'Daily Warm-Up' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Weekly Pit Stop' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Full Tune-Up' })).toBeVisible()

    // Test starting a meeting
    await meetingsPage.startWarmUp()
    await expect(page.getByText('Daily Warm-Up')).toBeVisible()
    await expect(page.getByText('Meeting Agenda')).toBeVisible()
  })

  test('Dashboard persistence', async ({ page }) => {
    // Complete a full audit first
    const homePage = new HomePage(page)
    const flashScanPage = new FlashScanPage(page)
    const fullAuditPage = new FullAuditPage(page)

    await homePage.goto()
    await homePage.startFlashScan()
    await flashScanPage.fillForm(testData.flashScan)
    await flashScanPage.submit()
    
    // Wait for Flash Scan results before upgrading
    await expect(page.getByText('Quick Wins')).toBeVisible({ timeout: 10000 })
    await flashScanPage.upgradeToFullAudit()
    
    await fullAuditPage.fillForm(testData.fullAudit)
    await fullAuditPage.submit()
    
    // Wait for Full Audit results to be saved
    await expect(page.getByText('Strategic Architecture Report')).toBeVisible({ timeout: 10000 })

    // Navigate away and back
    await page.goto('/')
    await page.goto('/dashboard')

    // Verify data persists
    await expect(page.getByText('Signal Board')).toBeVisible()
  })
})
