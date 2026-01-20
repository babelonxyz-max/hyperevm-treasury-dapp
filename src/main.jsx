import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WagmiProvider } from './providers/WagmiProvider.jsx'

function renderFatal(message, extra) {
  try {
    const details = extra ? `<pre style="text-align:left; max-width: 900px; margin: 12px auto; overflow:auto; background:#111; color:#eee; padding:12px; border-radius:8px;">${String(extra)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')}</pre>` : '';
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: ui-sans-serif, system-ui, -apple-system;">
        <h1 style="margin:0 0 8px;">App crashed</h1>
        <p style="margin:0 0 12px;">${String(message).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</p>
        ${details}
        <button onclick="window.location.reload()" style="padding:10px 14px;">Reload</button>
      </div>
    `;
  } catch (_) {
    // ignore
  }
}

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize app
try {
  // Surface hard crashes that happen outside React (e.g. during async effects / library init)
  window.addEventListener('error', (event) => {
    // Some extensions spam window.ethereum errors; still show them so we can diagnose white screens
    const msg = event?.message || 'Unhandled error';
    // Common injected-wallet extension issue (doesn't necessarily mean our app is broken)
    if (String(msg).includes('Cannot redefine property: ethereum')) return;
    // Ignore errors originating from extensions (e.g. injected scripts)
    if (String(event?.filename || '').startsWith('chrome-extension://')) return;
    if (String(event?.error?.stack || '').includes('chrome-extension://')) return;
    renderFatal(msg, event?.error?.stack || event?.error || '');
  });
  window.addEventListener('unhandledrejection', (event) => {
    renderFatal('Unhandled promise rejection', event?.reason?.stack || event?.reason || '');
  });

  let rootElement = document.getElementById('root');
  if (!rootElement) {
    // If something modified the DOM before React mounted, recreate the root container
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  }

  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <React.Suspense fallback={<div style={{padding: '20px', textAlign: 'center'}}>Loading...</div>}>
          <WagmiProvider>
            <App />
          </WagmiProvider>
        </React.Suspense>
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('❌ Failed to initialize app:', error);
  renderFatal('Failed to load application', error?.stack || error?.message || error);
}
