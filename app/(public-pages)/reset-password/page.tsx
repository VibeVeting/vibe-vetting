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
  const brandName = isBarter ? 'Barter Network' : 'VibeVetting';

  if (validating) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <i className="fa-solid fa-check"></i>
            </div>
            <h1>{brandName}</h1>
          </div>
          <div className="auth-card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: isBarter ? '#f472b6' : '#667eea' }}></i>
            <p style={{ marginTop: '16px', color: '#718096' }}>Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <i className="fa-solid fa-check"></i>
            </div>
            <h1>{brandName}</h1>
          </div>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: '48px', marginBottom: '16px' }}>
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
            <h2 style={{ marginBottom: '8px' }}>Invalid or Expired Link</h2>
            <p style={{ color: '#718096', marginBottom: '24px' }}>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href={forgotPasswordLink} className="btn btn-primary">
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
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <i className="fa-solid fa-check"></i>
            </div>
            <h1>{brandName}</h1>
          </div>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ color: '#22c55e', fontSize: '48px', marginBottom: '16px' }}>
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <h2 style={{ marginBottom: '8px' }}>Password Reset Successful</h2>
            <p style={{ color: '#718096', marginBottom: '24px' }}>
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Link href={loginLink} className="btn btn-primary">
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <i className="fa-solid fa-check"></i>
          </div>
          <h1>{brandName}</h1>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Reset Password</h2>
            <p>Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
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

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              <i className={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-key"}></i>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="auth-footer" style={{ marginTop: '24px' }}>
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
      <div className="auth-wrapper">
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#667eea' }}></i>
            <p style={{ marginTop: '16px', color: '#718096' }}>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
