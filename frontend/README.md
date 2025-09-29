# Frontend Applications

This directory contains the frontend applications for the Conversation UI Assistant project.

## Applications

### 1. Management UI (`management-ui/`)

- **Framework**: Vite + React 19
- **Port**: 3000
- **Description**: Administrative interface with Chat Widget Web Component
- **Features**:
  - Web Component distribution (framework-agnostic)
  - Client-side routing with React Router
  - TypeScript support
  - Tailwind CSS styling
  - Chat Widget as standalone web component
  - Web component bundle at `/dist/web-component/chat-widget.iife.js`

**Web Component:**

- `<chat-widget>` - Standalone chat widget web component
- Framework-agnostic (works with React, Vue, Angular, vanilla JS)
- Self-contained bundle with all dependencies

## Development

### Management UI Development

Start the management UI development:

```bash
# Management UI (main React app)
cd frontend/management-ui && pnpm dev

# Or build and serve web component
cd frontend/management-ui && make serve-webcomponent
```

### All Frontend Applications

Start all frontend applications:

```bash
# From project root
pnpm run dev:frontend
```

This will start the management UI:

- Management UI (main app): <http://localhost:3000>
- Web Component Demo: <http://localhost:3001/webcomponent-demo.html>
- Web Component Bundle: <http://localhost:3001/chat-widget.iife.js>

## Building

### Build All Frontend Applications

```bash
# From project root
pnpm run build:frontend
```

### Build Individual Applications

```bash
# Management UI (regular build)
cd frontend/management-ui && pnpm build

# Web Component build
cd frontend/management-ui && pnpm build:webcomponent
```

## Project Structure

```
frontend/
├── management-ui/                    # Vite + React application with Web Component
│   ├── src/                         # Source code
│   │   ├── chat-widget/             # Chat widget components
│   │   │   ├── components/          # React components
│   │   │   ├── hooks/               # Custom hooks
│   │   │   ├── providers/           # Context providers
│   │   │   ├── types/               # TypeScript types
│   │   │   ├── utils/               # Utilities
│   │   │   └── web-component/       # Web component wrapper
│   │   ├── components/              # UI components
│   │   └── styles/                  # CSS styles
│   ├── public/                      # Static assets
│   │   └── webcomponent-demo.html   # Web component demo
│   ├── dist/                        # Build output
│   │   └── web-component/           # Web component build
│   ├── package.json                 # Dependencies and scripts
│   ├── vite.config.ts               # Main Vite configuration
│   └── vite.webcomponent.config.ts  # Web component configuration
└── README.md                        # This file
```

## Integration with Backend

The frontend applications are designed to work with the backend services:

- **Management Service**: Port 8080
- **Navigation Service**: Port 8081

For full-stack development, use:

```bash
# Start all services (backend + frontend)
make run

# Or from root directory
pnpm run dev:all
```

## Web Component Usage

The Management UI provides a standalone web component for chat widget functionality:

- **Component Name**: `<chat-widget>`
- **Bundle URL**: `http://localhost:3001/chat-widget.iife.js`
- **Demo Page**: `http://localhost:3001/webcomponent-demo.html`

### Using in Any Web Application

```html
<!-- Include the web component script -->
<script src="http://localhost:3001/chat-widget.iife.js"></script>

<!-- Use the chat widget -->
<chat-widget
  api-endpoint="http://localhost:8080"
  websocket-url="ws://localhost:8081/ws/chat"
  theme="light"
  position="bottom-right"
  welcome-message="Hello! How can I help you?"
  placeholder="Type your message...">
</chat-widget>
```

### Programmatic Creation

```javascript
// Create widget programmatically
const container = document.getElementById('chat-container');
const widget = window.createChatWidget(container, {
  'api-endpoint': 'http://localhost:8080',
  'theme': 'dark',
  'position': 'bottom-left'
});

// Listen to events
widget.addEventListener('message-sent', (e) => {
  console.log('Message sent:', e.detail.message);
});

widget.addEventListener('navigation-action', (e) => {
  console.log('Navigation:', e.detail);
});
```

### Supported Attributes

- `api-endpoint` - Backend API URL
- `websocket-url` - WebSocket URL for real-time communication
- `theme` - "light" or "dark"
- `position` - "bottom-right", "bottom-left", "top-right", "top-left", or "static"
- `welcome-message` - Initial message displayed
- `placeholder` - Input placeholder text

### Events

- `message-sent` - When user sends a message
- `message-received` - When a response is received
- `navigation-action` - When navigation is requested
- `error` - When an error occurs

## Workspace Configuration

The frontend application is part of the pnpm workspace and can be managed from the project root:

- Install dependencies: `pnpm install`
- Run scripts: `pnpm run --recursive <script>`
- Clean build artifacts: `pnpm run clean:frontend`

## Web Component Development Commands

```bash
# Build web component
make build-webcomponent

# Develop with watch mode
make dev-webcomponent

# Serve built component
make serve-webcomponent

# Open demo page
make demo-webcomponent
```
