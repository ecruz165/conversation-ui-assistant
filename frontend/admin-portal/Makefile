# Admin Portal Makefile
# Standard commands that work across all modules

.PHONY: help build test run clean package install dev logs

# Default target
help:
	@echo "⚡ Admin Portal Commands:"
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
	@echo "🔨 Building Admin Portal..."
	pnpm build

# Run tests
test:
	@echo "🧪 Running Admin Portal tests..."
	pnpm test

# Start module locally (production build)
run:
	@echo "🚀 Starting Admin Portal (production)..."
	pnpm preview

# Development mode with hot reload
dev:
	@echo "🔥 Starting Admin Portal in development mode..."
	pnpm dev

# Create deployable artifact (same as build for frontend)
package:
	@echo "📦 Packaging Admin Portal..."
	pnpm build

# Install dependencies
install:
	@echo "📥 Installing Admin Portal dependencies..."
	pnpm install

# Clean build artifacts
clean:
	@echo "🧹 Cleaning Admin Portal..."
	rm -rf dist .output node_modules/.vite

# View module logs
logs:
	@echo "📋 Admin Portal logs..."
	@docker logs conversation-ui-admin-portal-dev --tail=50 -f 2>/dev/null || echo "Service not running in Docker"
