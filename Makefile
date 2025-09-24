.PHONY: help clean compile test package install verify deploy build develop-app start dev

# Default target
help:
	@echo "Available targets:"
	@echo "  clean        - Clean all build artifacts"
	@echo "  compile      - Compile the project"
	@echo "  test         - Run unit tests"
	@echo "  package      - Package the application"
	@echo "  install      - Install to local repository"
	@echo "  verify       - Run integration tests"
	@echo "  deploy       - Deploy to remote repository"
	@echo "  build        - Clean and package"
	@echo "  develop-app  - Full development build (clean + install + test)"
	@echo "  start        - Start the application"
	@echo "  dev          - Start in development mode"

# Maven targets
clean:
	mvn clean

compile:
	mvn compile

test:
	mvn test

package:
	mvn package

install:
	mvn install

verify:
	mvn verify

deploy:
	mvn deploy

build:
	mvn clean package

# Development target - runs clean install and ensures all tests pass
develop-app:
	mvn clean install

# Application startup
start:
	mvn spring-boot:run

dev:
	mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Utility targets
check-build:
	@echo "Checking build status..."
	mvn compile test-compile

check-tests:
	@echo "Running all tests..."
	mvn test

# Combined development workflow
full-check: clean compile test package
	@echo "Full development check completed successfully"
