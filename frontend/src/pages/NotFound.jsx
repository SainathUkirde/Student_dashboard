import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24, textAlign: 'center',
      background: 'var(--bg-primary)'
    }}>
      <div style={{
        fontSize: 80, fontWeight: 900, color: 'var(--accent-primary)',
        opacity: 0.1, lineHeight: 1, userSelect: 'none', marginBottom: 8
      }}>404</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 340, marginBottom: 28 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          <ArrowLeft size={14} /> Go Back
        </button>
        <Link to="/dashboard" className="btn btn-primary">
          <Home size={14} /> Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
