# Infrastructure Makefile
# Standard commands that work across all modules

.PHONY: help build test run clean package install dev logs

# Default target
help:
	@echo "🏗️  Infrastructure Commands:"
	@echo "  build     - Build the module"
	@echo "  test      - Run tests"
	@echo "  run       - Start module locally"
	@echo "  dev       - Start in development mode"
	@echo "  package   - Create deployable artifact"
	@echo "  install   - Install dependencies"
	@echo "  clean     - Clean build artifacts"
	@echo "  logs      - View module logs"

# Build the module (build Docker images)
build:
	@echo "🔨 Building Infrastructure..."
	docker-compose build

# Run tests (infrastructure health checks)
test:
	@echo "🧪 Testing Infrastructure..."
	@echo "Checking database connection..."
	@docker-compose exec -T postgres pg_isready -U conversation_user -d conversation_db || echo "Database not ready"

# Start module locally (production mode)
run:
	@echo "🚀 Starting Infrastructure (production)..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Development mode
dev:
	@echo "🔥 Starting Infrastructure in development mode..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Create deployable artifact (export Docker images)
package:
	@echo "📦 Packaging Infrastructure..."
	docker-compose build
	@echo "Docker images built and ready for deployment"

# Install dependencies (pull Docker images)
install:
	@echo "📥 Installing Infrastructure dependencies..."
	docker-compose pull

# Clean build artifacts
clean:
	@echo "🧹 Cleaning Infrastructure..."
	docker-compose down --volumes --remove-orphans
	docker system prune -f

# View module logs
logs:
	@echo "📋 Infrastructure logs..."
	docker-compose logs --tail=50 -f
