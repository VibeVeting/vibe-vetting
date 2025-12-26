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
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <i className="fa-solid fa-check"></i>
          </div>
          <h1>VibeVetting</h1>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          <div className="auth-header">
            <h2>Forgot Password</h2>
            <p>Enter your email to receive a reset link</p>
          </div>

          {success ? (
            <div className="success-message">
              <div className="success-icon">
                <i className="fa-solid fa-check-circle"></i>
              </div>
              <h3>Check Your Email</h3>
              <p>We&apos;ve sent a password reset link to <strong>{email}</strong></p>
              
              {/* Development only - show reset link */}
              {resetLink && (
                <div className="dev-notice">
                  <p style={{ fontSize: '12px', color: '#718096', marginTop: '16px' }}>
                    <strong>Development Mode:</strong> Email not configured.
                  </p>
                  <Link href={resetLink} className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-block' }}>
                    Click here to reset password
                  </Link>
                </div>
              )}
              
              <Link href="/login" className="auth-link" style={{ marginTop: '20px', display: 'block' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="auth-error" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
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

              <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                <i className={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-paper-plane"}></i>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="auth-footer" style={{ marginTop: '24px' }}>
                <p>Remember your password? <Link href="/login" className="auth-link">Sign in</Link></p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
