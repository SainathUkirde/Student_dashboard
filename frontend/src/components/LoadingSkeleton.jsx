import React from 'react';

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card" style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton skeleton-title" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: i === lines - 1 ? '70%' : '100%' }} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 26, width: '60%', marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      {[100, 80, 60, 60, 70].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonGrid({ count = 4, card = <SkeletonCard /> }) {
  return (
    <div className="grid-auto">
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{card}</React.Fragment>
      ))}
    </div>
  );
}

export default SkeletonCard;
