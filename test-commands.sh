#!/bin/bash

# Quick Test Runner for Standardized Commands
# Run this from the project root to test all standardized commands

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 Conversation UI Assistant - Command Testing${NC}"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "Makefile" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo "Select test type:"
echo ""
echo -e "${YELLOW}1)${NC} Quick Command Validation (fast)"
echo -e "${YELLOW}2)${NC} Comprehensive Scenario Testing (thorough)"
echo -e "${YELLOW}3)${NC} Interactive Testing (manual)"
echo -e "${YELLOW}4)${NC} Just show me the available commands"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Running quick command validation...${NC}"
        ./scripts/test-run-commands.sh
        ;;
    2)
        echo ""
        echo -e "${GREEN}Running comprehensive scenario testing...${NC}"
        ./scripts/test-run-scenarios.sh
        ;;
    3)
        echo ""
        echo -e "${GREEN}Starting interactive testing...${NC}"
        ./scripts/interactive-test.sh
        ;;
    4)
        echo ""
        echo -e "${GREEN}Available Commands Summary:${NC}"
        echo "=========================="
        echo ""
        echo "🏠 Root Commands:"
        echo "  make run                 # Full system demo (Docker Compose)"
        echo "  make run PROFILE=local   # Full system with localstack"
        echo "  make deps-overview       # System-wide dependency status"
        echo "  make deps-check-all      # All modules dependency status"
        echo "  make demo-stop           # Stop demo environment"
        echo ""
        echo "📦 Module Commands (same for all modules):"
        echo "  make help                # Show module commands"
        echo "  make build               # Build the module"
        echo "  make test                # Run tests"
        echo "  make run                 # Run module (Docker Compose demo)"
        echo "  make run PROFILE=local   # Run with localstack"
        echo "  make dev                 # Development mode (IDE profile)"
        echo "  make dev-with-deps       # Start dependencies + module"
        echo "  make clean               # Clean build artifacts"
        echo "  make deps-check          # Check dependency status"
        echo "  make deps-start          # Start dependencies (smart reuse)"
        echo "  make deps-stop           # Stop dependencies"
        echo "  make docker-run          # Run in Docker container"
        echo "  make docker-stop         # Stop Docker container"
        echo ""
        echo "🎯 Quick Test Examples:"
        echo "  make deps-overview"
        echo "  cd backend/management-service && make help"
        echo "  cd backend/management-service && make deps-check"
        echo "  cd frontend/demo-app && make run PROFILE=local"
        echo ""
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Testing completed!${NC}"
