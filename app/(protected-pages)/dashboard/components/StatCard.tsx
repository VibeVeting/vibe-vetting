'use client';

import { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  value: string;
  change: string;
  positive: boolean;
  index?: number;
}

export function StatCard({ label, icon, iconBg, iconColor, value, change, positive, index = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  // Animate number counting
  useEffect(() => {
    if (!isVisible || value === '...') {
      setDisplayValue(value);
      return;
    }

    // Extract numeric value
    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNum = parseFloat(numericMatch[0]);
    const suffix = value.replace(numericMatch[0], '');
    const isDecimal = value.includes('.');
    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const currentValue = targetNum * easeProgress;

      if (isDecimal) {
        setDisplayValue(currentValue.toFixed(1) + suffix);
      } else {
        setDisplayValue(Math.round(currentValue) + suffix);
      }

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible, value]);

  return (
    <div className={`stat-card-enhanced ${isVisible ? 'visible' : ''}`}>
      <div className="stat-card-glow" style={{ background: iconBg || 'rgba(102, 126, 234, 0.15)' }} />
      <div className="stat-card-content">
        <div className="stat-header">
          <span className="stat-label">{label}</span>
          <div
            className="stat-icon-badge"
            style={{
              background: `linear-gradient(135deg, ${iconColor || '#667eea'}22, ${iconColor || '#667eea'}44)`,
              color: iconColor || '#667eea',
            }}
          >
            <i className={`fa-solid ${icon}`}></i>
          </div>
        </div>
        <div className="stat-value-wrapper">
          <div className="stat-value">{displayValue}</div>
          <div className="stat-sparkline">
            <svg viewBox="0 0 80 24" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={iconColor || '#667eea'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={iconColor || '#667eea'} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,20 Q10,15 20,18 T40,12 T60,16 T80,8"
                fill="none"
                stroke={iconColor || '#667eea'}
                strokeWidth="2"
                className="sparkline-path"
              />
              <path
                d="M0,20 Q10,15 20,18 T40,12 T60,16 T80,8 L80,24 L0,24 Z"
                fill={`url(#gradient-${index})`}
              />
            </svg>
          </div>
        </div>
        <div className={`stat-change ${positive ? 'positive' : 'negative'}`}>
          <span className="stat-change-icon">
            <i className={`fa-solid ${positive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
          </span>
          {change}
        </div>
      </div>

      <style jsx>{`
        .stat-card-enhanced {
          position: relative;
          background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(226, 232, 240, 0.7);
          overflow: hidden;
          opacity: 0;
          transform: translateY(15px) perspective(1000px) rotateX(1deg);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.03),
            0 1px 2px rgba(0, 0, 0, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .stat-card-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, #a855f7 50%, #ec4899 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .stat-card-enhanced::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(135deg, transparent 40%, rgba(102, 126, 234, 0.2) 50%, transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .stat-card-enhanced.visible {
          opacity: 1;
          transform: translateY(0) perspective(1000px) rotateX(0deg);
        }

        .stat-card-enhanced:hover {
          transform: translateY(-5px) perspective(1000px) rotateX(-1deg) scale(1.01);
          box-shadow: 
            0 18px 40px rgba(102, 126, 234, 0.12),
            0 8px 20px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .stat-card-enhanced:hover::before {
          opacity: 1;
        }

        .stat-card-enhanced:hover::after {
          opacity: 1;
        }

        .stat-card-enhanced:nth-child(1)::before { background: linear-gradient(90deg, #667eea, #818cf8); }
        .stat-card-enhanced:nth-child(2)::before { background: linear-gradient(90deg, #22c55e, #4ade80); }
        .stat-card-enhanced:nth-child(3)::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .stat-card-enhanced:nth-child(4)::before { background: linear-gradient(90deg, #ec4899, #f472b6); }

        .stat-card-glow {
          position: absolute;
          top: -50%;
          right: -20%;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.3;
          transition: all 0.35s ease;
        }

        .stat-card-enhanced:hover .stat-card-glow {
          opacity: 0.6;
          transform: scale(1.3);
        }

        .stat-card-content {
          position: relative;
          z-index: 1;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.1),
            inset 0 2px 3px rgba(255, 255, 255, 0.35),
            inset 0 -1px 3px rgba(0, 0, 0, 0.04);
          transform: perspective(100px) rotateX(3deg);
        }

        .stat-card-enhanced:hover .stat-icon-badge {
          transform: perspective(100px) rotateX(0deg) scale(1.1) rotate(5deg);
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.14),
            inset 0 2px 3px rgba(255, 255, 255, 0.45);
        }

        .stat-value-wrapper {
          position: relative;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #1a202c;
          line-height: 1.1;
          margin-bottom: 6px;
          font-variant-numeric: tabular-nums;
          background: linear-gradient(135deg, #1a202c 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-sparkline {
          position: absolute;
          bottom: 4px;
          right: 0;
          width: 70px;
          height: 22px;
          opacity: 0.6;
        }

        .stat-sparkline svg {
          width: 100%;
          height: 100%;
        }

        .sparkline-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 1.2s ease-out forwards;
          animation-delay: 0.4s;
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        .stat-change {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          padding: 4px 10px;
          border-radius: 16px;
          background: rgba(226, 232, 240, 0.4);
        }

        .stat-change.positive {
          color: #059669;
          background: rgba(34, 197, 94, 0.12);
        }

        .stat-change.negative {
          color: #dc2626;
          background: rgba(239, 68, 68, 0.12);
        }

        .stat-change-icon {
          display: flex;
          align-items: center;
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
