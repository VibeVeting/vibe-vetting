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
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 30px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }

        .card-title {
          font-size: 18px;
          font-weight: 800;
          color: #1a202c;
          letter-spacing: -0.3px;
        }

        .card-menu {
          background: none;
          border: none;
          color: #718096;
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
