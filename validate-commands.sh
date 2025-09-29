#!/bin/bash

# Command Validation Script
# Validates all standardized commands across modules

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 Command Validation Report${NC}"
echo "============================="
echo ""

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to test command existence
test_command() {
    local module_path=$1
    local command=$2
    local description=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if cd "$module_path" && make -n "$command" >/dev/null 2>&1; then
        echo -e "  ✅ ${command} - ${description}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ❌ ${command} - ${description}"
    fi
    cd - >/dev/null
}

# Test root commands
echo -e "${YELLOW}📁 Root Commands${NC}"
echo "----------------"

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if make -n help >/dev/null 2>&1; then
    echo -e "  ✅ help - Show available commands"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ❌ help - Show available commands"
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if make -n run >/dev/null 2>&1; then
    echo -e "  ✅ run - Full system demo"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ❌ run - Full system demo"
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if make -n stop >/dev/null 2>&1; then
    echo -e "  ✅ stop - Stop all environments"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ❌ stop - Stop all environments"
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if make -n demo-stop >/dev/null 2>&1; then
    echo -e "  ✅ demo-stop - Stop all environments (alias)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ❌ demo-stop - Stop all environments (alias)"
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if make -n deploy >/dev/null 2>&1; then
    echo -e "  ✅ deploy - Deploy to AWS/localstack"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ❌ deploy - Deploy to AWS/localstack"
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if make -n deps-overview >/dev/null 2>&1; then
    echo -e "  ✅ deps-overview - System dependency status"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ❌ deps-overview - System dependency status"
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if make -n test-all >/dev/null 2>&1; then
    echo -e "  ✅ test-all - Test all modules with dependencies (IDE profile)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "  ❌ test-all - Test all modules with dependencies (IDE profile)"
fi

echo ""

# Define modules to test
MODULES=(
    "backend/management-service:Management Service"
    "backend/navigation-service:Navigation Service"
    "frontend/management-ui:Management UI"
    "frontend/chat-widget-mfe:Chat Widget MFE"
)

# Standard commands that should exist in all modules
STANDARD_COMMANDS=(
    "help:Show available commands"
    "build:Build the module"
    "test:Run tests with dependencies (IDE profile)"
    "run:Run with live code changes (starts dependencies + service)"
    "dev:Development mode (IDE profile)"
    "dev-with-deps:Start dependencies + module"
    "clean:Clean build artifacts"
    "package:Create deployable artifact"
    "install:Install dependencies"
    "deps-check:Check dependency status"
    "deps-start:Start dependencies"
    "deps-stop:Stop dependencies"
    "docker-run:Run in Docker container"
)

# Test each module
for module_entry in "${MODULES[@]}"; do
    IFS=':' read -r module_path module_name <<< "$module_entry"

    echo -e "${YELLOW}📦 ${module_name} (${module_path})${NC}"
    echo "$(printf '%.0s-' {1..50})"

    # Test each standard command
    for cmd_entry in "${STANDARD_COMMANDS[@]}"; do
        IFS=':' read -r command description <<< "$cmd_entry"
        test_command "$module_path" "$command" "$description"
    done

    echo ""
done

# Summary
echo -e "${BLUE}📊 Validation Summary${NC}"
echo "===================="
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}✅ All tests passed! ($PASSED_TESTS/$TOTAL_TESTS)${NC}"
    echo ""
    echo -e "${GREEN}🎯 Command standardization is complete and working correctly!${NC}"
    exit 0
else
    FAILED_TESTS=$((TOTAL_TESTS - PASSED_TESTS))
    echo -e "${RED}❌ Some tests failed: $PASSED_TESTS/$TOTAL_TESTS passed, $FAILED_TESTS failed${NC}"
    echo ""
    echo -e "${YELLOW}💡 Please check the failed commands above and fix the Makefiles${NC}"
    exit 1
fi
