"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const niches = [
  { name: "Beauty", emoji: "💄" },
  { name: "Fashion", emoji: "👗" },
  { name: "Food", emoji: "🍕" },
  { name: "Fitness", emoji: "💪" },
  { name: "Tech", emoji: "📱" },
  { name: "Travel", emoji: "✈️" },
  { name: "Lifestyle", emoji: "🌟" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Education", emoji: "📚" },
  { name: "Other", emoji: "✨" }
];

const followerRanges = [
  { range: "1K - 5K", label: "Nano", color: "#22c55e" },
  { range: "5K - 10K", label: "Micro", color: "#3b82f6" },
  { range: "10K - 25K", label: "Rising", color: "#8b5cf6" },
  { range: "25K - 50K", label: "Mid", color: "#f59e0b" },
  { range: "50K+", label: "Macro", color: "#ef4444" }
];

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', gradient: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', placeholder: '@yourhandle' },
  { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', gradient: 'linear-gradient(45deg, #FF0000, #cc0000)', placeholder: '@channel' },
  { id: 'twitter', name: 'X', icon: 'fa-x-twitter', color: '#1DA1F2', gradient: 'linear-gradient(45deg, #1DA1F2, #0d8ecf)', placeholder: '@handle' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', gradient: 'linear-gradient(45deg, #0A66C2, #0077B5)', placeholder: 'Profile URL' },
  { id: 'twitch', name: 'Twitch', icon: 'fa-twitch', color: '#9146FF', gradient: 'linear-gradient(45deg, #9146FF, #6441A5)', placeholder: '@channel' },
];

// Animated particles component
function FloatingParticles() {
  return (
    <div className="yc-particles">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="yc-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated background orbs
function BackgroundOrbs() {
  return (
    <div className="yc-orbs">
      <div className="yc-orb yc-orb-1" />
      <div className="yc-orb yc-orb-2" />
      <div className="yc-orb yc-orb-3" />
    </div>
  );
}

function RegisterBarterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    instagram: '',
    youtube: '',
    twitter: '',
    linkedin: '',
    twitch: '',
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
  const [focusedField, setFocusedField] = useState('');

  // Entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Password strength calculator with detailed feedback
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '', tips: [] };
    const tips: string[] = [];
    let score = 0;
    
    if (password.length >= 6) score++;
    else tips.push('6+ characters');
    
    if (password.length >= 10) score++;
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    else tips.push('Mixed case');
    
    if (/\d/.test(password)) score++;
    else tips.push('Numbers');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else tips.push('Symbols');
    
    if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444', tips };
    if (score <= 2) return { score: 2, label: 'Fair', color: '#f59e0b', tips };
    if (score <= 3) return { score: 3, label: 'Good', color: '#22c55e', tips };
    return { score: 4, label: 'Strong', color: '#10b981', tips: [] };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

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
    return formData.instagram || formData.youtube || 
           formData.twitter || formData.linkedin || formData.twitch;
  };

  const getFilledSocialsCount = () => {
    return [formData.instagram, formData.youtube, formData.twitter, formData.linkedin, formData.twitch].filter(Boolean).length;
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
    
    // Scroll to top of form
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
              twitter: formData.twitter,
              linkedin: formData.linkedin,
              twitch: formData.twitch,
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
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/creator-dashboard');
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const stepTitles = [
    { num: 1, title: "Account", icon: "🔐" },
    { num: 2, title: "Socials", icon: "📱" },
    { num: 3, title: "Profile", icon: "✨" }
  ];

  return (
    <div className={`yc-barter-wrapper ${isVisible ? 'visible' : ''}`}>
      <BackgroundOrbs />
      <FloatingParticles />
      
      {/* Animated Grid Background */}
      <div className="yc-grid-bg" />
      
      <div className="yc-barter-container">
        {/* Left Side - Hero Section */}
        <div className="yc-hero-panel">
          <div className="yc-hero-content">
            {/* Back Link */}
            <Link href="/" className="yc-back-link">
              <div className="yc-back-icon">
                <i className="fa-solid fa-arrow-left"></i>
              </div>
              <span>Back to Home</span>
            </Link>

            {/* Main Hero */}
            <div className="yc-hero-main">
              <div className="yc-gift-animation">
                <div className="yc-gift-box">
                  <span className="yc-gift-emoji">🎁</span>
                  <div className="yc-gift-sparkles">
                    <span>✨</span>
                    <span>⭐</span>
                    <span>✨</span>
                  </div>
                </div>
              </div>
              
              <h1 className="yc-hero-title">
                <span className="yc-title-line">Turn Content Into</span>
                <span className="yc-title-gradient">Free Products</span>
              </h1>
              
              <p className="yc-hero-subtitle">
                Join India&apos;s fastest-growing barter network. Create content, get amazing products.
              </p>
            </div>

            {/* Stats Row */}
            <div className="yc-stats-row">
              <div className="yc-stat">
                <div className="yc-stat-value">
                  <span className="yc-counter">🎁</span>
                </div>
                <div className="yc-stat-label">Free Products</div>
              </div>
              <div className="yc-stat-divider" />
              <div className="yc-stat">
                <div className="yc-stat-value">
                  <span className="yc-counter">🚀</span>
                </div>
                <div className="yc-stat-label">Launching Soon</div>
              </div>
              <div className="yc-stat-divider" />
              <div className="yc-stat">
                <div className="yc-stat-value">
                  <span className="yc-counter">💯</span>
                </div>
                <div className="yc-stat-label">Free Forever</div>
              </div>
            </div>

            {/* How It Works - Compact */}
            <div className="yc-how-it-works">
              <h3 className="yc-section-title">
                <span className="yc-title-icon">🚀</span>
                How It Works
              </h3>
              
              <div className="yc-steps-flow">
                <div className="yc-flow-step">
                  <div className="yc-flow-icon">
                    <span>🏢</span>
                  </div>
                  <div className="yc-flow-content">
                    <h4>Brands List Products</h4>
                    <p>Premium brands post barter opportunities</p>
                  </div>
                </div>
                
                <div className="yc-flow-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
                
                <div className="yc-flow-step">
                  <div className="yc-flow-icon">
                    <span>📸</span>
                  </div>
                  <div className="yc-flow-content">
                    <h4>You Create Content</h4>
                    <p>Post reels, stories or reviews</p>
                  </div>
                </div>
                
                <div className="yc-flow-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
                
                <div className="yc-flow-step yc-flow-step-final">
                  <div className="yc-flow-icon yc-flow-icon-glow">
                    <span>🎁</span>
                  </div>
                  <div className="yc-flow-content">
                    <h4>Get Free Products!</h4>
                    <p>Delivered to your doorstep</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="yc-trust-badges">
              <div className="yc-badge">
                <span className="yc-badge-icon">🛡️</span>
                <span>Verified Brands</span>
              </div>
              <div className="yc-badge">
                <span className="yc-badge-icon">💯</span>
                <span>No Hidden Fees</span>
              </div>
              <div className="yc-badge">
                <span className="yc-badge-icon">🤝</span>
                <span>Direct Deals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="yc-form-panel" ref={formRef}>
          <div className="yc-form-container">
            {/* Mobile Logo */}
            <div className="yc-mobile-header">
              <div className="yc-mobile-logo">
                <span className="yc-logo-icon">🎁</span>
                <span className="yc-logo-text">vibeVetting</span>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="yc-progress">
              {stepTitles.map((s, idx) => (
                <div key={s.num} className="yc-progress-item">
                  <div className={`yc-progress-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                    <div className="yc-step-circle">
                      {step > s.num ? (
                        <i className="fa-solid fa-check"></i>
                      ) : (
                        <span>{s.icon}</span>
                      )}
                    </div>
                    <span className="yc-step-label">{s.title}</span>
                  </div>
                  {idx < stepTitles.length - 1 && (
                    <div className={`yc-progress-connector ${step > s.num ? 'completed' : ''}`}>
                      <div className="yc-connector-line" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="yc-form-card">
              {/* Success State */}
              {success && (
                <div className="yc-success-state">
                  <div className="yc-success-animation">
                    <div className="yc-success-circle">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div className="yc-confetti">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="yc-confetti-piece" style={{ '--i': i } as React.CSSProperties} />
                      ))}
                    </div>
                  </div>
                  <h2>Welcome to the Network! 🎉</h2>
                  <p>Your creator account is ready. Redirecting to dashboard...</p>
                  <div className="yc-success-loader">
                    <div className="yc-loader-bar" />
                  </div>
                </div>
              )}

              {/* Step 1: Account */}
              {step === 1 && !success && (
                <div className="yc-step-content">
                  <div className="yc-card-header">
                    <h2>Create Your Account</h2>
                    <p>Start your journey to free products</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                    {error && (
                      <div className="yc-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-user"></i>
                        Full Name
                      </label>
                      <div className={`yc-input-wrapper ${focusedField === 'name' ? 'focused' : ''} ${formData.name ? 'filled' : ''}`}>
                        <input
                          type="text"
                          className="yc-input"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField('')}
                          required
                        />
                        {formData.name && (
                          <div className="yc-input-check">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-envelope"></i>
                        Email Address
                      </label>
                      <div className={`yc-input-wrapper ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                        <input
                          type="email"
                          className="yc-input"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          required
                        />
                        {formData.email && formData.email.includes('@') && (
                          <div className="yc-input-check">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="yc-form-row">
                      <div className="yc-form-group">
                        <label className="yc-label">
                          <i className="fa-solid fa-lock"></i>
                          Password
                        </label>
                        <div className={`yc-input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                          <input
                            type="password"
                            className="yc-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField('')}
                            required
                          />
                        </div>
                        {formData.password && (
                          <div className="yc-password-strength">
                            <div className="yc-strength-bars">
                              {[1, 2, 3, 4].map((level) => (
                                <div 
                                  key={level} 
                                  className={`yc-strength-bar ${passwordStrength.score >= level ? 'active' : ''}`}
                                  style={{ backgroundColor: passwordStrength.score >= level ? passwordStrength.color : undefined }}
                                />
                              ))}
                            </div>
                            <span className="yc-strength-label" style={{ color: passwordStrength.color }}>
                              {passwordStrength.label}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="yc-form-group">
                        <label className="yc-label">
                          <i className="fa-solid fa-shield-check"></i>
                          Confirm
                        </label>
                        <div className={`yc-input-wrapper ${focusedField === 'confirmPassword' ? 'focused' : ''} ${passwordsMatch ? 'success' : ''}`}>
                          <input
                            type="password"
                            className="yc-input"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField('')}
                            required
                          />
                          {formData.confirmPassword && (
                            <div className={`yc-input-check ${passwordsMatch ? 'success' : 'error'}`}>
                              <i className={`fa-solid ${passwordsMatch ? 'fa-check' : 'fa-xmark'}`}></i>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="yc-btn-primary">
                      <span>Continue</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </form>

                  <div className="yc-divider">
                    <span>or continue with</span>
                  </div>

                  <div className="yc-social-login">
                    <button className="yc-social-btn google">
                      <i className="fa-brands fa-google"></i>
                      <span>Google</span>
                    </button>
                  </div>

                  <div className="yc-footer">
                    Already have an account? <Link href="/login-barter">Sign In</Link>
                  </div>
                </div>
              )}

              {/* Step 2: Social Media */}
              {step === 2 && !success && (
                <div className="yc-step-content">
                  <div className="yc-card-header">
                    <h2>Connect Your Socials</h2>
                    <p>Add your social profiles • {getFilledSocialsCount()} connected</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                    {error && (
                      <div className="yc-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="yc-social-grid">
                      {socialPlatforms.map((platform) => (
                        <div 
                          key={platform.id} 
                          className={`yc-social-card ${formData[platform.id as keyof typeof formData] ? 'connected' : ''}`}
                        >
                          <div className="yc-social-header">
                            <div className="yc-social-icon" style={{ background: platform.gradient }}>
                              <i className={`fa-brands ${platform.icon}`}></i>
                            </div>
                            <span className="yc-social-name">{platform.name}</span>
                            {formData[platform.id as keyof typeof formData] && (
                              <div className="yc-social-check">
                                <i className="fa-solid fa-check"></i>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            className="yc-social-input"
                            placeholder={platform.placeholder}
                            value={formData[platform.id as keyof typeof formData] as string}
                            onChange={(e) => setFormData({ ...formData, [platform.id]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="yc-primary-platform">
                      <label className="yc-label">
                        <i className="fa-solid fa-star"></i>
                        Primary Platform
                      </label>
                      <div className="yc-platform-select">
                        {socialPlatforms.map((platform) => (
                          <button
                            key={platform.id}
                            type="button"
                            className={`yc-platform-btn ${formData.primaryPlatform === platform.id ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, primaryPlatform: platform.id })}
                            style={{ 
                              '--platform-color': platform.color,
                              '--platform-gradient': platform.gradient
                            } as React.CSSProperties}
                          >
                            <i className={`fa-brands ${platform.icon}`}></i>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="yc-form-actions">
                      <button type="button" className="yc-btn-secondary" onClick={handleBack}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Back</span>
                      </button>
                      <button type="submit" className="yc-btn-primary">
                        <span>Continue</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Profile */}
              {step === 3 && !success && (
                <div className="yc-step-content">
                  <div className="yc-card-header">
                    <h2>Complete Your Profile</h2>
                    <p>Help brands discover you</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="yc-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-users"></i>
                        Follower Count
                      </label>
                      <div className="yc-follower-select">
                        {followerRanges.map((range) => (
                          <button
                            key={range.range}
                            type="button"
                            className={`yc-follower-btn ${formData.followerCount === range.range ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, followerCount: range.range })}
                            style={{ '--range-color': range.color } as React.CSSProperties}
                          >
                            <span className="yc-follower-range">{range.range}</span>
                            <span className="yc-follower-label">{range.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-location-dot"></i>
                        City
                      </label>
                      <div className={`yc-input-wrapper ${focusedField === 'city' ? 'focused' : ''}`}>
                        <input
                          type="text"
                          className="yc-input"
                          placeholder="Mumbai, Delhi, Bangalore..."
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          onFocus={() => setFocusedField('city')}
                          onBlur={() => setFocusedField('')}
                        />
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-heart"></i>
                        Your Niche
                      </label>
                      <div className="yc-niche-grid">
                        {niches.map((niche) => (
                          <button
                            key={niche.name}
                            type="button"
                            className={`yc-niche-btn ${formData.niche === niche.name ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, niche: niche.name })}
                          >
                            <span className="yc-niche-emoji">{niche.emoji}</span>
                            <span>{niche.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.niche === 'Other' && (
                      <div className="yc-form-group">
                        <div className={`yc-input-wrapper ${focusedField === 'otherNiche' ? 'focused' : ''}`}>
                          <input
                            type="text"
                            className="yc-input"
                            placeholder="Specify your niche"
                            value={formData.otherNiche}
                            onChange={(e) => setFormData({ ...formData, otherNiche: e.target.value })}
                            onFocus={() => setFocusedField('otherNiche')}
                            onBlur={() => setFocusedField('')}
                          />
                        </div>
                      </div>
                    )}

                    <div className="yc-checkbox-group">
                      <label className="yc-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        />
                        <span className="yc-checkmark"></span>
                        <span className="yc-checkbox-text">
                          I agree to the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>
                        </span>
                      </label>
                    </div>

                    <div className="yc-form-actions">
                      <button type="button" className="yc-btn-secondary" onClick={handleBack}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Back</span>
                      </button>
                      <button type="submit" className="yc-btn-primary yc-btn-submit" disabled={loading}>
                        {loading ? (
                          <>
                            <div className="yc-spinner"></div>
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-rocket"></i>
                            <span>Join Network</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterBarterPage() {
  return (
    <Suspense fallback={
      <div className="yc-barter-wrapper">
        <div className="yc-loading-state">
          <div className="yc-loading-spinner"></div>
        </div>
      </div>
    }>
      <RegisterBarterContent />
    </Suspense>
  );
}
