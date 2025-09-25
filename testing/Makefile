# Testing Suite Makefile
# Provides consistent commands for all types of testing

.PHONY: help install clean test-e2e test-load test-stress test-integration test-security test-all

# Default target
help:
	@echo "🧪 Testing Suite Commands:"
	@echo ""
	@echo "Setup Commands:"
	@echo "  install          Install testing dependencies and tools"
	@echo "  clean            Clean test artifacts and reports"
	@echo ""
	@echo "Test Commands:"
	@echo "  test-e2e         Run end-to-end tests"
	@echo "  test-e2e-ui      Run E2E tests with UI mode"
	@echo "  test-load        Run load tests"
	@echo "  test-stress      Run stress tests"
	@echo "  test-integration Run integration tests"
	@echo "  test-security    Run security tests"
	@echo "  test-api         Run API tests"
	@echo ""
	@echo "Comprehensive Commands:"
	@echo "  test-all         Run all test suites"
	@echo "  test-ci          Run tests suitable for CI/CD"
	@echo ""
	@echo "Environment Commands:"
	@echo "  env-local        Set up local testing environment"
	@echo "  env-docker       Set up Docker testing environment"
	@echo ""

# Setup Commands
install:
	@echo "📦 Installing testing dependencies..."
	npm install
	npx playwright install
	@echo "✅ Testing tools installed successfully!"

clean:
	@echo "🧹 Cleaning test artifacts..."
	rm -rf test-results/
	rm -rf playwright-report/
	rm -rf coverage/
	rm -rf reports/
	@echo "✅ Test artifacts cleaned!"

# E2E Testing
test-e2e:
	@echo "🎭 Running end-to-end tests..."
	npx playwright test

test-e2e-ui:
	@echo "🎭 Running E2E tests with UI..."
	npx playwright test --ui

test-e2e-headed:
	@echo "🎭 Running E2E tests in headed mode..."
	npx playwright test --headed

# Load Testing
test-load:
	@echo "⚡ Running load tests..."
	k6 run load/scenarios/basic-load.js

test-load-spike:
	@echo "📈 Running spike load tests..."
	k6 run load/scenarios/spike-test.js

# Stress Testing
test-stress:
	@echo "💪 Running stress tests..."
	k6 run stress/scenarios/stress-test.js

# Integration Testing
test-integration:
	@echo "🔗 Running integration tests..."
	newman run integration/api/conversation-ui.postman_collection.json

test-api:
	@echo "🌐 Running API tests..."
	newman run integration/api/conversation-ui.postman_collection.json

# Security Testing
test-security:
	@echo "🔒 Running security tests..."
	@echo "Note: Requires OWASP ZAP to be installed"
	# zap-baseline.py -t http://localhost:8080

# Comprehensive Testing
test-all:
	@echo "🚀 Running all test suites..."
	$(MAKE) test-e2e
	$(MAKE) test-integration
	$(MAKE) test-load
	@echo "✅ All tests completed!"

test-ci:
	@echo "🤖 Running CI-suitable tests..."
	npx playwright test --reporter=junit
	newman run integration/api/conversation-ui.postman_collection.json --reporters junit

# Environment Setup
env-local:
	@echo "🏠 Setting up local testing environment..."
	@echo "Ensure services are running locally:"
	@echo "  - Management Service: http://localhost:8080"
	@echo "  - Navigation Service: http://localhost:8081"
	@echo "  - Admin Portal: http://localhost:3000"

env-docker:
	@echo "🐳 Setting up Docker testing environment..."
	cd ../infrastructure && docker-compose up -d
	@echo "Waiting for services to be ready..."
	sleep 30
	@echo "✅ Docker environment ready for testing!"
