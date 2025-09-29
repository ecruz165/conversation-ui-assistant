# Management Service Makefile
# Traditional Spring Boot service with JPA, Tomcat, and Spring AI

# Standard module commands (consistent across all modules)
.PHONY: help build test run dev clean package install logs
.PHONY: deps-start deps-stop deps-check deps-status dev-with-deps
.PHONY: docker-run docker-stop health status
.PHONY: wait-for-postgres ensure-postgres

# Dependencies: Shared PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=conversation_ui
POSTGRES_USER=conversation_user

MODULE_DEPENDENCIES: \
	- postgres

# Helper function to wait for PostgreSQL to be ready
wait-for-postgres:
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@timeout=60; \
	while [ $$timeout -gt 0 ]; do \
		if pg_isready -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d $(POSTGRES_DB) > /dev/null 2>&1; then \
			echo "✅ PostgreSQL is ready!"; \
			exit 0; \
		fi; \
		echo "⏳ PostgreSQL not ready, waiting... ($$timeout seconds left)"; \
		sleep 2; \
		timeout=$$((timeout-2)); \
	done; \
	echo "❌ PostgreSQL failed to start within 60 seconds"; \
	exit 1

# Helper function to ensure PostgreSQL is running (legacy support)
ensure-postgres:
	@echo "🗄️  Checking PostgreSQL..."
	@cd ../../infrastructure && docker-compose exec postgres pg_isready -U conversation_user -d conversation_ui > /dev/null 2>&1 || \
		(echo "🚀 Starting PostgreSQL..." && cd ../.. && make postgres-dev)

# Default target
help:
	@echo "🔧 Management Service (Traditional/Tomcat) Commands:"
	@echo ""
	@echo "🏗️  Building:"
	@echo "  build       - Build the module"
	@echo "  package     - Create deployable artifact"
	@echo "  install     - Install dependencies"
	@echo ""
	@echo "🚀 Running:"
	@echo "  run         - Run with live code changes (starts dependencies + service)"
	@echo "  dev         - Start in development mode (IDE profile)"
	@echo "  dev-with-deps - Start dependencies + service in dev mode"
	@echo "  docker-run  - Run in Docker container"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  test        - Run tests with dependencies (IDE profile)"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  clean       - Clean build artifacts"
	@echo "  logs        - View service logs"
	@echo "  health      - Check service health"
	@echo "  status      - Show service status"
	@echo ""
	@echo "🗄️  Dependencies (PostgreSQL):"
	@echo "  deps-check     - Check what dependencies are already running"
	@echo "  deps-start     - Start dependencies (reuses existing if available)"
	@echo "  deps-stop      - Stop all dependencies"
	@echo "  deps-status    - Check dependency status"
	@echo "  dev-with-deps  - Start dependencies + service in dev mode"
	@echo ""
	@echo "🗄️  Database Management:"
	@echo "  wait-for-postgres - Wait for PostgreSQL to be ready"

# Build the service
build:
	@echo "🔨 Building Management Service..."
	mvn clean compile



# Run tests (integration tests with dependencies using IDE profile)
test: deps-start
	@echo "🧪 Running Management Service tests with dependencies..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 3
	@echo "🚀 Running tests..."
	mvn test -P ide

# Run module with live code changes (starts dependencies + service)
run: deps-start
	@echo "🚀 Running Management Service with live code changes..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 3
	@echo "🔥 Starting Management Service (supports live reloading)..."
	mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=ide"

# Development mode with IDE profile
dev:
	@echo "🔥 Starting Management Service in development mode (IDE profile)..."
	mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=ide"



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

# Run in Docker container
docker-run:
	@echo "🐳 Running Management Service in Docker..."
	docker-compose up -d management-service

# Stop Docker container
docker-stop:
	@echo "🛑 Stopping Management Service Docker container..."
	docker-compose down

# View logs if running in Docker
logs:
	@echo "📋 Management Service logs..."
	@docker logs management-service-dev --tail=50 -f 2>/dev/null || echo "Service not running in Docker"

# Check service health
health:
	@echo "🔍 Checking Management Service health..."
	@curl -s http://localhost:8080/actuator/health 2>/dev/null | jq . || echo "❌ Service not responding on port 8080"

# Show service status
status:
	@echo "📊 Management Service Status:"
	@echo "🔍 Health Check:"
	@curl -s http://localhost:8080/actuator/health 2>/dev/null | jq . && echo "✅ Service: Healthy" || echo "❌ Service: Not responding"
	@echo ""
	@echo "🐳 Docker Status:"
	@docker ps --filter name=management-service --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No Docker containers found"



# Dependency Management Commands
deps-start:
	@echo "🚀 Starting Management Service dependencies..."
	@if pg_isready -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d $(POSTGRES_DB) > /dev/null 2>&1; then \
		echo "✅ PostgreSQL already running - reusing existing instance"; \
	else \
		echo "📦 Starting PostgreSQL (IDE profile)..."; \
		mvn docker-compose:up -Ddocker-compose.services=postgres -P ide; \
		$(MAKE) wait-for-postgres; \
	fi
	@echo "✅ All dependencies ready!"

# Check what dependencies are already running
deps-check:
	@echo "🔍 Checking Management Service dependencies..."
	@echo ""
	@echo "🗄️  PostgreSQL:"
	@if pg_isready -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d $(POSTGRES_DB) > /dev/null 2>&1; then \
		echo "✅ PostgreSQL: Already running on $(POSTGRES_HOST):$(POSTGRES_PORT) - will reuse"; \
	else \
		echo "❌ PostgreSQL: Not running - will start new instance"; \
	fi
	@echo ""
	@echo "🔧 Management Service:"
	@if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then \
		echo "✅ Management Service: Already running on localhost:8080"; \
	else \
		echo "❌ Management Service: Not running"; \
	fi

deps-stop:
	@echo "🛑 Stopping Management Service dependencies..."
	mvn docker-compose:down -P ide
	@echo "✅ All dependencies stopped!"

deps-status:
	@echo "📊 Management Service Dependencies Status:"
	@echo ""
	@echo "🗄️  PostgreSQL:"
	@if pg_isready -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d $(POSTGRES_DB) > /dev/null 2>&1; then \
		echo "✅ PostgreSQL: Running on $(POSTGRES_HOST):$(POSTGRES_PORT)"; \
	else \
		echo "❌ PostgreSQL: Not running"; \
	fi
	@echo ""
	@echo "🐳 Docker Containers:"
	@docker ps --filter name=shared-postgres-ide --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers found"

dev-with-deps: deps-start
	@echo "🔥 Starting Management Service with dependencies..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 3
	@echo "🚀 Starting Management Service in development mode..."
	mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
