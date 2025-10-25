/**
 * DevX Control Panel
 *
 * Runtime UI component for monitoring and controlling DevX features.
 * Shows current configuration status with visual indicators.
 *
 * Features:
 * - Keyboard shortcut toggle (Ctrl+Shift+X)
 * - Real-time configuration display
 * - Tool status indicators
 * - Zero external dependencies (inline CSS)
 * - Production-safe (auto-disabled)
 */

import { useState, useEffect } from 'react';
import { devxConfig, isDevXEnabled } from '../config/devx.config';

export function DevXControlPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Keyboard shortcut: Ctrl+Shift+X
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  // Don't render in production
  if (import.meta.env.PROD) {
    return null;
  }

  // Don't render if DevX is disabled
  if (!devxConfig.enabled) {
    return null;
  }

  // Minimized button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#0cce6b',
          border: '1px solid rgba(12, 206, 107, 0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          fontFamily: 'monospace',
          fontWeight: 600,
          cursor: 'pointer',
          zIndex: 999999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(12, 206, 107, 0.1)';
          e.currentTarget.style.borderColor = '#0cce6b';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)';
          e.currentTarget.style.borderColor = 'rgba(12, 206, 107, 0.3)';
        }}
        title="DevX Control Panel (Ctrl+Shift+X)"
      >
        ⚙️ DevX
      </button>
    );
  }

  // Tool status configuration
  const tools = [
    { key: 'webVitals', label: 'Web Vitals', icon: '📊' },
    { key: 'reactScan', label: 'React Scan', icon: '🔍' },
    { key: 'wdyr', label: 'WDYR', icon: '🔄' },
    { key: 'perfObserver', label: 'Perf Observer', icon: '⚡' },
    { key: 'memoryMonitor', label: 'Memory Monitor', icon: '💾' },
    { key: 'networkLogger', label: 'Network Logger', icon: '🌐' },
    { key: 'dashboard', label: 'Dashboard', icon: '📈' },
    { key: 'msw', label: 'MSW', icon: '🎭' },
    { key: 'million', label: 'Million.js', icon: '⚡' },
    { key: 'bundleVisualizer', label: 'Bundle Viz', icon: '📦' },
    { key: 'inspect', label: 'Vite Inspect', icon: '🔬' },
  ] as const;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        background: 'rgba(0, 0, 0, 0.95)',
        color: '#fff',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 999999,
        minWidth: '320px',
        maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚙️</span>
          <strong style={{ fontSize: '14px', color: '#0cce6b' }}>DevX Control Panel</strong>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0',
            lineHeight: 1,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          title="Close (Ctrl+Shift+X)"
        >
          ×
        </button>
      </div>

      {/* Environment notice */}
      <div
        style={{
          fontSize: '10px',
          color: '#888',
          marginBottom: '12px',
          padding: '8px',
          background: 'rgba(255, 193, 7, 0.1)',
          borderRadius: '4px',
          border: '1px solid rgba(255, 193, 7, 0.2)',
        }}
      >
        ℹ️ Configuration is read from environment variables. Changes require dev server restart.
      </div>

      {/* Mode & Log Level */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>Mode</div>
          <div style={{ color: '#0cce6b', fontWeight: 600 }}>
            {import.meta.env.DEV ? 'Development' : 'Production'}
          </div>
        </div>
        <div
          style={{
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>Log Level</div>
          <div style={{ color: '#0cce6b', fontWeight: 600 }}>
            {devxConfig.logLevel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Tool Status Grid */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            fontSize: '11px',
            color: '#888',
            marginBottom: '8px',
            fontWeight: 600,
          }}
        >
          TOOL STATUS
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {tools.map(({ key, label, icon }) => {
            const enabled = isDevXEnabled(key as keyof typeof devxConfig);
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: enabled
                    ? 'rgba(12, 206, 107, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  border: `1px solid ${
                    enabled ? 'rgba(12, 206, 107, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                  }`,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{icon}</span>
                  <span style={{ fontSize: '11px' }}>{label}</span>
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: enabled ? '#0cce6b' : '#888',
                  }}
                >
                  {enabled ? '✓ ON' : '✗ OFF'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div
        style={{
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: '#888',
            marginBottom: '8px',
            fontWeight: 600,
          }}
        >
          KEYBOARD SHORTCUTS
        </div>
        <div style={{ fontSize: '10px', color: '#888', lineHeight: 1.6 }}>
          <div>• Ctrl+Shift+X - Toggle this panel</div>
          <div>• Ctrl+Shift+L - Log DevX status</div>
          <div>• Ctrl+Shift+M - Log memory report</div>
          <div>• Ctrl+Shift+N - Log network stats</div>
        </div>
      </div>

      {/* Debug Access */}
      <div
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '10px',
          color: '#666',
          lineHeight: 1.5,
        }}
      >
        💡 Access monitors via console:
        <div style={{ marginTop: '4px', fontFamily: 'monospace', color: '#888' }}>
          window.__devxConfig
          <br />
          window.__webVitals
          <br />
          window.__perfMonitor
          <br />
          window.__memoryMonitor
          <br />
          window.__networkLogger
          <br />
          window.__msw
        </div>
      </div>
    </div>
  );
}
