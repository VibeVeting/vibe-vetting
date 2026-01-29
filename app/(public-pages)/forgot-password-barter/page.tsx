'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordBarterPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password-barter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset link');
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      // In development, show the reset link (in production, this would be emailed)
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="barter-forgot-wrapper">
      {/* Floating Elements */}
      <div className="barter-floating-elements">
        <div className="floating-icon" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>🔐</div>
        <div className="floating-icon" style={{ top: '25%', right: '15%', animationDelay: '1s' }}>✉️</div>
        <div className="floating-icon" style={{ bottom: '30%', left: '8%', animationDelay: '2s' }}>🔑</div>
        <div className="floating-icon" style={{ bottom: '20%', right: '12%', animationDelay: '0.5s' }}>💫</div>
      </div>

      <div className="barter-forgot-container">
        {/* Left Side - Creative Flow Explanation */}
        <div className="barter-flow-section">
          <div className="flow-header">
            <span className="flow-badge">✨ How Barter Works</span>
            <h2>Get Products You Love.<br />Create Content You're Proud Of.</h2>
            <p>A simple 3-step journey from signup to free products</p>
          </div>

          <div className="barter-flow-visual">
            {/* Step 1 */}
            <div className="flow-step">
              <div className="step-number">1</div>
              <div className="step-icon-box">
                <div className="step-icon">🏢</div>
                <div className="step-glow"></div>
              </div>
              <div className="step-content">
                <h3>Brands Onboard</h3>
                <p>Premium brands list their products & content requirements</p>
                <div className="step-tags">
                  <span>Beauty</span>
                  <span>Tech</span>
                  <span>Food</span>
                  <span>Fashion</span>
                </div>
              </div>
              <div className="flow-connector">
                <div className="connector-line"></div>
                <div className="connector-arrow">→</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flow-step">
              <div className="step-number">2</div>
              <div className="step-icon-box">
                <div className="step-icon">📝</div>
                <div className="step-glow"></div>
              </div>
              <div className="step-content">
                <h3>You Create Magic</h3>
                <p>Pick offers, follow the brief, create authentic content</p>
                <div className="step-checklist">
                  <div className="check-item">✓ Follow script guidelines</div>
                  <div className="check-item">✓ Add required hashtags</div>
                  <div className="check-item">✓ Tag the brand</div>
                  <div className="check-item">✓ Keep it public</div>
                </div>
              </div>
              <div className="flow-connector">
                <div className="connector-line"></div>
                <div className="connector-arrow">→</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flow-step final-step">
              <div className="step-number">3</div>
              <div className="step-icon-box celebration">
                <div className="step-icon">🎁</div>
                <div className="step-glow"></div>
                <div className="confetti">🎉</div>
              </div>
              <div className="step-content">
                <h3>Get Free Products!</h3>
                <p>Once approved, receive your product at your doorstep</p>
                <div className="reward-examples">
                  <div className="reward-item">
                    <span className="reward-icon">💄</span>
                    <span>₹2,500 Skincare Kit</span>
                  </div>
                  <div className="reward-item">
                    <span className="reward-icon">🎧</span>
                    <span>₹3,999 Earbuds</span>
                  </div>
                  <div className="reward-item">
                    <span className="reward-icon">☕</span>
                    <span>₹1,200 Coffee Box</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flow-footer">
            <div className="trust-badge">
              <span>🛡️</span>
              <span>No hidden charges. No catches. Just create & receive.</span>
            </div>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="barter-forgot-card">
          {!isSubmitted ? (
            <>
              <div className="barter-forgot-header">
                <div className="forgot-icon-wrapper">
                  <span className="forgot-main-icon">🔐</span>
                  <div className="forgot-icon-ring"></div>
                </div>
                <h1>Reset Your Password</h1>
                <p>No worries! Enter your email and we'll send you reset instructions.</p>
              </div>

              <form className="barter-forgot-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="barter-error-message">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="auth-field">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      placeholder="creator@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="barter-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>📨</span>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="barter-forgot-footer">
                <p>
                  Remember your password?{' '}
                  <Link href="/login-barter">Back to Login</Link>
                </p>
                <p>
                  New creator?{' '}
                  <Link href="/register-barter">Join the Barter Network</Link>
                </p>
              </div>
            </>
          ) : (
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
              <h2>Check Your Inbox!</h2>
              <p>We've sent password reset instructions to:</p>
              <div className="email-display">{email}</div>
              
              {/* Development only - show reset link */}
              {resetLink && (
                <div className="dev-notice" style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                    <strong>Development Mode:</strong> Email not configured.
                  </p>
                  <Link href={resetLink} className="barter-submit-btn" style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '14px' }}>
                    <span>🔗</span>
                    Click here to reset password
                  </Link>
                </div>
              )}
              
              <div className="success-tips">
                <div className="tip">
                  <span>💡</span>
                  <span>Can't find it? Check your spam folder</span>
                </div>
                <div className="tip">
                  <span>⏱️</span>
                  <span>Link expires in 60 minutes</span>
                </div>
              </div>
              <button 
                className="barter-secondary-btn"
                onClick={() => {
                  setIsSubmitted(false);
                  setResetLink('');
                }}
              >
                <span>🔄</span>
                Try a different email
              </button>
              <Link href="/login-barter" className="back-to-login-link">
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
