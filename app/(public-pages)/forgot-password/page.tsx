"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset link');
        setLoading(false);
        return;
      }

      setSuccess(true);
      // In development, show the reset link (in production, this would be emailed)
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-login-wrapper">
      {/* Floating Elements */}
      <div className="brand-floating-elements">
        <div className="brand-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>🔐</div>
        <div className="brand-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>✉️</div>
        <div className="brand-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>🔑</div>
        <div className="brand-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>💫</div>
      </div>

      <div className="brand-login-container">
        {/* Logo */}
        <div className="brand-login-logo">
          <div className="brand-logo-hex">
            <div className="hex-glow"></div>
            <span className="hex-letter">V</span>
          </div>
          <span className="brand-logo-text">VibeVetting</span>
        </div>

        {/* Forgot Password Card */}
        <div className="brand-login-card">
          {success ? (
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
                Check Your Email
              </h2>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '14px',
                marginBottom: '24px',
                lineHeight: 1.6
              }}>
                We&apos;ve sent a password reset link to<br />
                <strong style={{ color: '#00f5ff' }}>{email}</strong>
              </p>
              
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
                    className="brand-btn-primary"
                    style={{ display: 'inline-flex', padding: '12px 24px', fontSize: '14px' }}
                  >
                    <i className="fa-solid fa-key"></i>
                    Reset Password Now
                  </Link>
                </div>
              )}
              
              <Link href="/login" className="auth-link" style={{ fontSize: '14px' }}>
                <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="brand-card-header">
                <h2>Forgot Password</h2>
                <p>Enter your email to receive a reset link</p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="brand-error">
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
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="brand-btn-primary" disabled={loading}>
                  {loading ? (
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

                <div className="brand-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
                  <p>Remember your password? <Link href="/login" className="auth-link">Sign in</Link></p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
