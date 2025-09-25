# Chat Widget MFE Makefile
# Consistent commands for the chat widget micro frontend module

.PHONY: help build test run dev install clean package logs ensure-build

# Reusable function to ensure build exists
ensure-build:
	@if [ ! -d "dist" ]; then \
		echo "📦 No build found. Building first..."; \
		$(MAKE) build; \
	fi

# Default target
help:
	@echo "🎯 Chat Widget MFE Commands:"
	@echo ""
	@echo "📦 Development:"
	@echo "  make dev        - Start development server (port 3002)"
	@echo "  make install    - Install dependencies"
	@echo "  make clean      - Clean build artifacts"
	@echo ""
	@echo "🏗️  Building:"
	@echo "  make build      - Build for production"
	@echo "  make package    - Create npm package"
	@echo "  make run        - Start production preview"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test       - Run tests"
	@echo "  make test-watch - Run tests in watch mode"
	@echo ""
	@echo "🔧 Code Quality:"
	@echo "  make lint       - Check code quality"
	@echo "  make format     - Format code"
	@echo ""
	@echo "📊 Analysis:"
	@echo "  make analyze    - Analyze bundle size"
	@echo "  make logs       - Show development logs"
	@echo ""
	@echo "🗄️  Backend Services:"
	@echo "  backend-up    - Start navigation-service and database"
	@echo "  backend-down  - Stop backend services"
	@echo "  backend-logs  - View backend service logs"
	@echo "  backend-status - Check backend service status"
	@echo "  full-dev      - Start backend services and widget dev server"

# Development
dev:
	@echo "🚀 Starting chat widget MFE development server..."
	npm run dev

install:
	@echo "📦 Installing chat widget MFE dependencies..."
	npm install

clean:
	@echo "🧹 Cleaning chat widget MFE build artifacts..."
	npm run clean

# Building
build:
	@echo "🏗️ Building chat widget MFE for production..."
	npm run build

package: ensure-build
	@echo "📦 Creating chat widget MFE package..."
	@echo "✅ Build already exists or created"
	npm run package

run: ensure-build
	@echo "🚀 Starting chat widget MFE production preview..."
	npm run preview

# Testing
test:
	@echo "🧪 Running chat widget MFE tests..."
	npm run test

test-watch:
	@echo "🧪 Running chat widget MFE tests in watch mode..."
	npm run test:watch

# Code Quality
lint:
	@echo "🔍 Checking chat widget MFE code quality..."
	npm run lint

format:
	@echo "✨ Formatting chat widget MFE code..."
	npm run format

# Analysis
analyze:
	@echo "📊 Analyzing chat widget MFE bundle..."
	npm run build:analyze

logs:
	@echo "📋 Chat widget MFE development logs:"
	@echo "Server: http://localhost:3002"
	@echo "Remote Entry: http://localhost:3002/remoteEntry.js"
	@echo "Exposed modules:"
	@echo "  - ./ChatWidget"
	@echo "  - ./NavigationHelper"
	@echo "  - ./ConversationProvider"
	@echo "  - ./useConversation"

# Start backend services (navigation-service + database)
backend-up:
	@echo "🚀 Starting backend services for Chat Widget MFE..."
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

# Start backend services and widget dev server
full-dev: backend-up
	@echo "🔥 Starting full development environment..."
	@echo "⏳ Waiting for backend to be fully ready..."
	@sleep 15
	@echo "🚀 Starting chat widget development server..."
	npm run dev
