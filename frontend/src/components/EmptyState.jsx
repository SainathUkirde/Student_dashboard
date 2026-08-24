import React from 'react';
import { PackageOpen } from 'lucide-react';

function EmptyState({ icon: Icon = PackageOpen, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h3 className="empty-state-title">{title || 'No data available'}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
