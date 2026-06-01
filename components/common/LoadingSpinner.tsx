'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className={`loading-spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className={`spinner ${sizeClasses[size]}`}>
        <div className="spinner-ring" />
        <div className="spinner-center">
          <i className="fa-solid fa-bolt" />
        </div>
      </div>
      {text && <p className="loading-text">{text}</p>}

      <style jsx>{`
        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .loading-spinner-container.fullscreen {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        }

        .spinner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner.w-6 { width: 24px; height: 24px; }
        .spinner.w-10 { width: 40px; height: 40px; }
        .spinner.w-16 { width: 64px; height: 64px; }

        .spinner-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(0, 245, 255, 0.2);
          border-top-color: #00f5ff;
          animation: spin 1s linear infinite;
        }

        .spinner.w-6 .spinner-ring { border-width: 2px; }
        .spinner.w-10 .spinner-ring { border-width: 3px; }
        .spinner.w-16 .spinner-ring { border-width: 4px; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner-center {
          font-size: 12px;
          color: #667eea;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .spinner.w-6 .spinner-center { font-size: 8px; }
        .spinner.w-10 .spinner-center { font-size: 12px; }
        .spinner.w-16 .spinner-center { font-size: 20px; }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }

        .loading-text {
          font-size: 14px;
          font-weight: 600;
          color: ${fullScreen ? '#ffffff' : '#718096'};
          animation: fadeInOut 2s ease-in-out infinite;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );

  return spinner;
}

export function LoadingCard() {
  return (
    <div className="loading-card">
      <div className="skeleton skeleton-header" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton-row">
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-badge" />
      </div>

      <style jsx>{`
        .loading-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        .skeleton-header {
          width: 60%;
          height: 24px;
          margin-bottom: 16px;
        }

        .skeleton-line {
          width: 100%;
          height: 14px;
          margin-bottom: 10px;
        }

        .skeleton-line.short {
          width: 80%;
        }

        .skeleton-row {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .skeleton-badge {
          width: 80px;
          height: 28px;
          border-radius: 14px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="loading-grid">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}

      <style jsx>{`
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .loading-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .loading-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="loading-page">
      <LoadingSpinner size="lg" text="Loading..." fullScreen />
    </div>
  );
}

export default LoadingSpinner;
