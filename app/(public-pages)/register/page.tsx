"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company: formData.company || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
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
            <h2>Create Account</h2>
            <p>Start vetting influencers with AI</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="auth-error" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-user"></i>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Vinay Prajapati"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-building"></i>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VibeVetting Inc."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-envelope"></i>
                <input
                  type="email"
                  className="form-input"
                  placeholder="vinay91098@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  required
                />
                I agree to the <Link href="/terms" className="auth-link">Terms of Service</Link> and <Link href="/privacy" className="auth-link">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              <i className={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-user-plus"}></i>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or sign up with</span>
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
            <p>Already have an account? <Link href="/login" className="auth-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
