#!/bin/bash

# Test Script for Standardized Run Commands
# Tests all make commands across all modules to ensure consistency

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test function
test_command() {
    local module_path="$1"
    local command="$2"
    local description="$3"

    ((TOTAL_TESTS++))

    log_info "Testing: $description"
    echo "  Command: cd $module_path && $command"

    if cd "$module_path" && timeout 10s $command --help >/dev/null 2>&1 || \
       cd "$module_path" && timeout 10s $command help >/dev/null 2>&1 || \
       cd "$module_path" && $command 2>&1 | grep -q "help\|usage\|commands" 2>/dev/null; then
        log_success "$description"
        cd - >/dev/null
        return 0
    else
        log_error "$description"
        cd - >/dev/null
        return 1
    fi
}

# Test help command specifically
test_help_command() {
    local module_path="$1"
    local module_name="$2"

    ((TOTAL_TESTS++))

    log_info "Testing help command for $module_name"

    if cd "$module_path" && make help >/dev/null 2>&1; then
        log_success "$module_name help command"
        cd - >/dev/null
        return 0
    else
        log_error "$module_name help command"
        cd - >/dev/null
        return 1
    fi
}

# Test if command exists in Makefile
test_makefile_command() {
    local module_path="$1"
    local command="$2"
    local module_name="$3"

    ((TOTAL_TESTS++))

    if [ -f "$module_path/Makefile" ] && grep -q "^$command:" "$module_path/Makefile"; then
        log_success "$module_name has '$command' command"
        return 0
    else
        log_error "$module_name missing '$command' command"
        return 1
    fi
}

# Main test execution
main() {
    echo "🧪 Testing Standardized Run Commands"
    echo "===================================="
    echo ""

    # Define modules to test
    MODULES=(
        "backend/management-service:Management Service"
        "backend/navigation-service:Navigation Service"
        "frontend/management-ui:Management UI"
        "frontend/chat-widget-mfe:Chat Widget MFE"
        "frontend/demo-app:Demo App"
    )

    # Define standard commands that should exist in all modules
    STANDARD_COMMANDS=(
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

    log_info "Testing standard commands across all modules..."
    echo ""

    # Test each module for standard commands
    for module_entry in "${MODULES[@]}"; do
        IFS=':' read -r module_path module_name <<< "$module_entry"

        echo "📦 Testing $module_name ($module_path)"
        echo "----------------------------------------"

        # Check if module directory exists
        if [ ! -d "$module_path" ]; then
            log_error "$module_name directory not found: $module_path"
            continue
        fi

        # Check if Makefile exists
        if [ ! -f "$module_path/Makefile" ]; then
            log_error "$module_name Makefile not found"
            continue
        fi

        # Test help command execution
        test_help_command "$module_path" "$module_name"

        # Test each standard command exists in Makefile
        for cmd in "${STANDARD_COMMANDS[@]}"; do
            test_makefile_command "$module_path" "$cmd" "$module_name"
        done

        echo ""
    done

    # Test root Makefile commands
    echo "🏠 Testing Root Makefile Commands"
    echo "--------------------------------"

    ROOT_COMMANDS=(
        "help"
        "run"
        "deps-overview"
        "deps-check-all"
        "demo-stop"
    )

    for cmd in "${ROOT_COMMANDS[@]}"; do
        test_makefile_command "." "$cmd" "Root Makefile"
    done

    echo ""

    # Test dependency chain verification
    echo "🔗 Testing Dependency Chain Logic"
    echo "--------------------------------"

    # Test that dependency commands exist and have proper logic
    log_info "Checking dependency chain implementation..."

    # Check management-service depends on postgres
    if grep -q "pg_isready.*postgres" backend/management-service/Makefile; then
        log_success "Management Service has PostgreSQL dependency check"
    else
        log_error "Management Service missing PostgreSQL dependency check"
    fi

    # Check navigation-service depends on postgres
    if grep -q "pg_isready.*postgres" backend/navigation-service/Makefile; then
        log_success "Navigation Service has PostgreSQL dependency check"
    else
        log_error "Navigation Service missing PostgreSQL dependency check"
    fi

    # Check management-ui depends on management-service
    if grep -q "management-service\|8080" frontend/management-ui/Makefile; then
        log_success "Management UI has Management Service dependency"
    else
        log_error "Management UI missing Management Service dependency"
    fi

    # Check chat-widget-mfe depends on navigation-service
    if grep -q "navigation-service\|8081" frontend/chat-widget-mfe/Makefile; then
        log_success "Chat Widget MFE has Navigation Service dependency"
    else
        log_error "Chat Widget MFE missing Navigation Service dependency"
    fi

    echo ""

    # Test profile support (IDE profile for development)
    echo "⚙️  Testing IDE Profile Support"
    echo "-------------------------------"

    # Check for IDE profile support in dev commands
    for module_entry in "${MODULES[@]}"; do
        IFS=':' read -r module_path module_name <<< "$module_entry"

        if grep -q 'ide\|IDE' "$module_path/Makefile"; then
            log_success "$module_name supports IDE profile"
        else
            log_error "$module_name missing IDE profile support"
        fi
    done

    echo ""

    # Summary
    echo "📊 Test Summary"
    echo "==============="
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! Standardized commands are working correctly.${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please review the issues above.${NC}"
        exit 1
    fi
}

# Run the tests
main "$@"
