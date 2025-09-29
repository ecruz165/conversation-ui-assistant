#!/bin/bash

# Interactive Test Script for Run Commands
# Allows manual testing of specific scenarios

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Helper functions
print_header() {
    echo -e "\n${CYAN}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

print_option() {
    echo -e "${YELLOW}$1)${NC} $2"
}

print_command() {
    echo -e "${BLUE}Command:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Test functions
test_system_overview() {
    print_header "System-Wide Dependency Overview"
    print_command "make deps-overview"
    echo ""
    make deps-overview
    echo ""
    read -p "Press Enter to continue..."
}

test_module_help() {
    print_header "Module Help Commands"

    local modules=(
        "backend/management-service:Management Service"
        "backend/navigation-service:Navigation Service"
        "frontend/management-ui:Management UI"
        "frontend/chat-widget-mfe:Chat Widget MFE"
        "frontend/demo-app:Demo App"
    )

    echo "Select a module to test:"
    for i in "${!modules[@]}"; do
        IFS=':' read -r path name <<< "${modules[$i]}"
        print_option "$((i+1))" "$name ($path)"
    done
    print_option "0" "Back to main menu"

    read -p "Enter choice: " choice

    if [[ "$choice" =~ ^[1-5]$ ]]; then
        IFS=':' read -r path name <<< "${modules[$((choice-1))]}"
        print_header "Testing $name Help"
        print_command "cd $path && make help"
        echo ""
        cd "$path" && make help
        cd - >/dev/null
        echo ""
        read -p "Press Enter to continue..."
    fi
}

test_dependency_chain() {
    print_header "Dependency Chain Testing"

    echo "Select test scenario:"
    print_option "1" "Start PostgreSQL via Management Service"
    print_option "2" "Check Navigation Service reuses PostgreSQL"
    print_option "3" "Start Management UI (depends on Management Service)"
    print_option "4" "Start Chat Widget (depends on Navigation Service)"
    print_option "5" "Full dependency chain test"
    print_option "0" "Back to main menu"

    read -p "Enter choice: " choice

    case $choice in
        1)
            print_header "Starting PostgreSQL via Management Service"
            print_command "cd backend/management-service && make deps-start"
            echo ""
            cd backend/management-service && make deps-start
            cd - >/dev/null
            ;;
        2)
            print_header "Testing PostgreSQL Reuse"
            print_command "cd backend/navigation-service && make deps-check"
            echo ""
            cd backend/navigation-service && make deps-check
            cd - >/dev/null
            ;;
        3)
            print_header "Starting Management UI"
            print_command "cd frontend/management-ui && make deps-check"
            echo ""
            cd frontend/management-ui && make deps-check
            cd - >/dev/null
            ;;
        4)
            print_header "Starting Chat Widget"
            print_command "cd frontend/chat-widget-mfe && make deps-check"
            echo ""
            cd frontend/chat-widget-mfe && make deps-check
            cd - >/dev/null
            ;;
        5)
            print_header "Full Dependency Chain Test"
            print_command "make deps-check-all"
            echo ""
            make deps-check-all
            ;;
    esac

    if [[ "$choice" =~ ^[1-5]$ ]]; then
        echo ""
        read -p "Press Enter to continue..."
    fi
}

test_run_commands() {
    print_header "Run Command Testing"

    echo "Select run command test:"
    print_option "1" "Test 'make run' (Docker Compose demo)"
    print_option "2" "Test 'make run PROFILE=local' (Localstack)"
    print_option "3" "Test individual module run command"
    print_option "4" "Test dev-with-deps command"
    print_option "0" "Back to main menu"

    read -p "Enter choice: " choice

    case $choice in
        1)
            print_header "Testing Docker Compose Demo"
            print_info "This will start the full system in demo mode"
            print_command "make run"
            echo ""
            read -p "Continue? (y/N): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                make run
            fi
            ;;
        2)
            print_header "Testing Localstack Mode"
            print_info "This will start the system with localstack resources"
            print_command "make run PROFILE=local"
            echo ""
            read -p "Continue? (y/N): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                make run PROFILE=local
            fi
            ;;
        3)
            test_individual_run_command
            ;;
        4)
            test_dev_with_deps
            ;;
    esac

    if [[ "$choice" =~ ^[1-2]$ ]]; then
        echo ""
        read -p "Press Enter to continue..."
    fi
}

test_individual_run_command() {
    local modules=(
        "backend/management-service:Management Service"
        "backend/navigation-service:Navigation Service"
        "frontend/management-ui:Management UI"
        "frontend/chat-widget-mfe:Chat Widget MFE"
        "frontend/demo-app:Demo App"
    )

    echo "Select module to test run command:"
    for i in "${!modules[@]}"; do
        IFS=':' read -r path name <<< "${modules[$i]}"
        print_option "$((i+1))" "$name"
    done
    print_option "0" "Back"

    read -p "Enter choice: " choice

    if [[ "$choice" =~ ^[1-5]$ ]]; then
        IFS=':' read -r path name <<< "${modules[$((choice-1))]}"

        echo ""
        echo "Select run mode:"
        print_option "1" "Normal run (Docker Compose)"
        print_option "2" "Local profile (PROFILE=local)"

        read -p "Enter choice: " mode_choice

        case $mode_choice in
            1)
                print_header "Testing $name - Normal Run"
                print_command "cd $path && make run"
                echo ""
                read -p "Continue? (y/N): " confirm
                if [[ "$confirm" =~ ^[Yy]$ ]]; then
                    cd "$path" && make run
                    cd - >/dev/null
                fi
                ;;
            2)
                print_header "Testing $name - Local Profile"
                print_command "cd $path && make run PROFILE=local"
                echo ""
                read -p "Continue? (y/N): " confirm
                if [[ "$confirm" =~ ^[Yy]$ ]]; then
                    cd "$path" && make run PROFILE=local
                    cd - >/dev/null
                fi
                ;;
        esac
    fi
}

test_dev_with_deps() {
    local modules=(
        "backend/management-service:Management Service"
        "backend/navigation-service:Navigation Service"
        "frontend/management-ui:Management UI"
        "frontend/chat-widget-mfe:Chat Widget MFE"
        "frontend/demo-app:Demo App"
    )

    echo "Select module to test dev-with-deps:"
    for i in "${!modules[@]}"; do
        IFS=':' read -r path name <<< "${modules[$i]}"
        print_option "$((i+1))" "$name"
    done
    print_option "0" "Back"

    read -p "Enter choice: " choice

    if [[ "$choice" =~ ^[1-5]$ ]]; then
        IFS=':' read -r path name <<< "${modules[$((choice-1))]}"
        print_header "Testing $name - Dev with Dependencies"
        print_command "cd $path && make dev-with-deps"
        echo ""
        print_info "This will start dependencies and then the service in dev mode"
        read -p "Continue? (y/N): " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            cd "$path" && make dev-with-deps
            cd - >/dev/null
        fi
    fi
}

test_cleanup() {
    print_header "Cleanup Commands"

    echo "Select cleanup action:"
    print_option "1" "Stop demo environment"
    print_option "2" "Stop all dependencies"
    print_option "3" "Full cleanup (stop everything)"
    print_option "0" "Back to main menu"

    read -p "Enter choice: " choice

    case $choice in
        1)
            print_header "Stopping Demo Environment"
            print_command "make demo-stop"
            echo ""
            make demo-stop
            ;;
        2)
            print_header "Stopping Dependencies"
            print_command "cd backend/management-service && make deps-stop"
            echo ""
            cd backend/management-service && make deps-stop
            cd - >/dev/null
            ;;
        3)
            print_header "Full Cleanup"
            echo "Stopping all services..."
            make demo-stop 2>/dev/null || true
            cd backend/management-service && make deps-stop 2>/dev/null || true
            cd ../navigation-service && make deps-stop 2>/dev/null || true
            cd ../../
            print_success "Cleanup completed"
            ;;
    esac

    if [[ "$choice" =~ ^[1-3]$ ]]; then
        echo ""
        read -p "Press Enter to continue..."
    fi
}

# Main menu
main_menu() {
    while true; do
        clear
        print_header "🧪 Interactive Run Command Tester"
        echo ""
        print_info "Current directory: $(pwd)"
        echo ""

        print_option "1" "System-wide dependency overview"
        print_option "2" "Test module help commands"
        print_option "3" "Test dependency chain"
        print_option "4" "Test run commands"
        print_option "5" "Cleanup commands"
        print_option "q" "Quit"

        echo ""
        read -p "Enter your choice: " choice

        case $choice in
            1) test_system_overview ;;
            2) test_module_help ;;
            3) test_dependency_chain ;;
            4) test_run_commands ;;
            5) test_cleanup ;;
            q|Q)
                echo ""
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please try again."
                sleep 1
                ;;
        esac
    done
}

# Check if we're in the right directory
if [ ! -f "Makefile" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Start the interactive menu
main_menu
