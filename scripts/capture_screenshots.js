
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewportSize({ width: 1440, height: 900 });

    const baseUrl = 'http://localhost:3060';
    const outDir = path.join(__dirname, '../docs/frontend');

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // 1. Dashboard (Demo Mode)
    console.log('Capturing Dashboard...');
    await page.goto(`${baseUrl}/dashboard`);
    // Toggle Demo Mode ON if possible, or assume it defaults to something useful.
    // The README says "Launch Demo Dashboard" button on landing page.

    // Let's try to enable demo mode via localStorage or UI interaction if needed.
    // Based on current codebase, let's just capture what we see.
    // If it's empty, we might want to click the "Demo Mode" toggle if it exists.
    // Let's check the landing page flow.

    await page.goto(`${baseUrl}`);
    console.log('Capturing Landing Page...');
    await page.screenshot({ path: path.join(outDir, 'landing-page.png'), fullPage: true });

    // Navigate to Dashboard
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForTimeout(2000); // Wait for animations
    // Check for Demo Mode toggle or similar?
    // Let's just screenshot the dashboard as is.
    await page.screenshot({ path: path.join(outDir, 'dashboard.png') });

    // 2. Flash Scan
    console.log('Capturing Flash Scan...');
    await page.goto(`${baseUrl}/flash-scan`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'flash-scan.png') });

    // 3. Full Audit
    console.log('Capturing Full Audit...');
    await page.goto(`${baseUrl}/full-audit`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'full-audit.png') });

    // 4. Apex Audit
    console.log('Capturing Apex Audit...');
    await page.goto(`${baseUrl}/apex-audit`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'apex-audit.png') });

    await browser.close();
    console.log('Screenshots captured.');
})();
