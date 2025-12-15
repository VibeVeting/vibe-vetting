interface BadgeProps {
  type?: 'verified' | 'pending' | 'risk' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ type = 'info', children, className = '' }: BadgeProps) {
  const typeClass = `badge-${type}`;

  return (
    <span className={`badge ${typeClass} ${className}`}>
      {children}

      <style jsx>{`
        .badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          display: inline-block;
        }

        .badge-verified {
          background: rgba(72, 187, 120, 0.15);
          color: #22863a;
        }

        .badge-pending {
          background: rgba(237, 137, 54, 0.15);
          color: #7c2d12;
        }

        .badge-risk {
          background: rgba(245, 101, 101, 0.15);
          color: #742a2a;
        }

        .badge-info {
          background: rgba(102, 126, 234, 0.15);
          color: #667eea;
        }
      `}</style>
    </span>
  );
}
