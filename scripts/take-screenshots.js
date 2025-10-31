const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function takeScreenshots() {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  console.log('📸 Starting screenshot capture...\n');

  try {
    // 1. Login/Landing Page
    console.log('1️⃣  Capturing login page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '01-login-page.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 01-login-page.png\n');

    // Note: This script assumes you're already logged in or will use test credentials
    // For now, we'll capture the login page and then navigate directly
    console.log('   ✅ Login page captured\n');

    console.log('2️⃣  Note: Please ensure you have an active session or update credentials in the script\n');

    // 2. Dashboard - Light Mode
    console.log('3️⃣  Capturing dashboard (Light mode)...');
    await page.screenshot({
      path: path.join(screenshotsDir, '02-dashboard-light.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 02-dashboard-light.png\n');

    // 3. Search Functionality
    console.log('4️⃣  Capturing search...');
    const searchInput = await page.locator('input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('Apogem');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(screenshotsDir, '03-search-results.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 03-search-results.png\n');

    // 4. Click on search result (if available)
    console.log('5️⃣  Opening client details...');
    const searchResult = await page.locator('text=Apogem').first();
    if (await searchResult.isVisible()) {
      await searchResult.click();
      await page.waitForTimeout(4000); // Wait for data to load

      // Client Details Page
      console.log('6️⃣  Capturing client details...');
      await page.screenshot({
        path: path.join(screenshotsDir, '04-client-details.png'),
        fullPage: true,
      });
      console.log('   ✅ Saved: 04-client-details.png\n');

      // Scroll to charts
      console.log('7️⃣  Capturing performance charts...');
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(screenshotsDir, '05-performance-charts.png'),
        fullPage: false,
      });
      console.log('   ✅ Saved: 05-performance-charts.png\n');
    }

    // 5. Switch to Dark Mode
    console.log('8️⃣  Switching to Dark mode...');
    await page.goto('http://localhost:3000/dashboard/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Find and click dark mode
    const darkModeButton = await page.locator('button:has-text("Dark"), button:has-text("dark"), [data-theme="dark"]').first();
    if (await darkModeButton.isVisible()) {
      await darkModeButton.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({
      path: path.join(screenshotsDir, '06-settings-dark.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 06-settings-dark.png\n');

    // Go back to dashboard in dark mode
    console.log('9️⃣  Capturing dashboard (Dark mode)...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '07-dashboard-dark.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 07-dashboard-dark.png\n');

    // 6. Switch to Asian Mode
    console.log('🔟  Switching to Asian mode...');
    await page.goto('http://localhost:3000/dashboard/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const asianModeButton = await page.locator('button:has-text("Asian"), button:has-text("asian"), [data-theme="asian"]').first();
    if (await asianModeButton.isVisible()) {
      await asianModeButton.click();
      await page.waitForTimeout(1000);
    }

    // Go back to dashboard in asian mode
    console.log('1️⃣1️⃣  Capturing dashboard (Asian mode)...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '08-dashboard-asian.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 08-dashboard-asian.png\n');

    // 7. Glossary Page
    console.log('1️⃣2️⃣  Capturing glossary page...');
    await page.goto('http://localhost:3000/dashboard/glossary', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '09-glossary.png'),
      fullPage: true,
    });
    console.log('   ✅ Saved: 09-glossary.png\n');

    // 8. Reports History
    console.log('1️⃣3️⃣  Capturing reports page...');
    await page.goto('http://localhost:3000/dashboard/reports', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '10-reports.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 10-reports.png\n');

    // 9. Mobile View - Dashboard
    console.log('1️⃣4️⃣  Capturing mobile view...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, '11-mobile-dashboard.png'),
      fullPage: true,
    });
    console.log('   ✅ Saved: 11-mobile-dashboard.png\n');

    console.log('✨ All screenshots captured successfully!\n');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}\n`);

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Run the script
takeScreenshots();
