'use client';

interface StatCardProps {
  label: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  value: string;
  change: string;
  positive: boolean;
}

export function StatCard({ label, icon, iconBg, iconColor, value, change, positive }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div 
          className="stat-icon-badge" 
          style={{ 
            background: iconBg || 'rgba(102, 126, 234, 0.15)',
            color: iconColor || '#667eea'
          }}
        >
          <i className={`fa-solid ${icon}`}></i>
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${positive ? '' : 'negative'}`}>
        {change}
      </div>
    </div>
  );
}
