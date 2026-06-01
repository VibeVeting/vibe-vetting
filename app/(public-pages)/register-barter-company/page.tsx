"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const industries = [
  { name: "Fashion & Apparel", emoji: "👗" },
  { name: "Beauty & Cosmetics", emoji: "💄" },
  { name: "Food & Beverages", emoji: "🍕" },
  { name: "Health & Wellness", emoji: "💪" },
  { name: "Technology", emoji: "📱" },
  { name: "Home & Living", emoji: "🏠" },
  { name: "Travel & Hospitality", emoji: "✈️" },
  { name: "Electronics", emoji: "🎮" },
  { name: "Education", emoji: "📚" },
  { name: "Entertainment", emoji: "🎬" },
  { name: "Sports & Fitness", emoji: "⚽" },
  { name: "Other", emoji: "✨" }
];

const productCategories = [
  "Fashion", "Beauty", "Food", "Tech", "Fitness", 
  "Travel", "Lifestyle", "Gaming", "Health", "Finance", 
  "Education", "Entertainment", "Home", "Kids", "Pets"
];

const budgetRanges = [
  { range: "₹10K - ₹25K", label: "Starter" },
  { range: "₹25K - ₹50K", label: "Growth" },
  { range: "₹50K - ₹1L", label: "Scale" },
  { range: "₹1L - ₹5L", label: "Enterprise" },
  { range: "₹5L+", label: "Premium" }
];

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F', placeholder: '@yourcompany' },
  { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877F2', placeholder: 'Page URL' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2', placeholder: 'Company URL' },
  { id: 'twitter', name: 'X', icon: 'fa-x-twitter', color: '#000000', placeholder: '@handle' },
  { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000', placeholder: '@channel' },
];

// Animated particles component
function FloatingParticles() {
  return (
    <div className="yc-particles company-particles">
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
    <div className="yc-orbs company-orbs">
      <div className="yc-orb yc-orb-1" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.1))' }} />
      <div className="yc-orb yc-orb-2" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.1))' }} />
      <div className="yc-orb yc-orb-3" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(99, 102, 241, 0.1))' }} />
    </div>
  );
}

function RegisterBarterCompanyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    otherIndustry: '',
    website: '',
    description: '',
    city: '',
    address: '',
    gstNumber: '',
    contactPerson: '',
    contactPhone: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    productsCategories: [] as string[],
    averageProductValue: '',
    monthlyBarterBudget: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Password strength calculator
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
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.userType === 'barter_company') {
          window.location.href = '/barter-company-dashboard';
          return;
        } else {
          // Different user type is logged in - clear and let them register as barter company
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (token) {
      localStorage.removeItem('token');
    }

    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      productsCategories: prev.productsCategories.includes(category)
        ? prev.productsCategories.filter(c => c !== category)
        : [...prev.productsCategories, category]
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.companyName || !formData.email || !formData.contactPerson) {
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
      if (!formData.industry) {
        setError('Please select your industry');
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

    if (formData.productsCategories.length === 0) {
      setError('Please select at least one product category');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the terms');
      return;
    }

    setLoading(true);

    try {
      // First, register the company
      const response = await fetch('/api/auth/register-barter-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          companyProfile: {
            companyName: formData.companyName,
            industry: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
            website: formData.website,
            description: formData.description,
            city: formData.city,
            address: formData.address,
            gstNumber: formData.gstNumber,
            contactPerson: formData.contactPerson,
            contactPhone: formData.contactPhone,
            socialHandles: {
              instagram: formData.instagram,
              facebook: formData.facebook,
              linkedin: formData.linkedin,
              twitter: formData.twitter,
              youtube: formData.youtube,
            },
            productsCategories: formData.productsCategories,
            averageProductValue: formData.averageProductValue ? parseInt(formData.averageProductValue) : undefined,
            monthlyBarterBudget: formData.monthlyBarterBudget,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Send verification email via AWS SES
      const verifyResponse = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.contactPerson,
          userType: 'barter_company',
        }),
      });

      if (!verifyResponse.ok) {
        console.warn('Failed to send verification email, but company registered');
      }

      // Store user data (but don't log in until email is verified)
      localStorage.setItem('pendingVerification', JSON.stringify({
        email: formData.email,
        name: formData.contactPerson,
        userType: 'barter_company',
      }));
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&type=barter_company`);
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const stepTitles = [
    { num: 1, title: "Account", icon: "🏢" },
    { num: 2, title: "Business", icon: "💼" },
    { num: 3, title: "Products", icon: "📦" }
  ];

  return (
    <div className={`yc-barter-wrapper company-wrapper ${isVisible ? 'visible' : ''}`}>
      <BackgroundOrbs />
      <FloatingParticles />
      
      {/* Animated Grid Background */}
      <div className="yc-grid-bg company-grid" />
      
      <div className="yc-barter-container">
        {/* Left Side - Hero Section */}
        <div className="yc-hero-panel company-hero">
          <div className="yc-hero-content">
            {/* Back Link */}
            <Link href="/" className="yc-back-link">
              <div className="yc-back-icon company-back">
                <i className="fa-solid fa-arrow-left"></i>
              </div>
              <span>Back to Home</span>
            </Link>

            {/* Main Hero */}
            <div className="yc-hero-main">
              <div className="yc-gift-animation">
                <div className="yc-gift-box company-gift">
                  <span className="yc-gift-emoji">🏢</span>
                  <div className="yc-gift-sparkles">
                    <span>✨</span>
                    <span>⭐</span>
                    <span>✨</span>
                  </div>
                </div>
              </div>
              
              <h1 className="yc-hero-title">
                <span className="yc-title-line">Grow Your Brand With</span>
                <span className="yc-title-gradient company-gradient">Creator Partnerships</span>
              </h1>
              
              <p className="yc-hero-subtitle">
                Connect with verified creators for authentic product promotions. No upfront payments—just products for content.
              </p>
            </div>

            {/* Stats Row */}
            <div className="yc-stats-row">
              <div className="yc-stat">
                <div className="yc-stat-icon company-stat-icon">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="yc-stat-label">Verified Creators</div>
              </div>
              <div className="yc-stat-divider" />
              <div className="yc-stat">
                <div className="yc-stat-icon company-stat-icon">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div className="yc-stat-label">Track ROI</div>
              </div>
              <div className="yc-stat-divider" />
              <div className="yc-stat">
                <div className="yc-stat-icon company-stat-icon">
                  <i className="fa-solid fa-hand-holding-dollar"></i>
                </div>
                <div className="yc-stat-label">No Cash Payments</div>
              </div>
            </div>

            {/* How It Works - Compact */}
            <div className="yc-how-it-works">
              <h3 className="yc-section-title">
                <span className="yc-title-icon">🚀</span>
                How Barter Works
              </h3>
              
              <div className="yc-steps-flow">
                <div className="yc-flow-step">
                  <div className="yc-flow-icon company-flow-icon">
                    <span>📦</span>
                  </div>
                  <div className="yc-flow-content">
                    <h4>List Your Products</h4>
                    <p>Create barter offers with product details</p>
                  </div>
                </div>
                
                <div className="yc-flow-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
                
                <div className="yc-flow-step">
                  <div className="yc-flow-icon company-flow-icon">
                    <span>👥</span>
                  </div>
                  <div className="yc-flow-content">
                    <h4>Review Applications</h4>
                    <p>Select matching creators</p>
                  </div>
                </div>
                
                <div className="yc-flow-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
                
                <div className="yc-flow-step yc-flow-step-final">
                  <div className="yc-flow-icon yc-flow-icon-glow company-flow-icon">
                    <span>📈</span>
                  </div>
                  <div className="yc-flow-content">
                    <h4>Get Content & Reach!</h4>
                    <p>Authentic promotions from creators</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="yc-trust-badges">
              <div className="yc-badge">
                <span className="yc-badge-icon">🛡️</span>
                <span>Verified Creators</span>
              </div>
              <div className="yc-badge">
                <span className="yc-badge-icon">📊</span>
                <span>Analytics Dashboard</span>
              </div>
              <div className="yc-badge">
                <span className="yc-badge-icon">🤝</span>
                <span>Managed Collabs</span>
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
                <div className="yc-barter-logo-hexagon company-logo-hex">
                  <div className="yc-barter-hex-inner">
                    <span className="yc-barter-hex-v">V</span>
                  </div>
                </div>
                <span className="yc-logo-text">
                  <span className="yc-logo-vibe">VIBE</span>
                  <span className="yc-logo-vetting">VETTING</span>
                </span>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="yc-progress company-progress">
              {stepTitles.map((s, idx) => (
                <div key={s.num} className="yc-progress-item">
                  <div className={`yc-progress-step company-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
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
                    <div className={`yc-progress-connector company-connector ${step > s.num ? 'completed' : ''}`}>
                      <div className="yc-connector-line" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="yc-form-card company-form-card">
              {/* Success State */}
              {success && (
                <div className="yc-success-state company-success">
                  <div className="yc-success-animation">
                    <div className="yc-success-circle company-success-circle">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div className="yc-confetti">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="yc-confetti-piece" style={{ '--i': i } as React.CSSProperties} />
                      ))}
                    </div>
                  </div>
                  <h2>Check Your Email! ✉️</h2>
                  <p>We&apos;ve sent a verification link. Please verify your email to continue.</p>
                  <div className="yc-success-loader">
                    <div className="yc-loader-bar company-loader" />
                  </div>
                </div>
              )}

              {/* Step 1: Account */}
              {step === 1 && !success && (
                <div className="yc-step-content">
                  <div className="yc-card-header">
                    <div className="company-type-badge">
                      <i className="fa-solid fa-building"></i>
                      <span>Barter Company</span>
                    </div>
                    <h2>Create Company Account</h2>
                    <p>Start your barter marketing journey</p>
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
                        <i className="fa-solid fa-building"></i>
                        Company Name *
                      </label>
                      <div className={`yc-input-wrapper ${focusedField === 'companyName' ? 'focused' : ''} ${formData.companyName ? 'filled' : ''}`}>
                        <input
                          type="text"
                          className="yc-input"
                          placeholder="Your Company Name"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          onFocus={() => setFocusedField('companyName')}
                          onBlur={() => setFocusedField('')}
                          required
                        />
                        {formData.companyName && (
                          <div className="yc-input-check">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-user"></i>
                        Contact Person *
                      </label>
                      <div className={`yc-input-wrapper ${focusedField === 'contactPerson' ? 'focused' : ''} ${formData.contactPerson ? 'filled' : ''}`}>
                        <input
                          type="text"
                          className="yc-input"
                          placeholder="Your Name"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          onFocus={() => setFocusedField('contactPerson')}
                          onBlur={() => setFocusedField('')}
                          required
                        />
                        {formData.contactPerson && (
                          <div className="yc-input-check">
                            <i className="fa-solid fa-check"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-envelope"></i>
                        Business Email *
                      </label>
                      <div className={`yc-input-wrapper ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                        <input
                          type="email"
                          className="yc-input"
                          placeholder="company@email.com"
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
                          <i className="fa-solid fa-shield-halved"></i>
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

                    <button type="submit" className="yc-btn-primary company-btn-primary">
                      <span>Continue</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </form>

                  <div className="yc-footer">
                    Already have an account? <Link href="/login-barter-company">Sign In</Link>
                  </div>
                </div>
              )}

              {/* Step 2: Business Details */}
              {step === 2 && !success && (
                <div className="yc-step-content">
                  <div className="yc-card-header">
                    <h2>Business Details</h2>
                    <p>Tell us about your company</p>
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
                        <i className="fa-solid fa-industry"></i>
                        Industry *
                      </label>
                      <div className="yc-industry-grid">
                        {industries.map((industry) => (
                          <button
                            key={industry.name}
                            type="button"
                            className={`yc-industry-btn ${formData.industry === industry.name ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, industry: industry.name })}
                          >
                            <span className="yc-industry-emoji">{industry.emoji}</span>
                            <span>{industry.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.industry === 'Other' && (
                      <div className="yc-form-group">
                        <div className={`yc-input-wrapper ${focusedField === 'otherIndustry' ? 'focused' : ''}`}>
                          <input
                            type="text"
                            className="yc-input"
                            placeholder="Specify your industry"
                            value={formData.otherIndustry}
                            onChange={(e) => setFormData({ ...formData, otherIndustry: e.target.value })}
                            onFocus={() => setFocusedField('otherIndustry')}
                            onBlur={() => setFocusedField('')}
                          />
                        </div>
                      </div>
                    )}

                    <div className="yc-form-row">
                      <div className="yc-form-group">
                        <label className="yc-label">
                          <i className="fa-solid fa-globe"></i>
                          Website
                        </label>
                        <div className={`yc-input-wrapper ${focusedField === 'website' ? 'focused' : ''}`}>
                          <input
                            type="url"
                            className="yc-input"
                            placeholder="https://yourcompany.com"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            onFocus={() => setFocusedField('website')}
                            onBlur={() => setFocusedField('')}
                          />
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
                            placeholder="Mumbai, Delhi..."
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            onFocus={() => setFocusedField('city')}
                            onBlur={() => setFocusedField('')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="yc-form-row">
                      <div className="yc-form-group">
                        <label className="yc-label">
                          <i className="fa-solid fa-phone"></i>
                          Contact Phone
                        </label>
                        <div className={`yc-input-wrapper ${focusedField === 'contactPhone' ? 'focused' : ''}`}>
                          <input
                            type="tel"
                            className="yc-input"
                            placeholder="+91 98765 43210"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            onFocus={() => setFocusedField('contactPhone')}
                            onBlur={() => setFocusedField('')}
                          />
                        </div>
                      </div>
                      
                      <div className="yc-form-group">
                        <label className="yc-label">
                          <i className="fa-solid fa-file-invoice"></i>
                          GST Number
                        </label>
                        <div className={`yc-input-wrapper ${focusedField === 'gstNumber' ? 'focused' : ''}`}>
                          <input
                            type="text"
                            className="yc-input"
                            placeholder="Optional"
                            value={formData.gstNumber}
                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                            onFocus={() => setFocusedField('gstNumber')}
                            onBlur={() => setFocusedField('')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-share-nodes"></i>
                        Social Media (Optional)
                      </label>
                      <div className="yc-social-compact">
                        {socialPlatforms.map((platform) => (
                          <div key={platform.id} className="yc-social-compact-item">
                            <div className="yc-social-compact-icon" style={{ color: platform.color }}>
                              <i className={`fa-brands ${platform.icon}`}></i>
                            </div>
                            <input
                              type="text"
                              className="yc-social-compact-input"
                              placeholder={platform.placeholder}
                              value={formData[platform.id as keyof typeof formData] as string}
                              onChange={(e) => setFormData({ ...formData, [platform.id]: e.target.value })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="yc-form-actions">
                      <button type="button" className="yc-btn-secondary" onClick={handleBack}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Back</span>
                      </button>
                      <button type="submit" className="yc-btn-primary company-btn-primary">
                        <span>Continue</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Products */}
              {step === 3 && !success && (
                <div className="yc-step-content">
                  <div className="yc-card-header">
                    <h2>Product Information</h2>
                    <p>What products will you offer for barter?</p>
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
                        <i className="fa-solid fa-tags"></i>
                        Product Categories *
                        <span className="yc-label-hint">Select all that apply</span>
                      </label>
                      <div className="yc-category-grid">
                        {productCategories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            className={`yc-category-btn ${formData.productsCategories.includes(category) ? 'selected' : ''}`}
                            onClick={() => toggleCategory(category)}
                          >
                            <span>{category}</span>
                            {formData.productsCategories.includes(category) && (
                              <i className="fa-solid fa-check"></i>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-indian-rupee-sign"></i>
                        Average Product Value
                      </label>
                      <div className={`yc-input-wrapper ${focusedField === 'averageProductValue' ? 'focused' : ''}`}>
                        <input
                          type="number"
                          className="yc-input"
                          placeholder="e.g., 2000"
                          value={formData.averageProductValue}
                          onChange={(e) => setFormData({ ...formData, averageProductValue: e.target.value })}
                          onFocus={() => setFocusedField('averageProductValue')}
                          onBlur={() => setFocusedField('')}
                        />
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-wallet"></i>
                        Monthly Barter Budget
                      </label>
                      <div className="yc-budget-select">
                        {budgetRanges.map((budget) => (
                          <button
                            key={budget.range}
                            type="button"
                            className={`yc-budget-btn ${formData.monthlyBarterBudget === budget.range ? 'selected' : ''}`}
                            onClick={() => setFormData({ ...formData, monthlyBarterBudget: budget.range })}
                          >
                            <span className="yc-budget-range">{budget.range}</span>
                            <span className="yc-budget-label">{budget.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="yc-form-group">
                      <label className="yc-label">
                        <i className="fa-solid fa-align-left"></i>
                        Company Description
                      </label>
                      <div className={`yc-input-wrapper yc-textarea-wrapper ${focusedField === 'description' ? 'focused' : ''}`}>
                        <textarea
                          className="yc-input yc-textarea"
                          placeholder="Brief description of your company and products..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          onFocus={() => setFocusedField('description')}
                          onBlur={() => setFocusedField('')}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="yc-checkbox-group">
                      <label className="yc-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        />
                        <span className="yc-checkmark company-checkmark"></span>
                        <span className="yc-checkbox-text">
                          I agree to the <Link href="/terms-barter-company">Brand Terms</Link> and <Link href="/privacy-barter-company">Privacy Policy</Link>
                        </span>
                      </label>
                    </div>

                    <div className="yc-form-actions">
                      <button type="button" className="yc-btn-secondary" onClick={handleBack}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Back</span>
                      </button>
                      <button type="submit" className="yc-btn-primary yc-btn-submit company-btn-primary" disabled={loading}>
                        {loading ? (
                          <>
                            <div className="yc-spinner company-spinner"></div>
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-rocket"></i>
                            <span>Create Account</span>
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
      
      <style jsx>{`
        .company-wrapper {
          --company-primary: #6366f1;
          --company-secondary: #8b5cf6;
        }
        
        .company-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
        }
        
        .company-gradient {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
        
        .company-grid {
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
        }
        
        .company-back {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)) !important;
        }
        
        .company-gift {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)) !important;
        }
        
        .company-stat-icon {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)) !important;
          color: #a5b4fc !important;
        }
        
        .company-flow-icon {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2)) !important;
        }
        
        .company-logo-hex {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        }
        
        .company-step.active .yc-step-circle {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        }
        
        .company-connector.completed .yc-connector-line {
          background: linear-gradient(90deg, #6366f1, #8b5cf6) !important;
        }
        
        .company-form-card {
          border-top: 3px solid #6366f1;
        }
        
        .company-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .company-btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        }
        
        .company-btn-primary:hover {
          background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
        
        .company-success-circle {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        }
        
        .company-loader {
          background: linear-gradient(90deg, #6366f1, #8b5cf6) !important;
        }
        
        .company-checkmark::after {
          border-color: #6366f1 !important;
        }
        
        .company-spinner {
          border-top-color: #6366f1 !important;
        }
        
        .yc-industry-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        
        .yc-industry-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .yc-industry-btn:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.3);
          color: white;
        }
        
        .yc-industry-btn.selected {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border-color: #6366f1;
          color: white;
        }
        
        .yc-industry-emoji {
          font-size: 20px;
        }
        
        .yc-social-compact {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .yc-social-compact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .yc-social-compact-icon {
          font-size: 16px;
          width: 24px;
          text-align: center;
        }
        
        .yc-social-compact-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          outline: none;
        }
        
        .yc-social-compact-input::placeholder {
          color: #64748b;
        }
        
        .yc-category-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .yc-category-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .yc-category-btn:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.3);
          color: white;
        }
        
        .yc-category-btn.selected {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border-color: #6366f1;
          color: white;
        }
        
        .yc-category-btn i {
          font-size: 10px;
        }
        
        .yc-budget-select {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }
        
        .yc-budget-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .yc-budget-btn:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.3);
          color: white;
        }
        
        .yc-budget-btn.selected {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border-color: #6366f1;
          color: white;
        }
        
        .yc-budget-range {
          font-size: 11px;
          font-weight: 600;
        }
        
        .yc-budget-label {
          font-size: 10px;
          opacity: 0.7;
        }
        
        .yc-textarea-wrapper {
          height: auto;
        }
        
        .yc-textarea {
          resize: none;
          min-height: 80px;
        }
        
        .yc-label-hint {
          font-size: 11px;
          color: #64748b;
          font-weight: 400;
          margin-left: 8px;
        }
        
        @media (max-width: 768px) {
          .yc-industry-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .yc-budget-select {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default function RegisterBarterCompanyPage() {
  return (
    <Suspense fallback={
      <div className="yc-barter-wrapper">
        <div className="yc-loading-state">
          <div className="yc-loading-spinner"></div>
        </div>
      </div>
    }>
      <RegisterBarterCompanyContent />
    </Suspense>
  );
}
