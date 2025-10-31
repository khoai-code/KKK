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

  const browser = await chromium.launch({ headless: false }); // Set to false to see the browser
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  console.log('📸 Starting screenshot capture...\n');
  console.log('ℹ️  Starting from dashboard (assuming already logged in)...\n');

  try {
    // 1. Login Page
    console.log('1️⃣  Capturing login page...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '01-login-page.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 01-login-page.png\n');

    // 2. Dashboard - Light Mode (navigate directly)
    console.log('2️⃣  Navigating to dashboard (Light mode)...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '02-dashboard-light.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 02-dashboard-light.png\n');

    // 3. Search Functionality
    console.log('3️⃣  Demonstrating search...');
    const searchSelectors = [
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[type="search"]',
      '[data-testid="search-input"]',
    ];

    let searchInput = null;
    for (const selector of searchSelectors) {
      try {
        searchInput = await page.locator(selector).first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (searchInput) {
      await searchInput.fill('Apogem');
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: join(screenshotsDir, '03-search-results.png'),
        fullPage: false,
      });
      console.log('   ✅ Saved: 03-search-results.png\n');

      // 4. Click on first result if visible
      console.log('4️⃣  Opening client details...');
      try {
        const resultSelectors = [
          'text=Apogem',
          '[data-client-result]',
          'div:has-text("Apogem")',
        ];

        for (const selector of resultSelectors) {
          try {
            const result = await page.locator(selector).first();
            if (await result.isVisible({ timeout: 2000 })) {
              await result.click();
              await page.waitForTimeout(5000); // Wait for data to load
              break;
            }
          } catch (e) {
            continue;
          }
        }

        await page.screenshot({
          path: join(screenshotsDir, '04-client-details.png'),
          fullPage: true,
        });
        console.log('   ✅ Saved: 04-client-details.png\n');

        // Scroll to see charts
        console.log('5️⃣  Capturing performance metrics...');
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: join(screenshotsDir, '05-client-charts.png'),
          fullPage: false,
        });
        console.log('   ✅ Saved: 05-client-charts.png\n');
      } catch (e) {
        console.log('   ⚠️  Could not capture client details\n');
      }
    }

    // 5. Settings Page & Theme Switching
    console.log('6️⃣  Navigating to settings...');
    await page.goto('http://localhost:3000/dashboard/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '06-settings-page.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 06-settings-page.png\n');

    // Try to switch to Dark mode
    console.log('7️⃣  Switching to Dark mode...');
    try {
      const darkButton = await page.locator('button:has-text("Dark"), button:has-text("dark")').first();
      if (await darkButton.isVisible({ timeout: 2000 })) {
        await darkButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('   ⚠️  Could not find dark mode button\n');
    }

    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '07-dashboard-dark.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 07-dashboard-dark.png\n');

    // Try to switch to Asian mode
    console.log('8️⃣  Switching to Asian mode...');
    await page.goto('http://localhost:3000/dashboard/settings');
    await page.waitForTimeout(2000);
    try {
      const asianButton = await page.locator('button:has-text("Asian"), button:has-text("asian")').first();
      if (await asianButton.isVisible({ timeout: 2000 })) {
        await asianButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('   ⚠️  Could not find asian mode button\n');
    }

    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '08-dashboard-asian.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 08-dashboard-asian.png\n');

    // 6. Glossary Page
    console.log('9️⃣  Capturing glossary page...');
    await page.goto('http://localhost:3000/dashboard/glossary');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '09-glossary.png'),
      fullPage: true,
    });
    console.log('   ✅ Saved: 09-glossary.png\n');

    // 7. Reports Page
    console.log('🔟 Capturing reports page...');
    await page.goto('http://localhost:3000/dashboard/reports');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '10-reports.png'),
      fullPage: false,
    });
    console.log('   ✅ Saved: 10-reports.png\n');

    // 8. Mobile View
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
  } finally {
    await browser.close();
  }
}

captureScreenshots();
