# Demo App Makefile
# Standard commands that work across all modules

.PHONY: help build test run clean package install dev logs ensure-build

# Reusable function to ensure build exists
ensure-build:
	@if [ ! -d "dist" ]; then \
		echo "📦 No build found. Building first..."; \
		$(MAKE) build; \
	fi

# Default target
help:
	@echo "🎯 Demo App Commands:"
	@echo ""
	@echo "🏗️  Building:"
	@echo "  build       - Build the module"
	@echo "  ensure-build- Ensure build exists (build if needed)"
	@echo "  package     - Create deployable artifact"
	@echo ""
	@echo "🚀 Running:"
	@echo "  dev         - Start in development mode"
	@echo "  run         - Start module locally (production)"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  test        - Run tests"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  install     - Install dependencies"
	@echo "  clean       - Clean build artifacts"
	@echo "  logs        - View module logs"
	@echo ""
	@echo "🗄️  Backend Services:"
	@echo "  backend-up    - Start navigation-service, chat-widget-mfe, and database"
	@echo "  backend-down  - Stop backend services"
	@echo "  backend-logs  - View backend service logs"
	@echo "  backend-status - Check backend service status"
	@echo "  full-dev      - Start all services and demo app dev server"

# Build the module
build:
	@echo "🔨 Building Demo App..."
	pnpm build

# Run tests
test:
	@echo "🧪 Running Demo App tests..."
	pnpm test

# Start module locally (production build)
run: ensure-build
	@echo "🚀 Starting Demo App (production)..."
	pnpm preview

# Development mode with hot reload
dev:
	@echo "🔥 Starting Demo App in development mode..."
	pnpm dev

# Create deployable artifact (same as build for frontend)
package: ensure-build
	@echo "📦 Packaging Demo App..."
	@echo "✅ Build already exists or created"

# Install dependencies
install:
	@echo "📥 Installing Demo App dependencies..."
	pnpm install

# Clean build artifacts
clean:
	@echo "🧹 Cleaning Demo App..."
	rm -rf dist node_modules/.vite

# View module logs
logs:
	@echo "📋 Demo App logs..."
	@docker logs demo-app-frontend --tail=50 -f 2>/dev/null || echo "Service not running in Docker"

# Start backend services (navigation-service + database)
backend-up:
	@echo "🚀 Starting backend services for Demo App..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ Backend services started:"
	@echo "  💬 Navigation Service: http://localhost:8081"
	@echo "  🗄️  PostgreSQL: localhost:5432"
	@echo "  🔍 Health Check: http://localhost:8081/actuator/health"

# Stop backend services
backend-down:
	@echo "🛑 Stopping backend services..."
	docker-compose down

# View backend service logs
backend-logs:
	@echo "📋 Backend service logs..."
	docker-compose logs -f

# Check backend service status
backend-status:
	@echo "📊 Backend service status..."
	@docker-compose ps
	@echo ""
	@echo "🔍 Health checks:"
	@curl -s http://localhost:8081/actuator/health 2>/dev/null | jq . || echo "❌ Navigation Service not responding"

# Start backend services and demo app dev server
full-dev: backend-up
	@echo "🔥 Starting full development environment..."
	@echo "⏳ Waiting for backend to be fully ready..."
	@sleep 15
	@echo "🚀 Starting demo app development server..."
	pnpm dev
