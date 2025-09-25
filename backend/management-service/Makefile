# Management Service Makefile
# Standard commands that work across all modules

.PHONY: help build test run clean package install dev logs ensure-postgres

# Helper function to ensure PostgreSQL is running
ensure-postgres:
	@echo "🗄️  Checking PostgreSQL..."
	@cd ../../infrastructure && docker-compose exec postgres pg_isready -U conversation_user -d conversation_ui > /dev/null 2>&1 || \
		(echo "🚀 Starting PostgreSQL..." && cd .. && make postgres-dev)

# Default target
help:
	@echo "🔧 Management Service Commands:"
	@echo ""
	@echo "🏗️  Building:"
	@echo "  build       - Build the module"
	@echo "  package     - Create deployable artifact"
	@echo "  install     - Install dependencies"
	@echo ""
	@echo "🚀 Running:"
	@echo "  dev         - Start in development mode (auto-starts PostgreSQL)"
	@echo "  run         - Start module locally (auto-starts PostgreSQL)"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  test        - Run tests"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  clean       - Clean build artifacts"
	@echo "  logs        - View module logs"
	@echo "  ensure-postgres - Ensure PostgreSQL is running"
	@echo ""
	@echo "🗄️  Database (IDE Profile):"
	@echo "  postgres-start - Start PostgreSQL via Maven plugin"
	@echo "  postgres-stop  - Stop PostgreSQL via Maven plugin"
	@echo "  postgres-logs  - View PostgreSQL logs"
	@echo "  ide           - Start in IDE mode with PostgreSQL"

# Build the service
build:
	@echo "🔨 Building Management Service..."
	mvn clean compile

# Run tests
test:
	@echo "🧪 Running Management Service tests..."
	mvn test

# Run service locally
run: ensure-postgres
	@echo "🚀 Starting Management Service..."
	mvn spring-boot:run

# Development mode with hot reload
dev: ensure-postgres
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

# Start PostgreSQL via Maven Docker Compose plugin
postgres-start:
	@echo "🗄️  Starting PostgreSQL via Maven plugin..."
	mvn docker-compose:up -Ddocker-compose.services=postgres

# Stop PostgreSQL via Maven Docker Compose plugin
postgres-stop:
	@echo "🗄️  Stopping PostgreSQL via Maven plugin..."
	mvn docker-compose:down

# View PostgreSQL logs
postgres-logs:
	@echo "📋 PostgreSQL logs..."
	@docker logs management-service-postgres-ide --tail=50 -f 2>/dev/null || echo "PostgreSQL not running"

# IDE mode - Start PostgreSQL and run service in IDE profile
ide: postgres-start
	@echo "🔥 Starting Management Service in IDE mode..."
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@sleep 5
	mvn spring-boot:run -Dspring-boot.run.profiles=ide
