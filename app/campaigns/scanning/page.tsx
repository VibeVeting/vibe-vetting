"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ScanningPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Gathering creator data',
    'Analyzing content history',
    'Evaluating brand alignment',
    'Assessing audience quality',
    'Calculating risk scores',
  ];

  useEffect(() => {
    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to matches after completion
          setTimeout(() => router.push('/campaigns/matches'), 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    setCurrentStep(Math.floor((progress / 100) * steps.length));
  }, [progress]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="AI Scanning in Progress"
            subtitle="Finding the best creator matches for your campaign"
          />

          <div className="scanning-container">
            <div className="scanning-card">
              <div className="scanning-icon">
                <i className="fas fa-robot fa-3x"></i>
              </div>

              <h2>Analyzing Creators...</h2>

              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{progress}%</span>
              </div>

              <div className="scanning-steps">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`step-item ${index <= currentStep ? 'active' : ''}`}
                  >
                    <div className="step-icon">
                      {index < currentStep ? (
                        <i className="fas fa-check"></i>
                      ) : index === currentStep ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-circle"></i>
                      )}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <p className="scanning-note">
                This usually takes 2-3 minutes. You can close this page and we'll notify you when it's done.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
