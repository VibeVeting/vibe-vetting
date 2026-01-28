"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Three.js component to avoid SSR issues
const ThreeScene = dynamic(() => import('./ThreeScene').then(mod => ({ default: mod.ThreeScene })), {
  ssr: false,
  loading: () => <div className="three-loading">Loading 3D...</div>
});

export default function ScanningPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [creatorsFound, setCreatorsFound] = useState(0);

  const steps = [
    { icon: 'fa-database', text: 'Gathering creator data', subtext: 'Scanning social platforms...' },
    { icon: 'fa-magnifying-glass-chart', text: 'Analyzing content history', subtext: 'Reviewing past posts...' },
    { icon: 'fa-bullseye', text: 'Evaluating brand alignment', subtext: 'Matching values...' },
    { icon: 'fa-users', text: 'Assessing audience quality', subtext: 'Analyzing followers...' },
    { icon: 'fa-shield-halved', text: 'Calculating risk scores', subtext: 'Finalizing results...' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push('/campaigns/matches'), 1500);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    setCurrentStep(Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1));
    setCreatorsFound(Math.floor((progress / 100) * 127));
  }, [progress, steps.length]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="AI Scanning"
            subtitle="Finding the best creator matches for your campaign"
            showSearch={false}
          />

          {/* 3D Scanning Hero Section */}
          <div className="scanning-hero-3d">
            {/* Three.js 3D Scene */}
            <ThreeScene progress={progress} />
            
            {/* Glass Overlay with Progress */}
            <div className="scanning-overlay">
              <div className="scanning-glass-card">
                <div className="hologram-effect"></div>
                <div className="progress-ring-3d">
                  <svg viewBox="0 0 120 120">
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="50%" stopColor="#764ba2" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <circle className="progress-track-3d" cx="60" cy="60" r="54" />
                    <circle 
                      className="progress-fill-3d" 
                      cx="60" cy="60" r="54"
                      strokeDasharray="339.3"
                      strokeDashoffset={339.3 - (339.3 * progress) / 100}
                      filter="url(#glow)"
                    />
                  </svg>
                  <div className="progress-content-3d">
                    <span className="progress-value-3d">{progress}</span>
                    <span className="progress-symbol">%</span>
                  </div>
                </div>
                <h2 className="scanning-status">
                  {progress < 100 ? 'AI Analysis Active' : '✓ Analysis Complete'}
                </h2>
                <p className="scanning-step-text">{steps[currentStep]?.text}</p>
                <div className="scanning-indicators">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`indicator ${i < currentStep ? 'complete' : ''} ${i === currentStep ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="floating-stats-3d">
              <div className="float-stat stat-left">
                <div className="float-stat-icon">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="float-stat-content">
                  <span className="float-stat-value">{creatorsFound}</span>
                  <span className="float-stat-label">Creators</span>
                </div>
              </div>
              <div className="float-stat stat-right">
                <div className="float-stat-icon green">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div className="float-stat-content">
                  <span className="float-stat-value">{Math.max(0, Math.ceil((100 - progress) * 0.08))}s</span>
                  <span className="float-stat-label">Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Timeline */}
          <div className="timeline-horizontal">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`h-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              >
                <div className="h-step-connector">
                  <div className="h-connector-line"></div>
                </div>
                <div className="h-step-node">
                  {index < currentStep ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    <i className={`fa-solid ${step.icon}`}></i>
                  )}
                </div>
                <div className="h-step-label">{step.text.split(' ').slice(0, 2).join(' ')}</div>
              </div>
            ))}
          </div>

          {/* Info Cards Row */}
          <div className="scanning-info-row">
            <div className="info-card-3d purple">
              <div className="card-glow"></div>
              <div className="info-card-icon">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div className="info-card-data">
                <span className="info-card-value">AI</span>
                  <span className="info-card-label">AI Engine</span>
              </div>
              <div className="info-card-status active">
                <span className="pulse-dot"></span>
                Active
              </div>
            </div>
            <div className="info-card-3d amber">
              <div className="card-glow"></div>
              <div className="info-card-icon">
                <i className="fa-solid fa-database"></i>
              </div>
              <div className="info-card-data">
                <span className="info-card-value">2.4M</span>
                <span className="info-card-label">Profiles Indexed</span>
              </div>
              <div className="info-card-badge">LIVE</div>
            </div>
            <div className="info-card-3d green">
              <div className="card-glow"></div>
              <div className="info-card-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="info-card-data">
                <span className="info-card-value">99.9%</span>
                <span className="info-card-label">Accuracy Rate</span>
              </div>
              <div className="info-card-check">
                <i className="fa-solid fa-check"></i>
              </div>
            </div>
            <div className="info-card-3d cyan">
              <div className="card-glow"></div>
              <div className="info-card-icon">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <div className="info-card-data">
                <span className="info-card-value">0.3s</span>
                <span className="info-card-label">Avg Response</span>
              </div>
              <div className="info-card-spark">⚡</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
