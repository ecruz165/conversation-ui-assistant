# Management Service Makefile
# Spring Boot service with Maven

.PHONY: help build test run clean package install dev logs

# Default target
help:
	@echo "🔧 Management Service Commands:"
	@echo "  build     - Compile the service"
	@echo "  test      - Run unit tests"
	@echo "  run       - Start service locally"
	@echo "  dev       - Start service in development mode"
	@echo "  package   - Create deployable JAR"
	@echo "  install   - Install dependencies"
	@echo "  clean     - Clean build artifacts"
	@echo "  logs      - View service logs (if running in Docker)"

# Build the service
build:
	@echo "🔨 Building Management Service..."
	mvn clean compile

# Run tests
test:
	@echo "🧪 Running Management Service tests..."
	mvn test

# Run service locally
run:
	@echo "🚀 Starting Management Service..."
	mvn spring-boot:run

# Development mode with hot reload
dev:
	@echo "🔥 Starting Management Service in development mode..."
	mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Create deployable package
package:
	@echo "📦 Packaging Management Service..."
	mvn clean package -DskipTests

# Install dependencies
install:
	@echo "📥 Installing Management Service dependencies..."
	mvn clean install -DskipTests

# Clean build artifacts
clean:
	@echo "🧹 Cleaning Management Service..."
	mvn clean

# View logs if running in Docker
logs:
	@echo "📋 Management Service logs..."
	@docker logs management-service-dev --tail=50 -f 2>/dev/null || echo "Service not running in Docker"
