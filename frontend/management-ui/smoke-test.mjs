import { chromium } from 'playwright';

/**
 * Smoke test to verify the application loads and renders after linting fixes
 */
async function runSmokeTest() {
    console.log('🚀 Starting Playwright Smoke Test...\n');

    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });

    const page = await context.newPage();

    try {
        // Collect console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Collect page errors
        const pageErrors = [];
        page.on('pageerror', error => {
            pageErrors.push(error.message);
        });

        // Navigate to the application
        console.log('📄 Loading application at http://localhost:3000/...');
        const response = await page.goto('http://localhost:3000/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Check response status
        const status = response.status();
        console.log(`✅ Response status: ${status}`);

        if (status !== 200) {
            throw new Error(`Expected 200 response, got ${status}`);
        }

        // Wait for React root to render
        console.log('⏳ Waiting for React application to mount...');
        await page.waitForSelector('#root', { timeout: 10000 });

        // Check if the root has content
        const rootHasContent = await page.evaluate(() => {
            const root = document.getElementById('root');
            return root && root.children.length > 0;
        });

        console.log(`✅ React root has content: ${rootHasContent}`);

        // Wait a bit more for any runtime errors to surface
        await page.waitForTimeout(2000);

        // Check for navigation elements (indicating app loaded)
        const hasNavigation = await page.locator('nav, header, [role="navigation"]').count() > 0;
        console.log(`✅ Navigation elements found: ${hasNavigation}`);

        // Take screenshot
        console.log('📸 Taking screenshot...');
        await page.screenshot({
            path: 'test-results/smoke-test-screenshot.png',
            fullPage: true
        });

        // Report results
        console.log('\n📊 Test Results:');
        console.log(`   ✅ Application loaded: ${status === 200 ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ React mounted: ${rootHasContent ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Navigation rendered: ${hasNavigation ? 'PASS' : 'FAIL'}`);
        console.log(`   ⚠️  Console errors: ${consoleErrors.length}`);
        console.log(`   ⚠️  Page errors: ${pageErrors.length}`);

        if (consoleErrors.length > 0) {
            console.log('\n❌ Console Errors:');
            consoleErrors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err.substring(0, 100)}${err.length > 100 ? '...' : ''}`);
            });
        }

        if (pageErrors.length > 0) {
            console.log('\n❌ Page Errors:');
            pageErrors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err.substring(0, 100)}${err.length > 100 ? '...' : ''}`);
            });
        }

        const allTestsPassed = status === 200 &&
                              rootHasContent &&
                              hasNavigation &&
                              pageErrors.length === 0;

        if (allTestsPassed) {
            console.log('\n🎊 All smoke tests PASSED! Application is working correctly after linting fixes.');
        } else {
            console.log('\n⚠️  Some tests FAILED or warnings detected. Check the details above.');
        }

        return allTestsPassed;

    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// Run the test
runSmokeTest()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test runner crashed:', error);
        process.exit(1);
    });
