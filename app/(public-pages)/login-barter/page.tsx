"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginBarterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.userType === 'barter_creator') {
        window.location.href = '/creator-dashboard';
      } else {
        window.location.href = '/dashboard';
      }
      return;
    }

    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user type
      if (data.user.userType === 'barter_creator') {
        router.push('/creator-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
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
          <div className="barter-card-header">
            <h2>Welcome Back, Creator!</h2>
            <p>Sign in to view brand offers and submit your content</p>
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
                  placeholder="your@email.com"
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
                  placeholder="Your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-options" style={{ justifyContent: 'flex-end' }}>
              <Link href="/forgot-password" className="auth-link">Forgot password?</Link>
            </div>

            <button type="submit" className="barter-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="barter-footer">
            <p>Don&apos;t have an account? <Link href="/register-barter" className="auth-link">Join as Creator</Link></p>
            <p style={{ marginTop: '8px' }}>Are you a brand? <Link href="/login" className="auth-link">Brand login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginBarterPage() {
  return (
    <Suspense fallback={
      <div className="barter-register-wrapper">
        <div className="barter-register-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#f472b6' }}></i>
          </div>
        </div>
      </div>
    }>
      <LoginBarterContent />
    </Suspense>
  );
}
