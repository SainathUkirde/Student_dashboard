import React from 'react';

/**
 * Animated progress bar
 * status: 'good' | 'warning' | 'critical'
 */
function ProgressBar({ value, max = 100, status, showLabel = false, height = 8 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const s = status || (pct >= 75 ? 'good' : pct >= 65 ? 'warning' : 'critical');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="progress-bar-wrapper" style={{ flex: 1, height }}>
        <div
          className={`progress-bar-fill ${s}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 36, textAlign: 'right' }}>
          {pct.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

export default ProgressBar;
