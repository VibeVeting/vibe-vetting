"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
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
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

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
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-btn">
              <i className="fa-brands fa-google"></i>
              Google
            </button>
            <button type="button" className="social-btn">
              <i className="fa-brands fa-linkedin"></i>
              LinkedIn
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
