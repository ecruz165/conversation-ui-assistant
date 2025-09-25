# Docker Infrastructure

This directory contains the complete Docker infrastructure for the Conversation UI Assistant project, providing full containerization with proper service networking and dependencies.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  Frontend Dev   │    │    pgAdmin      │
│   Port: 80/443  │    │  Port: 3000/1   │    │   Port: 8082    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                    Docker Network                       │
    │                 (conversation-network)                  │
    │                                                         │
    │  ┌─────────────────┐    ┌─────────────────┐           │
    │  │ Management Svc  │    │ Navigation Svc  │           │
    │  │   Port: 8080    │    │   Port: 8081    │           │
    │  └─────────────────┘    └─────────────────┘           │
    │           │                       │                    │
    │           └───────────┬───────────┘                    │
    │                       │                                │
    │  ┌─────────────────┐  │  ┌─────────────────┐          │
    │  │   PostgreSQL    │  │  │     Redis       │          │
    │  │   Port: 5432    │  │  │   Port: 6379    │          │
    │  └─────────────────┘  │  └─────────────────┘          │
    └────────────────────────────────────────────────────────┘
```

## Services

### Core Services

#### 1. **Management Service**
- **Container**: `conversation-ui-management`
- **Port**: 8080
- **Purpose**: Core business logic, user management, conversations, AI models
- **Health Check**: `/actuator/health`
- **Dependencies**: PostgreSQL

#### 2. **Navigation Service**
- **Container**: `conversation-ui-navigation`
- **Port**: 8081
- **Purpose**: Web navigation, page analysis, automation workflows
- **Health Check**: `/actuator/health`
- **Dependencies**: PostgreSQL, Management Service

#### 3. **PostgreSQL Database**
- **Container**: `conversation-ui-postgres`
- **Port**: 5432
- **Purpose**: Shared database for both services
- **Health Check**: `pg_isready`
- **Volumes**: Persistent data storage

#### 4. **Redis Cache**
- **Container**: `conversation-ui-redis`
- **Port**: 6379
- **Purpose**: Caching, session storage, performance optimization
- **Health Check**: `redis-cli ping`

#### 5. **Nginx Reverse Proxy**
- **Container**: `conversation-ui-nginx`
- **Ports**: 80, 443
- **Purpose**: Load balancing, SSL termination, API routing
- **Features**: Rate limiting, security headers, monitoring

### Development Services

#### 6. **pgAdmin** (Development Only)
- **Container**: `conversation-ui-pgadmin`
- **Port**: 8082
- **Purpose**: Database administration interface
- **Credentials**: admin@conversation-ui.local / admin

#### 7. **Frontend Dev Server** (Development Only)
- **Container**: `conversation-ui-frontend-dev`
- **Ports**: 3000, 3001
- **Purpose**: Hot-reload frontend development
- **Features**: Live reloading, development tools

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 10GB+ available disk space

### Development Environment

```bash
# Clone and navigate to infrastructure
cd infrastructure

# Copy environment file
cp .env.example .env.dev

# Start development environment
./docker-manager.sh dev

# Or manually:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Production Environment

```bash
# Setup environment
cp .env.example .env
# Edit .env with production values

# Start production environment
./docker-manager.sh prod

# Or manually:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Docker Manager Script

The `docker-manager.sh` script provides convenient commands for managing the Docker environment:

```bash
# Development
./docker-manager.sh dev                    # Start development environment
./docker-manager.sh dev --build            # Start with rebuild

# Production
./docker-manager.sh prod                   # Start production environment

# Management
./docker-manager.sh stop                   # Stop all services
./docker-manager.sh restart                # Restart all services
./docker-manager.sh status                 # Show service status

# Monitoring
./docker-manager.sh logs                   # Show all logs
./docker-manager.sh logs --service nginx   # Show specific service logs
./docker-manager.sh logs --follow          # Follow logs in real-time

# Maintenance
./docker-manager.sh build                  # Build all services
./docker-manager.sh clean                  # Clean up everything
./docker-manager.sh shell --service postgres  # Open shell in container

# Database
./docker-manager.sh db migrate             # Run migrations
./docker-manager.sh db backup              # Backup database
./docker-manager.sh db reset               # Reset database

# Testing
./docker-manager.sh test                   # Run all tests
```

## Service URLs

### Development
- **Application**: http://localhost
- **Management API**: http://localhost:8080
- **Navigation API**: http://localhost:8081
- **pgAdmin**: http://localhost:8082
- **Frontend Dev**: http://localhost:3000
- **Demo App**: http://localhost:3001

### Production
- **Application**: http://localhost
- **Management API**: http://localhost/api/management/
- **Navigation API**: http://localhost/api/navigation/
- **Monitoring**: http://monitoring.localhost (internal network only)

## Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_api_key
OPENAI_ENABLED=true

# Database
POSTGRES_PASSWORD=secure_password

# Security
JWT_SECRET=your_jwt_secret_32_chars_minimum
ENCRYPTION_KEY=your_encryption_key_32_chars

# Application
APP_ENV=production
LOG_LEVEL=INFO
```

### Docker Compose Files

- **`docker-compose.yml`**: Base configuration
- **`docker-compose.dev.yml`**: Development overrides
- **`docker-compose.prod.yml`**: Production overrides

### Nginx Configuration

- **`docker/nginx/nginx.conf`**: Main Nginx configuration
- **`docker/nginx/conf.d/monitoring.conf`**: Monitoring endpoints

## Networking

### Internal Network
- **Network**: `conversation-network`
- **Subnet**: `172.20.0.0/16`
- **Driver**: Bridge

### Service Communication
- Services communicate using container names as hostnames
- Example: `http://management-service:8080`
- Database: `postgres:5432`
- Redis: `redis:6379`

## Volumes

### Persistent Data
- **`postgres_data`**: Database files
- **`redis_data`**: Redis persistence
- **`nginx_logs`**: Nginx access/error logs
- **`pgadmin_data`**: pgAdmin configuration

### Development Volumes
- **`postgres_dev_data`**: Development database
- **`frontend_node_modules`**: Node.js dependencies

## Health Checks

All services include comprehensive health checks:

- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping`
- **Backend Services**: Spring Boot Actuator `/actuator/health`
- **Nginx**: Custom health endpoint

## Security Features

### Nginx Security
- Rate limiting (API: 10 req/s, Login: 1 req/s)
- Security headers (XSS, CSRF, Content-Type)
- Request size limits (100MB max)
- Access restrictions for monitoring endpoints

### Container Security
- Non-root user execution
- Resource limits and reservations
- Health check monitoring
- Restart policies

## Monitoring and Logging

### Logging
- JSON structured logging
- Log rotation (10MB max, 3 files)
- Centralized log collection via Docker

### Metrics
- Spring Boot Actuator metrics
- Prometheus endpoints
- Nginx status monitoring
- Custom application metrics

### Health Monitoring
- Service health checks every 30s
- Dependency health verification
- Automatic restart on failure

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :8080
   
   # Stop conflicting services
   ./docker-manager.sh stop
   ```

2. **Database Connection Issues**
   ```bash
   # Check database health
   docker-compose exec postgres pg_isready -U conversation_user
   
   # View database logs
   ./docker-manager.sh logs --service postgres
   ```

3. **Build Failures**
   ```bash
   # Clean rebuild
   ./docker-manager.sh clean
   ./docker-manager.sh dev --build
   ```

4. **Memory Issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Increase Docker memory limit
   # Docker Desktop: Settings > Resources > Memory
   ```

### Debug Commands

```bash
# Service status
./docker-manager.sh status

# Service logs
./docker-manager.sh logs --service management-service --follow

# Container shell access
./docker-manager.sh shell --service postgres

# Network inspection
docker network inspect conversation-ui_conversation-network

# Volume inspection
docker volume ls | grep conversation
```

## Development Workflow

1. **Start Development Environment**
   ```bash
   ./docker-manager.sh dev --build
   ```

2. **Run Database Migrations**
   ```bash
   ./docker-manager.sh db migrate
   ```

3. **View Logs**
   ```bash
   ./docker-manager.sh logs --follow
   ```

4. **Run Tests**
   ```bash
   ./docker-manager.sh test
   ```

5. **Stop Environment**
   ```bash
   ./docker-manager.sh stop
   ```

This Docker infrastructure provides a complete, production-ready containerized environment with proper service orchestration, networking, and monitoring capabilities.
