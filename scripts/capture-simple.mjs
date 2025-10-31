import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function captureScreenshots() {
  const screenshotsDir = join(__dirname, '../screenshots');
  if (!existsSync(screenshotsDir)) {
    mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  console.log('📸 Starting screenshot capture...\n');
  console.log('⚠️  IMPORTANT: You need to manually log in when prompted!\n');
  console.log('   The browser will open and wait for you...\n');

  try {
    // 1. Login Page
    console.log('1️⃣  Opening login page...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '01-login-page.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 01-login-page.png\n');

    // Wait for manual login with extended time
    console.log('⏳ PLEASE LOG IN NOW...');
    console.log('   Waiting 30 seconds for you to complete login...\n');
    await page.waitForTimeout(30000);

    // Check current URL
    console.log(`   Current URL: ${page.url()}`);

    // Navigate to dashboard if not there
    if (!page.url().includes('/dashboard')) {
      console.log('   Navigating to dashboard...');
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    }
    await page.waitForTimeout(3000);

    // 2. Dashboard - Light Mode
    console.log('2️⃣  Capturing dashboard (Light mode)...');
    await page.screenshot({
      path: join(screenshotsDir, '02-dashboard-light.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 02-dashboard-light.png\n');

    // 3. Try to find and use search
    console.log('3️⃣  Looking for search functionality...');
    try {
      // Try multiple selectors
      const searchInput = await page.locator('input[type="text"]').first();
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('Apogem');
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: join(screenshotsDir, '03-search-results.png'),
          fullPage: false,
        });
        console.log('   ✅ Saved: 03-search-results.png\n');

        // Try to click first client
        console.log('4️⃣  Trying to open client details...');
        const clientCard = await page.locator('div').filter({ hasText: 'Apogem' }).first();
        if (await clientCard.isVisible({ timeout: 2000 })) {
          await clientCard.click();
          await page.waitForTimeout(5000);

          await page.screenshot({
            path: join(screenshotsDir, '04-client-details.png'),
            fullPage: true,
          });
          console.log('   ✅ Saved: 04-client-details.png\n');

          // Scroll for charts
          console.log('5️⃣  Capturing charts...');
          await page.evaluate(() => window.scrollBy(0, 500));
          await page.waitForTimeout(2000);
          await page.screenshot({
            path: join(screenshotsDir, '05-client-charts.png'),
            fullPage: false,
          });
          console.log('   ✅ Saved: 05-client-charts.png\n');
        }
      }
    } catch (e) {
      console.log('   ⚠️  Skipping search demo (not found)\n');
    }

    // 6. Settings Page
    console.log('6️⃣  Navigating to settings...');
    await page.goto('http://localhost:3000/dashboard/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '06-settings-page.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 06-settings-page.png\n');

    // 7. Try Dark mode
    console.log('7️⃣  Trying Dark mode...');
    try {
      const darkBtn = page.locator('button').filter({ hasText: /dark/i }).first();
      if (await darkBtn.isVisible({ timeout: 2000 })) {
        await darkBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('   ⚠️  Dark mode button not found\n');
    }

    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '07-dashboard-dark.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 07-dashboard-dark.png\n');

    // 8. Try Asian mode
    console.log('8️⃣  Trying Asian mode...');
    await page.goto('http://localhost:3000/dashboard/settings');
    await page.waitForTimeout(2000);
    try {
      const asianBtn = page.locator('button').filter({ hasText: /asian/i }).first();
      if (await asianBtn.isVisible({ timeout: 2000 })) {
        await asianBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('   ⚠️  Asian mode button not found\n');
    }

    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '08-dashboard-asian.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 08-dashboard-asian.png\n');

    // 9. Glossary
    console.log('9️⃣  Capturing glossary...');
    await page.goto('http://localhost:3000/dashboard/glossary');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '09-glossary.png'),
      fullPage: true,
    });
    console.log('   ✅ Saved: 09-glossary.png\n');

    // 10. Reports
    console.log('🔟 Capturing reports...');
    await page.goto('http://localhost:3000/dashboard/reports');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '10-reports.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 10-reports.png\n');

    // 11. Mobile view
    console.log('1️⃣1️⃣  Capturing mobile view...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '11-mobile-dashboard.png'),
      fullPage: true,
    });
    console.log('   ✅ Saved: 11-mobile-dashboard.png\n');

    console.log('✨ All screenshots captured successfully!\n');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
