# Demo App Makefile
# Standard commands that work across all modules

.PHONY: help build test run clean package install dev logs

# Default target
help:
	@echo "🎯 Demo App Commands:"
	@echo "  build     - Build the module"
	@echo "  test      - Run tests"
	@echo "  run       - Start module locally"
	@echo "  dev       - Start in development mode"
	@echo "  package   - Create deployable artifact"
	@echo "  install   - Install dependencies"
	@echo "  clean     - Clean build artifacts"
	@echo "  logs      - View module logs"

# Build the module
build:
	@echo "🔨 Building Demo App..."
	pnpm build

# Run tests
test:
	@echo "🧪 Running Demo App tests..."
	pnpm test

# Start module locally (production build)
run:
	@echo "🚀 Starting Demo App (production)..."
	pnpm preview

# Development mode with hot reload
dev:
	@echo "🔥 Starting Demo App in development mode..."
	pnpm dev

# Create deployable artifact (same as build for frontend)
package:
	@echo "📦 Packaging Demo App..."
	pnpm build

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
	@docker logs frontend-dev --tail=50 -f 2>/dev/null || echo "Service not running in Docker"
