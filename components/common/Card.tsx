import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  menu?: boolean;
  onMenuClick?: () => void;
}

export function Card({ children, className = '', title, menu, onMenuClick }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {menu && (
            <button className="card-menu" onClick={onMenuClick}>
              <i className="fas fa-ellipsis-v"></i>
            </button>
          )}
        </div>
      )}
      <div className="card-content">{children}</div>

      <style jsx>{`
        .card {
          background: var(--bg-elevated);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          padding: 30px;
          box-shadow: var(--shadow-md);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--border-color);
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .card-menu {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 20px;
          transition: color 0.3s ease;
          padding: 4px 8px;
        }

        .card-menu:hover {
          color: #667eea;
        }

        .card-content {
          /* Container for card children */
        }
      `}</style>
    </div>
  );
}
