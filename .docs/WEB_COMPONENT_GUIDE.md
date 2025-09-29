# Chat Widget Web Component Guide

This guide shows how to use the Chat Widget as a native web component in any web application, framework, or plain HTML page.

## 🚀 Quick Start

### 1. Build the Web Component

```bash
cd frontend/management-ui

# Build the web component
make build-webcomponent

# Or using pnpm directly
pnpm build:webcomponent
```

### 2. Include in Your HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Application</title>
</head>
<body>
    <!-- Your application content -->
    <h1>Welcome to My App</h1>

    <!-- Include the web component script -->
    <script src="http://localhost:3000/dist/web-component/chat-widget.iife.js"></script>

    <!-- Use the chat widget -->
    <chat-widget
        api-endpoint="http://localhost:8080"
        websocket-url="ws://localhost:8081/ws/chat"
        theme="light"
        position="bottom-right">
    </chat-widget>
</body>
</html>
```

### 3. Try the Demo

```bash
# Run the interactive demo
make demo-webcomponent

# Or serve manually
make serve-webcomponent
# Then visit: http://localhost:3001/webcomponent-demo.html
```

## 📖 API Reference

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `api-endpoint` | string | `"http://localhost:8080"` | Backend API endpoint |
| `websocket-url` | string | `"ws://localhost:8081/ws/chat"` | WebSocket URL for real-time chat |
| `theme` | `"light" \| "dark"` | `"light"` | Visual theme |
| `position` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `"bottom-right"` | Widget position |
| `welcome-message` | string | `"Hi! I'm here to help you navigate..."` | Initial message |
| `placeholder` | string | `"Ask me anything..."` | Input placeholder text |
| `show-welcome-message` | boolean | `true` | Whether to show welcome message |
| `max-height` | number | `500` | Maximum widget height in pixels |
| `width` | number | `350` | Widget width in pixels |
| `z-index` | number | `1000` | CSS z-index for positioning |

### Events

The web component dispatches custom events that you can listen to:

#### `navigation-action`

Fired when the AI suggests a navigation action.

```javascript
widget.addEventListener('navigation-action', (event) => {
    console.log('Navigation action:', event.detail);
    // event.detail = { type: 'navigate', target: '/dashboard', data: {...} }
});
```

#### `message-sent`

Fired when a user sends a message.

```javascript
widget.addEventListener('message-sent', (event) => {
    console.log('Message sent:', event.detail.message);
});
```

#### `message-received`

Fired when a message is received from the AI.

```javascript
widget.addEventListener('message-received', (event) => {
    console.log('Message received:', event.detail.message);
});
```

#### `error`

Fired when an error occurs.

```javascript
widget.addEventListener('error', (event) => {
    console.error('Widget error:', event.detail.error);
});
```

## 🛠️ Development Workflow

### Development Commands

```bash
# Watch mode for development
make dev-webcomponent
# Rebuilds automatically when you change source files

# Build for production
make build-webcomponent

# Serve the built component
make serve-webcomponent

# Open interactive demo
make demo-webcomponent
```

### Vite-Friendly Development

The web component is built with Vite and follows modern build practices:

- **Hot Module Replacement**: Use `dev-webcomponent` for instant rebuilds
- **Tree Shaking**: Only includes code that's actually used
- **Modern JS**: Outputs ES2015+ for better performance
- **Source Maps**: Full debugging support in development
- **CSS Inlining**: All styles are bundled into the JavaScript

### File Structure

```
frontend/management-ui/
├── src/chat-widget/web-component/
│   ├── ChatWidgetElement.ts       # Web component class
│   └── index.ts                   # Entry point
├── vite.webcomponent.config.ts    # Vite config for web component
├── public/webcomponent-demo.html  # Interactive demo page
└── dist/web-component/            # Build output
    ├── chat-widget.iife.js        # Bundled web component
    └── chat-widget.iife.js.map    # Source map
```

## 🌐 Framework Integration

### React

```jsx
import { useEffect, useRef } from 'react';

function MyComponent() {
    const widgetRef = useRef(null);

    useEffect(() => {
        const widget = widgetRef.current;

        const handleNavigation = (event) => {
            console.log('Navigation:', event.detail);
            // Handle navigation in your React app
        };

        widget?.addEventListener('navigation-action', handleNavigation);

        return () => {
            widget?.removeEventListener('navigation-action', handleNavigation);
        };
    }, []);

    return (
        <div>
            <h1>My React App</h1>
            <chat-widget
                ref={widgetRef}
                api-endpoint="http://localhost:8080"
                theme="light"
                position="bottom-right"
            />
        </div>
    );
}
```

### Vue

```vue
<template>
    <div>
        <h1>My Vue App</h1>
        <chat-widget
            ref="widget"
            api-endpoint="http://localhost:8080"
            theme="light"
            position="bottom-right"
            @navigation-action="handleNavigation"
        />
    </div>
</template>

<script>
export default {
    mounted() {
        this.$refs.widget.addEventListener('navigation-action', this.handleNavigation);
    },
    beforeUnmount() {
        this.$refs.widget.removeEventListener('navigation-action', this.handleNavigation);
    },
    methods: {
        handleNavigation(event) {
            console.log('Navigation:', event.detail);
            // Handle navigation in your Vue app
        }
    }
}
</script>
```

### Angular

```typescript
// app.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <h1>My Angular App</h1>
        <chat-widget
            #widget
            api-endpoint="http://localhost:8080"
            theme="light"
            position="bottom-right">
        </chat-widget>
    `
})
export class AppComponent implements AfterViewInit {
    @ViewChild('widget') widget!: ElementRef;

    ngAfterViewInit() {
        this.widget.nativeElement.addEventListener('navigation-action', (event: any) => {
            console.log('Navigation:', event.detail);
            // Handle navigation in your Angular app
        });
    }
}
```

### Vanilla JavaScript

```javascript
// Create widget programmatically
const container = document.getElementById('chat-container');

// Use the global helper function
const widget = window.createChatWidget(container, {
    'api-endpoint': 'http://localhost:8080',
    'theme': 'dark',
    'position': 'bottom-left',
    'welcome-message': 'Hello! How can I help you today?'
});

// Listen to events
widget.addEventListener('navigation-action', (event) => {
    console.log('Navigation:', event.detail);

    // Example: Navigate to the suggested page
    if (event.detail.type === 'navigate') {
        window.location.href = event.detail.target;
    }
});

widget.addEventListener('message-sent', (event) => {
    console.log('User said:', event.detail.message);
});
```

## 🎨 Theming

The web component supports light and dark themes out of the box:

```html
<!-- Light theme (default) -->
<chat-widget theme="light"></chat-widget>

<!-- Dark theme -->
<chat-widget theme="dark"></chat-widget>
```

### Custom Styling

The web component uses Shadow DOM for style encapsulation, but you can still customize it:

```css
/* Target the web component itself */
chat-widget {
    /* These styles affect the component's position/layout */
    --chat-widget-z-index: 9999;
}

/* The internal styles are encapsulated, but you can override via attributes */
```

## 🔧 Configuration Examples

### Minimal Setup

```html
<script src="http://localhost:3000/dist/web-component/chat-widget.iife.js"></script>
<chat-widget></chat-widget>
```

### Full Configuration

```html
<chat-widget
    api-endpoint="https://api.mycompany.com"
    websocket-url="wss://ws.mycompany.com/chat"
    theme="dark"
    position="top-left"
    welcome-message="Welcome to MyCompany! How can I assist you?"
    placeholder="Type your question here..."
    show-welcome-message="true"
    max-height="600"
    width="400"
    z-index="5000">
</chat-widget>
```

### Dynamic Configuration

```javascript
const widget = document.querySelector('chat-widget');

// Change theme at runtime
widget.setAttribute('theme', 'dark');

// Change position
widget.setAttribute('position', 'top-right');

// Change API endpoint
widget.setAttribute('api-endpoint', 'https://new-api.example.com');
```

## 🚀 Production Deployment

### Build for Production

```bash
# Build optimized version
make build-webcomponent

# Output will be in: dist/web-component/chat-widget.iife.js
```

### Serve Static Files

The built web component is a single JavaScript file that you can serve from any static hosting:

- **CDN**: Upload to your CDN
- **Static Hosting**: Serve from Netlify, Vercel, etc.
- **Web Server**: Serve from Apache, Nginx, etc.
- **Same Origin**: Include in your application's static assets

### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourapp.com;

    # Serve the web component
    location /chat-widget.js {
        alias /path/to/chat-widget.iife.js;
        add_header Cache-Control "public, max-age=31536000";
        add_header Access-Control-Allow-Origin "*";
    }

    # Your application
    location / {
        # Your app configuration
    }
}
```

### CDN Usage

```html
<!-- Use from your CDN -->
<script src="https://cdn.yourcompany.com/chat-widget.iife.js"></script>
<chat-widget api-endpoint="https://api.yourcompany.com"></chat-widget>
```

## 🔍 Debugging

### Development Mode

```bash
# Build with source maps
make dev-webcomponent

# Or build and serve with debugging
make serve-webcomponent
```

### Browser Console

```javascript
// Check if component is loaded
console.log('ChatWidget loaded:', !!window.ChatWidgetElement);

// Access component instance
const widget = document.querySelector('chat-widget');
console.log('Widget element:', widget);

// Check registration
console.log('Registered:', customElements.get('chat-widget'));
```

### Demo Page

The demo page at `public/webcomponent-demo.html` includes:

- Real-time event logging
- Interactive configuration
- Usage examples
- Browser compatibility checks

## 🌟 Advanced Usage

### Multiple Widgets

```html
<!-- Different configurations on the same page -->
<chat-widget id="support-widget"
    api-endpoint="https://support-api.com"
    theme="light"
    position="bottom-right"
    welcome-message="Need help? I'm here to assist!">
</chat-widget>

<chat-widget id="sales-widget"
    api-endpoint="https://sales-api.com"
    theme="dark"
    position="bottom-left"
    welcome-message="Interested in our products?">
</chat-widget>
```

### Conditional Loading

```javascript
// Load widget only when needed
async function loadChatWidget() {
    if (!customElements.get('chat-widget')) {
        await import('http://localhost:3000/dist/web-component/chat-widget.iife.js');
    }

    const widget = document.createElement('chat-widget');
    widget.setAttribute('api-endpoint', 'https://api.example.com');
    document.body.appendChild(widget);
}

// Load on user action
document.getElementById('help-button').addEventListener('click', loadChatWidget);
```

### Integration with Router

```javascript
// React Router example
import { useNavigate } from 'react-router-dom';

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const widget = document.querySelector('chat-widget');

        const handleNavigation = (event) => {
            // Use your router to navigate
            navigate(event.detail.target);
        };

        widget?.addEventListener('navigation-action', handleNavigation);
        return () => widget?.removeEventListener('navigation-action', handleNavigation);
    }, [navigate]);

    return (
        <div>
            <Routes>
                {/* Your routes */}
            </Routes>
            <chat-widget api-endpoint="http://localhost:8080" />
        </div>
    );
}
```

## 📋 Browser Support

The web component works in all modern browsers that support:

- **Custom Elements v1**: Chrome 54+, Firefox 63+, Safari 10.1+
- **Shadow DOM v1**: Chrome 53+, Firefox 63+, Safari 10+
- **ES2015 Modules**: Chrome 61+, Firefox 60+, Safari 11+

For older browsers, consider using polyfills:

```html
<!-- Polyfills for older browsers -->
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2/webcomponents-loader.js"></script>
<script>
  window.WebComponents = window.WebComponents || {
    waitFor: function(cb) { cb(); }
  };

  WebComponents.waitFor(function() {
    // Load your web component after polyfills
    const script = document.createElement('script');
    script.src = 'http://localhost:3000/dist/web-component/chat-widget.iife.js';
    document.head.appendChild(script);
  });
</script>
```

## ❓ Troubleshooting

### Component Not Loading

1. **Check Network**: Ensure the script loads successfully
2. **Check Console**: Look for JavaScript errors
3. **Check Registration**: Use `customElements.get('chat-widget')`

### Events Not Firing

1. **Check Event Names**: Use exact event names (`navigation-action`, not `navigationAction`)
2. **Check Timing**: Add listeners after the component is connected
3. **Check Scope**: Events bubble up from the shadow DOM

### Styling Issues

1. **Shadow DOM**: Styles are encapsulated; use attributes for configuration
2. **Z-Index**: Adjust the `z-index` attribute if the widget is hidden
3. **Position**: Ensure parent containers don't interfere with positioning

### API Connection Issues

1. **CORS**: Ensure your API allows cross-origin requests
2. **WebSocket**: Check WebSocket URL format and accessibility
3. **Network**: Verify API endpoints are reachable

## 📞 Support

For issues and questions:

1. Check the [Interactive Demo](http://localhost:3001/webcomponent-demo.html)
2. Review browser console for errors
3. Verify API connectivity
4. Check the source code in `src/chat-widget/web-component/`
