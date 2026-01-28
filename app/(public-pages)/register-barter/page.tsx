"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const niches = [
  "Beauty & Skincare",
  "Fashion & Style",
  "Food & Cooking",
  "Fitness & Health",
  "Tech & Gadgets",
  "Travel & Lifestyle",
  "Parenting & Family",
  "Gaming",
  "Home & Decor",
  "Pet & Animals",
  "Education & Learning",
  "Entertainment",
  "Other"
];

const followerRanges = [
  "1K - 5K",
  "5K - 10K",
  "10K - 25K",
  "25K - 50K",
  "50K+"
];

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', placeholder: '@yourhandle' },
  { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', placeholder: '@channel or URL' },
  { id: 'tiktok', name: 'TikTok', icon: 'fa-tiktok', color: '#00f2ea', placeholder: '@yourhandle' },
  { id: 'twitter', name: 'Twitter/X', icon: 'fa-x-twitter', color: '#1DA1F2', placeholder: '@yourhandle' },
  { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877F2', placeholder: 'Page name or URL' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', placeholder: 'Profile URL' },
];

function RegisterBarterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    primaryPlatform: '',
    followerCount: '',
    niche: '',
    otherNiche: '',
    city: '',
    whyBarter: '',
    agreeTerms: false,
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

    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const hasAtLeastOneSocial = () => {
    return formData.instagram || formData.youtube || formData.tiktok || 
           formData.twitter || formData.facebook || formData.linkedin;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    if (step === 2) {
      if (!hasAtLeastOneSocial()) {
        setError('Please add at least one social media handle');
        return;
      }
      if (!formData.primaryPlatform) {
        setError('Please select your primary platform');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.followerCount || !formData.niche) {
      setError('Please fill in all required fields');
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
          userType: 'barter_creator',
          creatorProfile: {
            socialHandles: {
              instagram: formData.instagram,
              youtube: formData.youtube,
              tiktok: formData.tiktok,
              twitter: formData.twitter,
              facebook: formData.facebook,
              linkedin: formData.linkedin,
            },
            primaryPlatform: formData.primaryPlatform,
            followerCount: formData.followerCount,
            niche: formData.niche === 'Other' ? formData.otherNiche : formData.niche,
            city: formData.city,
            whyBarter: formData.whyBarter,
            barterReady: true,
          }
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

      router.push('/creator-dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const getFilledSocials = () => {
    const socials = [];
    if (formData.instagram) socials.push({ platform: 'Instagram', handle: formData.instagram });
    if (formData.youtube) socials.push({ platform: 'YouTube', handle: formData.youtube });
    if (formData.tiktok) socials.push({ platform: 'TikTok', handle: formData.tiktok });
    if (formData.twitter) socials.push({ platform: 'Twitter/X', handle: formData.twitter });
    if (formData.facebook) socials.push({ platform: 'Facebook', handle: formData.facebook });
    if (formData.linkedin) socials.push({ platform: 'LinkedIn', handle: formData.linkedin });
    return socials;
  };

  return (
    <div className="barter-register-wrapper">
      <div className="barter-register-container">
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

        <div className="barter-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">{step > 1 ? <i className="fa-solid fa-check"></i> : '1'}</div>
            <span>Account</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">{step > 2 ? <i className="fa-solid fa-check"></i> : '2'}</div>
            <span>Socials</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Profile</span>
          </div>
        </div>

        <div className="barter-register-card">
          {step === 1 && (
            <>
              <div className="barter-card-header">
                <h2>Join as a Barter Creator</h2>
                <p>Get free products from brands in exchange for authentic content</p>
              </div>

              <div className="barter-benefits-mini">
                <div className="benefit-item">
                  <i className="fa-solid fa-gift"></i>
                  <span>Free Products</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-handshake"></i>
                  <span>Brand Collabs</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Grow Together</span>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                {error && (
                  <div className="barter-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {error}
                  </div>
                )}

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
                  </div>
                </div>

                <button type="submit" className="barter-btn-primary">
                  Continue
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="barter-card-header">
                <h2>Connect Your Social Media</h2>
                <p>Add at least one platform where you create content</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                {error && (
                  <div className="barter-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {error}
                  </div>
                )}

                <div className="social-handles-grid">
                  {socialPlatforms.map((platform) => (
                    <div key={platform.id} className="social-handle-item">
                      <div className="social-handle-header">
                        <i className={`fa-brands ${platform.icon}`} style={{ color: platform.color }}></i>
                        <span>{platform.name}</span>
                      </div>
                      <input
                        type="text"
                        className="form-input social-input"
                        placeholder={platform.placeholder}
                        value={formData[platform.id as keyof typeof formData] as string}
                        onChange={(e) => setFormData({ ...formData, [platform.id]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="form-label">Primary Platform *</label>
                  <p className="form-hint">Which platform do you post on most?</p>
                  <div className="primary-platform-grid">
                    {socialPlatforms.map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        className={`platform-select-btn ${formData.primaryPlatform === platform.id ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, primaryPlatform: platform.id })}
                        disabled={!formData[platform.id as keyof typeof formData]}
                      >
                        <i className={`fa-brands ${platform.icon}`} style={{ color: formData.primaryPlatform === platform.id ? '#fff' : platform.color }}></i>
                        <span>{platform.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="barter-btn-group">
                  <button type="button" className="barter-btn-secondary" onClick={handleBack}>
                    <i className="fa-solid fa-arrow-left"></i>
                    Back
                  </button>
                  <button type="submit" className="barter-btn-primary">
                    Continue
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="barter-card-header">
                <h2>Complete Your Profile</h2>
                <p>Help brands find you for the right collaborations</p>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="barter-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {error}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Follower Count *</label>
                    <div className="input-with-icon">
                      <i className="fa-solid fa-users"></i>
                      <select
                        className="form-input form-select"
                        value={formData.followerCount}
                        onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
                        required
                      >
                        <option value="">Select range</option>
                        {followerRanges.map((range) => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <div className="input-with-icon">
                      <i className="fa-solid fa-location-dot"></i>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Mumbai, Delhi..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Niche *</label>
                  <div className="niche-grid">
                    {niches.map((niche) => (
                      <button
                        key={niche}
                        type="button"
                        className={`niche-tag ${formData.niche === niche ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, niche })}
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.niche === 'Other' && (
                  <div className="form-group">
                    <label className="form-label">Specify Your Niche</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="E.g., Sustainable Fashion"
                      value={formData.otherNiche}
                      onChange={(e) => setFormData({ ...formData, otherNiche: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Why do you want to do barter deals?</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Tell brands why you're interested..."
                    value={formData.whyBarter}
                    onChange={(e) => setFormData({ ...formData, whyBarter: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="barter-summary">
                  <h4>Your Profile Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Primary</span>
                      <span className="summary-value">{socialPlatforms.find(p => p.id === formData.primaryPlatform)?.name || '-'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Followers</span>
                      <span className="summary-value">{formData.followerCount || '-'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Niche</span>
                      <span className="summary-value">{formData.niche === 'Other' ? formData.otherNiche : formData.niche || '-'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Platforms</span>
                      <span className="summary-value">{getFilledSocials().length} connected</span>
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
                    I agree to receive barter offers and accept the <Link href="/terms" className="auth-link">Terms</Link>
                  </label>
                </div>

                <div className="barter-btn-group">
                  <button type="button" className="barter-btn-secondary" onClick={handleBack}>
                    <i className="fa-solid fa-arrow-left"></i>
                    Back
                  </button>
                  <button type="submit" className="barter-btn-primary barter-btn-success" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check"></i>
                        Complete Registration
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="barter-footer">
            <p>Already have an account? <Link href="/login-barter" className="auth-link">Sign in</Link></p>
            <p style={{ marginTop: '8px' }}>Are you a brand? <Link href="/register" className="auth-link">Register here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterBarterPage() {
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
      <RegisterBarterContent />
    </Suspense>
  );
}
