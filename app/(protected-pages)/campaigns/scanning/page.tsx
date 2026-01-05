"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
          {/* Scan Header */}
          <div className="scan-header">
            <div className="scan-icon-wrapper">
              <i className="fa-solid fa-robot"></i>
            </div>
            <h1>AI Scanning in Progress</h1>
            <p>Finding the best creator matches for your campaign</p>
          </div>

          {/* Progress Card */}
          <div className="progress-card">
            <div className="progress-header">
              <span className="progress-label">Overall Progress</span>
              <span className="progress-percentage">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Scan Steps */}
          <div className="scan-steps">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`scan-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              >
                <div className="step-icon">
                  {index < currentStep ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    <i className={`fa-solid ${step.icon}`}></i>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-text">{step.text}</div>
                  <div className="step-progress">{step.subtext}</div>
                </div>
                <div className="step-status">
                  {index < currentStep ? 'Complete' : index === currentStep ? 'In Progress' : 'Pending'}
                </div>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="info-item">
              <div className="info-icon">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="info-text">
                <div className="info-label">Creators Found</div>
                <div className="info-value">{creatorsFound}</div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <i className="fa-solid fa-bullhorn"></i>
              </div>
              <div className="info-text">
                <div className="info-label">Campaign</div>
                <div className="info-value">Summer Launch</div>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="info-text">
                <div className="info-label">Est. Time</div>
                <div className="info-value">{Math.max(0, Math.ceil((100 - progress) * 0.08))}s</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
