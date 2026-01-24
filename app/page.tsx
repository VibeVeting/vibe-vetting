"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const analysisMessages = [
  "Scanning 847 creators in real-time...",
  "AI computing brand impact potential...",
  "Verifying creator credibility scores...",
  "Processing audience demographics...",
  "Predicting future content performance...",
  "Analyzing values alignment matrix...",
  "Verifying audience authenticity...",
  "Evaluating content quality patterns...",
  "Mapping creator growth trajectory...",
];

const stats = [
  { value: "100+", label: "Creators Analyzed", icon: "fa-users", color: "#00f5ff" },
  { value: "5+", label: "Brands Protected", icon: "fa-shield-halved", color: "#a855f7" },
  { value: "90.9%", label: "AI Accuracy", icon: "fa-bullseye", color: "#22c55e" },
  { value: "24/7", label: "AI Monitoring", icon: "fa-clock", color: "#f59e0b" },
];

const supportedPlatforms = [
  { name: "Instagram", icon: "fa-instagram", color: "#E4405F" },
  { name: "TikTok", icon: "fa-tiktok", color: "#00f2ea" },
  { name: "YouTube", icon: "fa-youtube", color: "#FF0000" },
  { name: "Twitter", icon: "fa-twitter", color: "#1DA1F2" },
  { name: "LinkedIn", icon: "fa-linkedin-in", color: "#0A66C2" },
  { name: "Facebook", icon: "fa-facebook-f", color: "#1877F2" },
  { name: "Twitch", icon: "fa-twitch", color: "#9146FF" },
  { name: "Pinterest", icon: "fa-pinterest-p", color: "#BD081C" },
];

const features = [
  {
    icon: "fa-crosshairs",
    title: "Values Alignment",
    description: "AI analyzes every piece of content to ensure creators' values align with your brand identity.",
    gradient: "linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)",
  },
  {
    icon: "fa-brain",
    title: "Deep Analysis",
    description: "From first post to present - AI examines years of content, comments, and interactions.",
    gradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
    featured: true
  },
  {
    icon: "fa-users",
    title: "Audience Intelligence",
    description: "Verify authentic, engaged audiences matching your target demographic.",
    gradient: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
  },
  {
    icon: "fa-shield-halved",
    title: "Risk Protection",
    description: "Comprehensive AI screening eliminates creators with potential brand risks.",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
  },
  {
    icon: "fa-chart-line",
    title: "Growth Prediction",
    description: "AI predicts creator growth trajectory and future brand impact.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  },
  {
    icon: "fa-gem",
    title: "Perfect Match",
    description: "Find creators who naturally speak your brand language through AI analysis.",
    gradient: "linear-gradient(135deg, #00f5ff 0%, #a855f7 100%)",
  },
];

const matchingSteps = [
  { num: "01", name: "Deep Content Scan", info: "AI analyzes every post, story, comment for brand alignment" },
  { num: "02", name: "Voice Style Match", info: "Identifies creators whose style matches your brand voice" },
  { num: "03", name: "Risk Assessment", info: "AI screening eliminates potential brand damage with 90.9% accuracy" },
  { num: "04", name: "Audience Check", info: "Verifies authentic audiences matching your demographics" },
  { num: "05", name: "Growth Prediction", info: "Predicts creator trajectory and future impact potential" },
  { num: "06", name: "24/7 Monitoring", info: "Continuous AI tracking ensures brand alignment over time" },
];

const pricingPlans = [
  {
    name: "Explorer",
    price: "$99",
    originalPrice: "$299",
    period: "/mo",
    description: "Perfect for startups",
    features: [
      "25 vibeAI™ Analyses/month",
      "Basic Neural Safety Check",
      "2 Year History Analysis",
      "Email Support",
    ],
  },
  {
    name: "Pioneer",
    price: "$299",
    originalPrice: "$799",
    period: "/mo",
    description: "For growing brands",
    featured: true,
    features: [
      "100 vibeAI™ Analyses/month",
      "Advanced Neural Safety",
      "Complete History Analysis",
      "Priority Support",
      "Custom Brand DNA Profile",
    ],
  },
  {
    name: "Visionary",
    price: "Custom",
    period: "",
    description: "For enterprise leaders",
    features: [
      "Unlimited vibeAI™ Analyses",
      "White-label Solution",
      "Dedicated AI Engineer",
      "Custom Neural Training",
      "SLA Guarantee",
    ],
  },
];

const faqs = [
  { q: "How does vibeAI™ analyze creators?", a: "vibeAI™ analyzes every piece of content a creator has posted - examining patterns, values alignment, and predicting future behavior with 90.9% accuracy." },
  { q: "What makes vibeAI™ different?", a: "Unlike traditional tools, vibeAI™ analyzes past digital footprint to predict future performance, ensuring you partner with creators who will deliver results." },
  { q: "What platforms does vibeAI™ analyze?", a: "vibeAI™ processes data from all major platforms including Instagram, YouTube, TikTok, Twitter, LinkedIn, and emerging platforms." },
  { q: "How far back does analysis go?", a: "vibeAI™ analyzes a creator's complete digital history - from their very first post to their most recent activity, no time limit." },
  { q: "What is the beta program?", a: "Beta users get exclusive early access to vibeAI™ at discounted rates, plus direct input into feature development and priority support." },
  { q: "Can I customize the AI model?", a: "Pioneer and Visionary plans allow you to customize AI analysis based on your specific brand requirements and target criteria." },
];

const testimonials = [
  {
    quote: "vibeAI™ found us micro-creators we never would have discovered. Our engagement rates tripled in just 3 months.",
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechStartup Inc.",
    avatar: "SC",
  },
  {
    quote: "The risk assessment feature alone saved us from a potential PR disaster. Worth every penny.",
    name: "Michael Rodriguez",
    role: "Brand Manager",
    company: "Global Retail Co.",
    avatar: "MR",
  },
  {
    quote: "Finally, an AI tool that actually delivers on its promises. The accuracy is remarkable.",
    name: "Emma Watson",
    role: "CMO",
    company: "Fashion Forward",
    avatar: "EW",
  },
];

export default function LandingPage() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % analysisMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollTop / docHeight) * 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
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
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
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

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div 
          className="hero-spotlight"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(0, 245, 255, 0.06), transparent 40%)`,
          }}
        />
        <div className={`hero-container ${isVisible ? 'visible' : ''}`}>
          {/* Status Badge */}
          <div className="hero-status">
            <div className="status-badge glass">
              <span className="status-pulse" />
              <span className="status-text">vibeAI™ Now Available</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="hero-title">
            <span className="title-line">Find Creators Who</span>
            <span className="title-line title-gradient">Truly Align</span>
            <span className="title-line">With Your Brand</span>
          </h1>

          <p className="hero-subtitle">
            Our AI analyzes creators&apos; complete digital footprint to predict performance 
            and ensure perfect brand alignment. No more guesswork, just results.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <Link href="/register" className="btn-primary-glow">
              <span>Start Free Trial</span>
              <i className="fa-solid fa-arrow-right" />
            </Link>
            <Link href="#demo" className="btn-secondary-glass">
              <i className="fa-solid fa-play" />
              <span>Watch Demo</span>
            </Link>
          </div>

          {/* Stats */}
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

      {/* Supported Platforms Section */}
      <section className="trusted-section platforms-section">
        <div className="section-container">
          <p className="trusted-label">ANALYZE CREATORS ACROSS ALL MAJOR PLATFORMS</p>
          <p className="platforms-subtitle">One powerful AI, every social network covered</p>
          <div className="trusted-logos platforms-grid">
            {supportedPlatforms.map((platform, index) => (
              <div key={index} className="brand-logo platform-card glass">
                <i className={`fa-brands ${platform.icon}`} style={{ color: platform.color }} />
                <span>{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass">
              <span className="badge-pulse" />
              <span>🧠</span>
              <span>Deep AI Analysis Engine</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">Every Post, Every Action</span>
              <span className="title-sub">Analyzed by vibeAI™</span>
            </h2>
            <p className="section-desc">
              Our AI digs deep into creators&apos; complete digital footprint - analyzing years of content
              to predict future performance and ensure perfect brand alignment
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card glass ${feature.featured ? 'featured' : ''}`}>
                <div className="feature-icon-wrap" style={{ background: feature.gradient }}>
                  <i className={`fa-solid ${feature.icon}`} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section" id="how-it-works">
        <div className="section-container">
          <div className="matching-card glass">
            <div className="matching-header">
              <span className="matching-icon">🧠</span>
              <h2 className="matching-title">vibeAI™ Smart Matching Engine</h2>
              <p className="matching-subtitle">6-step AI process to find your perfect creator match</p>
            </div>

            <div className="matching-grid">
              {matchingSteps.map((step, index) => (
                <div key={index} className="matching-step glass">
                  <div className="step-number">{step.num}</div>
                  <h4 className="step-name">{step.name}</h4>
                  <p className="step-info">{step.info}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Section */}
      <section className="pipeline-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass">
              <span className="badge-pulse" />
              <span>⚡</span>
              <span>vibeAI™ Smart Engine</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">How vibeAI™ Discovers Your</span>
              <span className="title-sub">Perfect Creator Match</span>
            </h2>
          </div>

          <div className="pipeline-steps">
            <div className="pipeline-step glass">
              <div className="phase-badge">PHASE 01</div>
              <div className="step-icon-large">📊</div>
              <h3 className="step-title-large">Complete History Analysis</h3>
              <p className="step-desc-large">
                vibeAI™ processes every piece of content creators have published across all platforms - 
                examining language patterns, messaging consistency, and value alignment to predict future behavior.
              </p>
            </div>

            <div className="pipeline-connector">
              <div className="connector-line" />
              <div className="connector-icon">⚡</div>
              <div className="connector-line" />
            </div>

            <div className="pipeline-step glass">
              <div className="phase-badge">PHASE 02</div>
              <div className="step-icon-large">🎯</div>
              <h3 className="step-title-large">Values Compatibility Check</h3>
              <p className="step-desc-large">
                Our AI compares creator values, messaging tone, and content themes against your brand guidelines 
                to identify creators who naturally speak your brand language.
              </p>
            </div>

            <div className="pipeline-connector">
              <div className="connector-line" />
              <div className="connector-icon">⚡</div>
              <div className="connector-line" />
            </div>

            <div className="pipeline-step glass">
              <div className="phase-badge">PHASE 03</div>
              <div className="step-icon-large">✨</div>
              <h3 className="step-title-large">Perfect Match Verification</h3>
              <p className="step-desc-large">
                Only creators who pass comprehensive AI screening and demonstrate consistent brand value 
                enhancement potential are recommended. We guarantee 90.9% accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
        {/* <section className="testimonials-section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">
                <span className="title-gradient">What Our Clients</span>
                <span className="title-sub">Are Saying</span>
              </h2>
            </div>

            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card glass">
                  <div className="testimonial-quote">&ldquo;{testimonial.quote}&rdquo;</div>
                  <div className="testimonial-author">
                    <div className="author-avatar">{testimonial.avatar}</div>
                    <div className="author-info">
                      <div className="author-name">{testimonial.name}</div>
                      <div className="author-role">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

      {/* Pricing Section */}
      <section className="pricing-section" id="pricing">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass">
              <span className="badge-pulse" />
              <span>💎</span>
              <span>Beta Access Pricing</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">Simple, Transparent</span>
              <span className="title-sub">Pricing</span>
            </h2>
            <p className="section-desc">
              Join the future of creator intelligence at exclusive beta rates
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card glass ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <div className="pricing-badge">MOST POPULAR</div>}
                <div className="pricing-header">
                  <h3 className="pricing-name">{plan.name}</h3>
                  <div className="pricing-price">
                    {plan.price}<span>{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="original-price">{plan.originalPrice}/mo after beta</div>
                  )}
                  <p className="pricing-desc">{plan.description}</p>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <span className="check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/register" 
                  className={plan.featured ? 'pricing-btn primary' : 'pricing-btn'}
                >
                  {plan.price === "Custom" ? "Contact Us" : "Join Beta"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-gradient">Frequently Asked</span>
              <span className="title-sub">Questions</span>
            </h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item glass">
                <h4 className="faq-question">{faq.q}</h4>
                <p className="faq-answer">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="section-container">
          <div className="cta-card glass">
            <div className="cta-glow" />
            <div className="cta-badge">
              <span className="status-pulse" />
              vibeAI™ SYSTEM READY
            </div>
            <h2 className="cta-title">Join the Future of Creator Intelligence</h2>
            <p className="cta-desc">
              Be among the first to experience vibeAI™ - the next generation of 
              AI-powered creator matching technology.
            </p>
            <div className="cta-buttons">
              <Link href="/register" className="btn-primary-glow large">
                <span>🚀</span>
                <span>JOIN BETA NOW</span>
                <span className="btn-shine" />
              </Link>
              <Link href="/contact" className="btn-secondary-glass">
                <span>📞</span>
                <span>BOOK DEMO</span>
              </Link>
            </div>
            <p className="cta-note">No credit card required • Exclusive beta pricing • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                <div className="logo-icon">
                  <i className="fa-solid fa-bolt" />
                </div>
                <span className="logo-text">
                  <span className="logo-vibe">VIBE</span>
                  <span className="logo-vetting">VETTING</span>
                </span>
              </Link>
              <p className="footer-tagline">
                Powered by vibeAI™ Intelligence.<br />
                Finding your perfect creator match.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link"><i className="fa-brands fa-twitter" /></a>
                <a href="#" className="social-link"><i className="fa-brands fa-linkedin" /></a>
                <a href="#" className="social-link"><i className="fa-brands fa-instagram" /></a>
                <a href="#" className="social-link"><i className="fa-brands fa-youtube" /></a>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <a href="#features">Features</a>
                <a href="#how-it-works">How it Works</a>
                <a href="#pricing">Pricing</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="/about">About Us</a>
                <a href="/careers">Careers</a>
                <a href="/blog">Blog</a>
                <a href="/contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
                <a href="/cookies">Cookie Policy</a>
                <a href="/gdpr">GDPR</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="/help">Help Center</a>
                <a href="/docs">Documentation</a>
                <a href="/api">API Reference</a>
                <a href="/status">System Status</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 VibeVetting. Powered by vibeAI™. All rights reserved.</p>
            <div className="footer-status">
              <span className="status-dot" />
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
