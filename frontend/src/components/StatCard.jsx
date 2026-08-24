import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ICON_COLORS = {
  indigo: { bg: '#eef2ff', color: '#4f46e5' },
  purple: { bg: '#f5f3ff', color: '#7c3aed' },
  emerald: { bg: '#f0fdf4', color: '#16a34a' },
  amber:  { bg: '#fffbeb', color: '#d97706' },
  rose:   { bg: '#fff1f2', color: '#e11d48' },
  cyan:   { bg: '#ecfeff', color: '#0891b2' },
  blue:   { bg: '#eff6ff', color: '#2563eb' },
  slate:  { bg: '#f8fafc', color: '#475569' },
};

function StatCard({ icon: Icon, value, label, color = 'indigo', trend, trendLabel, subtitle }) {
  const { bg, color: iconColor } = ICON_COLORS[color] || ICON_COLORS.indigo;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--success-color)' : trend === 'down' ? 'var(--danger-color)' : 'var(--text-muted)';

  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-card-icon" style={{ background: bg }}>
          <Icon size={20} color={iconColor} />
        </div>
      )}
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      {trend && trendLabel && (
        <div className="stat-card-trend" style={{ color: trendColor }}>
          <TrendIcon size={12} />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
