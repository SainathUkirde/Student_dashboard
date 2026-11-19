import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: '40px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, fontSize: 28,
          }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#718096', marginBottom: 24, maxWidth: 400, fontSize: 14 }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/dashboard'; }}
            style={{
              padding: '10px 20px', background: '#4f46e5', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
            }}
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
