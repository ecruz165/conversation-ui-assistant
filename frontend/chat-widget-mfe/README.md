# Product Requirements Document
## Universal Chat Widget MFE (Web Component)

**Product Name:** NavChat Widget  
**Version:** 1.0.0  
**Date:** November 2024  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Overview
A fully encapsulated, framework-agnostic chat widget built as a Web Component with Shadow DOM isolation. The widget provides conversational navigation capabilities and can be embedded in any frontend framework (React, Vue, Angular, vanilla JS) or static HTML site without style conflicts or dependency issues.

### 1.2 Key Features
- **True Isolation**: Shadow DOM ensures complete style and DOM encapsulation
- **Framework Agnostic**: Works with any frontend technology
- **MUI Components**: Material-UI components adapted for Shadow DOM
- **Emotion CSS-in-JS**: Inline styling within Shadow DOM
- **Module Federation**: Can be loaded as MFE or standalone
- **Real-time Communication**: WebSocket connection to navigation service
- **Voice Support**: Audio input with speech-to-text
- **Accessibility**: WCAG 2.1 AA compliant

### 1.3 Technical Stack
- **Core**: Web Components (Custom Elements v1)
- **UI Library**: MUI Base (unstyled components)
- **Styling**: Emotion CSS-in-JS with Shadow DOM support
- **Build**: Webpack 5 with Module Federation
- **Communication**: WebSocket, REST APIs
- **TypeScript**: Full type safety

---

## 2. Technical Architecture

### 2.1 Web Component Structure

```
navchat-widget/
├── src/
│   ├── index.ts                    # Web Component registration
│   ├── NavChatWidget.ts            # Main Web Component class
│   ├── components/
│   │   ├── ChatContainer.tsx       # React root inside Shadow DOM
│   │   ├── MessageList.tsx         # Message display
│   │   ├── InputArea.tsx           # Text/voice input
│   │   ├── NavigationCard.tsx      # Navigation suggestions
│   │   └── VoiceRecorder.tsx       # Audio handling
│   ├── styles/
│   │   ├── theme.ts                # MUI theme configuration
│   │   ├── globalStyles.ts         # Shadow DOM global styles
│   │   └── emotionCache.ts         # Emotion cache for Shadow DOM
│   ├── services/
│   │   ├── WebSocketService.ts     # WS connection management
│   │   ├── NavigationService.ts    # Navigation API calls
│   │   └── AudioService.ts         # Voice processing
│   ├── hooks/
│   │   ├── useWebSocket.ts         # WebSocket React hook
│   │   ├── useNavigation.ts        # Navigation state
│   │   └── useVoiceInput.ts        # Voice input handling
│   ├── utils/
│   │   ├── shadowDomUtils.ts       # Shadow DOM helpers
│   │   ├── eventBridge.ts          # Event communication
│   │   └── storage.ts              # Local storage wrapper
│   └── types/
│       └── index.d.ts              # TypeScript definitions
├── dist/
│   ├── navchat-widget.js          # UMD bundle
│   ├── navchat-widget.esm.js      # ES Module
│   └── navchat-widget.min.js      # Minified for CDN
└── package.json
```

---

## 3. Component Specifications

### 3.1 Web Component Registration

```typescript
// index.ts
import { NavChatWidget } from './NavChatWidget';

// Register the custom element
if (!customElements.get('navchat-widget')) {
  customElements.define('navchat-widget', NavChatWidget);
}

// Export for module usage
export { NavChatWidget };
```

### 3.2 Main Web Component Class

```typescript
// NavChatWidget.ts
import { createRoot } from 'react-dom/client';
import { createCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import ChatContainer from './components/ChatContainer';
import { theme } from './styles/theme';

export class NavChatWidget extends HTMLElement {
  private root: ReactDOM.Root | null = null;
  private shadowRoot: ShadowRoot;
  private emotionCache: EmotionCache;
  
  // Observed attributes
  static get observedAttributes() {
    return [
      'api-key',
      'endpoint',
      'theme',
      'position',
      'language',
      'auto-open',
      'z-index'
    ];
  }
  
  constructor() {
    super();
    
    // Create Shadow DOM
    this.shadowRoot = this.attachShadow({ mode: 'open' });
    
    // Create Emotion cache for Shadow DOM
    this.emotionCache = this.createEmotionCache();
  }
  
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }
  
  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
    this.cleanupEventListeners();
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.handleAttributeChange(name, newValue);
    }
  }
  
  private createEmotionCache(): EmotionCache {
    // Create container in Shadow DOM for Emotion styles
    const emotionRoot = document.createElement('div');
    emotionRoot.setAttribute('id', 'emotion-root');
    this.shadowRoot.appendChild(emotionRoot);
    
    return createCache({
      key: 'navchat',
      container: emotionRoot,
      prepend: true
    });
  }
  
  private render() {
    // Create React mount point in Shadow DOM
    const mountPoint = document.createElement('div');
    mountPoint.setAttribute('id', 'navchat-root');
    this.shadowRoot.appendChild(mountPoint);
    
    // Create React root and render
    this.root = createRoot(mountPoint);
    this.root.render(
      <CacheProvider value={this.emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ChatContainer
            apiKey={this.getAttribute('api-key')}
            endpoint={this.getAttribute('endpoint')}
            position={this.getAttribute('position') || 'bottom-right'}
            theme={this.getAttribute('theme') || 'light'}
          />
        </ThemeProvider>
      </CacheProvider>
    );
  }
  
  // Public API methods
  open() {
    this.dispatchEvent(new CustomEvent('open'));
  }
  
  close() {
    this.dispatchEvent(new CustomEvent('close'));
  }
  
  sendMessage(message: string) {
    this.dispatchEvent(new CustomEvent('send-message', { detail: message }));
  }
}
```

### 3.3 Chat Container Component

```typescript
// components/ChatContainer.tsx
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, IconButton, Badge, Fade } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import MessageList from './MessageList';
import InputArea from './InputArea';
import { useWebSocket } from '../hooks/useWebSocket';
import { useNavigation } from '../hooks/useNavigation';

const WidgetContainer = styled(Box)(({ theme, position }) => ({
  position: 'fixed',
  ...getPositionStyles(position),
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  fontFamily: theme.typography.fontFamily,
}));

const ChatWindow = styled(Box)(({ theme }) => ({
  width: '380px',
  height: '600px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  
  '@media (max-width: 480px)': {
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
}));

const FloatingButton = styled(IconButton)(({ theme }) => ({
  width: '60px',
  height: '60px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
}));

export default function ChatContainer({ apiKey, endpoint, position, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { sendMessage, isConnected } = useWebSocket(endpoint, apiKey);
  const { navigate, suggestions } = useNavigation();
  
  useEffect(() => {
    // Listen for custom events from Web Component
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener('navchat-open', handleOpen);
    window.addEventListener('navchat-close', handleClose);
    
    return () => {
      window.removeEventListener('navchat-open', handleOpen);
      window.removeEventListener('navchat-close', handleClose);
    };
  }, []);
  
  const handleSendMessage = (content: string, type: 'text' | 'voice' = 'text') => {
    const message = {
      id: Date.now().toString(),
      content,
      type,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, message]);
    sendMessage(message);
  };
  
  const handleNavigate = (path: string) => {
    // Dispatch navigation event to parent
    window.dispatchEvent(new CustomEvent('navchat-navigate', {
      detail: { path },
      bubbles: true,
      composed: true // Allows event to cross Shadow DOM boundary
    }));
    navigate(path);
  };
  
  return (
    <WidgetContainer position={position}>
      {!isOpen ? (
        <FloatingButton onClick={() => setIsOpen(true)}>
          <Badge badgeContent={unreadCount} color="error">
            <ChatIcon />
          </Badge>
        </FloatingButton>
      ) : (
        <Fade in={isOpen}>
          <ChatWindow>
            <ChatHeader>
              <Box>
                <Typography variant="h6">Navigation Assistant</Typography>
                <Typography variant="caption">
                  {isConnected ? 'Online' : 'Connecting...'}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setIsOpen(false)}
                sx={{ color: 'inherit' }}
              >
                <CloseIcon />
              </IconButton>
            </ChatHeader>
            
            <MessageList 
              messages={messages}
              suggestions={suggestions}
              onNavigate={handleNavigate}
            />
            
            <InputArea 
              onSendMessage={handleSendMessage}
              disabled={!isConnected}
            />
          </ChatWindow>
        </Fade>
      )}
    </WidgetContainer>
  );
}
```

### 3.4 Theme Configuration for Shadow DOM

```typescript
// styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#8b9dff',
      dark: '#4459b7',
    },
    secondary: {
      main: '#764ba2',
      light: '#a674d3',
      dark: '#4a2473',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    // Override MUI components for Shadow DOM compatibility
    MuiPopover: {
      defaultProps: {
        container: () => document.querySelector('navchat-widget')?.shadowRoot?.getElementById('navchat-root'),
      },
    },
    MuiModal: {
      defaultProps: {
        container: () => document.querySelector('navchat-widget')?.shadowRoot?.getElementById('navchat-root'),
      },
    },
    MuiPopper: {
      defaultProps: {
        container: () => document.querySelector('navchat-widget')?.shadowRoot?.getElementById('navchat-root'),
      },
    },
  },
});
```

---

## 4. Integration Methods

### 4.1 CDN Integration (Vanilla HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@your-org/navchat-widget@1.0.0/dist/navchat-widget.min.js"></script>
</head>
<body>
  <!-- Simple integration -->
  <navchat-widget 
    api-key="your-api-key"
    endpoint="wss://api.example.com/chat"
    theme="light"
    position="bottom-right">
  </navchat-widget>
  
  <script>
    // Listen for navigation events
    window.addEventListener('navchat-navigate', (event) => {
      console.log('Navigate to:', event.detail.path);
      // Handle navigation in your app
    });
    
    // Programmatic control
    const widget = document.querySelector('navchat-widget');
    widget.open();
    widget.sendMessage('Hello');
  </script>
</body>
</html>
```

### 4.2 React Integration

```typescript
// React wrapper component
import React, { useEffect, useRef } from 'react';
import '@your-org/navchat-widget';

interface NavChatWidgetProps {
  apiKey: string;
  endpoint: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
  onNavigate?: (path: string) => void;
}

export const NavChatWidget: React.FC<NavChatWidgetProps> = ({
  apiKey,
  endpoint,
  theme = 'light',
  position = 'bottom-right',
  onNavigate,
}) => {
  const widgetRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      onNavigate?.(event.detail.path);
    };
    
    window.addEventListener('navchat-navigate', handleNavigate);
    
    return () => {
      window.removeEventListener('navchat-navigate', handleNavigate);
    };
  }, [onNavigate]);
  
  return (
    <navchat-widget
      ref={widgetRef}
      api-key={apiKey}
      endpoint={endpoint}
      theme={theme}
      position={position}
    />
  );
};
```

### 4.3 Vue Integration

```vue
<template>
  <navchat-widget
    :api-key="apiKey"
    :endpoint="endpoint"
    :theme="theme"
    :position="position"
    @navchat-navigate="handleNavigate"
  />
</template>

<script>
import '@your-org/navchat-widget';

export default {
  props: ['apiKey', 'endpoint', 'theme', 'position'],
  methods: {
    handleNavigate(event) {
      this.$router.push(event.detail.path);
    }
  },
  mounted() {
    // Access widget API
    this.$el.open();
  }
}
</script>
```

### 4.4 Angular Integration

```typescript
// Angular wrapper component
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import '@your-org/navchat-widget';

@Component({
  selector: 'app-navchat',
  template: `
    <navchat-widget
      #widget
      [attr.api-key]="apiKey"
      [attr.endpoint]="endpoint"
      [attr.theme]="theme"
      [attr.position]="position">
    </navchat-widget>
  `
})
export class NavChatComponent {
  @Input() apiKey!: string;
  @Input() endpoint!: string;
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() position: string = 'bottom-right';
  @Output() navigate = new EventEmitter<string>();
  
  @ViewChild('widget') widget!: ElementRef;
  
  ngAfterViewInit() {
    window.addEventListener('navchat-navigate', (event: any) => {
      this.navigate.emit(event.detail.path);
    });
  }
  
  open() {
    this.widget.nativeElement.open();
  }
}
```

---

## 5. Build Configuration

### 5.1 Webpack Configuration

```javascript
// webpack.config.js
const path = require('path');
const { ModuleFederationPlugin } = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'navchat-widget.js',
    library: 'NavChatWidget',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    // Module Federation for MFE usage
    new ModuleFederationPlugin({
      name: 'navChatWidget',
      filename: 'remoteEntry.js',
      exposes: {
        './Widget': './src/index.ts',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@mui/material': { singleton: true },
        '@emotion/react': { singleton: true },
        '@emotion/styled': { singleton: true },
      },
    }),
  ],
  externals: {
    // Don't bundle these for smaller size
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
};
```

### 5.2 Package.json

```json
{
  "name": "@your-org/navchat-widget",
  "version": "1.0.0",
  "description": "Universal chat widget for conversational navigation",
  "main": "dist/navchat-widget.js",
  "module": "dist/navchat-widget.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "webpack --mode production",
    "build:dev": "webpack --mode development",
    "build:mfe": "webpack --config webpack.mfe.config.js",
    "watch": "webpack --watch --mode development",
    "test": "jest",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@emotion/cache": "^11.11.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/base": "^5.0.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "ts-loader": "^9.5.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

---

## 6. Features Specifications

### 6.1 Core Features

| Feature | Description | Priority |
|---------|------------|----------|
| Shadow DOM Isolation | Complete style/DOM encapsulation | P0 |
| WebSocket Connection | Real-time bi-directional communication with Spring WebFlux | P0 |
| Text Input | Basic text message sending | P0 |
| Navigation Suggestions | Display clickable navigation options | P0 |
| Voice Dictation | Continuous speech recognition with Web Speech API | P0 |
| Audio Streaming | Real-time audio capture and streaming to backend | P0 |
| WebRTC Support | High-quality audio capture for voice | P1 |
| Typing Indicators | Show when assistant is responding | P1 |
| Message History | Persist chat history in localStorage | P1 |
| Theme Customization | Light/dark mode support | P1 |
| Voice Commands | "Navigate to...", "Show me...", "Open..." | P1 |
| Multi-language STT | Support for multiple languages in dictation | P2 |
| Noise Cancellation | Background noise filtering | P2 |

### 6.2 Accessibility Requirements

- **WCAG 2.1 Level AA** compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus management
- ARIA labels and roles
- Reduced motion support

### 6.3 Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14.1+ | Full support |
| Edge | 90+ | Full support |
| Mobile Safari | 14.5+ | Full support |
| Chrome Mobile | 90+ | Full support |

---

## 7. API Specifications

### 7.1 Web Component Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| api-key | string | required | API key for authentication |
| endpoint | string | required | WebSocket endpoint URL |
| theme | 'light' \| 'dark' \| 'auto' | 'light' | Widget theme |
| position | 'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left' | 'bottom-right' | Screen position |
| language | string | 'en' | Interface language |
| auto-open | boolean | false | Auto-open on load |
| z-index | number | 9999 | Z-index for stacking |
| max-width | string | '380px' | Maximum width |
| max-height | string | '600px' | Maximum height |

### 7.2 JavaScript API

```typescript
interface NavChatWidget extends HTMLElement {
  // Methods
  open(): void;
  close(): void;
  toggle(): void;
  sendMessage(message: string): void;
  clearHistory(): void;
  setTheme(theme: 'light' | 'dark'): void;
  setLanguage(lang: string): void;
  
  // Properties
  isOpen: boolean;
  isConnected: boolean;
  messageCount: number;
  
  // Events
  onopen: (event: CustomEvent) => void;
  onclose: (event: CustomEvent) => void;
  onmessage: (event: CustomEvent) => void;
  onnavigate: (event: CustomEvent) => void;
  onconnect: (event: CustomEvent) => void;
  ondisconnect: (event: CustomEvent) => void;
}
```

### 7.3 Custom Events

| Event Name | Detail | Description |
|------------|--------|-------------|
| navchat-open | null | Widget opened |
| navchat-close | null | Widget closed |
| navchat-message | { message: Message } | Message sent/received |
| navchat-navigate | { path: string } | Navigation requested |
| navchat-connect | null | WebSocket connected |
| navchat-disconnect | null | WebSocket disconnected |
| navchat-error | { error: Error } | Error occurred |

---

## 8. Performance Requirements

### 8.1 Bundle Size
- **Minified**: < 150KB
- **Gzipped**: < 50KB
- **First Paint**: < 100ms
- **Interactive**: < 300ms

### 8.2 Runtime Performance
- **Memory Usage**: < 20MB
- **CPU Usage**: < 5% idle
- **WebSocket Reconnect**: < 3 seconds
- **Message Latency**: < 100ms

### 8.3 Optimization Strategies
- Tree shaking for unused MUI components
- Code splitting for voice features
- Lazy loading for emoji picker
- Service Worker for offline support
- WebP images with fallbacks
- Debounced typing indicators

---

## 9. Security Considerations

### 9.1 Content Security Policy
```javascript
// CSP headers for Shadow DOM
const cspMeta = document.createElement('meta');
cspMeta.httpEquiv = 'Content-Security-Policy';
cspMeta.content = "default-src 'self'; connect-src wss://* https://*; media-src 'self' blob:;";
```

### 9.2 Authentication
- JWT token validation
- API key encryption
- Secure WebSocket (WSS)
- CORS configuration

---

## 10. Voice Dictation Implementation

### 10.1 Voice Capture Service

```typescript
// services/VoiceService.ts
import { EventEmitter } from 'events';

export interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  sampleRate: number;
}

export class VoiceService extends EventEmitter {
  private recognition: SpeechRecognition | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private websocket: WebSocket | null = null;
  
  constructor(private config: VoiceConfig) {
    super();
    this.initializeSpeechRecognition();
  }
  
  private initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
    this.recognition.lang = this.config.language;
    
    // Event handlers
    this.recognition.onstart = () => {
      this.emit('recognitionStart');
    };
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript;
        this.emit('finalTranscript', transcript);
      } else {
        const interim = lastResult[0].transcript;
        this.emit('interimTranscript', interim);
      }
    };
    
    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.emit('error', event.error);
      this.handleRecognitionError(event);
    };
    
    this.recognition.onend = () => {
      this.emit('recognitionEnd');
      if (this.isRecording && this.config.continuous) {
        // Restart for continuous dictation
        this.recognition?.start();
      }
    };
  }
  
  async startDictation(): Promise<void> {
    try {
      // Start speech recognition
      this.recognition?.start();
      this.isRecording = true;
      
      // Start audio capture for streaming
      await this.startAudioCapture();
      
    } catch (error) {
      console.error('Failed to start dictation:', error);
      this.emit('error', error);
    }
  }
  
  async startAudioCapture(): Promise<void> {
    try {
      // Get audio stream with high quality settings
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.config.sampleRate,
        }
      });
      
      // Create MediaRecorder for audio chunks
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      };
      
      this.mediaRecorder = new MediaRecorder(this.audioStream, options);
      
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          // Stream audio chunk to backend
          this.streamAudioChunk(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.emit('audioComplete', audioBlob);
        this.audioChunks = [];
      };
      
      // Start recording in chunks for streaming
      this.mediaRecorder.start(100); // 100ms chunks
      
    } catch (error) {
      console.error('Failed to capture audio:', error);
      this.emit('error', error);
    }
  }
  
  private streamAudioChunk(chunk: Blob): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      // Convert to base64 for WebSocket transmission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        this.websocket?.send(JSON.stringify({
          type: 'audio_chunk',
          data: base64Audio.split(',')[1],
          timestamp: Date.now()
        }));
      };
      reader.readAsDataURL(chunk);
    }
  }
  
  stopDictation(): void {
    this.isRecording = false;
    this.recognition?.stop();
    this.mediaRecorder?.stop();
    this.audioStream?.getTracks().forEach(track => track.stop());
  }
  
  private handleRecognitionError(event: SpeechRecognitionErrorEvent): void {
    switch (event.error) {
      case 'no-speech':
        console.log('No speech detected');
        break;
      case 'audio-capture':
        console.error('No microphone found');
        break;
      case 'not-allowed':
        console.error('Microphone permission denied');
        break;
      default:
        console.error('Speech recognition error:', event.error);
    }
  }
  
  setWebSocket(ws: WebSocket): void {
    this.websocket = ws;
  }
  
  // Voice command processing
  processVoiceCommand(transcript: string): void {
    const commands = {
      navigate: /^(navigate to|go to|open|show me|take me to)\s+(.+)/i,
      search: /^(search for|find|look for)\s+(.+)/i,
      help: /^(help|what can you do|commands)/i,
      close: /^(close|exit|quit)/i,
    };
    
    for (const [action, pattern] of Object.entries(commands)) {
      const match = transcript.match(pattern);
      if (match) {
        this.emit('voiceCommand', { action, value: match[2] || null });
        break;
      }
    }
  }
}
```

### 10.2 WebSocket Service for Spring Reactive Backend

```typescript
// services/WebSocketService.ts
import { EventEmitter } from 'events';
import { StompClient } from './StompClient';

export interface WebSocketConfig {
  url: string;
  apiKey: string;
  reconnectDelay: number;
  heartbeatInterval: number;
}

export interface ChatMessage {
  id: string;
  type: 'text' | 'audio' | 'navigation' | 'command';
  content?: string;
  audioData?: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  metadata?: Record<string, any>;
}

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private stomp: StompClient | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: ChatMessage[] = [];
  private isConnected: boolean = false;
  private sessionId: string;
  
  constructor(private config: WebSocketConfig) {
    super();
    this.sessionId = this.generateSessionId();
  }
  
  connect(): void {
    // Connect to Spring WebFlux WebSocket endpoint
    const wsUrl = `${this.config.url}?apiKey=${this.config.apiKey}&sessionId=${this.sessionId}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.emit('connected');
      
      // Initialize STOMP if using Spring WebSocket with STOMP
      if (this.config.url.includes('/stomp')) {
        this.initializeStomp();
      }
      
      // Send queued messages
      this.flushMessageQueue();
      
      // Start heartbeat
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };
    
    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.emit('disconnected');
      
      // Clear heartbeat
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }
      
      // Attempt reconnection
      this.scheduleReconnect();
    };
  }
  
  private initializeStomp(): void {
    // For Spring STOMP endpoints
    this.stomp = new StompClient(this.ws!);
    
    // Subscribe to user-specific queue
    this.stomp.subscribe(`/user/queue/reply`, (message) => {
      this.handleMessage(message);
    });
    
    // Subscribe to navigation updates
    this.stomp.subscribe(`/topic/navigation/${this.sessionId}`, (message) => {
      this.handleNavigationUpdate(message);
    });
  }
  
  sendMessage(message: ChatMessage): void {
    if (!this.isConnected) {
      this.messageQueue.push(message);
      return;
    }
    
    const payload = {
      ...message,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };
    
    if (this.stomp) {
      // Send via STOMP
      this.stomp.send('/app/chat.sendMessage', payload);
    } else {
      // Send via raw WebSocket
      this.ws?.send(JSON.stringify(payload));
    }
  }
  
  sendAudioStream(audioData: string, isFinal: boolean = false): void {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      type: 'audio',
      audioData,
      sender: 'user',
      timestamp: new Date().toISOString(),
      metadata: {
        isFinal,
        format: 'webm',
        sampleRate: 48000,
      }
    };
    
    this.sendMessage(message);
  }
  
  sendDictation(transcript: string, isFinal: boolean = false): void {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      type: 'text',
      content: transcript,
      sender: 'user',
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'dictation',
        isFinal,
      }
    };
    
    this.sendMessage(message);
  }
  
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'navigation':
        this.emit('navigation', message);
        break;
      case 'assistant_message':
        this.emit('assistantMessage', message);
        break;
      case 'suggestion':
        this.emit('suggestion', message);
        break;
      case 'error':
        this.emit('error', message);
        break;
      default:
        this.emit('message', message);
    }
  }
  
  private handleNavigationUpdate(update: any): void {
    this.emit('navigationUpdate', update);
  }
  
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, this.config.reconnectDelay);
  }
  
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
  }
}
```

### 10.3 Voice Input Component with Dictation

```typescript
// components/VoiceInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { IconButton, Box, Typography, LinearProgress, Chip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import StopIcon from '@mui/icons-material/Stop';
import { VoiceService } from '../services/VoiceService';
import { useWebSocket } from '../hooks/useWebSocket';

const VoiceContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const TranscriptDisplay = styled(Box)(({ theme }) => ({
  minHeight: '60px',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
}));

const InterimText = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
}));

const FinalText = styled('span')(({ theme }) => ({
  color: theme.palette.text.primary,
  marginRight: theme.spacing(1),
}));

const VoiceIndicator = styled(Box)(({ theme, isActive }) => ({
  width: '100%',
  height: '4px',
  backgroundColor: isActive ? theme.palette.primary.main : theme.palette.action.disabled,
  borderRadius: '2px',
  transition: 'all 0.3s ease',
  animation: isActive ? 'pulse 1.5s infinite' : 'none',
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 },
  },
}));

const AudioLevelMeter = styled(LinearProgress)(({ theme }) => ({
  height: '2px',
  backgroundColor: theme.palette.action.disabled,
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.success.main,
  },
}));

interface VoiceInputProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  onCommand: (command: any) => void;
  language?: string;
  continuous?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onCommand,
  language = 'en-US',
  continuous = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const voiceService = useRef<VoiceService | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const { ws } = useWebSocket();
  
  useEffect(() => {
    // Initialize voice service
    voiceService.current = new VoiceService({
      language,
      continuous,
      interimResults: true,
      maxAlternatives: 1,
      sampleRate: 48000,
    });
    
    // Set up WebSocket connection
    if (ws) {
      voiceService.current.setWebSocket(ws);
    }
    
    // Event listeners
    voiceService.current.on('finalTranscript', (transcript: string) => {
      setFinalTranscript(prev => prev + ' ' + transcript);
      setInterimTranscript('');
      onTranscript(transcript, true);
      
      // Process voice commands
      voiceService.current?.processVoiceCommand(transcript);
    });
    
    voiceService.current.on('interimTranscript', (transcript: string) => {
      setInterimTranscript(transcript);
      onTranscript(transcript, false);
    });
    
    voiceService.current.on('voiceCommand', (command: any) => {
      onCommand(command);
    });
    
    voiceService.current.on('error', (error: string) => {
      setError(error);
      setIsRecording(false);
      setIsDictating(false);
    });
    
    return () => {
      voiceService.current?.stopDictation();
      voiceService.current?.removeAllListeners();
    };
  }, [language, continuous, ws]);
  
  const startDictation = async () => {
    try {
      setError(null);
      setIsRecording(true);
      setIsDictating(true);
      setFinalTranscript('');
      setInterimTranscript('');
      
      await voiceService.current?.startDictation();
      
      // Set up audio level monitoring
      await setupAudioLevelMonitoring();
      
    } catch (error) {
      console.error('Failed to start dictation:', error);
      setError('Failed to access microphone');
      setIsRecording(false);
      setIsDictating(false);
    }
  };
  
  const stopDictation = () => {
    voiceService.current?.stopDictation();
    setIsRecording(false);
    setIsDictating(false);
    setAudioLevel(0);
    
    // Clean up audio context
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
  };
  
  const setupAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      
      analyser.current.fftSize = 256;
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (!analyser.current || !isRecording) return;
        
        analyser.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel((average / 255) * 100);
        
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
      
    } catch (error) {
      console.error('Failed to setup audio monitoring:', error);
    }
  };
  
  const toggleDictation = () => {
    if (isDictating) {
      stopDictation();
    } else {
      startDictation();
    }
  };
  
  const clearTranscript = () => {
    setFinalTranscript('');
    setInterimTranscript('');
  };
  
  return (
    <VoiceContainer>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            onClick={toggleDictation}
            color={isDictating ? 'primary' : 'default'}
            size="large"
          >
            {isDictating ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
          
          {isDictating && (
            <IconButton onClick={stopDictation} color="error">
              <StopIcon />
            </IconButton>
          )}
          
          <Chip
            label={isDictating ? 'Dictating...' : 'Click to dictate'}
            color={isDictating ? 'primary' : 'default'}
            size="small"
          />
        </Box>
        
        {continuous && (
          <Chip
            label="Continuous"
            color="secondary"
            size="small"
            variant="outlined"
          />
        )}
      </Box>
      
      {isRecording && (
        <AudioLevelMeter variant="determinate" value={audioLevel} />
      )}
      
      <VoiceIndicator isActive={isDictating} />
      
      {(finalTranscript || interimTranscript) && (
        <TranscriptDisplay>
          {finalTranscript && <FinalText>{finalTranscript}</FinalText>}
          {interimTranscript && <InterimText>{interimTranscript}</InterimText>}
          
          {finalTranscript && (
            <IconButton
              size="small"
              onClick={clearTranscript}
              sx={{ position: 'absolute', top: 4, right: 4 }}
            >
              ×
            </IconButton>
          )}
        </TranscriptDisplay>
      )}
      
      {error && (
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      )}
    </VoiceContainer>
  );
};
```

### 10.4 Spring WebFlux Backend Integration

```java
// WebSocketHandler for Spring Reactive
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler implements WebSocketHandler {
    
    private final NavigationService navigationService;
    private final AudioProcessingService audioService;
    private final ObjectMapper objectMapper;
    
    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String sessionId = extractSessionId(session);
        
        Flux<WebSocketMessage> messageFlux = session.receive()
            .map(WebSocketMessage::getPayloadAsText)
            .flatMap(payload -> processMessage(payload, sessionId))
            .map(response -> session.textMessage(response))
            .doOnError(error -> handleError(session, error));
        
        return session.send(messageFlux)
            .doOnSubscribe(sub -> handleConnection(session, sessionId))
            .doFinally(sig -> handleDisconnection(session, sessionId));
    }
    
    private Mono<String> processMessage(String payload, String sessionId) {
        try {
            JsonNode message = objectMapper.readTree(payload);
            String type = message.get("type").asText();
            
            return switch (type) {
                case "text" -> handleTextMessage(message, sessionId);
                case "audio" -> handleAudioMessage(message, sessionId);
                case "audio_chunk" -> handleAudioChunk(message, sessionId);
                case "command" -> handleVoiceCommand(message, sessionId);
                default -> Mono.just(createErrorResponse("Unknown message type"));
            };
            
        } catch (Exception e) {
            return Mono.just(createErrorResponse(e.getMessage()));
        }
    }
    
    private Mono<String> handleAudioChunk(JsonNode message, String sessionId) {
        String audioData = message.get("data").asText();
        boolean isFinal = message.get("metadata").get("isFinal").asBoolean();
        
        return audioService.processAudioChunk(audioData, sessionId, isFinal)
            .flatMap(transcript -> {
                if (transcript != null) {
                    return navigationService.processQuery(transcript, sessionId);
                }
                return Mono.empty();
            })
            .map(this::toJson);
    }
}
```