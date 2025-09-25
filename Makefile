.PHONY: help setup develop-app run stop logs status
.PHONY: docker-dev docker-prod docker-stop docker-logs docker-clean
.PHONY: build-all test-all clean-all deploy-check
.PHONY: lint format type-check quality-check
.PHONY: test-e2e test-load test-security test-suite-all
.PHONY: postgres-dev postgres-stop postgres-status postgres-logs

# Default target
help:
	@echo "🚀 Conversation UI Assistant - System Orchestration"
	@echo ""
	@echo "📋 SYSTEM SETUP:"
	@echo "  setup           - Install all dependencies + pre-commit hooks"
	@echo "  develop-app     - Full development setup (database + backend build)"
	@echo ""
	@echo "🚀 IDE DEVELOPMENT ENVIRONMENT:"
	@echo "  run             - Start complete IDE environment (all services with IDE profile)"
	@echo "  stop            - Stop all IDE services"
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
	@echo "  test-all        - Test all modules"
	@echo "  clean-all       - Clean all modules"
	@echo "  deploy-check    - Full deployment readiness check"
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

run:
	@echo "🚀 Starting complete IDE development environment..."
	@echo "📦 Using comprehensive Docker Compose with IDE profile..."
	@echo "🔧 This will start all services: backend + frontend + database + tools"
	@echo ""
	docker-compose -f docker-compose.ide.yml up -d
	@echo ""
	@echo "⏳ Waiting for services to start..."
	@sleep 10
	@echo ""
	@echo "✅ Complete development environment started!"
	@echo ""
	@echo "🌐 **Access Points:**"
	@echo "  📱 Management UI:     http://localhost:3000"
	@echo "  🎯 Demo App:          http://localhost:3001"
	@echo "  💬 Chat Widget MFE:   http://localhost:3002"
	@echo ""
	@echo "🔧 **Backend Services:**"
	@echo "  ⚙️  Management API:    http://localhost:8080"
	@echo "  🧭 Navigation API:    http://localhost:8081"
	@echo ""
	@echo "🗄️  **Database & Tools:**"
	@echo "  🐘 PostgreSQL Main:   localhost:5432 (management-service)"
	@echo "  🐘 PostgreSQL Nav:    localhost:5433 (navigation-service)"
	@echo "  🔍 pgAdmin:           http://localhost:8083"
	@echo ""
	@echo "📋 **Health Checks:**"
	@echo "  Management Service:   http://localhost:8080/actuator/health"
	@echo "  Navigation Service:   http://localhost:8081/actuator/health"

stop:
	@echo "🛑 Stopping complete IDE development environment..."
	docker-compose -f docker-compose.ide.yml down
	@echo "✅ All services stopped!"

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
	mvn spring-boot:run -Dspring-boot.run.profiles=dev

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

docker-prod:
	@echo "🐳 Starting production Docker environment..."
	pnpm run docker:prod

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
	@cd frontend/demo-app && make build
	@cd infrastructure && make build
	@echo "✅ All modules built successfully!"

# Clean all modules
clean-all:
	@echo "🧹 Cleaning all modules..."
	@cd backend/management-service && make clean
	@cd backend/navigation-service && make clean
	@cd frontend/management-ui && make clean
	@cd frontend/demo-app && make clean
	@cd infrastructure && make clean
	@echo "✅ All modules cleaned!"

# Test all modules
test-all:
	@echo "🧪 Testing all modules..."
	@cd backend/management-service && make test
	@cd backend/navigation-service && make test
	@cd frontend/management-ui && make test
	@cd frontend/demo-app && make test
	@cd infrastructure && make test
	@echo "✅ All modules tested successfully!"

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
