"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2fa, setRequires2fa] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaInfo, setTwoFaInfo] = useState('');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Redirect if already logged in or handle OAuth callback
  useEffect(() => {
    // Check for OAuth token in cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies.oauth_token) {
      // Transfer OAuth data to localStorage
      localStorage.setItem('token', cookies.oauth_token);
      if (cookies.oauth_user) {
        try {
          localStorage.setItem('user', decodeURIComponent(cookies.oauth_user));
        } catch (e) {
          console.error('Error parsing oauth_user cookie:', e);
        }
      }
      // Clear OAuth cookies
      document.cookie = 'oauth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'oauth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      window.location.href = '/dashboard';
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard';
      return;
    }

    // Check for OAuth errors
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        oauth_failed: 'OAuth authentication failed. Please try again.',
        oauth_denied: 'You denied the authentication request.',
        no_code: 'No authorization code received.',
        invalid_state: 'Invalid state. Please try again.',
        callback_failed: 'Authentication callback failed. Please try again.',
        email_required: 'Email is required for authentication. Please ensure your account has an email.',
      };
      setError(errorMessages[oauthError] || 'Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          code: requires2fa ? twoFaCode : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (data.requires2fa) {
        setRequires2fa(true);
        setTwoFaInfo(data.message || 'Enter the verification code sent to your email.');
        if (data.devCode) setTwoFaInfo(prev => `${prev} (Dev code: ${data.devCode})`);
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Use window.location for hard redirect to ensure auth state is loaded
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
            <h2>{requires2fa ? 'Two-Factor Verification' : 'Welcome Back'}</h2>
            <p>{requires2fa ? 'Enter the 6-digit code sent to your email' : 'Sign in to your account to continue'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            {!requires2fa && (
              <>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <i className="fa-solid fa-envelope"></i>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-with-icon">
                    <i className="fa-solid fa-lock"></i>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {requires2fa && (
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-shield"></i>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123456"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                    required
                  />
                </div>
                {twoFaInfo && <div className="helper-text" style={{ marginTop: '6px', color: '#4a5568', fontSize: '12px' }}>{twoFaInfo}</div>}
              </div>
            )}

            <div className="auth-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              <i className={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-arrow-right-to-bracket"}></i>
              {loading ? (requires2fa ? 'Verifying...' : 'Signing In...') : (requires2fa ? 'Verify Code' : 'Sign In')}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <button 
              type="button" 
              className="social-btn"
              onClick={() => {
                setOauthLoading('google');
                window.location.href = '/api/auth/google';
              }}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'google' ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-brands fa-google"></i>
              )}
              Google
            </button>
            <button 
              type="button" 
              className="social-btn"
              disabled={true}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
              title="Coming Soon"
            >
              <i className="fa-brands fa-facebook"></i>
              Meta <span style={{ fontSize: '10px', marginLeft: '4px' }}>(Soon)</span>
            </button>
          </div>

          <div className="auth-footer">
            <p>Don&apos;t have an account? <Link href="/register" className="auth-link">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-box">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#667eea' }}></i>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
