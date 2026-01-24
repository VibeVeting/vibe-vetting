'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const plans = [
  {
    name: 'Explorer',
    price: '$99',
    originalPrice: '$299',
    period: '/mo',
    description: 'Perfect for startups',
    icon: 'fa-rocket',
    features: [
      '25 vibeAI™ Analyses/month',
      'Basic Neural Safety Check',
      '2 Year History Analysis',
      'Email Support',
    ],
  },
  {
    name: 'Pioneer',
    price: '$299',
    originalPrice: '$799',
    period: '/mo',
    description: 'For growing brands',
    featured: true,
    icon: 'fa-crown',
    features: [
      '100 vibeAI™ Analyses/month',
      'Advanced Neural Safety',
      'Complete History Analysis',
      'Priority Support',
      'Custom Brand DNA Profile',
    ],
  },
  {
    name: 'Visionary',
    price: 'Custom',
    period: '',
    description: 'For enterprise leaders',
    icon: 'fa-building',
    features: [
      'Unlimited vibeAI™ Analyses',
      'White-label Solution',
      'Dedicated AI Engineer',
      'Custom Neural Training',
      'SLA Guarantee',
    ],
  },
];

const faqs = [
  { q: 'How does vibeAI™ analyze creators?', a: 'vibeAI™ analyzes every piece of content a creator has posted - examining patterns, values alignment, and predicting future behavior with 90.9% accuracy.' },
  { q: 'What makes vibeAI™ different?', a: 'Unlike traditional tools, vibeAI™ analyzes past digital footprint to predict future performance, ensuring you partner with creators who will deliver results.' },
  { q: 'What platforms does vibeAI™ analyze?', a: 'vibeAI™ processes data from all major platforms including Instagram, YouTube, TikTok, Twitter, LinkedIn, and emerging platforms.' },
  { q: 'Is there a free trial?', a: 'Yes! All plans come with a 14-day free trial. No credit card required to start.' },
  { q: 'Can I switch plans anytime?', a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate your billing.' },
  { q: 'Can I customize the AI model?', a: 'Pioneer and Visionary plans allow you to customize AI analysis based on your specific brand requirements and target criteria.' },
];

const stats = [
  { value: '100+', label: 'Creators Analyzed', icon: 'fa-users', color: '#00f5ff' },
  { value: '5+', label: 'Brands Protected', icon: 'fa-shield-halved', color: '#a855f7' },
  { value: '90.9%', label: 'AI Accuracy', icon: 'fa-bullseye', color: '#22c55e' },
  { value: '24/7', label: 'AI Monitoring', icon: 'fa-clock', color: '#f59e0b' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / docHeight) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Background Elements */}
      <div className="bg-grid" />
      <div className="floating-elements">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
      </div>

      {/* Particle Effect */}
      <div className="particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 20}s`,
          }} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="landing-nav glass">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <div className="logo-icon pulse-glow">
              <i className="fa-solid fa-bolt" />
            </div>
            <span className="logo-text">
              <span className="logo-vibe">VIBE</span>
              <span className="logo-vetting">VETTING</span>
            </span>
            <span className="beta-badge">BETA</span>
          </Link>
          <div className="nav-links">
            <Link href="/#features" className="nav-link">Features</Link>
            <Link href="/#how-it-works" className="nav-link">How it Works</Link>
            <Link href="/pricing" className="nav-link active">Pricing</Link>
            <Link href="/#faq" className="nav-link">FAQ</Link>
          </div>
          <div className="nav-actions">
            <Link href="/login" className="nav-link signin">Sign In</Link>
            <Link href="/register" className="nav-cta glow-btn">
              <span>Get Started</span>
              <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Pricing Hero */}
      <section className="pricing-hero-section">
        <div className={`hero-container ${isVisible ? 'visible' : ''}`}>
          <div className="hero-status">
            <div className="status-badge glass">
              <span className="status-pulse" />
              <span className="status-text">Simple, Transparent Pricing</span>
            </div>
          </div>

          <h1 className="hero-title">
            <span className="title-line">Choose Your</span>
            <span className="title-line title-gradient">Perfect Plan</span>
          </h1>

          <p className="hero-subtitle">
            Start free and scale as you grow. All plans include our core vibeAI™ features
            with no hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-section" id="pricing">
        <div className="section-container">
          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`pricing-card glass ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && (
                  <div className="popular-tag">
                    <i className="fa-solid fa-star" />
                    <span>Most Popular</span>
                  </div>
                )}
                <div className="plan-header">
                  <div className="plan-icon">
                    <i className={`fa-solid ${plan.icon}`} />
                  </div>
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-desc">{plan.description}</p>
                </div>

                <div className="plan-price">
                  {plan.originalPrice && (
                    <span className="original-price">{plan.originalPrice}</span>
                  )}
                  <span className="current-price">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <i className="fa-solid fa-check" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href={plan.featured ? '/register?plan=pioneer' : '/register'} 
                  className={`plan-cta ${plan.featured ? 'glow-btn' : 'glass'}`}
                >
                  <span>{plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}</span>
                  <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            ))}
          </div>

          {/* Beta Discount Banner */}
          <div className="beta-banner glass">
            <div className="beta-icon">
              <i className="fa-solid fa-gift" />
            </div>
            <div className="beta-content">
              <h4>🎉 Beta Pricing - Limited Time</h4>
              <p>Lock in these exclusive rates before official launch. Prices will increase by 60%.</p>
            </div>
            <Link href="/register" className="beta-cta glow-btn">
              <span>Claim Beta Access</span>
              <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container">
          <div className="hero-stats glass">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                  <i className={`fa-solid ${stat.icon}`} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="comparison-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass">
              <span className="badge-pulse" />
              <span>✨</span>
              <span>All Plans Include</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">Everything You Need</span>
              <span className="title-sub">To Find Perfect Creators</span>
            </h2>
          </div>

          <div className="features-grid comparison-grid">
            <div className="feature-card glass">
              <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)' }}>
                <i className="fa-solid fa-brain" />
              </div>
              <h3 className="feature-title">AI-Powered Analysis</h3>
              <p className="feature-desc">Our AI scans creator content to understand their true vibe and audience alignment</p>
            </div>
            <div className="feature-card glass">
              <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                <i className="fa-solid fa-shield-check" />
              </div>
              <h3 className="feature-title">Fraud Detection</h3>
              <p className="feature-desc">Identify fake followers and engagement to protect your brand investments</p>
            </div>
            <div className="feature-card glass">
              <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)' }}>
                <i className="fa-solid fa-chart-mixed" />
              </div>
              <h3 className="feature-title">Deep Analytics</h3>
              <p className="feature-desc">Get detailed metrics on engagement, growth, and audience demographics</p>
            </div>
            <div className="feature-card glass">
              <div className="feature-icon-wrap" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                <i className="fa-solid fa-users-gear" />
              </div>
              <h3 className="feature-title">Team Collaboration</h3>
              <p className="feature-desc">Work together with your team on creator discovery and campaign management</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass">
              <span className="badge-pulse" />
              <span>❓</span>
              <span>Common Questions</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">Frequently Asked</span>
              <span className="title-sub">Questions</span>
            </h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item glass ${openFaq === index ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <i className={`fa-solid ${openFaq === index ? 'fa-minus' : 'fa-plus'}`} />
                </div>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card glass">
            <h2 className="cta-title">Ready to Find Your <span className="title-gradient">Perfect Creators?</span></h2>
            <p className="cta-subtitle">Join thousands of brands already using VibeVetting to discover authentic influencers.</p>
            <div className="cta-buttons">
              <Link href="/register" className="btn-primary-glow">
                <span>Start Free Trial</span>
                <i className="fa-solid fa-arrow-right" />
              </Link>
              <Link href="/login" className="btn-secondary-glass">
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">
                  <i className="fa-solid fa-bolt" />
                </div>
                <span className="logo-text">
                  <span className="logo-vibe">VIBE</span>
                  <span className="logo-vetting">VETTING</span>
                </span>
              </div>
              <p className="footer-tagline">AI-powered creator matching for brands that care about authenticity.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="copyright">© 2026 VibeVetting. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
