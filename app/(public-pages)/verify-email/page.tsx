"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [userType, setUserType] = useState<string>('brand');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const type = searchParams.get('type');
    const pendingEmail = searchParams.get('email');

    if (type) {
      setUserType(type);
    }

    if (pendingEmail) {
      setEmail(pendingEmail);
      setStatus('pending');
      return;
    }

    if (success === 'true') {
      setStatus('success');
    } else if (error) {
      setStatus('error');
      switch (error) {
        case 'missing_token':
          setErrorMessage('Verification token is missing. Please use the link from your email.');
          break;
        case 'expired':
          setErrorMessage('Your verification link has expired. Please request a new one.');
          break;
        case 'invalid':
          setErrorMessage('Invalid verification link. Please check your email for the correct link.');
          break;
        case 'failed':
          setErrorMessage('Failed to verify email. Please try again.');
          break;
        case 'server_error':
          setErrorMessage('Server error occurred. Please try again later.');
          break;
        default:
          setErrorMessage('An error occurred during verification.');
      }
    } else {
      setStatus('pending');
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
      } else {
        setErrorMessage(data.error || 'Failed to resend email');
      }
    } catch (error) {
      setErrorMessage('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const getLoginLink = () => {
    switch (userType) {
      case 'barter_creator':
        return '/login-barter';
      case 'barter_company':
        return '/login-barter-company';
      default:
        return '/login';
    }
  };

  const getDashboardLink = () => {
    switch (userType) {
      case 'barter_creator':
        return '/creator-dashboard';
      case 'barter_company':
        return '/barter-company-dashboard';
      default:
        return '/dashboard';
    }
  };

  const getBrandColor = () => {
    switch (userType) {
      case 'barter_creator':
        return '#ec4899';
      case 'barter_company':
        return '#8b5cf6';
      default:
        return '#6366f1';
    }
  };

  return (
    <div className="verify-email-wrapper">
      <style jsx>{`
        .verify-email-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .verify-email-wrapper::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 20%, ${getBrandColor()}15 0%, transparent 40%),
                      radial-gradient(circle at 70% 80%, ${getBrandColor()}10 0%, transparent 35%);
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 20px) rotate(5deg); }
        }

        .verify-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 28px;
          padding: 52px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 1;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .verify-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .icon-circle {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          font-size: 52px;
          position: relative;
        }

        .icon-circle::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: inherit;
          opacity: 0.3;
          filter: blur(12px);
        }

        .icon-circle.success {
          background: linear-gradient(135deg, #22c55e44, #10b98144);
          border: 2px solid #22c55e66;
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
        }

        .icon-circle.error {
          background: linear-gradient(135deg, #ef444444, #dc262644);
          border: 2px solid #ef444466;
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
        }

        .icon-circle.pending {
          background: linear-gradient(135deg, ${getBrandColor()}44, ${getBrandColor()}33);
          border: 2px solid ${getBrandColor()}66;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 30px ${getBrandColor()}50;
        }

        .icon-circle.loading {
          background: linear-gradient(135deg, #3b82f644, #6366f144);
          border: 2px solid #3b82f666;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        .verify-title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 16px;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          letter-spacing: -0.5px;
        }

        .verify-message {
          color: #e2e8f0;
          font-size: 17px;
          line-height: 1.7;
          margin-bottom: 32px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .email-highlight {
          color: ${getBrandColor()};
          font-weight: 700;
          text-shadow: 0 0 15px ${getBrandColor()}80;
          background: linear-gradient(135deg, ${getBrandColor()}20, transparent);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid ${getBrandColor()}40;
          display: inline-block;
          margin: 4px 0;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, ${getBrandColor()}, ${getBrandColor()}dd);
          color: white;
          box-shadow: 0 8px 24px ${getBrandColor()}40;
        }

        .action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px ${getBrandColor()}50;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-color: ${getBrandColor()}60;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .success-animation {
          animation: bounceIn 0.6s ease-out;
        }

        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .resend-success {
          background: linear-gradient(135deg, #22c55e25, #10b98125);
          border: 1px solid #22c55e55;
          color: #4ade80;
          padding: 18px;
          border-radius: 14px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.2);
        }

        .tips-box {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 24px;
          margin-top: 28px;
          text-align: left;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .tips-title {
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tips-title i {
          color: #fbbf24;
          filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tips-list li {
          color: #cbd5e1;
          font-size: 14px;
          padding: 8px 0;
          padding-left: 24px;
          position: relative;
          transition: color 0.2s ease;
        }

        .tips-list li:hover {
          color: #f1f5f9;
        }

        .tips-list li::before {
          content: '✦';
          position: absolute;
          left: 0;
          color: ${getBrandColor()};
          font-size: 10px;
          top: 10px;
          filter: drop-shadow(0 0 4px ${getBrandColor()}80);
        }

        .back-link,
        .back-link:visited,
        .back-link:active {
          color: ${getBrandColor()} !important;
          text-decoration: none !important;
          font-size: 15px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 28px;
          padding: 10px 20px;
          border-radius: 10px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid transparent;
        }

        .back-link:hover {
          color: ${getBrandColor()} !important;
          background: rgba(255, 255, 255, 0.06);
          border-color: ${getBrandColor()}40;
          transform: translateX(-4px);
          text-decoration: none !important;
        }
      `}</style>

      <div className="verify-card">
        {status === 'loading' && (
          <>
            <div className="icon-circle loading">
              <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
            </div>
            <h1 className="verify-title">Verifying Email...</h1>
            <p className="verify-message">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="icon-circle success success-animation">
              ✓
            </div>
            <h1 className="verify-title">Email Verified! 🎉</h1>
            <p className="verify-message">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <div className="btn-group">
              <Link href={getLoginLink()} className="action-btn primary">
                <i className="fa-solid fa-right-to-bracket"></i>
                Continue to Login
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="icon-circle error">
              ✕
            </div>
            <h1 className="verify-title">Verification Failed</h1>
            <p className="verify-message">{errorMessage}</p>
            <div className="btn-group">
              <Link href={getLoginLink()} className="action-btn primary">
                <i className="fa-solid fa-right-to-bracket"></i>
                Go to Login
              </Link>
              <Link href="/" className="action-btn secondary">
                <i className="fa-solid fa-home"></i>
                Back to Home
              </Link>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="icon-circle pending">
              ✉️
            </div>
            <h1 className="verify-title">Check Your Email!</h1>
            <p className="verify-message">
              We&apos;ve sent a verification link to{' '}
              {email && <span className="email-highlight">{email}</span>}
              {!email && 'your email address'}. 
              Please check your inbox and click the link to verify your account.
            </p>

            {resendSuccess && (
              <div className="resend-success">
                <i className="fa-solid fa-check-circle"></i>
                Verification email sent successfully!
              </div>
            )}

            {email && (
              <div className="btn-group">
                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="action-btn secondary"
                >
                  {resending ? (
                    <>
                      <span className="loading-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="tips-box">
              <div className="tips-title">
                <i className="fa-solid fa-lightbulb"></i>
                Didn&apos;t receive the email?
              </div>
              <ul className="tips-list">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Wait a few minutes and try again</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>

            <Link href="/" className="back-link">
              <i className="fa-solid fa-arrow-left"></i>
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
