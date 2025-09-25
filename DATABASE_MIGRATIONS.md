# Database Migrations

This document describes the database schema and migration strategy for the Conversation UI Assistant project.

## Overview

The project uses **Flyway** for database migrations with a shared PostgreSQL database between two microservices:

- **Management Service** (V1.x.x migrations)
- **Navigation Service** (V2.x.x migrations)

## Database Configuration

### Shared Database

- **Database**: `conversation_ui`
- **User**: `conversation_user`
- **Password**: `conversation_pass`
- **Host**: `localhost:5432`

### Migration Strategy

- **Management Service**: Handles V1.x.x migrations (core business logic)
- **Navigation Service**: Handles V2.x.x migrations (navigation-specific data)
- **Version Separation**: Prevents migration conflicts between services
- **Shared Schema**: Both services use the `public` schema

## Management Service Migrations (V1.x.x)

### V1.1.0 - Create users table

- **users**: User accounts and authentication
- **Indexes**: username, email, active status, profile data (GIN)
- **Triggers**: Auto-update `updated_at` timestamp

### V1.2.0 - Create conversations table

- **conversations**: User conversation sessions
- **messages**: Individual messages within conversations
- **Relationships**: conversations → users (FK)
- **Triggers**: Auto-update conversation timestamp on new messages

### V1.3.0 - Create ai models table

- **ai_models**: AI model configurations (OpenAI, Anthropic, etc.)
- **user_preferences**: User-specific settings and preferences
- **applications**: Web applications for navigation
- **Relationships**: preferences → users, ai_models (FK)

### V1.4.0 - Create audit logs table

- **audit_logs**: System audit trail for security
- **system_settings**: Application-wide configuration
- **user_sessions**: Active user session management
- **Functions**: Session cleanup utilities

### V1.5.0 - Insert initial data

- Default AI models (GPT-4 Turbo, Claude 3, etc.)
- System configuration settings
- Sample applications (GitHub, Google Drive, Slack, Notion)
- Default admin user (username: `admin`)

## Navigation Service Migrations (V2.x.x)

### V2.1.0 - Create navigation sessions table

- **navigation_sessions**: Active navigation sessions
- **page_snapshots**: Page state and DOM snapshots
- **Relationships**: snapshots → sessions (FK)
- **Triggers**: Auto-update session on new snapshots

### V2.2.0 - Create page elements table

- **page_elements**: Identified page elements and properties
- **element_interactions**: User interaction logs
- **element_selectors**: Multiple selector strategies per element
- **Relationships**: Complex FK relationships for element tracking

### V2.3.0 - Create navigation steps table

- **navigation_steps**: Individual navigation actions
- **navigation_workflows**: Reusable navigation patterns
- **workflow_executions**: Workflow execution tracking
- **Features**: Step retry logic, workflow templates

### V2.4.0 - Create performance metrics table

- **performance_metrics**: Navigation performance data
- **browser_automation_logs**: Detailed automation logs
- **element_recognition_cache**: AI recognition result caching
- **session_analytics**: Aggregated session statistics

### V2.5.0 - Insert initial data

- Sample navigation workflows (GitHub login, file upload, etc.)
- Performance metrics examples
- Element recognition cache entries
- Browser automation log samples

## Running Migrations

### Prerequisites

```bash
# Start PostgreSQL database
docker-compose -f infrastructure/docker-compose.yml up -d postgres
```

### Management Service

```bash
cd backend/management-service
mvn flyway:migrate
```

### Navigation Service

```bash
cd backend/navigation-service
mvn flyway:migrate
```

### Verification

```bash
# Check all tables
docker exec conversation-ui-postgres psql -U conversation_user -d conversation_ui -c "\dt"

# Check migration history
docker exec conversation-ui-postgres psql -U conversation_user -d conversation_ui -c "SELECT version, description, installed_on FROM flyway_schema_history ORDER BY installed_rank;"
```

## Database Schema Summary

### Core Tables (22 total)

- **User Management**: users, user_preferences, user_sessions
- **Conversations**: conversations, messages
- **AI Configuration**: ai_models, system_settings
- **Applications**: applications
- **Auditing**: audit_logs
- **Navigation**: navigation_sessions, page_snapshots, navigation_steps
- **Elements**: page_elements, element_interactions, element_selectors
- **Workflows**: navigation_workflows, workflow_executions
- **Performance**: performance_metrics, session_analytics
- **Automation**: browser_automation_logs, element_recognition_cache

### Key Features

- **JSONB Support**: Flexible data storage for configurations and metadata
- **Full-text Indexing**: GIN indexes for JSON data
- **Audit Trail**: Comprehensive logging and tracking
- **Performance Monitoring**: Detailed metrics and analytics
- **Caching**: AI recognition result caching for performance
- **Workflow Management**: Reusable navigation patterns

## Development Notes

- Both services share the same database but manage separate data domains
- Migration versioning prevents conflicts (V1.x.x vs V2.x.x)
- Initial data includes realistic examples for development and testing
- All tables include proper constraints, indexes, and documentation
- Triggers handle automatic timestamp updates
- Functions provide utility operations (cleanup, etc.)
