import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const colors = { success: '#22c55e', error: '#f87171', warning: '#f59e0b', info: '#60a5fa' };

export function Toast({ id, message, type, onClose }) {
  const Icon = icons[type] || Info;
  return (
    <div className={`toast ${type}`} role="alert">
      <Icon size={16} color={colors[type]} />
      <span style={{ flex: 1, fontSize: '13.5px', color: 'var(--text-primary)' }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}

export default ToastContainer;
