'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordBarterPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password-barter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset link');
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      // In development, show the reset link (in production, this would be emailed)
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="barter-register-wrapper">
      <div className="barter-register-container" style={{ maxWidth: '440px' }}>
        <div className="barter-register-header">
          <Link href="/" className="barter-back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Back to Home
          </Link>
          <div className="barter-logo">
            <span className="logo-icon">🎁</span>
            <span className="logo-text">Barter Creators</span>
          </div>
        </div>

        <div className="barter-register-card">
          {!isSubmitted ? (
            <>
              <div className="barter-card-header">
                <h2>🔐 Reset Password</h2>
                <p>No worries! Enter your email and we&apos;ll send you reset instructions.</p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="barter-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <i className="fa-solid fa-envelope"></i>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="creator@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="barter-btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Send Reset Link
                    </>
                  )}
                </button>

                <div className="barter-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
                  <p>Remember your password? <Link href="/login-barter" className="auth-link">Back to Login</Link></p>
                  <p style={{ marginTop: '8px' }}>New creator? <Link href="/register-barter" className="auth-link">Join the Barter Network</Link></p>
                </div>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 24px', 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                ✅
              </div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: '#ffffff', 
                marginBottom: '10px',
                fontFamily: "'Space Grotesk', sans-serif"
              }}>
                Check Your Inbox!
              </h2>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '14px',
                marginBottom: '12px',
                lineHeight: 1.6
              }}>
                We&apos;ve sent password reset instructions to:
              </p>
              <div style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'rgba(244, 114, 182, 0.1)',
                border: '1px solid rgba(244, 114, 182, 0.3)',
                borderRadius: '10px',
                color: '#f472b6',
                fontWeight: 500,
                fontSize: '14px',
                marginBottom: '24px'
              }}>
                {email}
              </div>
              
              {/* Development only - show reset link */}
              {resetLink && (
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '20px'
                }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '12px' }}>
                    <strong>Development Mode:</strong> Email not configured.
                  </p>
                  <Link 
                    href={resetLink} 
                    className="barter-btn-primary"
                    style={{ display: 'inline-flex', padding: '12px 24px', fontSize: '14px' }}
                  >
                    <i className="fa-solid fa-key"></i>
                    Reset Password Now
                  </Link>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                marginBottom: '24px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <span>💡</span>
                  <span>Can&apos;t find it? Check your spam folder</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  <span>⏱️</span>
                  <span>Link expires in 60 minutes</span>
                </div>
              </div>
              
              <button 
                className="barter-btn-secondary"
                onClick={() => {
                  setIsSubmitted(false);
                  setResetLink('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                <i className="fa-solid fa-rotate"></i>
                Try a different email
              </button>
              
              <Link href="/login-barter" className="auth-link" style={{ fontSize: '14px' }}>
                <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i>
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
