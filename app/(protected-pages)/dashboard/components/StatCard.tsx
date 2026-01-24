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
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-bottom: 4px solid rgba(226, 232, 240, 0.9);
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) perspective(1000px) rotateX(2deg);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.04),
            0 1px 3px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .stat-card-enhanced.visible {
          opacity: 1;
          transform: translateY(0) perspective(1000px) rotateX(0deg);
        }

        .stat-card-enhanced:hover {
          transform: translateY(-6px) perspective(1000px) rotateX(-2deg) scale(1.02);
          box-shadow: 
            0 25px 50px rgba(102, 126, 234, 0.15),
            0 10px 20px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          border-bottom-color: rgba(102, 126, 234, 0.5);
        }

        .stat-card-glow {
          position: absolute;
          top: -50%;
          right: -20%;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .stat-card-enhanced:hover .stat-card-glow {
          opacity: 0.9;
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
          margin-bottom: 16px;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.1),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.05);
          transform: perspective(100px) rotateX(5deg);
        }

        .stat-card-enhanced:hover .stat-icon-badge {
          transform: perspective(100px) rotateX(0deg) scale(1.15) rotate(5deg);
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.4);
        }

        .stat-value-wrapper {
          position: relative;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 800;
          color: #1a202c;
          line-height: 1.1;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
        }

        .stat-sparkline {
          position: absolute;
          bottom: 8px;
          right: 0;
          width: 80px;
          height: 24px;
          opacity: 0.6;
        }

        .stat-sparkline svg {
          width: 100%;
          height: 100%;
        }

        .sparkline-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 1.5s ease-out forwards;
          animation-delay: 0.5s;
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #718096;
        }

        .stat-change.positive {
          color: #22c55e;
        }

        .stat-change.negative {
          color: #ef4444;
        }

        .stat-change-icon {
          display: flex;
          align-items: center;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
