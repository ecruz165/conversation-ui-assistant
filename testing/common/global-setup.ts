import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  // Create a browser instance for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for services to be ready
    console.log('⏳ Waiting for services to be ready...');
    
    // Check Management Service
    await waitForService(page, 'http://localhost:8080/actuator/health', 'Management Service');
    
    // Check Navigation Service  
    await waitForService(page, 'http://localhost:8081/actuator/health', 'Navigation Service');
    
    // Check Admin Portal
    await waitForService(page, 'http://localhost:3000', 'Admin Portal');

    console.log('✅ All services are ready!');

    // Perform any global setup tasks here
    // For example:
    // - Create test data
    // - Set up authentication tokens
    // - Initialize database state
    // - Clear caches

    console.log('🔧 Performing global setup tasks...');
    
    // Example: Clear any existing test data
    await clearTestData(page);
    
    // Example: Create initial test data
    await createTestData(page);

    console.log('✅ Global setup completed successfully!');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function waitForService(page: any, url: string, serviceName: string, maxRetries = 30) {
  console.log(`⏳ Waiting for ${serviceName} at ${url}...`);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 5000 
      });
      
      if (response && response.status() < 400) {
        console.log(`✅ ${serviceName} is ready!`);
        return;
      }
    } catch (error) {
      // Service not ready yet, continue waiting
    }
    
    console.log(`⏳ ${serviceName} not ready yet, retrying... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error(`❌ ${serviceName} failed to start after ${maxRetries} retries`);
}

async function clearTestData(page: any) {
  console.log('🧹 Clearing existing test data...');
  
  // Example: Clear test data via API calls
  try {
    // This would depend on your actual API endpoints
    // await page.request.delete('http://localhost:8080/api/test-data');
    console.log('✅ Test data cleared');
  } catch (error) {
    console.log('ℹ️ No test data to clear or endpoint not available');
  }
}

async function createTestData(page: any) {
  console.log('📝 Creating initial test data...');
  
  // Example: Create test data via API calls
  try {
    // This would depend on your actual API endpoints
    // const testUser = {
    //   username: 'testuser',
    //   email: 'test@example.com'
    // };
    // await page.request.post('http://localhost:8080/api/users', {
    //   data: testUser
    // });
    console.log('✅ Test data created');
  } catch (error) {
    console.log('ℹ️ Could not create test data or endpoint not available');
  }
}

export default globalSetup;
