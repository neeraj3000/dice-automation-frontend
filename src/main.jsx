import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './app/store';
import App from './App';
import './index.css';

class ErrorBoundary extends Component {
  state = { failed: false, error: null };
  static getDerivedStateFromError(error) { return { failed: true, error }; }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="max-w-xl">
          <h1 className="font-serif text-2xl">Something broke on our side</h1>
          <p className="mt-2 text-ink-soft">Reload the page to continue. Your data is safe.</p>
          {this.state.error && (
            <pre className="mt-4 max-h-60 overflow-auto rounded border border-rust/30 bg-rust-soft/50 p-3 text-left font-mono text-xs text-rust">
              {this.state.error.toString()}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
          <button onClick={() => window.location.reload()} className="mt-5 rounded-control bg-signal px-4 py-2 text-sm font-medium text-white">Reload</button>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
