# 🚀 Make Commands Quick Reference

## System Commands (from project root)

| Command | Description |
|---------|-------------|
| `make run` | Full system demo (Docker Compose) |
| `make stop` | Stop all environments (demo + IDE) |
| `make demo-stop` | Stop all environments (alias for stop) |
| `make deploy` | Deploy to AWS environment |
| `make deploy PROFILE=local` | Deploy to localstack (local AWS simulation) |
| `make deps-overview` | System-wide dependency status |
| `make deps-check-all` | All modules dependency status |
| `make develop-app` | Full development setup |

## Module Commands (same for ALL modules)

### Core Operations

| Command | Description |
|---------|-------------|
| `make help` | Show available commands |
| `make build` | Build the module |
| `make test` | Run tests |
| `make clean` | Clean build artifacts |
| `make package` | Create deployable artifact |
| `make install` | Install dependencies |

### Running & Development

| Command | Description |
|---------|-------------|
| `make run` | Run module (Docker Compose demo) |
| `make dev` | Development mode (IDE profile) |
| `make dev-with-deps` | Start dependencies + module |

### Dependency Management

| Command | Description |
|---------|-------------|
| `make deps-check` | Check dependency status |
| `make deps-start` | Start dependencies (smart reuse) |
| `make deps-stop` | Stop dependencies |
| `make deps-status` | Detailed dependency status |

### Docker Operations

| Command | Description |
|---------|-------------|
| `make docker-run` | Run in Docker container |
| `make docker-stop` | Stop Docker container |

## 🔗 Dependency Chain

```
demo-app → chat-widget-mfe → navigation-service → postgres
management-ui → management-service → postgres
```

## 📍 Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| PostgreSQL | 5432 | `pg_isready` |
| Management Service | 8080 | `/actuator/health` |
| Navigation Service | 8081 | `/actuator/health` |
| Management UI | 4000 | HTTP check |
| Chat Widget MFE | 3002 | HTTP check |
| Demo App | 5173 | HTTP check |

## 🎯 Common Workflows

### Start Development Environment

```bash
# Check what's running
make deps-overview

# Start backend service
cd backend/management-service && make dev-with-deps

# Start frontend
cd frontend/management-ui && make dev-with-deps
```

### Full System Demo

```bash
# Start everything
make run

# Check status
make deps-overview

# Stop everything
make stop
```

### Individual Module Development

```bash
# Go to any module
cd backend/navigation-service

# Check dependencies
make deps-check

# Start with dependencies
make dev-with-deps

# Or just start the module (if deps already running)
make dev
```

### Test Deployment

```bash
# Deploy to localstack (local AWS simulation)
make deploy PROFILE=local

# Deploy to AWS
make deploy
```

## 🧪 Testing

```bash
# Individual module testing
make test                   # Run tests only
make test-with-deps         # Start dependencies + run tests

# System-wide testing
make test-all               # Test all modules
make test-all-with-deps     # Start PostgreSQL + test all modules

# Validation scripts
./test-commands.sh          # Quick validation
./scripts/interactive-test.sh # Interactive testing
```

## 🚨 Emergency Commands

```bash
# Stop everything
make stop
cd backend/management-service && make deps-stop

# Full cleanup
docker system prune -f

# Check what's still running
make deps-overview
lsof -i :5432  # PostgreSQL
lsof -i :8080  # Management Service
```

## 💡 Smart Features

- ✅ **Service Reuse**: Automatically detects and reuses running services
- ✅ **Health Checks**: Services verify dependencies before starting
- ✅ **Profile Support**: IDE, local (localstack), and demo modes
- ✅ **Zero Waste**: Never starts duplicate PostgreSQL instances
- ✅ **Cross-Module Awareness**: Frontend modules detect backend services

## 🔧 Profiles

| Profile | Usage | Description |
|---------|-------|-------------|
| IDE (default) | `make dev` | Development with hot reload |
| Demo | `make run` | Docker Compose production-like |
| Local (deploy) | `make deploy PROFILE=local` | Localstack AWS simulation |
| AWS (deploy) | `make deploy` | Real AWS deployment |
