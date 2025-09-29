# Management UI Makefile
# Frontend for Management Service (depends on: management-service → postgres)

# Standard module commands (consistent across all modules)
.PHONY: help build test run dev clean package install logs
.PHONY: deps-start deps-stop deps-check deps-status dev-with-deps
.PHONY: docker-run docker-stop health status
.PHONY: ensure-build preview wait-for-backend full-stack
.PHONY: build-webcomponent dev-webcomponent serve-webcomponent demo-webcomponent

# Dependencies: Management Service (which depends on PostgreSQL)
BACKEND_SERVICE=management-service
BACKEND_HOST=localhost
BACKEND_PORT=8080
BACKEND_HEALTH_URL=http://$(BACKEND_HOST):$(BACKEND_PORT)/actuator/health

# Helper function to wait for backend service to be ready
wait-for-backend:
	@echo "⏳ Waiting for $(BACKEND_SERVICE) to be ready..."
	@timeout=120; \
	while [ $$timeout -gt 0 ]; do \
		if curl -s $(BACKEND_HEALTH_URL) > /dev/null 2>&1; then \
			echo "✅ $(BACKEND_SERVICE) is ready!"; \
			exit 0; \
		fi; \
		echo "⏳ $(BACKEND_SERVICE) not ready, waiting... ($$timeout seconds left)"; \
		sleep 3; \
		timeout=$$((timeout-3)); \
	done; \
	echo "❌ $(BACKEND_SERVICE) failed to start within 120 seconds"; \
	exit 1

# Reusable function to ensure build exists
ensure-build:
	@if [ ! -d "dist" ]; then \
		echo "📦 No build found. Building first..."; \
		$(MAKE) build; \
	fi

# Default target
help:
	@echo "⚡ Management UI Commands:"
	@echo ""
	@echo "🏗️  Building:"
	@echo "  build       - Build the module"
	@echo "  build-webcomponent - Build standalone web component"
	@echo "  ensure-build- Ensure build exists (build if needed)"
	@echo "  package     - Create deployable artifact"
	@echo ""
	@echo "🚀 Running:"
	@echo "  run         - Run module (Docker Compose demo mode)"
	@echo "  dev         - Start in development mode (IDE profile)"
	@echo "  dev-webcomponent - Develop web component with watch mode"
	@echo "  serve-webcomponent - Serve built web component"
	@echo "  demo-webcomponent - Open web component demo page"
	@echo "  dev-with-deps - Start dependencies + frontend dev server"
	@echo "  docker-run  - Run in Docker container"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  test        - Run tests with backend dependencies"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  install     - Install dependencies"
	@echo "  clean       - Clean build artifacts"
	@echo "  logs        - View module logs"
	@echo ""
	@echo "🗄️  Dependencies (management-service → postgres):"
	@echo "  deps-check     - Check what dependencies are already running"
	@echo "  deps-start     - Start dependencies (reuses existing if available)"
	@echo "  deps-stop      - Stop all dependencies"
	@echo "  deps-status    - Check dependency status"
	@echo "  dev-with-deps  - Start dependencies + frontend dev server"
	@echo "  full-stack     - Start entire dependency chain"
	@echo ""
	@echo "🗄️  Backend Services (Legacy):"
	@echo "  backend-up    - Start management-service and database"
	@echo "  backend-down  - Stop backend services"
	@echo "  backend-logs  - View backend service logs"
	@echo "  backend-status - Check backend service status"
	@echo "  full-dev      - Start backend services and frontend dev server"
	@echo ""
	@echo "🐳 Docker (Zero Trust):"
	@echo "  docker-build  - Build Docker image"
	@echo "  docker-run    - Run Docker container"
	@echo "  docker-stop   - Stop Docker container"
	@echo "  docker-push   - Push to registry"

# Build the module
build:
	@echo "🔨 Building Management UI..."
	pnpm build


# Run tests (integration tests with backend dependencies)
test: deps-start
	@echo "🧪 Running Management UI tests with backend dependencies..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 5
	@echo "🚀 Running tests..."
	pnpm test

# Run module (standardized across all modules)
run:
	@echo "🚀 Running Management UI with Vite development server..."
	pnpm dev

# Preview production build (alias for run)
preview: run

# Development mode with IDE profile
dev:
	@echo "🔥 Starting Management UI in development mode (IDE profile)..."
	pnpm dev

# Create deployable artifact (same as build for frontend)
package: ensure-build
	@echo "📦 Packaging Management UI..."
	@echo "✅ Build already exists or created"

# Install dependencies
install:
	@echo "📥 Installing Management UI dependencies..."
	pnpm install

# Clean build artifacts
clean:
	@echo "🧹 Cleaning Management UI..."
	rm -rf dist .output node_modules/.vite

# Run in Docker container
docker-run:
	@echo "🐳 Running Management UI in Docker..."
	docker-compose up -d management-ui

# Stop Docker container
docker-stop:
	@echo "🛑 Stopping Management UI Docker container..."
	docker-compose down

# View module logs
logs:
	@echo "📋 Management UI logs..."
	@docker logs management-ui-frontend --tail=50 -f 2>/dev/null || echo "Service not running in Docker"

# Start backend services (management-service + database)
backend-up:
	@echo "🚀 Starting backend services for Management UI..."
	docker-compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ Backend services started:"
	@echo "  📊 Management Service: http://localhost:8080"
	@echo "  🗄️  PostgreSQL: localhost:5432"
	@echo "  🔍 Health Check: http://localhost:8080/actuator/health"

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
	@curl -s http://localhost:8080/actuator/health 2>/dev/null | jq . || echo "❌ Management Service not responding"

# Dependency Management Commands
deps-start:
	@echo "🚀 Starting Management UI dependencies..."
	@if curl -s $(BACKEND_HEALTH_URL) > /dev/null 2>&1; then \
		echo "✅ Management Service already running - reusing existing instance"; \
	else \
		echo "📦 Starting management-service (which will start postgres)..."; \
		cd ../../backend/management-service && $(MAKE) dev-with-deps & \
		$(MAKE) wait-for-backend; \
	fi
	@echo "✅ All dependencies ready!"

# Check what dependencies are already running
deps-check:
	@echo "🔍 Checking Management UI dependencies..."
	@echo ""
	@echo "🔧 Management Service:"
	@if curl -s $(BACKEND_HEALTH_URL) > /dev/null 2>&1; then \
		echo "✅ Management Service: Already running on $(BACKEND_HOST):$(BACKEND_PORT) - will reuse"; \
	else \
		echo "❌ Management Service: Not running - will start new instance"; \
	fi
	@echo ""
	@echo "🗄️  PostgreSQL (via management-service):"
	@if pg_isready -h localhost -p 5432 -U conversation_user -d conversation_ui > /dev/null 2>&1; then \
		echo "✅ PostgreSQL: Already running on localhost:5432 - will reuse"; \
	else \
		echo "❌ PostgreSQL: Not running - will start via management-service"; \
	fi

deps-stop:
	@echo "🛑 Stopping Management UI dependencies..."
	cd ../../backend/management-service && $(MAKE) deps-stop
	@echo "✅ All dependencies stopped!"

deps-status:
	@echo "📊 Management UI Dependencies Status:"
	@echo ""
	@echo "🔧 Management Service:"
	@if curl -s $(BACKEND_HEALTH_URL) > /dev/null 2>&1; then \
		echo "✅ Management Service: Running on $(BACKEND_HOST):$(BACKEND_PORT)"; \
	else \
		echo "❌ Management Service: Not running"; \
	fi
	@echo ""
	@echo "🗄️  PostgreSQL (via management-service):"
	cd ../../backend/management-service && $(MAKE) deps-status

dev-with-deps: deps-start
	@echo "🔥 Starting Management UI with dependencies..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 3
	@echo "🚀 Starting Management UI development server..."
	pnpm dev

full-stack: deps-start
	@echo "🔥 Starting full Management UI stack..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 3
	@echo "🚀 Starting Management UI development server..."
	pnpm dev

# Start backend services and frontend dev server (Legacy)
full-dev: backend-up
	@echo "🔥 Starting full development environment..."
	@echo "⏳ Waiting for backend to be fully ready..."
	@sleep 15
	@echo "🚀 Starting frontend development server..."
	pnpm dev

# Docker Commands for Zero Trust Deployment
docker-build:
	@echo "🐳 Building Management UI Docker image..."
	docker build -t management-ui:latest .
	@echo "✅ Docker image built: management-ui:latest"



docker-push:
	@echo "📤 Pushing Management UI to registry..."
	@read -p "Enter registry URL: " registry; \
	docker tag management-ui:latest $$registry/management-ui:latest && \
	docker push $$registry/management-ui:latest

# ============================================================================
# WEB COMPONENT COMMANDS
# ============================================================================

# Build standalone web component
build-webcomponent:
	@echo "🔧 Building Chat Widget Web Component..."
	pnpm build:webcomponent
	@echo "✅ Web component built successfully!"
	@echo "📁 Output: dist/web-component/chat-widget.iife.js"
	@echo "🌐 Demo: public/webcomponent-demo.html"

# Develop web component with watch mode
dev-webcomponent:
	@echo "🔥 Starting Web Component development (watch mode)..."
	@echo "📦 Building web component with file watching..."
	pnpm dev:webcomponent

# Serve built web component
serve-webcomponent: build-webcomponent
	@echo "🚀 Serving Chat Widget Web Component..."
	@echo "📡 Web Component: http://localhost:3001/chat-widget.iife.js"
	@echo "🌐 Demo Page: http://localhost:3001/webcomponent-demo.html"
	@echo "📋 Usage:"
	@echo "  <script src=\"http://localhost:3001/chat-widget.iife.js\"></script>"
	@echo "  <chat-widget api-endpoint=\"http://localhost:8080\"></chat-widget>"
	pnpm preview:webcomponent

# Open web component demo page
demo-webcomponent: build-webcomponent
	@echo "🎭 Opening Web Component Demo..."
	@echo "📦 Building web component first..."
	@echo "🌐 Demo will be available at: http://localhost:3001/webcomponent-demo.html"
	@echo ""
	@echo "🔧 Demo Features:"
	@echo "  • Interactive widget configuration"
	@echo "  • Real-time event monitoring"
	@echo "  • Usage examples and code snippets"
	@echo "  • Theme and position testing"
	@echo ""
	@if command -v open >/dev/null 2>&1; then \
		pnpm preview:webcomponent & \
		sleep 2 && open http://localhost:3001/webcomponent-demo.html; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		pnpm preview:webcomponent & \
		sleep 2 && xdg-open http://localhost:3001/webcomponent-demo.html; \
	else \
		echo "🌐 Manual: Navigate to http://localhost:3001/webcomponent-demo.html"; \
		pnpm preview:webcomponent; \
	fi
