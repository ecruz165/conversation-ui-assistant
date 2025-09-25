import React from 'react';
import ChatWidget from './components/ChatWidget';
import NavigationHelper from './components/NavigationHelper';
import ConversationProvider from './providers/ConversationProvider';

/**
 * Development App component for testing the chat widget MFE
 * This is only used in development mode for testing purposes
 */
const App: React.FC = () => {
  return (
    <ConversationProvider
      apiEndpoint="http://localhost:8080"
      websocketUrl="ws://localhost:8080/ws"
    >
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Development Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            Chat Widget MFE - Development
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
            Micro Frontend for Conversational Navigation
          </p>
        </div>

        {/* Development Content */}
        <div style={{
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Widget Demo */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Chat Widget Demo</h2>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                This is how the chat widget appears when embedded in applications.
              </p>
              <div style={{ position: 'relative', height: '400px', border: '1px dashed #ddd', borderRadius: '4px' }}>
                <ChatWidget
                  position="bottom-right"
                  theme="light"
                  showWelcomeMessage={true}
                />
              </div>
            </div>

            {/* Navigation Helper Demo */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Navigation Helper</h2>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Standalone navigation helper component for inline assistance.
              </p>
              <NavigationHelper
                placeholder="Ask me to navigate somewhere..."
                compact={false}
              />
            </div>
          </div>

          {/* Module Federation Info */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Module Federation Exports</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              This MFE exposes the following components for consumption by other applications:
            </p>
            <ul style={{ color: '#666', lineHeight: '1.6' }}>
              <li><code>./ChatWidget</code> - Main chat widget component</li>
              <li><code>./NavigationHelper</code> - Inline navigation helper</li>
              <li><code>./ConversationProvider</code> - Context provider for conversation state</li>
              <li><code>./useConversation</code> - Hook for accessing conversation functionality</li>
            </ul>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              Remote Entry: <strong>http://localhost:3002/remoteEntry.js</strong>
            </div>
          </div>
        </div>
      </div>
    </ConversationProvider>
  );
};

export default App;
