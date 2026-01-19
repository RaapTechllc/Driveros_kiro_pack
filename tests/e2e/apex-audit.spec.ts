import { test, expect } from '@playwright/test'
import { ApexAuditPage } from './helpers/page-objects'

test.describe('Apex Audit Page', () => {
  let apexAuditPage: ApexAuditPage

  test.beforeEach(async ({ page }) => {
    apexAuditPage = new ApexAuditPage(page)
  })

  test('page loads with form visible', async ({ page }) => {
    await apexAuditPage.goto()

    // Check page title/header
    await expect(page.getByRole('heading', { name: 'Apex Audit' })).toBeVisible()
    await expect(page.getByText('The full picture. The real numbers. The path forward.')).toBeVisible()

    // Check form is visible
    await expect(apexAuditPage.companyNameInput).toBeVisible()
    await expect(apexAuditPage.nextButton).toBeVisible()

    // Check we're on step 1 of 12
    await expect(page.getByText('Step 1 of 12')).toBeVisible()
  })

  test('navigates through all 12 sections', async ({ page }) => {
    await apexAuditPage.goto()

    const sectionTitles = [
      'Company Profile',
      'Revenue & Profit',
      'Sales & Marketing',
      'Customers',
      'Operations',
      'Growth Planning',
      'Tech Stack',
      'Offer & Value',
      'Compliance',
      'Brand',
      'Experiments',
      'Additional Context'
    ]

    // Navigate through each section
    for (let i = 0; i < sectionTitles.length; i++) {
      // Check section title is visible
      await expect(page.getByRole('heading', { name: sectionTitles[i] })).toBeVisible()
      await expect(page.getByText(`Step ${i + 1} of 12`)).toBeVisible()

      // Move to next section (except for last one)
      if (i < sectionTitles.length - 1) {
        await apexAuditPage.nextSection()
      }
    }

    // On last section, submit button should be visible
    await expect(apexAuditPage.submitButton).toBeVisible()
    await expect(apexAuditPage.nextButton).not.toBeVisible()
  })

  test('navigates back through sections', async ({ page }) => {
    await apexAuditPage.goto()

    // Go forward a few sections
    await apexAuditPage.nextSection()
    await apexAuditPage.nextSection()
    await apexAuditPage.nextSection()

    // Should be on section 4 (Customers)
    await expect(page.getByText('Step 4 of 12')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible()

    // Navigate back
    await apexAuditPage.previousSection()
    await expect(page.getByText('Step 3 of 12')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sales & Marketing' })).toBeVisible()

    await apexAuditPage.previousSection()
    await expect(page.getByText('Step 2 of 12')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Revenue & Profit' })).toBeVisible()

    await apexAuditPage.previousSection()
    await expect(page.getByText('Step 1 of 12')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Company Profile' })).toBeVisible()

    // Previous button should be disabled on first section
    await expect(apexAuditPage.previousButton).toBeDisabled()
  })

  test('fills minimal form and submits successfully', async ({ page }) => {
    await apexAuditPage.goto()

    // Fill the form
    await apexAuditPage.fillMinimalForm()

    // Should be on last section with submit button
    await expect(apexAuditPage.submitButton).toBeVisible()

    // Submit the form
    await apexAuditPage.submit()

    // Should show loading state
    await expect(page.getByText('Analyzing Business Architecture')).toBeVisible()

    // Wait for submission to complete (shows success state)
    await expect(page.getByText('Audit Submitted for Expert Review')).toBeVisible({ timeout: 10000 })

    // Should show preliminary analysis
    await expect(page.getByText('Preliminary Analysis Generated Below')).toBeVisible()
  })

  test('persists data between steps', async ({ page }) => {
    await apexAuditPage.goto()

    // Fill some data in section 1
    const testCompanyName = 'Persistence Test Company'
    const testWebsite = 'https://persistence-test.com'
    await apexAuditPage.companyNameInput.fill(testCompanyName)
    await apexAuditPage.websiteInput.fill(testWebsite)
    await apexAuditPage.industrySelect.selectOption('Technology')

    // Go to next section
    await apexAuditPage.nextSection()
    await expect(page.getByText('Step 2 of 12')).toBeVisible()

    // Go back
    await apexAuditPage.previousSection()
    await expect(page.getByText('Step 1 of 12')).toBeVisible()

    // Data should still be there
    await expect(apexAuditPage.companyNameInput).toHaveValue(testCompanyName)
    await expect(apexAuditPage.websiteInput).toHaveValue(testWebsite)
    await expect(apexAuditPage.industrySelect).toHaveValue('Technology')
  })

  test('can jump to any section via progress buttons', async ({ page }) => {
    await apexAuditPage.goto()

    // Fill first section so we have some data
    await apexAuditPage.fillCompanyProfile({
      companyName: 'Jump Test Company',
      industry: 'Technology'
    })

    // Jump to section 6 (Growth Planning) using the section button
    await page.getByRole('button', { name: /Growth|6/ }).click()

    // Should be on Growth Planning section
    await expect(page.getByRole('heading', { name: 'Growth Planning' })).toBeVisible()
    await expect(page.getByText('Step 6 of 12')).toBeVisible()

    // Jump back to section 1
    await page.getByRole('button', { name: /Company Profile|1/ }).click()

    // Should be back on Company Profile
    await expect(page.getByRole('heading', { name: 'Company Profile' })).toBeVisible()
    await expect(page.getByText('Step 1 of 12')).toBeVisible()

    // Original data should still be there
    await expect(apexAuditPage.companyNameInput).toHaveValue('Jump Test Company')
  })

  test('displays analysis results after submission', async ({ page }) => {
    await apexAuditPage.goto()

    // Fill and submit the form
    await apexAuditPage.fillMinimalForm()
    await apexAuditPage.submit()

    // Wait for results
    await expect(page.getByText('Audit Submitted for Expert Review')).toBeVisible({ timeout: 10000 })

    // Check for key result sections (health score, stage, etc.)
    await expect(page.getByText(/Health Score/i)).toBeVisible()
    await expect(page.getByText(/Stage/i)).toBeVisible()

    // Check for action plan sections
    await expect(page.getByText(/Immediate Actions|This Week/i)).toBeVisible()

    // Dashboard button should be visible
    await expect(page.getByRole('button', { name: /Dashboard|View Dashboard/i })).toBeVisible()
  })

  test('handles form validation for required number fields', async ({ page }) => {
    await apexAuditPage.goto()

    // Navigate to Revenue section
    await apexAuditPage.nextSection()

    // Check that number inputs accept numeric values
    const revenueInput = page.locator('#apex-annual_revenue')
    await revenueInput.fill('1000000')
    await expect(revenueInput).toHaveValue('1000000')

    // Test that the input handles non-numeric gracefully (clears or ignores)
    await revenueInput.fill('')
    await revenueInput.type('abc')
    // Non-numeric input should result in empty or 0
    const value = await revenueInput.inputValue()
    expect(value === '' || value === '0').toBeTruthy()
  })

  test('slider controls work correctly', async ({ page }) => {
    await apexAuditPage.goto()

    // Navigate to Revenue section (has gross/net margin sliders)
    await apexAuditPage.nextSection()

    // Find the gross margin slider
    const grossMarginSlider = page.locator('#apex-gross_margin')

    // Check slider attributes
    await expect(grossMarginSlider).toHaveAttribute('type', 'range')
    await expect(grossMarginSlider).toHaveAttribute('min', '0')
    await expect(grossMarginSlider).toHaveAttribute('max', '100')

    // Change the slider value
    await grossMarginSlider.fill('80')
    await expect(grossMarginSlider).toHaveValue('80')

    // Check the label shows the updated value
    await expect(page.getByText('Gross Margin: 80%')).toBeVisible()
  })

  test('multiselect checkboxes work in Tech Stack section', async ({ page }) => {
    await apexAuditPage.goto()

    // Navigate to Tech Stack section (section 7)
    for (let i = 0; i < 6; i++) {
      await apexAuditPage.nextSection()
    }

    await expect(page.getByRole('heading', { name: 'Tech Stack' })).toBeVisible()

    // Find marketing tools checkboxes
    const googleAdsCheckbox = page.getByRole('checkbox', { name: 'Google Ads' })
    const metaAdsCheckbox = page.getByRole('checkbox', { name: 'Meta Ads' })

    // Check both
    await googleAdsCheckbox.check()
    await metaAdsCheckbox.check()

    await expect(googleAdsCheckbox).toBeChecked()
    await expect(metaAdsCheckbox).toBeChecked()

    // Uncheck one
    await googleAdsCheckbox.uncheck()
    await expect(googleAdsCheckbox).not.toBeChecked()
    await expect(metaAdsCheckbox).toBeChecked()
  })
})
