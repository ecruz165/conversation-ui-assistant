# Navigation Service Makefile
# Standard commands that work across all modules

.PHONY: help build test run clean package install dev logs

# Default target
help:
	@echo "🧭 Navigation Service Commands:"
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
	@echo "🔨 Building Navigation Service..."
	mvn clean compile

# Run tests
test:
	@echo "🧪 Running Navigation Service tests..."
	mvn test

# Start module locally
run:
	@echo "🚀 Starting Navigation Service..."
	mvn spring-boot:run

# Development mode with hot reload
dev:
	@echo "🔥 Starting Navigation Service in development mode..."
	mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Create deployable artifact
package:
	@echo "📦 Packaging Navigation Service..."
	mvn clean package -DskipTests

# Install dependencies
install:
	@echo "📥 Installing Navigation Service dependencies..."
	mvn clean install -DskipTests

# Clean build artifacts
clean:
	@echo "🧹 Cleaning Navigation Service..."
	mvn clean

# View module logs
logs:
	@echo "📋 Navigation Service logs..."
	@docker logs navigation-service-dev --tail=50 -f 2>/dev/null || echo "Service not running in Docker"
