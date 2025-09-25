#!/bin/bash

# Docker Manager Script for Conversation UI Assistant
# This script helps manage the Docker environment for development and production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# Functions
print_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs for all services"
    echo "  build       Build all services"
    echo "  clean       Clean up containers, images, and volumes"
    echo "  status      Show status of all services"
    echo "  shell       Open shell in a service container"
    echo "  db          Database operations (migrate, reset, backup, restore)"
    echo "  test        Run tests in containers"
    echo "  help        Show this help message"
    echo ""
    echo "Options:"
    echo "  --service   Specify a specific service (for logs, shell, etc.)"
    echo "  --follow    Follow logs in real-time"
    echo "  --build     Force rebuild when starting"
    echo ""
    echo "Examples:"
    echo "  $0 dev --build                    # Start dev environment with rebuild"
    echo "  $0 logs --service management      # Show logs for management service"
    echo "  $0 shell --service postgres       # Open shell in postgres container"
    echo "  $0 db migrate                     # Run database migrations"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
}

setup_environment() {
    local env_type=$1
    
    if [ "$env_type" = "dev" ]; then
        if [ ! -f "$SCRIPT_DIR/.env.dev" ]; then
            print_warning ".env.dev not found, copying from .env.example"
            cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env.dev"
        fi
        export ENV_FILE="$SCRIPT_DIR/.env.dev"
    else
        if [ ! -f "$SCRIPT_DIR/.env" ]; then
            print_error ".env file not found. Please copy .env.example to .env and configure it."
            exit 1
        fi
        export ENV_FILE="$SCRIPT_DIR/.env"
    fi
}

start_development() {
    print_info "Starting development environment..."
    setup_environment "dev"
    
    local build_flag=""
    if [ "$BUILD" = "true" ]; then
        build_flag="--build"
    fi
    
    cd "$SCRIPT_DIR"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up -d $build_flag
    
    print_success "Development environment started!"
    print_info "Services available at:"
    echo "  - Management API: http://localhost:8080"
    echo "  - Navigation API: http://localhost:8081"
    echo "  - pgAdmin: http://localhost:8082"
    echo "  - Nginx Proxy: http://localhost"
    echo "  - Frontend Dev: http://localhost:3000"
}

start_production() {
    print_info "Starting production environment..."
    setup_environment "prod"
    
    local build_flag=""
    if [ "$BUILD" = "true" ]; then
        build_flag="--build"
    fi
    
    cd "$SCRIPT_DIR"
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env up -d $build_flag
    
    print_success "Production environment started!"
    print_info "Services available at:"
    echo "  - Application: http://localhost"
    echo "  - Management API: http://localhost/api/management/"
    echo "  - Navigation API: http://localhost/api/navigation/"
}

stop_services() {
    print_info "Stopping all services..."
    cd "$SCRIPT_DIR"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.prod.yml down
    print_success "All services stopped!"
}

show_logs() {
    local service=$1
    local follow_flag=""
    
    if [ "$FOLLOW" = "true" ]; then
        follow_flag="-f"
    fi
    
    cd "$SCRIPT_DIR"
    if [ -n "$service" ]; then
        docker-compose logs $follow_flag "$service"
    else
        docker-compose logs $follow_flag
    fi
}

build_services() {
    print_info "Building all services..."
    cd "$SCRIPT_DIR"
    docker-compose build --no-cache
    print_success "All services built!"
}

clean_environment() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up Docker environment..."
        cd "$SCRIPT_DIR"
        docker-compose down -v --rmi all --remove-orphans
        docker system prune -f
        print_success "Environment cleaned!"
    else
        print_info "Cleanup cancelled."
    fi
}

show_status() {
    print_info "Service status:"
    cd "$SCRIPT_DIR"
    docker-compose ps
}

open_shell() {
    local service=$1
    if [ -z "$service" ]; then
        print_error "Please specify a service with --service option"
        exit 1
    fi
    
    print_info "Opening shell in $service container..."
    cd "$SCRIPT_DIR"
    docker-compose exec "$service" /bin/sh
}

database_operations() {
    local operation=$1
    cd "$SCRIPT_DIR"
    
    case $operation in
        migrate)
            print_info "Running database migrations..."
            docker-compose exec management-service mvn flyway:migrate
            docker-compose exec navigation-service mvn flyway:migrate
            print_success "Migrations completed!"
            ;;
        reset)
            print_warning "This will reset the database. Are you sure? (y/N)"
            read -r response
            if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
                docker-compose exec postgres psql -U conversation_user -d conversation_ui -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
                print_success "Database reset!"
            fi
            ;;
        backup)
            local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
            docker-compose exec postgres pg_dump -U conversation_user conversation_ui > "$backup_file"
            print_success "Database backed up to $backup_file"
            ;;
        *)
            print_error "Unknown database operation: $operation"
            echo "Available operations: migrate, reset, backup"
            ;;
    esac
}

run_tests() {
    print_info "Running tests in containers..."
    cd "$SCRIPT_DIR"
    docker-compose exec management-service mvn test
    docker-compose exec navigation-service mvn test
    print_success "Tests completed!"
}

# Parse command line arguments
COMMAND=""
SERVICE=""
FOLLOW="false"
BUILD="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        dev|prod|stop|restart|logs|build|clean|status|shell|db|test|help)
            COMMAND=$1
            shift
            ;;
        --service)
            SERVICE="$2"
            shift 2
            ;;
        --follow)
            FOLLOW="true"
            shift
            ;;
        --build)
            BUILD="true"
            shift
            ;;
        *)
            if [ -z "$COMMAND" ]; then
                COMMAND=$1
            fi
            shift
            ;;
    esac
done

# Check dependencies
check_dependencies

# Execute command
case $COMMAND in
    dev)
        start_development
        ;;
    prod)
        start_production
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        start_development
        ;;
    logs)
        show_logs "$SERVICE"
        ;;
    build)
        build_services
        ;;
    clean)
        clean_environment
        ;;
    status)
        show_status
        ;;
    shell)
        open_shell "$SERVICE"
        ;;
    db)
        database_operations "$2"
        ;;
    test)
        run_tests
        ;;
    help|"")
        print_usage
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        print_usage
        exit 1
        ;;
esac
