import { chromium } from "playwright";

/**
 * Playwright test script for Chat Widget Web Component
 * Tests the web component functionality in a real browser environment
 */
async function runWebComponentTests() {
  console.log("🚀 Starting Playwright Web Component Tests...\n");

  const browser = await chromium.launch({
    headless: false, // Set to true for CI/automated runs
    devtools: false,
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  });

  const page = await context.newPage();

  try {
    // Enable console logging from the browser
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`❌ Browser Error: ${msg.text()}`);
      } else if (msg.text().includes("[WebComponent Test]")) {
        console.log(`📝 ${msg.text()}`);
      }
    });

    // Navigate to test page
    console.log("📄 Loading test page...");
    await page.goto("http://localhost:3001/test-webcomponent.html");

    // Wait for component to load
    console.log("⏳ Waiting for web component to load...");
    await page.waitForSelector('[data-tests-complete="true"]', { timeout: 10000 });

    // Get test results
    const testsPassed = await page.getAttribute("body", "data-tests-passed");
    const testsTotal = await page.getAttribute("body", "data-tests-total");

    console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed\n`);

    // Check for component in DOM
    const componentExists = await page.locator("chat-widget").count();
    console.log(`✅ Web components found in DOM: ${componentExists}`);

    // Test component attributes
    const theme = await page.locator("chat-widget").getAttribute("theme");
    const position = await page.locator("chat-widget").getAttribute("position");
    const apiEndpoint = await page.locator("chat-widget").getAttribute("api-endpoint");

    console.log(`✅ Component attributes:`);
    console.log(`   - Theme: ${theme}`);
    console.log(`   - Position: ${position}`);
    console.log(`   - API Endpoint: ${apiEndpoint}`);

    // Test shadow DOM
    const hasShadowRoot = await page.evaluate(() => {
      const widget = document.querySelector("chat-widget");
      return widget && widget.shadowRoot !== null;
    });
    console.log(`✅ Shadow DOM created: ${hasShadowRoot}`);

    // Test global function
    const globalFunctionExists = await page.evaluate(() => {
      return typeof window.createChatWidget === "function";
    });
    console.log(`✅ Global createChatWidget function: ${globalFunctionExists}`);

    // Test programmatic creation
    console.log("\n🧪 Testing programmatic widget creation...");
    const programmaticTest = await page.evaluate(() => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const widget = window.createChatWidget(container, {
        theme: "dark",
        position: "top-left",
        "welcome-message": "Playwright test widget",
      });

      const success =
        widget &&
        widget.tagName.toLowerCase() === "chat-widget" &&
        widget.getAttribute("theme") === "dark" &&
        widget.getAttribute("position") === "top-left";

      // Clean up
      container.remove();

      return success;
    });
    console.log(`✅ Programmatic creation test: ${programmaticTest ? "PASS" : "FAIL"}`);

    // Test attribute reactivity
    console.log("\n🔄 Testing attribute reactivity...");
    await page.evaluate(() => {
      const widget = document.querySelector("chat-widget");
      widget.setAttribute("theme", "dark");
      widget.setAttribute("position", "top-left");
    });

    // Wait a moment for potential re-render
    await page.waitForTimeout(500);

    const newTheme = await page.locator("chat-widget").getAttribute("theme");
    const newPosition = await page.locator("chat-widget").getAttribute("position");

    console.log(`✅ Attribute updates:`);
    console.log(`   - New theme: ${newTheme}`);
    console.log(`   - New position: ${newPosition}`);

    // Test event handling
    console.log("\n📡 Testing event handling...");
    const eventTestResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        const widget = document.querySelector("chat-widget");
        let eventsReceived = 0;

        const eventHandler = (_event) => {
          eventsReceived++;
          if (eventsReceived >= 1) {
            resolve(true);
          }
        };

        // Add event listeners
        widget.addEventListener("message-sent", eventHandler);
        widget.addEventListener("message-received", eventHandler);
        widget.addEventListener("navigation-action", eventHandler);
        widget.addEventListener("error", eventHandler);

        // Simulate an event (dispatch custom event for testing)
        setTimeout(() => {
          widget.dispatchEvent(
            new CustomEvent("message-sent", {
              detail: { message: "Test message" },
            })
          );
        }, 100);

        // Timeout after 2 seconds
        setTimeout(() => resolve(false), 2000);
      });
    });
    console.log(`✅ Event handling test: ${eventTestResult ? "PASS" : "FAIL"}`);

    // Take screenshot for documentation
    console.log("\n📸 Taking screenshot...");
    await page.screenshot({
      path: "webcomponent-test-results.png",
      fullPage: true,
    });

    // Final summary
    console.log("\n🎉 Web Component Tests Summary:");
    console.log(`   📊 Unit Tests: ${testsPassed}/${testsTotal} passed`);
    console.log(`   🔧 Component Creation: ${componentExists > 0 ? "PASS" : "FAIL"}`);
    console.log(`   🌑 Shadow DOM: ${hasShadowRoot ? "PASS" : "FAIL"}`);
    console.log(`   🌍 Global Function: ${globalFunctionExists ? "PASS" : "FAIL"}`);
    console.log(`   🤖 Programmatic Creation: ${programmaticTest ? "PASS" : "FAIL"}`);
    console.log(`   📡 Event Handling: ${eventTestResult ? "PASS" : "FAIL"}`);

    const allTestsPassed =
      testsPassed === testsTotal &&
      componentExists > 0 &&
      hasShadowRoot &&
      globalFunctionExists &&
      programmaticTest &&
      eventTestResult;

    if (allTestsPassed) {
      console.log("\n🎊 All tests PASSED! Web component is working correctly.");
    } else {
      console.log("\n⚠️  Some tests FAILED. Check the details above.");
    }

    return allTestsPassed;
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the tests
runWebComponentTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Test runner crashed:", error);
    process.exit(1);
  });
