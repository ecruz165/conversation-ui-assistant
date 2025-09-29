.PHONY: help setup develop-app run stop demo-stop logs status
.PHONY: docker-dev docker-prod docker-stop docker-logs docker-clean
.PHONY: build-all test-all clean-all deploy-check deploy
.PHONY: lint format type-check quality-check
.PHONY: test-e2e test-load test-security test-suite-all
.PHONY: postgres-dev postgres-stop postgres-status postgres-logs
.PHONY: deps-overview deps-check-all demo-run demo-stop

# Default target
help:
	@echo "🚀 Conversation UI Assistant - System Orchestration"
	@echo ""
	@echo "📋 SYSTEM SETUP:"
	@echo "  setup           - Install all dependencies + pre-commit hooks"
	@echo "  develop-app     - Full development setup (database + backend build)"
	@echo ""
	@echo "🚀 SYSTEM DEMO:"
	@echo "  run             - Run full system demo (Development Mode)"
	@echo "  stop            - Stop all environments (development + IDE)"
	@echo ""
	@echo "🚀 DEPLOYMENT:"
	@echo "  deploy          - Deploy to AWS environment"
	@echo "  deploy PROFILE=local - Deploy to localstack (local AWS simulation)"
	@echo ""
	@echo "🔧 IDE DEVELOPMENT:"
	@echo "  logs            - View logs from all IDE services"
	@echo "  status          - Check status and health of all IDE services"
	@echo ""
	@echo "🐳 DOCKER ORCHESTRATION:"
	@echo "  docker-dev      - Start development environment"
	@echo "  docker-prod     - Start production environment"
	@echo "  docker-stop     - Stop all containers"
	@echo "  docker-logs     - View container logs"
	@echo "  docker-clean    - Clean Docker resources"
	@echo ""
	@echo "🏗️  SYSTEM-LEVEL BUILDS:"
	@echo "  build-all       - Build all modules for deployment"
	@echo "  test-all        - Test all modules with dependencies (IDE profile)"
	@echo "  clean-all       - Clean all modules"
	@echo "  deploy-check    - Full deployment readiness check"
	@echo ""
	@echo "🏢 TENANT DEMOS:"
	@echo "  tenants-help    - Show tenant demo commands"
	@echo "  tenants-list    - List available tenant demos"
	@echo "  tenants-run     - Run all tenant demos"
	@echo "  tenants-stop    - Stop all tenant demos"
	@echo ""
	@echo "🗄️  DATABASE HELPERS:"
	@echo "  postgres-dev    - Start PostgreSQL for development"
	@echo "  postgres-stop   - Stop PostgreSQL container"
	@echo "  postgres-status - Check PostgreSQL status"
	@echo "  postgres-logs   - View PostgreSQL logs"
	@echo ""
	@echo "🧪 TESTING SUITE:"
	@echo "  test-e2e        - Run end-to-end tests"
	@echo "  test-load       - Run load tests"
	@echo "  test-security   - Run security tests"
	@echo "  test-suite-all  - Run complete testing suite"
	@echo ""
	@echo "🔍 CODE QUALITY:"
	@echo "  lint            - Run Biome linting"
	@echo "  format          - Format code with Biome"
	@echo "  type-check      - TypeScript compilation check"
	@echo "  quality-check   - Run all quality checks"
	@echo ""
	@echo "📁 MODULE COMMANDS:"
	@echo "  For individual modules, cd into the module and run:"
	@echo "    cd backend/management-service && make help"
	@echo "    cd frontend/management-ui && make help"
	@echo "    cd infrastructure && make help"
	@echo "    cd testing && make help"
	@echo ""
	@echo "🔗 DEPENDENCY MANAGEMENT:"
	@echo "  deps-overview   - Show all running services and dependencies"
	@echo "  deps-check-all  - Check dependency status across all modules"

# ============================================================================
# SETUP & DEVELOPMENT
# ============================================================================

setup:
	@echo "🔧 Setting up development environment..."
	pnpm install
	pre-commit install
	@echo "✅ Setup complete!"

develop-app:
	@echo "🚀 Starting full development setup..."
	pnpm run db:start
	mvn clean install
	@echo "✅ Development environment ready!"

dev:
	@echo "🎯 Starting full development environment..."
	pnpm run dev:all

# ============================================================================
# DEMO ENVIRONMENT
# ============================================================================

# Run full system demo (Development Mode)
run:
	@echo "🚀 Running full system demo (Development Mode)..."
	@echo "📦 Starting all services in development mode..."
	@echo ""
	@echo "🗄️  Starting PostgreSQL..."
	@cd backend/management-service && make deps-start
	@echo ""
	@echo "🔧 Starting backend services..."
	@cd backend/management-service && make run &
	@cd backend/navigation-service && make run &
	@echo ""
	@echo "🎯 Starting frontend services..."
	@cd frontend/management-ui && make run &
	@echo ""
	@echo "⏳ Waiting for services to start..."
	@sleep 10
	@echo ""
	@echo "✅ Full system demo started!"
	@echo ""
	@echo "🌐 **Access Points:**"
	@echo "  📱 Management UI (with Chat Widget MFE): http://localhost:3000"
	@echo ""
	@echo "🔧 **Backend APIs:**"
	@echo "  ⚙️  Management API:    http://localhost:8080"
	@echo "  🧭 Navigation API:    http://localhost:8081"
	@echo ""
	@echo "🗄️  **Database:**"
	@echo "  🐘 PostgreSQL:        localhost:5432"
	@echo ""
	@echo "🏢 **Tenant Demos:**"
	@echo "  Use 'make tenants-run' to start tenant applications"
	@echo "  Use 'make tenants-list' to see available demos"
	@echo ""
	@echo "💡 **Usage Tips:**"
	@echo "  • Use 'make stop' to stop all services"
	@echo "  • Use 'make deps-overview' to check status"
	@echo "  • Chat Widget MFE available at: http://localhost:3000/assets/remoteEntry.js"

# Stop demo environment (alias for stop)
demo-stop: stop

# Stop all environments (development + IDE)
stop:
	@echo "🛑 Stopping all environments..."
	@echo "🔧 Stopping development services..."
	@pkill -f "spring-boot:run" 2>/dev/null || true
	@pkill -f "vite.*--port.*3000" 2>/dev/null || true
	@pkill -f "webpack.*serve.*tenant" 2>/dev/null || true
	@echo "🔧 Stopping IDE development environment..."
	@docker-compose -f docker-compose.ide.yml down 2>/dev/null || true
	@echo "✅ All environments stopped!"

# ============================================================================
# DEPLOYMENT
# ============================================================================

# Deploy to AWS environment (supports PROFILE=local for localstack)
deploy:
	@if [ "$(PROFILE)" = "local" ]; then \
		echo "🚀 Deploying to localstack (local AWS simulation)..."; \
		echo "🔧 Starting localstack infrastructure..."; \
		docker-compose -f docker-compose.localstack.yml up -d; \
		echo "📦 Deploying all services to localstack..."; \
		echo "  • S3 buckets, Lambda functions, API Gateway, etc."; \
		echo "  • RDS instances, ECS services, CloudFormation stacks"; \
		echo "✅ Deployment to localstack completed!"; \
		echo ""; \
		echo "🌐 **Localstack Endpoints:**"; \
		echo "  • S3:          http://localhost:4566"; \
		echo "  • Lambda:      http://localhost:4566"; \
		echo "  • API Gateway: http://localhost:4566"; \
		echo "  • RDS:         http://localhost:4566"; \
		echo ""; \
		echo "💡 **Access localstack dashboard:** http://localhost:4566"; \
	else \
		echo "🚀 Deploying to AWS environment..."; \
		echo "🔧 Building and packaging all services..."; \
		$(MAKE) build-all; \
		echo "📦 Deploying to AWS using CDK/CloudFormation..."; \
		echo "  • Backend services to ECS/Lambda"; \
		echo "  • Frontend to S3 + CloudFront"; \
		echo "  • Database to RDS"; \
		echo "  • Infrastructure as Code"; \
		echo "✅ Deployment to AWS completed!"; \
		echo ""; \
		echo "💡 **Check AWS Console for deployment status**"; \
	fi



logs:
	@echo "📋 Viewing logs from all IDE services..."
	docker-compose -f docker-compose.ide.yml logs -f

status:
	@echo "📊 IDE Development Environment Status:"
	@echo ""
	docker-compose -f docker-compose.ide.yml ps
	@echo ""
	@echo "🔍 Health Checks:"
	@curl -s http://localhost:8080/actuator/health 2>/dev/null | jq . && echo "✅ Management Service: Healthy" || echo "❌ Management Service: Not responding"
	@curl -s http://localhost:8081/actuator/health 2>/dev/null | jq . && echo "✅ Navigation Service: Healthy" || echo "❌ Navigation Service: Not responding"

# ============================================================================
# BACKEND (Maven)
# ============================================================================

backend-clean:
	@echo "🧹 Cleaning backend build artifacts..."
	mvn clean

backend-compile:
	@echo "🔨 Compiling backend sources..."
	mvn compile

backend-test:
	@echo "🧪 Running backend tests..."
	mvn test

backend-package:
	@echo "📦 Packaging backend..."
	mvn package

backend-install:
	@echo "📥 Installing backend to local repository..."
	mvn install

backend-verify:
	@echo "✅ Running backend integration tests..."
	mvn verify

backend-deploy:
	@echo "🚀 Deploying backend..."
	mvn deploy

backend-build:
	@echo "🏗️  Building backend (clean + package)..."
	mvn clean package

backend-start:
	@echo "▶️  Starting backend services..."
	mvn spring-boot:run

backend-dev:
	@echo "🔧 Starting backend in development mode..."
	mvn spring-boot:run -Dspring-boot.run.profiles=ide

# ============================================================================
# FRONTEND (pnpm)
# ============================================================================

frontend-clean:
	@echo "🧹 Cleaning frontend build artifacts..."
	pnpm run clean:frontend

frontend-build:
	@echo "🏗️  Building frontend applications..."
	pnpm run build:frontend

frontend-dev:
	@echo "🎨 Starting frontend development servers..."
	pnpm run dev:frontend

frontend-test:
	@echo "🧪 Running frontend tests..."
	pnpm run test:frontend

frontend-lint:
	@echo "🔍 Linting frontend code..."
	pnpm run lint

frontend-format:
	@echo "✨ Formatting frontend code..."
	pnpm run format

frontend-type-check:
	@echo "📝 Checking TypeScript types..."
	pnpm run type-check

# ============================================================================
# CODE QUALITY (Biome + Tools)
# ============================================================================

lint:
	@echo "🔍 Running Biome linting..."
	pnpm run lint

format:
	@echo "✨ Formatting code with Biome..."
	pnpm run format

type-check:
	@echo "📝 Running TypeScript type checking..."
	pnpm run type-check

pre-commit:
	@echo "🔒 Running pre-commit hooks..."
	pnpm run pre-commit

quality-check: lint type-check
	@echo "✅ All quality checks passed!"

# ============================================================================
# DOCKER
# ============================================================================

docker-dev:
	@echo "🐳 Starting development Docker environment..."
	pnpm run docker:dev

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	pnpm run docker:stop

docker-logs:
	@echo "📋 Viewing Docker logs..."
	pnpm run docker:logs

docker-clean:
	@echo "🧹 Cleaning Docker resources..."
	pnpm run docker:clean

# ============================================================================
# SYSTEM-LEVEL WORKFLOWS
# ============================================================================

# Build all modules for deployment
build-all:
	@echo "🏗️  Building all modules..."
	@cd backend/management-service && make build
	@cd backend/navigation-service && make build
	@cd frontend/management-ui && make build
	@cd frontend/management-ui && make build-mfe
	@cd infrastructure && make build
	@echo "✅ All modules built successfully!"

# Clean all modules
clean-all:
	@echo "🧹 Cleaning all modules..."
	@cd backend/management-service && make clean
	@cd backend/navigation-service && make clean
	@cd frontend/management-ui && make clean
	@cd infrastructure && make clean
	@echo "✅ All modules cleaned!"

# Test all modules with dependencies (IDE profile)
test-all:
	@echo "🧪 Testing all modules with dependencies (IDE profile)..."
	@echo "🗄️  Starting shared PostgreSQL if needed..."
	@cd backend/management-service && make deps-start
	@echo "🧪 Running backend tests..."
	@cd backend/management-service && make test
	@cd backend/navigation-service && make test
	@echo "🧪 Running frontend tests..."
	@cd frontend/management-ui && make test
	@cd infrastructure && make test
	@echo "✅ All modules tested successfully!"

# ============================================================================
# TENANT DEMO COMMANDS
# ============================================================================

# Show tenant demo help
tenants-help:
	@echo "🏢 Tenant Demo Commands:"
	@echo ""
	@echo "Available tenant demos:"
	@echo "  tenant-a-healthcare  - Healthcare organization demo (port 3100)"
	@echo ""
	@echo "Commands:"
	@echo "  tenants-list         - List all available tenant demos"
	@echo "  tenants-run          - Start all tenant demos"
	@echo "  tenants-stop         - Stop all tenant demos"
	@echo "  tenants-status       - Check status of all tenant demos"
	@echo ""
	@echo "Individual tenant commands:"
	@echo "  cd tenants/tenant-a-healthcare && make help"
	@echo "  cd tenants/tenant-a-healthcare && make run"

# List available tenant demos
tenants-list:
	@echo "🏢 Available Tenant Demos:"
	@echo ""
	@find tenants -maxdepth 1 -type d -name "tenant-*" 2>/dev/null | while read dir; do \
		if [ -f "$$dir/package.json" ]; then \
			name=$$(basename "$$dir"); \
			desc=$$(grep '"description"' "$$dir/package.json" | sed 's/.*"description": *"\([^"]*\)".*/\1/'); \
			port=$$(grep 'TENANT_PORT' "$$dir/Makefile" 2>/dev/null | head -1 | sed 's/.*= *\([0-9]*\).*/\1/' || echo "N/A"); \
			echo "  $$name"; \
			echo "    Description: $$desc"; \
			echo "    Port: $$port"; \
			echo ""; \
		fi; \
	done || echo "  No tenant demos found"

# Start all tenant demos
tenants-run:
	@echo "🚀 Starting all tenant demos..."
	@echo "Note: This will start tenant demos in the background"
	@find tenants -maxdepth 1 -type d -name "tenant-*" 2>/dev/null | while read dir; do \
		if [ -f "$$dir/Makefile" ]; then \
			echo "Starting $$(basename "$$dir")..."; \
			cd "$$dir" && make run & \
		fi; \
	done || echo "No tenant demos found"
	@echo "✅ All tenant demos started!"
	@echo "Use 'make tenants-status' to check their status"

# Stop all tenant demos
tenants-stop:
	@echo "🛑 Stopping all tenant demos..."
	@pkill -f "webpack.*serve.*tenant" 2>/dev/null || true
	@echo "✅ All tenant demos stopped!"

# Check status of all tenant demos
tenants-status:
	@echo "📊 Tenant Demo Status:"
	@echo ""
	@find tenants -maxdepth 1 -type d -name "tenant-*" 2>/dev/null | while read dir; do \
		if [ -f "$$dir/Makefile" ]; then \
			name=$$(basename "$$dir"); \
			port=$$(grep 'TENANT_PORT' "$$dir/Makefile" 2>/dev/null | head -1 | sed 's/.*= *\([0-9]*\).*/\1/' || echo "3000"); \
			if curl -s http://localhost:$$port > /dev/null 2>&1; then \
				echo "  ✅ $$name - Running on port $$port"; \
			else \
				echo "  ❌ $$name - Not running"; \
			fi; \
		fi; \
	done || echo "  No tenant demos found"

# Full deployment check
deploy-check: clean-all build-all test-all
	@echo "✅ Full deployment check completed successfully!"

# ============================================================================
# TESTING SUITE
# ============================================================================

# End-to-end tests
test-e2e:
	@echo "🎭 Running end-to-end tests..."
	@cd testing && make test-e2e

# Load tests
test-load:
	@echo "⚡ Running load tests..."
	@cd testing && make test-load



# Security tests
test-security:
	@echo "🔒 Running security tests..."
	@cd testing && make test-security

# Complete testing suite
test-suite-all:
	@echo "🚀 Running complete testing suite..."
	@cd testing && make test-all

# ============================================================================
# DATABASE HELPERS
# ============================================================================

# Start PostgreSQL for development
postgres-dev:
	@echo "🗄️  Starting PostgreSQL for development..."
	@cd infrastructure && docker-compose up -d postgres
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@cd infrastructure && docker-compose exec postgres pg_isready -U conversation_user -d conversation_ui || \
		(echo "⏳ PostgreSQL starting up, please wait..." && sleep 5 && \
		 docker-compose exec postgres pg_isready -U conversation_user -d conversation_ui)
	@echo "✅ PostgreSQL is ready at localhost:5432"
	@echo "📋 Database: conversation_ui"
	@echo "👤 User: conversation_user"
	@echo "🔑 Password: conversation_pass"

# Stop PostgreSQL container
postgres-stop:
	@echo "🛑 Stopping PostgreSQL..."
	@cd infrastructure && docker-compose stop postgres

# Check PostgreSQL status
postgres-status:
	@echo "📊 PostgreSQL Status:"
	@cd infrastructure && docker-compose ps postgres || echo "❌ PostgreSQL container not found"
	@echo ""
	@echo "🔍 Connection Test:"
	@cd infrastructure && docker-compose exec postgres pg_isready -U conversation_user -d conversation_ui 2>/dev/null && \
		echo "✅ PostgreSQL is ready and accepting connections" || \
		echo "❌ PostgreSQL is not ready or not running"

# View PostgreSQL logs
postgres-logs:
	@echo "📋 PostgreSQL Logs:"
	@cd infrastructure && docker-compose logs -f postgres

# ============================================================================
# DEPENDENCY MANAGEMENT
# ============================================================================

# Show comprehensive overview of all running services
deps-overview:
	@echo "🔗 Conversation UI Assistant - Dependency Overview"
	@echo "=================================================="
	@echo ""
	@echo "🗄️  SHARED POSTGRESQL:"
	@if pg_isready -h localhost -p 5432 -U conversation_user -d conversation_ui > /dev/null 2>&1; then \
		echo "✅ PostgreSQL: Running on localhost:5432"; \
		echo "   📦 Container: $$(docker ps --filter name=shared-postgres-ide --format '{{.Names}}' 2>/dev/null || echo 'Not in shared container')"; \
	else \
		echo "❌ PostgreSQL: Not running"; \
	fi
	@echo ""
	@echo "🔧 BACKEND SERVICES:"
	@if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then \
		echo "✅ Management Service: Running on localhost:8080"; \
	else \
		echo "❌ Management Service: Not running"; \
	fi
	@if curl -s http://localhost:8081/actuator/health > /dev/null 2>&1; then \
		echo "✅ Navigation Service: Running on localhost:8081"; \
	else \
		echo "❌ Navigation Service: Not running"; \
	fi
	@echo ""
	@echo "🎯 FRONTEND SERVICES:"
	@if curl -s http://localhost:3000 > /dev/null 2>&1; then \
		echo "✅ Management UI (with Chat Widget MFE): Running on localhost:3000"; \
	else \
		echo "❌ Management UI: Not running"; \
	fi
	@echo ""
	@echo "🐳 DOCKER CONTAINERS:"
	@docker ps --filter name=shared-postgres-ide --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No shared containers found"
	@echo ""
	@echo "💡 TIP: Use 'make deps-check-all' for detailed module dependency status"

# Check dependency status across all modules
deps-check-all:
	@echo "🔍 Checking Dependencies Across All Modules"
	@echo "============================================"
	@echo ""
	@echo "🔧 BACKEND MODULES:"
	@echo "-------------------"
	@echo "📦 Management Service:"
	@cd backend/management-service && $(MAKE) deps-check 2>/dev/null || echo "❌ Module not available"
	@echo ""
	@echo "📦 Navigation Service:"
	@cd backend/navigation-service && $(MAKE) deps-check 2>/dev/null || echo "❌ Module not available"
	@echo ""
	@echo "🎯 FRONTEND MODULES:"
	@echo "--------------------"
	@echo "📦 Management UI (includes Chat Widget MFE):"
	@cd frontend/management-ui && $(MAKE) deps-check 2>/dev/null || echo "❌ Module not available"
