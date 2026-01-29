"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const benefits = [
  { icon: "fa-brain", text: "AI-Powered Creator Vetting" },
  { icon: "fa-shield-halved", text: "Brand Safety Protection" },
  { icon: "fa-chart-line", text: "Campaign Analytics" },
  { icon: "fa-robot", text: "Auto-Negotiation Bot" },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
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
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { score: 3, label: 'Good', color: '#22c55e' };
    return { score: 4, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Redirect if already logged in or handle OAuth callback
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies.oauth_token) {
      localStorage.setItem('token', cookies.oauth_token);
      if (cookies.oauth_user) {
        try {
          localStorage.setItem('user', decodeURIComponent(cookies.oauth_user));
        } catch (e) {
          console.error('Error parsing oauth_user cookie:', e);
        }
      }
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

    const oauthError = searchParams.get('error');
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        oauth_failed: 'OAuth authentication failed. Please try again.',
        oauth_denied: 'You denied the authentication request.',
        no_code: 'No authorization code received.',
        invalid_state: 'Invalid state. Please try again.',
        callback_failed: 'Authentication callback failed. Please try again.',
        email_required: 'Email is required for authentication.',
      };
      setError(errorMessages[oauthError] || 'Authentication failed. Please try again.');
    }
  }, [searchParams]);

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

    if (!formData.agreeTerms) {
      setError('Please agree to the terms');
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

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="brand-register-wrapper">
      {/* Floating Elements */}
      <div className="brand-floating-elements">
        <div className="brand-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>🎯</div>
        <div className="brand-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>🚀</div>
        <div className="brand-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>📊</div>
        <div className="brand-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>✨</div>
        <div className="brand-float-icon" style={{ top: '45%', left: '8%', animationDelay: '1.5s' }}>🔍</div>
        <div className="brand-float-icon" style={{ top: '60%', right: '10%', animationDelay: '2.5s' }}>💎</div>
      </div>

      <div className="brand-register-split">
        {/* Left Side - Value Proposition */}
        <div className="brand-info-panel">
          <div className="brand-panel-content">
            <Link href="/" className="brand-back-link">
              <i className="fa-solid fa-arrow-left"></i>
              Back to Home
            </Link>

            <div className="brand-hero">
              <div className="brand-logo-section">
                <div className="brand-logo-hex">
                  <div className="hex-glow"></div>
                  <span className="hex-letter">V</span>
                </div>
              </div>
              <h1>Find Your Perfect<br /><span className="gradient-text-brand">Creator Match</span></h1>
              <p>AI-powered influencer vetting platform trusted by leading brands</p>
            </div>

            {/* Benefits */}
            <div className="brand-benefits">
              <h3>🚀 What You Get</h3>
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="benefit-icon">
                      <i className={`fa-solid ${benefit.icon}`}></i>
                    </div>
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Preview */}
            <div className="brand-stats-preview">
              <div className="stat-preview-item">
                <span className="stat-icon">🎯</span>
                <div className="stat-text">
                  <span className="stat-number">6</span>
                  <span className="stat-desc">Platforms</span>
                </div>
              </div>
              <div className="stat-preview-item">
                <span className="stat-icon">🤖</span>
                <div className="stat-text">
                  <span className="stat-number">AI</span>
                  <span className="stat-desc">Powered</span>
                </div>
              </div>
              <div className="stat-preview-item">
                <span className="stat-icon">⚡</span>
                <div className="stat-text">
                  <span className="stat-number">10s</span>
                  <span className="stat-desc">Analysis</span>
                </div>
              </div>
            </div>

            <div className="brand-trust-badges">
              <div className="trust-badge">
                <i className="fa-solid fa-shield-halved"></i>
                <span>Secure & Private</span>
              </div>
              <div className="trust-badge">
                <i className="fa-solid fa-bolt"></i>
                <span>Instant Setup</span>
              </div>
              <div className="trust-badge">
                <i className="fa-solid fa-credit-card"></i>
                <span>No Credit Card</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="brand-form-panel">
          <div className="brand-form-container">
            <div className="mobile-brand-logo">
              <div className="mobile-hex">V</div>
              <span className="mobile-logo-text">VibeVetting</span>
            </div>

            <div className="brand-register-card">
              {/* Success State */}
              {success && (
                <div className="brand-success-state">
                  <div className="success-icon">🎉</div>
                  <h2>Welcome to VibeVetting!</h2>
                  <p>Your account has been created. Redirecting to dashboard...</p>
                  <div className="success-loader">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  </div>
                </div>
              )}

              {!success && (
                <>
                  <div className="brand-card-header">
                    <h2>Create Your Account</h2>
                    <p>Start vetting creators with AI in seconds</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="brand-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {error}
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <div className="input-with-icon">
                          <i className="fa-solid fa-user"></i>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Your name"
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
                            placeholder="Your company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
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

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Password *</label>
                        <div className="input-with-icon">
                          <i className="fa-solid fa-lock"></i>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="Min 6 characters"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                          />
                        </div>
                        {formData.password && (
                          <div className="password-strength">
                            <div className="strength-bars">
                              {[1, 2, 3, 4].map((level) => (
                                <div 
                                  key={level} 
                                  className={`strength-bar ${passwordStrength.score >= level ? 'active' : ''}`}
                                  style={{ backgroundColor: passwordStrength.score >= level ? passwordStrength.color : undefined }}
                                />
                              ))}
                            </div>
                            <span className="strength-label" style={{ color: passwordStrength.color }}>
                              {passwordStrength.label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm Password *</label>
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
                        {formData.confirmPassword && formData.password && (
                          <div className="password-match">
                            {formData.password === formData.confirmPassword ? (
                              <span className="match-success"><i className="fa-solid fa-check"></i> Passwords match</span>
                            ) : (
                              <span className="match-error"><i className="fa-solid fa-xmark"></i> Passwords don&apos;t match</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="auth-options">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        />
                        <span>I agree to the <Link href="/terms" className="auth-link">Terms of Service</Link> and <Link href="/privacy" className="auth-link">Privacy Policy</Link></span>
                      </label>
                    </div>

                    <button type="submit" className="brand-btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-rocket"></i>
                          Create Account
                        </>
                      )}
                    </button>
                  </form>

                  <div className="brand-divider">
                    <span>or continue with</span>
                  </div>

                  <div className="brand-social-buttons">
                    <button 
                      type="button" 
                      className="brand-social-btn google"
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
                      <span>Google</span>
                    </button>
                    <button 
                      type="button" 
                      className="brand-social-btn linkedin"
                      disabled={true}
                      title="Coming Soon"
                    >
                      <i className="fa-brands fa-linkedin"></i>
                      <span>LinkedIn <small>(Soon)</small></span>
                    </button>
                  </div>

                  <div className="brand-footer">
                    <p>Already have an account? <Link href="/login" className="auth-link">Sign in</Link></p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="brand-register-wrapper">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#00f5ff' }}></i>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
