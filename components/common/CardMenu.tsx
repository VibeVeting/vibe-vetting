'use client';

import { useState, useRef, useEffect } from 'react';

export interface MenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface CardMenuProps {
  items: MenuItem[];
}

export function CardMenu({ items }: CardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="card-menu-wrapper" ref={menuRef}>
      <button 
        className="card-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <i className="fa-solid fa-ellipsis-vertical"></i>
      </button>
      
      {isOpen && (
        <div className="card-menu-dropdown">
          {items.map((item, index) => (
            <button
              key={index}
              className={`menu-item ${item.danger ? 'danger' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (item.disabled) return;
                item.onClick();
                setIsOpen(false);
              }}
              disabled={item.disabled}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .card-menu-wrapper {
          position: relative;
        }

        .card-menu-btn {
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
          font-size: 18px;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-menu-btn:hover {
          background: #f1f5f9;
          color: #667eea;
        }

        .card-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          z-index: 9999;
          overflow: visible;
          animation: slideDown 0.15s ease;
          padding: 6px 0;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #4a5568;
          text-align: left;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .menu-item:hover {
          background: #f7fafc;
          color: #667eea;
        }

        .menu-item.danger {
          color: #e53e3e;
        }

        .menu-item.danger:hover {
          background: #fff5f5;
          color: #c53030;
        }

        .menu-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .menu-item.disabled:hover {
          background: none;
          color: inherit;
        }

        .menu-item i {
          width: 16px;
          text-align: center;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
