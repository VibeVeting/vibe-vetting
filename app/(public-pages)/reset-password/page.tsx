"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type'); // 'barter' or null for regular users
  const isBarter = type === 'barter';

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidating(false);
        return;
      }

      try {
        const typeParam = type ? `&type=${type}` : '';
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}${typeParam}`);
        const data = await response.json();
        setTokenValid(data.valid);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          type: type || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const loginLink = isBarter ? '/login-barter' : '/login';
  const forgotPasswordLink = isBarter ? '/forgot-password-barter' : '/forgot-password';

  // Barter themed wrapper
  if (isBarter) {
    if (validating) {
      return (
        <div className="barter-forgot-wrapper">
          <div className="barter-forgot-card" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="btn-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 20px', borderWidth: '3px' }}></div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Validating reset link...</p>
            </div>
          </div>
        </div>
      );
    }

    if (!token || !tokenValid) {
      return (
        <div className="barter-forgot-wrapper">
          <div className="barter-forgot-card" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <div className="barter-success-state">
              <div className="forgot-icon-wrapper">
                <span className="forgot-main-icon">❌</span>
                <div className="forgot-icon-ring" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}></div>
              </div>
              <h2 style={{ marginBottom: '12px' }}>Invalid or Expired Link</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href={forgotPasswordLink} className="barter-submit-btn" style={{ textDecoration: 'none' }}>
                <span>🔗</span>
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (success) {
      return (
        <div className="barter-forgot-wrapper">
          <div className="barter-forgot-card" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <div className="barter-success-state">
              <div className="success-icon-wrapper">
                <span className="success-main-icon">✅</span>
                <div className="success-icon-ring"></div>
                <div className="success-particles">
                  <span>✨</span>
                  <span>✨</span>
                  <span>✨</span>
                </div>
              </div>
              <h2>Password Reset Successful!</h2>
              <p style={{ marginBottom: '24px' }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link href={loginLink} className="barter-submit-btn" style={{ textDecoration: 'none' }}>
                <span>🔓</span>
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="barter-forgot-wrapper">
        <div className="barter-floating-elements">
          <div className="floating-icon" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>🔐</div>
          <div className="floating-icon" style={{ top: '25%', right: '15%', animationDelay: '1s' }}>🔑</div>
          <div className="floating-icon" style={{ bottom: '30%', left: '8%', animationDelay: '2s' }}>✨</div>
          <div className="floating-icon" style={{ bottom: '20%', right: '12%', animationDelay: '0.5s' }}>💫</div>
        </div>

        <div className="barter-forgot-card" style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div className="barter-forgot-header">
            <div className="forgot-icon-wrapper">
              <span className="forgot-main-icon">🔑</span>
              <div className="forgot-icon-ring"></div>
            </div>
            <h1>Reset Your Password</h1>
            <p>Create a new secure password for your account</p>
          </div>

          <form className="barter-forgot-form" onSubmit={handleSubmit}>
            {error && (
              <div className="barter-error-message">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="auth-field">
              <label>New Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="barter-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  <span>🔐</span>
                  Reset Password
                </>
              )}
            </button>
          </form>

          <div className="barter-forgot-footer">
            <p>
              Remember your password?{' '}
              <Link href={loginLink}>Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Brand/Regular themed wrapper
  if (validating) {
    return (
      <div className="brand-login-wrapper">
        <div className="brand-login-container">
          <div className="brand-login-logo">
            <div className="brand-logo-hex">
              <div className="hex-glow"></div>
              <span className="hex-letter">V</span>
            </div>
            <span className="brand-logo-text">VibeVetting</span>
          </div>
          <div className="brand-login-card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#00f5ff' }}></i>
            <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="brand-login-wrapper">
        <div className="brand-login-container">
          <div className="brand-login-logo">
            <div className="brand-logo-hex">
              <div className="hex-glow"></div>
              <span className="hex-letter">V</span>
            </div>
            <span className="brand-logo-text">VibeVetting</span>
          </div>
          <div className="brand-login-card" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 24px', 
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fa-solid fa-circle-xmark" style={{ fontSize: '40px', color: '#ef4444' }}></i>
            </div>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 700, 
              color: '#ffffff', 
              marginBottom: '12px',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>Invalid or Expired Link</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px', fontSize: '14px' }}>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href={forgotPasswordLink} className="brand-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              <i className="fa-solid fa-arrow-left"></i>
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="brand-login-wrapper">
        <div className="brand-login-container">
          <div className="brand-login-logo">
            <div className="brand-logo-hex">
              <div className="hex-glow"></div>
              <span className="hex-letter">V</span>
            </div>
            <span className="brand-logo-text">VibeVetting</span>
          </div>
          <div className="brand-login-card" style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 24px', 
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fa-solid fa-check-circle" style={{ fontSize: '40px', color: '#22c55e' }}></i>
            </div>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 700, 
              color: '#ffffff', 
              marginBottom: '12px',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>Password Reset Successful</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px', fontSize: '14px' }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link href={loginLink} className="brand-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-login-wrapper">
      <div className="brand-floating-elements">
        <div className="brand-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>🔐</div>
        <div className="brand-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>🔑</div>
        <div className="brand-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>✨</div>
        <div className="brand-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>💫</div>
      </div>

      <div className="brand-login-container">
        <div className="brand-login-logo">
          <div className="brand-logo-hex">
            <div className="hex-glow"></div>
            <span className="hex-letter">V</span>
          </div>
          <span className="brand-logo-text">VibeVetting</span>
        </div>

        <div className="brand-login-card">
          <div className="brand-card-header">
            <h2>Reset Password</h2>
            <p>Create a new secure password for your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="brand-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="brand-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Resetting...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-key"></i>
                  Reset Password
                </>
              )}
            </button>

            <div className="brand-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
              <p>Remember your password? <Link href={loginLink} className="auth-link">Sign in</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="brand-login-wrapper">
        <div className="brand-login-container">
          <div className="brand-login-card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#00f5ff' }}></i>
            <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
