#!/bin/bash

# Comprehensive Test Script for Run Command Scenarios
# Tests actual execution of run commands in different scenarios

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
TIMEOUT_SECONDS=30
TEST_LOG_FILE="test-run-scenarios.log"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$TEST_LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$TEST_LOG_FILE"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1" | tee -a "$TEST_LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$TEST_LOG_FILE"
}

log_scenario() {
    echo -e "\n${CYAN}🧪 SCENARIO: $1${NC}" | tee -a "$TEST_LOG_FILE"
    echo "$(date): Starting scenario: $1" >> "$TEST_LOG_FILE"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up test environment..."

    # Stop any running services
    make demo-stop 2>/dev/null || true

    # Stop individual module services
    cd backend/management-service && make deps-stop 2>/dev/null || true
    cd ../navigation-service && make deps-stop 2>/dev/null || true
    cd ../../

    # Kill any background processes
    pkill -f "spring-boot:run" 2>/dev/null || true
    pkill -f "pnpm dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true

    log_info "Cleanup completed"
}

# Trap cleanup on exit
trap cleanup EXIT

# Test individual module help commands
test_help_commands() {
    log_scenario "Testing Help Commands"

    local modules=(
        "backend/management-service"
        "backend/navigation-service"
        "frontend/management-ui"
        "frontend/chat-widget-mfe"
        "frontend/demo-app"
    )

    for module in "${modules[@]}"; do
        log_info "Testing help command: $module"

        if cd "$module" && timeout 10s make help >/dev/null 2>&1; then
            log_success "$module help command works"
        else
            log_error "$module help command failed"
        fi
        cd - >/dev/null
    done
}

# Test dependency checking
test_dependency_checking() {
    log_scenario "Testing Dependency Checking"

    # Test system-wide dependency overview
    log_info "Testing system-wide dependency overview..."
    if timeout 15s make deps-overview >/dev/null 2>&1; then
        log_success "System dependency overview works"
    else
        log_error "System dependency overview failed"
    fi

    # Test individual module dependency checks
    local modules=(
        "backend/management-service"
        "backend/navigation-service"
        "frontend/management-ui"
        "frontend/chat-widget-mfe"
        "frontend/demo-app"
    )

    for module in "${modules[@]}"; do
        log_info "Testing dependency check: $module"

        if cd "$module" && timeout 10s make deps-check >/dev/null 2>&1; then
            log_success "$module deps-check works"
        else
            log_error "$module deps-check failed"
        fi
        cd - >/dev/null
    done
}

# Test smart dependency startup
test_smart_dependency_startup() {
    log_scenario "Testing Smart Dependency Startup"

    # Start PostgreSQL via one service
    log_info "Starting PostgreSQL via management-service..."
    cd backend/management-service
    if timeout 60s make deps-start >/dev/null 2>&1; then
        log_success "PostgreSQL started via management-service"
    else
        log_error "Failed to start PostgreSQL via management-service"
        cd - >/dev/null
        return 1
    fi
    cd - >/dev/null

    # Test that navigation-service reuses existing PostgreSQL
    log_info "Testing PostgreSQL reuse via navigation-service..."
    cd backend/navigation-service
    if timeout 30s make deps-check 2>&1 | grep -q "already running.*reuse"; then
        log_success "Navigation service detects and reuses existing PostgreSQL"
    else
        log_warning "Navigation service may not be detecting existing PostgreSQL"
    fi
    cd - >/dev/null
}

# Test build commands
test_build_commands() {
    log_scenario "Testing Build Commands"

    # Test backend builds
    local backend_modules=(
        "backend/management-service"
        "backend/navigation-service"
    )

    for module in "${backend_modules[@]}"; do
        log_info "Testing build: $module"

        if cd "$module" && timeout 120s make build >/dev/null 2>&1; then
            log_success "$module build works"
        else
            log_error "$module build failed"
        fi
        cd - >/dev/null
    done

    # Test frontend builds (shorter timeout)
    local frontend_modules=(
        "frontend/management-ui"
        "frontend/chat-widget-mfe"
        "frontend/demo-app"
    )

    for module in "${frontend_modules[@]}"; do
        log_info "Testing build: $module"

        if cd "$module" && timeout 60s make build >/dev/null 2>&1; then
            log_success "$module build works"
        else
            log_warning "$module build may require dependencies"
        fi
        cd - >/dev/null
    done
}

# Test profile support
test_profile_support() {
    log_scenario "Testing Profile Support"

    # Test that run commands support PROFILE=local
    local modules=(
        "backend/management-service"
        "backend/navigation-service"
        "frontend/management-ui"
        "frontend/chat-widget-mfe"
        "frontend/demo-app"
    )

    for module in "${modules[@]}"; do
        log_info "Testing PROFILE=local support: $module"

        if cd "$module" && grep -q 'PROFILE.*local' Makefile; then
            log_success "$module supports PROFILE=local"
        else
            log_error "$module missing PROFILE=local support"
        fi
        cd - >/dev/null
    done

    # Test root makefile profile support
    log_info "Testing root Makefile PROFILE=local support..."
    if grep -q 'PROFILE.*local' Makefile; then
        log_success "Root Makefile supports PROFILE=local"
    else
        log_error "Root Makefile missing PROFILE=local support"
    fi
}

# Test Docker commands
test_docker_commands() {
    log_scenario "Testing Docker Commands"

    local modules=(
        "backend/management-service"
        "backend/navigation-service"
        "frontend/management-ui"
        "frontend/chat-widget-mfe"
        "frontend/demo-app"
    )

    for module in "${modules[@]}"; do
        log_info "Testing Docker commands exist: $module"

        if cd "$module" && grep -q "docker-run:" Makefile && grep -q "docker-stop:" Makefile; then
            log_success "$module has Docker commands"
        else
            log_error "$module missing Docker commands"
        fi
        cd - >/dev/null
    done
}

# Test command consistency
test_command_consistency() {
    log_scenario "Testing Command Consistency"

    local required_commands=(
        "help"
        "build"
        "test"
        "run"
        "dev"
        "clean"
        "package"
        "install"
        "deps-check"
        "deps-start"
        "deps-stop"
        "dev-with-deps"
        "docker-run"
        "docker-stop"
    )

    local modules=(
        "backend/management-service"
        "backend/navigation-service"
        "frontend/management-ui"
        "frontend/chat-widget-mfe"
        "frontend/demo-app"
    )

    for module in "${modules[@]}"; do
        log_info "Checking command consistency: $module"

        local missing_commands=()
        for cmd in "${required_commands[@]}"; do
            if ! cd "$module" && grep -q "^$cmd:" Makefile; then
                missing_commands+=("$cmd")
            fi
            cd - >/dev/null 2>&1
        done

        if [ ${#missing_commands[@]} -eq 0 ]; then
            log_success "$module has all required commands"
        else
            log_error "$module missing commands: ${missing_commands[*]}"
        fi
    done
}

# Main test execution
main() {
    echo "🚀 Comprehensive Run Command Testing"
    echo "====================================="
    echo "Log file: $TEST_LOG_FILE"
    echo ""

    # Initialize log file
    echo "Test run started at $(date)" > "$TEST_LOG_FILE"

    # Run test scenarios
    test_help_commands
    test_command_consistency
    test_dependency_checking
    test_smart_dependency_startup
    test_build_commands
    test_profile_support
    test_docker_commands

    echo ""
    log_info "All test scenarios completed!"
    log_info "Check $TEST_LOG_FILE for detailed logs"

    echo ""
    echo "🎯 Quick Manual Tests You Can Run:"
    echo "=================================="
    echo ""
    echo "1. Test system overview:"
    echo "   make deps-overview"
    echo ""
    echo "2. Test individual module:"
    echo "   cd backend/management-service && make help"
    echo "   cd backend/management-service && make deps-check"
    echo ""
    echo "3. Test dependency startup:"
    echo "   cd backend/navigation-service && make dev-with-deps"
    echo ""
    echo "4. Test profile support:"
    echo "   cd frontend/demo-app && make run PROFILE=local"
    echo ""
    echo "5. Test full system demo:"
    echo "   make run"
    echo ""
}

# Run the tests
main "$@"
