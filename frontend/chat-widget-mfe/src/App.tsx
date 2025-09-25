import React from 'react';
import ChatWidget from './components/ChatWidget';

/**
 * Development App component for testing the chat widget MFE
 * This is only used in development mode for testing purposes
 */
const App: React.FC = () => {
  const handleNavigationAction = (action: any) => {
    console.log('Navigation action:', action);
  };

  const handleMessageSent = (message: string) => {
    console.log('Message sent:', message);
  };

  const handleMessageReceived = (message: any) => {
    console.log('Message received:', message);
  };

  const handleError = (error: string) => {
    console.error('Chat widget error:', error);
  };

  return (
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
        {/* Widget Demo */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>Chat Widget Demo</h2>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            This is how the chat widget appears when embedded in applications.
            The widget connects to the reactive navigation service with Netty WebSocket.
          </p>
          <div style={{
            position: 'relative',
            height: '400px',
            border: '1px dashed #ddd',
            borderRadius: '4px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#999'
            }}>
              <p>Chat widget will appear in the bottom-right corner</p>
              <p style={{ fontSize: '0.9rem' }}>Click the chat button to start a conversation</p>
            </div>
          </div>
        </div>

        {/* Module Federation Info */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>WebSocket Connection</h2>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            The chat widget connects to the navigation service via WebSocket:
          </p>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            <strong>WebSocket URL:</strong> ws://localhost:8081/ws/chat<br/>
            <strong>Service:</strong> Navigation Service (Reactive with Netty)<br/>
            <strong>Features:</strong> Message counting, session management, real-time chat
          </div>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Make sure the navigation service is running with <code>make ide</code> in the backend/navigation-service directory.
          </p>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget
        position="bottom-right"
        theme="light"
        showWelcomeMessage={true}
        welcomeMessage="Hi! I'm your navigation assistant. I can help you find what you're looking for!"
        onNavigationAction={handleNavigationAction}
        onMessageSent={handleMessageSent}
        onMessageReceived={handleMessageReceived}
        onError={handleError}
      />
    </div>
  );
};

export default App;
