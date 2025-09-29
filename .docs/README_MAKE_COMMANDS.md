# Make Commands Reference

## Overview

This document provides a comprehensive guide to the standardized make commands available across all modules in the Conversation UI Assistant project. The system implements smart dependency management with service reuse and IDE profile integration.

## 🏗️ Architecture

### Dependency Chain

```
demo-app → chat-widget-mfe → navigation-service → postgres
management-ui → management-service → postgres
```

### Shared Infrastructure

- **Shared PostgreSQL**: Single instance on port 5432 (`shared-postgres-ide`)
- **Smart Service Reuse**: Automatic detection and reuse of running services
- **IDE Profile Integration**: Maven and pnpm profiles for development
- **Zero Trust Security**: Docker containers with SSL/TLS support

## 🚀 System-Wide Commands

Run these from the project root directory:

### Demo & Deployment

```bash
make run                    # Full system demo (Docker Compose)
make stop                   # Stop all environments (demo + IDE)
make demo-stop              # Stop all environments (alias for stop)
make deploy                 # Deploy to AWS environment
make deploy PROFILE=local   # Deploy to localstack (local AWS simulation)
```

### Monitoring & Status

```bash
make deps-overview          # System-wide dependency status
make deps-check-all         # All modules dependency status
make develop-app            # Full development setup (build + test + DB)
```

### Development Environment

```bash
make setup                  # Install all dependencies + pre-commit hooks
make build-all              # Build all modules
make test-all               # Run all tests
make clean-all              # Clean all modules
```

## 📦 Module Commands

These commands are **standardized across ALL modules** (backend and frontend):

### Core Commands

```bash
make help                   # Show available commands
make build                  # Build the module
make test                   # Run tests
make clean                  # Clean build artifacts
make package                # Create deployable artifact
make install                # Install dependencies
```

### Running & Development

```bash
make run                    # Run module (Docker Compose demo mode)
make dev                    # Development mode (IDE profile)
make dev-with-deps          # Start dependencies + module in dev mode
```

### Dependency Management

```bash
make deps-check             # Check dependency status
make deps-start             # Start dependencies (smart reuse)
make deps-stop              # Stop dependencies
make deps-status            # Detailed dependency status
```

### Docker Operations

```bash
make docker-run             # Run in Docker container
make docker-stop            # Stop Docker container
```

## 🎯 Module-Specific Examples

### Backend Services

#### Management Service

```bash
cd backend/management-service

# Development workflow
make deps-check             # Check if PostgreSQL is running
make dev-with-deps          # Start PostgreSQL + service in dev mode
make test                   # Run unit tests
make test-with-deps         # Start PostgreSQL + run tests
make build                  # Build JAR file

# Production deployment
make run                    # Docker Compose demo
make docker-run             # Run in Docker container
```

#### Navigation Service

```bash
cd backend/navigation-service

# Smart dependency reuse
make deps-check             # Will detect existing PostgreSQL
make dev                    # Start service (reuses existing PostgreSQL)
make run PROFILE=local      # Run with localstack configuration
```

### Frontend Services

#### Management UI

```bash
cd frontend/management-ui

# Development workflow
make deps-check             # Check if management-service is running
make dev-with-deps          # Start backend + frontend dev server
make build                  # Build production assets

# Zero trust deployment
make docker-run             # Run with SSL/TLS support
```

#### Chat Widget MFE

```bash
cd frontend/chat-widget-mfe

# Module Federation development
make deps-check             # Check if navigation-service is running
make dev                    # Start widget dev server
make run PROFILE=local      # Run with localstack backend
```

#### Demo App

```bash
cd frontend/demo-app

# Full stack development
make deps-check             # Check entire dependency chain
make dev-with-deps          # Start all dependencies + demo app
make run                    # Docker Compose demo mode
```

## 🔧 Smart Dependency Management

### Automatic Service Reuse

The system automatically detects and reuses existing services:

```bash
# Start PostgreSQL via management service
cd backend/management-service && make deps-start

# Navigation service will reuse existing PostgreSQL
cd backend/navigation-service && make deps-check
# Output: ✅ PostgreSQL already running - reusing existing instance
```

### Health Check Integration

Services use health checks to detect availability:

- **PostgreSQL**: `pg_isready` command
- **Backend Services**: `/actuator/health` endpoints
- **Frontend Services**: HTTP availability checks

### IDE Profile Activation

Development commands automatically activate appropriate profiles:

- **Maven**: `-P ide` profile with Docker Compose integration
- **Spring Boot**: `--spring.profiles.active=ide`
- **Frontend**: Development server with hot reload

## 🌐 Profile Support

### IDE Profile (Default Development)

```bash
make dev                    # Uses IDE profile
make dev-with-deps          # Starts dependencies with IDE profile
```

### Demo Profile (Docker Compose)

```bash
make run                    # Full Docker Compose orchestration
# All services run in containers
# Production-like environment
```

### Deployment Profiles

```bash
make deploy                 # Deploy to AWS environment
make deploy PROFILE=local   # Deploy to localstack (local AWS simulation)
```

## 📊 Monitoring Commands

### System Overview

```bash
make deps-overview
```

**Output:**

```
🗄️  SHARED POSTGRESQL:
✅ PostgreSQL: Running on localhost:5432
   📦 Container: shared-postgres-ide

🔧 BACKEND SERVICES:
✅ Management Service: Running on localhost:8080
✅ Navigation Service: Running on localhost:8081

🎯 FRONTEND SERVICES:
✅ Management UI: Running on localhost:4000
✅ Chat Widget MFE: Running on localhost:3002
❌ Demo App: Not running
```

### Module Dependency Status

```bash
cd backend/management-service && make deps-check
```

**Output:**

```
🔍 Checking Management Service dependencies...

🗄️  PostgreSQL:
✅ PostgreSQL: Already running on localhost:5432 - will reuse

🔧 Management Service:
✅ Management Service: Already running on localhost:8080
```

## 🧪 Testing Commands

### Automated Testing

```bash
# Quick command validation
./test-commands.sh

# Comprehensive testing
./scripts/test-run-scenarios.sh

# Interactive testing
./scripts/interactive-test.sh
```

### Manual Testing Examples

```bash
# Test dependency chain
make deps-overview
cd backend/navigation-service && make dev-with-deps
cd frontend/chat-widget-mfe && make dev-with-deps

# Test profile support
cd frontend/demo-app && make run PROFILE=local

# Test full system
make run
```

## 🔒 Security Features

### Zero Trust Docker Containers

- Non-root user execution (UID 1001)
- SSL/TLS certificate volume mounts
- Security headers in nginx configuration
- Minimal attack surface

### Certificate Management

```bash
# Frontend containers support SSL certificates
docker run -v /path/to/certs:/etc/nginx/ssl:ro management-ui
```

## 🚨 Troubleshooting

### Common Issues

**PostgreSQL Connection Issues:**

```bash
# Check PostgreSQL status
make deps-overview

# Restart PostgreSQL
cd backend/management-service && make deps-stop && make deps-start
```

**Service Not Detected:**

```bash
# Check service health
curl http://localhost:8080/actuator/health

# Restart service
cd backend/management-service && make dev
```

**Port Conflicts:**

```bash
# Check what's running on ports
lsof -i :5432  # PostgreSQL
lsof -i :8080  # Management Service
lsof -i :8081  # Navigation Service
```

### Cleanup Commands

```bash
# Stop everything
make demo-stop
cd backend/management-service && make deps-stop

# Clean build artifacts
make clean-all

# Full reset
docker system prune -f
```

## 📚 Additional Resources

- **PRD**: `.docs/PRD_Smart_Dependency_Management.md` - Detailed system design
- **Test Scripts**: `scripts/` directory - Automated testing tools
- **Module Documentation**: Each module's `README.md` for specific details

## 🎯 Quick Reference

**Most Common Commands:**

```bash
# System status
make deps-overview

# Start development
cd backend/management-service && make dev-with-deps
cd frontend/management-ui && make dev-with-deps

# Full demo
make run

# Cleanup
make demo-stop
```

**Emergency Reset:**

```bash
make demo-stop
cd backend/management-service && make deps-stop
docker system prune -f
```
