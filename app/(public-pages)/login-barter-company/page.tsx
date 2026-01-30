"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginBarterCompanyContent() {
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
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.userType === 'barter_company') {
          // Barter company already logged in, go to company dashboard
          window.location.href = '/barter-company-dashboard';
          return;
        } else {
          // Different user type logged in - clear and let them login as barter company
          // Each user type should use their own login page
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        // Invalid user data, clear and let them login fresh
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (token) {
      // Token but no user data, clear and let them login fresh
      localStorage.removeItem('token');
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
      const response = await fetch('/api/auth/login-barter-company', {
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

      // Always redirect to barter company dashboard - use hard redirect
      window.location.href = '/barter-company-dashboard';
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="barter-register-wrapper barter-company-theme">
      <div className="barter-register-container" style={{ maxWidth: '440px' }}>
        <div className="barter-register-header">
          <Link href="/" className="barter-back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Back to Home
          </Link>
          <div className="barter-logo">
            <div className="barter-logo-hexagon company-hexagon">
              <div className="barter-hex-inner">
                <span className="barter-hex-v">V</span>
              </div>
            </div>
            <span className="logo-text">
              <span className="logo-vibe">VIBE</span>
              <span className="logo-vetting">VETTING</span>
            </span>
          </div>
        </div>

        <div className="barter-register-card company-card">
          <div className="barter-card-header">
            <div className="company-badge">
              <i className="fa-solid fa-building"></i>
              <span>Barter Company</span>
            </div>
            <h2>Welcome Back, Partner!</h2>
            <p>Sign in to manage your barter campaigns and collaborations</p>
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
                  placeholder="company@email.com"
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
              <Link href="/forgot-password-barter-company" className="auth-link">Forgot password?</Link>
            </div>

            <button type="submit" className="barter-btn-primary company-btn" disabled={loading}>
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
            <p>Don&apos;t have an account? <Link href="/register-barter-company" className="auth-link">Register as Company</Link></p>
            <p style={{ marginTop: '8px' }}>Are you a creator? <Link href="/login-barter" className="auth-link">Creator login</Link></p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .barter-company-theme {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
        }
        
        .company-hexagon {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
        }
        
        .company-card {
          border-top: 3px solid #6366f1;
        }
        
        .company-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .company-badge i {
          font-size: 14px;
        }
        
        .company-btn {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
        }
        
        .company-btn:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
}

export default function LoginBarterCompanyPage() {
  return (
    <Suspense fallback={
      <div className="barter-register-wrapper">
        <div className="barter-register-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#8b5cf6' }}></i>
          </div>
        </div>
      </div>
    }>
      <LoginBarterCompanyContent />
    </Suspense>
  );
}
