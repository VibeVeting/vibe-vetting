"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordBarterCompanyPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          userType: 'barter_company'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="barter-register-wrapper barter-company-theme">
      <div className="barter-register-container" style={{ maxWidth: '440px' }}>
        <div className="barter-register-header">
          <Link href="/login-barter-company" className="barter-back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Back to Login
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
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '32px',
                color: 'white'
              }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <h2 style={{ marginBottom: '12px', fontSize: '20px' }}>Check Your Email</h2>
              <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                We&apos;ve sent password reset instructions to <strong style={{ color: '#f8fafc' }}>{email}</strong>
              </p>
              <Link 
                href="/login-barter-company" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="barter-card-header">
                <div className="company-badge">
                  <i className="fa-solid fa-building"></i>
                  <span>Barter Company</span>
                </div>
                <h2>Reset Password</h2>
                <p>Enter your email and we&apos;ll send you reset instructions</p>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="barter-btn-primary company-btn" disabled={loading}>
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
              </form>

              <div className="barter-footer">
                <p>Remember your password? <Link href="/login-barter-company" className="auth-link">Sign In</Link></p>
              </div>
            </>
          )}
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
