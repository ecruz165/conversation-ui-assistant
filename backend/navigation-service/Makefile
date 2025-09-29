# Navigation Service Makefile
# Reactive Spring Boot service with Netty and OpenAI integration

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
	@echo "🧭 Navigation Service (Reactive/Netty) Commands:"
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
	@echo "  deps-start     - Start all dependencies (PostgreSQL)"
	@echo "  deps-stop      - Stop all dependencies"
	@echo "  deps-status    - Check dependency status"
	@echo "  dev-with-deps  - Start dependencies + service in dev mode"
	@echo ""
	@echo "🗄️  Database Management:"
	@echo "  wait-for-postgres - Wait for PostgreSQL to be ready"

# Build the module
build:
	@echo "🔨 Building Navigation Service..."
	mvn clean compile



# Run tests (integration tests with dependencies using IDE profile)
test: deps-start
	@echo "🧪 Running Navigation Service tests with dependencies..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 3
	@echo "🚀 Running tests..."
	mvn test -P ide

# Run module with live code changes (starts dependencies + service)
run: deps-start
	@echo "🚀 Running Navigation Service with live code changes..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 3
	@echo "🔥 Starting Navigation Service (supports live reloading)..."
	mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=ide"

# Development mode with IDE profile
dev:
	@echo "🔥 Starting Navigation Service in development mode (IDE profile)..."
	mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=ide"



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

# Run in Docker container
docker-run:
	@echo "🐳 Running Navigation Service in Docker..."
	docker-compose up -d navigation-service

# Stop Docker container
docker-stop:
	@echo "🛑 Stopping Navigation Service Docker container..."
	docker-compose down

# View module logs
logs:
	@echo "📋 Navigation Service logs..."
	@docker logs navigation-service-dev --tail=50 -f 2>/dev/null || echo "Service not running in Docker"

# Check service health
health:
	@echo "🔍 Checking Navigation Service health..."
	@curl -s http://localhost:8081/actuator/health 2>/dev/null | jq . || echo "❌ Service not responding on port 8081"

# Show service status
status:
	@echo "📊 Navigation Service Status:"
	@echo "🔍 Health Check:"
	@curl -s http://localhost:8081/actuator/health 2>/dev/null | jq . && echo "✅ Service: Healthy" || echo "❌ Service: Not responding"
	@echo ""
	@echo "🐳 Docker Status:"
	@docker ps --filter name=navigation-service --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No Docker containers found"



# Dependency Management Commands
deps-start:
	@echo "🚀 Starting Navigation Service dependencies..."
	@if pg_isready -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d $(POSTGRES_DB) > /dev/null 2>&1; then \
		echo "✅ PostgreSQL already running - reusing existing instance"; \
	else \
		echo "📦 Starting PostgreSQL (IDE profile)..."; \
		mvn docker-compose:up -Ddocker-compose.services=postgres -P ide; \
		$(MAKE) wait-for-postgres; \
	fi
	@echo "✅ All dependencies ready!"

# Check dependency status (smart reuse detection)
deps-check:
	@echo "🔍 Checking Navigation Service dependencies..."
	@echo ""
	@echo "🗄️  PostgreSQL:"
	@if pg_isready -h $(POSTGRES_HOST) -p $(POSTGRES_PORT) -U $(POSTGRES_USER) -d $(POSTGRES_DB) > /dev/null 2>&1; then \
		echo "✅ PostgreSQL: Already running on $(POSTGRES_HOST):$(POSTGRES_PORT) - will reuse"; \
	else \
		echo "❌ PostgreSQL: Not running - will start when needed"; \
	fi

deps-stop:
	@echo "🛑 Stopping Navigation Service dependencies..."
	mvn docker-compose:down -P ide
	@echo "✅ All dependencies stopped!"

deps-status:
	@echo "📊 Navigation Service Dependencies Status:"
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
	@echo "🔥 Starting Navigation Service with dependencies..."
	@echo "⏳ Waiting for dependencies to be fully ready..."
	@sleep 3
	@echo "🚀 Starting Navigation Service in development mode..."
	mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
