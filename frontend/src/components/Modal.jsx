import React from 'react';
import { X } from 'lucide-react';

function Modal({ title, onClose, children, footer, size = '' }) {
  // Close on overlay click
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlay} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal ${size ? 'modal-' + size : ''}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">{footer}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;
