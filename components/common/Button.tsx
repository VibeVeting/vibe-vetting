import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`} {...props}>
      {icon && <i className={`fas ${icon}`}></i>}
      {children}

      <style jsx>{`
        .btn {
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          font-family: 'Poppins', sans-serif;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 11px;
        }

        .btn-md {
          padding: 8px 16px;
          font-size: 13px;
        }

        .btn-lg {
          padding: 10px 20px;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-secondary {
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid #e2e8f0;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        .btn-danger {
          background: rgba(203, 36, 49, 0.15);
          color: #cb2431;
          border: 2px solid rgba(203, 36, 49, 0.2);
        }

        .btn-danger:hover:not(:disabled) {
          background: #cb2431;
          color: white;
          border-color: #cb2431;
        }
      `}</style>
    </button>
  );
}
