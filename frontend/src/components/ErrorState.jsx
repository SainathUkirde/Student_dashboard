import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

function ErrorState({ message, onRetry }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger-color)' }}>
        <AlertCircle size={28} />
      </div>
      <h3 className="empty-state-title" style={{ color: 'var(--danger-color)' }}>
        Unable to load data
      </h3>
      <p className="empty-state-desc">{message || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={onRetry}>
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
