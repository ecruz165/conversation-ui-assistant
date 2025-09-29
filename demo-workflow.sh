#!/bin/bash

# Demo Workflow Script
# Demonstrates the standardized make command system in action

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🚀 Conversation UI Assistant - Demo Workflow${NC}"
echo "=============================================="
echo ""

# Function to pause and wait for user input
pause() {
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read -r
}

# Function to run command with description
run_demo() {
    local description=$1
    local command=$2

    echo -e "${CYAN}📋 ${description}${NC}"
    echo -e "${YELLOW}Command: ${command}${NC}"
    echo ""

    eval "$command"

    pause
}

echo -e "${GREEN}This demo will show you the standardized make command system in action.${NC}"
echo ""
echo "We'll demonstrate:"
echo "• System-wide dependency monitoring"
echo "• Smart dependency detection and reuse"
echo "• Individual module development workflow"
echo "• Full system demo capabilities"
echo ""

pause

# 1. System Overview
run_demo "1. Check current system status" "make deps-overview"

# 2. Individual Module Dependency Check
run_demo "2. Check Management Service dependencies" "cd backend/management-service && make deps-check"

# 3. Frontend Module Dependency Check
run_demo "3. Check Management UI dependencies (shows dependency chain)" "cd frontend/management-ui && make deps-check"

# 4. Show help for a module
run_demo "4. Show standardized commands for Management Service" "cd backend/management-service && make help"

# 5. Show help for a frontend module
run_demo "5. Show standardized commands for Chat Widget MFE" "cd frontend/chat-widget-mfe && make help"

# 6. Root system help
run_demo "6. Show root system orchestration commands" "make help"

# 7. Validate all commands
echo -e "${CYAN}📋 7. Validate all standardized commands across the system${NC}"
echo -e "${YELLOW}Command: ./validate-commands.sh${NC}"
echo ""
echo -e "${GREEN}Running comprehensive validation...${NC}"
echo ""

./validate-commands.sh

pause

# 8. Final system status
run_demo "8. Final system status check" "make deps-overview"

echo ""
echo -e "${GREEN}🎉 Demo Complete!${NC}"
echo ""
echo -e "${BLUE}Key Takeaways:${NC}"
echo "• ✅ All commands are standardized across modules"
echo "• ✅ Smart dependency detection prevents duplicate services"
echo "• ✅ Clear separation between development and deployment"
echo "• ✅ Comprehensive monitoring and status reporting"
echo "• ✅ Professional, consistent interface"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "• Try: cd backend/management-service && make dev-with-deps"
echo "• Try: make run (for full system demo)"
echo "• Try: make deploy PROFILE=local (for localstack deployment)"
echo ""
echo -e "${CYAN}📚 Documentation:${NC}"
echo "• README_MAKE_COMMANDS.md - Comprehensive guide"
echo "• QUICK_REFERENCE.md - One-page reference"
echo "• SYSTEM_READY.md - Validation summary"
echo ""
