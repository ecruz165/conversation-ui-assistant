# Frontend Applications

This directory contains the frontend applications for the Conversation UI Assistant project.

## Applications

### 1. Admin Portal (`admin-portal/`)
- **Framework**: TanStack Start (React 19)
- **Port**: 3000
- **Description**: Administrative interface for managing the conversation UI system
- **Features**: 
  - Server-side rendering (SSR)
  - File-based routing
  - TypeScript support
  - Tailwind CSS styling

### 2. Demo App (`demo-app/`)
- **Framework**: React 18 + Vite
- **Port**: 3001
- **Description**: Demo application for testing the conversation UI assistant
- **Features**:
  - Client-side rendering
  - TypeScript support
  - Hot module replacement
  - Modern React development setup

## Development

### Individual Applications

Start a specific frontend application:

```bash
# Admin Portal
cd frontend/admin-portal && pnpm dev

# Demo App
cd frontend/demo-app && pnpm dev
```

### All Frontend Applications

Start all frontend applications simultaneously:

```bash
# From project root
pnpm run dev:frontend
```

This will start both applications in parallel:
- Admin Portal: http://localhost:3000
- Demo App: http://localhost:3001

## Building

### Build All Frontend Applications

```bash
# From project root
pnpm run build:frontend
```

### Build Individual Applications

```bash
# Admin Portal
cd frontend/admin-portal && pnpm build

# Demo App
cd frontend/demo-app && pnpm build
```

## Project Structure

```
frontend/
├── admin-portal/          # TanStack Start application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── dist/             # Build output
│   ├── package.json      # Dependencies and scripts
│   └── vite.config.ts    # Vite configuration
├── demo-app/             # React + Vite application
│   ├── src/              # Source code
│   ├── dist/             # Build output
│   ├── package.json      # Dependencies and scripts
│   └── vite.config.ts    # Vite configuration
└── README.md             # This file
```

## Integration with Backend

The frontend applications are designed to work with the backend services:
- **Management Service**: Port 8080
- **Navigation Service**: Port 8081

For full-stack development, use:

```bash
# Start all services (backend + frontend)
pnpm run dev:all
```

## Workspace Configuration

Both frontend applications are part of the pnpm workspace and can be managed from the project root:

- Install dependencies: `pnpm install`
- Run scripts across all apps: `pnpm run --recursive <script>`
- Clean build artifacts: `pnpm run clean:frontend`
