# Chat Widget MFE Makefile
# Consistent commands for the chat widget micro frontend module

.PHONY: help build test run dev install clean package logs

# Default target
help:
	@echo "🎯 Chat Widget MFE Commands:"
	@echo ""
	@echo "📦 Development:"
	@echo "  make dev        - Start development server (port 3002)"
	@echo "  make install    - Install dependencies"
	@echo "  make clean      - Clean build artifacts"
	@echo ""
	@echo "🏗️  Building:"
	@echo "  make build      - Build for production"
	@echo "  make package    - Create npm package"
	@echo "  make run        - Start production preview"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test       - Run tests"
	@echo "  make test-watch - Run tests in watch mode"
	@echo ""
	@echo "🔧 Code Quality:"
	@echo "  make lint       - Check code quality"
	@echo "  make format     - Format code"
	@echo ""
	@echo "📊 Analysis:"
	@echo "  make analyze    - Analyze bundle size"
	@echo "  make logs       - Show development logs"

# Development
dev:
	@echo "🚀 Starting chat widget MFE development server..."
	npm run dev

install:
	@echo "📦 Installing chat widget MFE dependencies..."
	npm install

clean:
	@echo "🧹 Cleaning chat widget MFE build artifacts..."
	npm run clean

# Building
build:
	@echo "🏗️ Building chat widget MFE for production..."
	npm run build

package:
	@echo "📦 Creating chat widget MFE package..."
	npm run package

run:
	@echo "🚀 Starting chat widget MFE production preview..."
	npm run preview

# Testing
test:
	@echo "🧪 Running chat widget MFE tests..."
	npm run test

test-watch:
	@echo "🧪 Running chat widget MFE tests in watch mode..."
	npm run test:watch

# Code Quality
lint:
	@echo "🔍 Checking chat widget MFE code quality..."
	npm run lint

format:
	@echo "✨ Formatting chat widget MFE code..."
	npm run format

# Analysis
analyze:
	@echo "📊 Analyzing chat widget MFE bundle..."
	npm run build:analyze

logs:
	@echo "📋 Chat widget MFE development logs:"
	@echo "Server: http://localhost:3002"
	@echo "Remote Entry: http://localhost:3002/remoteEntry.js"
	@echo "Exposed modules:"
	@echo "  - ./ChatWidget"
	@echo "  - ./NavigationHelper" 
	@echo "  - ./ConversationProvider"
	@echo "  - ./useConversation"
