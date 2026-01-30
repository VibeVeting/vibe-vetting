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
  { value: "6", label: "Platforms", icon: "fa-globe", color: "#00f5ff" },
  { value: "AI", label: "Powered", icon: "fa-robot", color: "#22c55e" },
  { value: "7", label: "Pipeline Stages", icon: "fa-layer-group", color: "#a855f7" },
  { value: "3", label: "AI Features", icon: "fa-brain", color: "#f59e0b" },
];

// What makes us different
const differentiators = [
  {
    icon: "fa-layer-group",
    title: "7-Stage Pipeline",
    description: "Track creators from discovery to contract completion. Never lose track of negotiations or deadlines again.",
    stat: "7",
    statLabel: "Stages",
  },
  {
    icon: "fa-bolt",
    title: "Instant Results",
    description: "What takes agencies weeks, we do in seconds. Full analysis before your coffee gets cold.",
    stat: "10s",
    statLabel: "Average",
  },
  {
    icon: "fa-globe",
    title: "6 Platforms",
    description: "Instagram, YouTube, Twitter, LinkedIn, Facebook, Twitch - all in one place.",
    stat: "6",
    statLabel: "Networks",
  },
  {
    icon: "fa-file-contract",
    title: "Built-in Contracts",
    description: "Generate professional contracts instantly. No more back-and-forth with legal teams.",
    stat: "1-Click",
    statLabel: "Contracts",
  },
];



// How it works for customers - Complete Journey
const howItWorks = [
  { step: "1", title: "Discover", desc: "Find creators across 6 platforms matching your brand", icon: "fa-magnifying-glass" },
  { step: "2", title: "AI Vetting", desc: "Deep scan of content history, audience & risks", icon: "fa-brain" },
  { step: "3", title: "VibeScore", desc: "Get AI-powered brand alignment score", icon: "fa-chart-line" },
  { step: "4", title: "Add to Pipeline", desc: "Move vetted creators into your workflow", icon: "fa-layer-group" },
  { step: "5", title: "Outreach", desc: "AI writes personalized collaboration emails", icon: "fa-envelope" },
  { step: "6", title: "Negotiate", desc: "AI auto-negotiates the best rates for you", icon: "fa-handshake" },
  { step: "7", title: "Contract", desc: "Generate professional contracts instantly", icon: "fa-file-signature" },
  { step: "8", title: "Track Engagement", desc: "Monitor likes, comments, shares & audience growth", icon: "fa-chart-pie" },
];

const supportedPlatforms = [
  { name: "Instagram", icon: "fa-instagram", color: "#E4405F" },
  { name: "YouTube", icon: "fa-youtube", color: "#FF0000" },
  { name: "Twitter", icon: "fa-twitter", color: "#1DA1F2" },
  { name: "LinkedIn", icon: "fa-linkedin-in", color: "#0A66C2" },
  { name: "Facebook", icon: "fa-facebook-f", color: "#1877F2" },
  { name: "Twitch", icon: "fa-twitch", color: "#9146FF" },
];

// 🔥 SUPERPOWER FEATURES - Real features that exist in the codebase
const superpowerFeatures = [
  {
    icon: "fa-bell",
    title: "Controversy Alerts",
    headline: "Know When Creators Get Into Trouble",
    description: "Get notified when any creator in your pipeline gets into controversy, posts problematic content, or faces backlash. Take action before it hurts your brand.",
    stat: "Alerts",
    statSub: "Protection",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    badge: "PROTECTION",
  },
  {
    icon: "fa-robot",
    title: "Auto-Negotiation Bot",
    headline: "AI Negotiates Deals For You",
    description: "Set your budget. Our AI handles the entire negotiation. It knows market rates, uses smart strategies, and gets you the best price without awkward back-and-forth.",
    stat: "3",
    statSub: "Strategies",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    badge: "GAME CHANGER",
  },
  {
    icon: "fa-users-slash",
    title: "Fake Follower Detector",
    headline: "Know The Real Audience Size",
    description: "AI analyzes engagement patterns, follower growth, and interaction quality to calculate what percentage of followers are real humans vs bots. Stop paying for fake reach.",
    stat: "AI",
    statSub: "Detection",
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    badge: "SAVE MONEY",
  },
  {
    icon: "fa-envelope-open-text",
    title: "AI Outreach Writer",
    headline: "Personalized Emails That Get Replies",
    description: "AI generates custom collaboration emails based on creator's content and style. No more generic templates. Every email feels personal because AI writes it specifically for them.",
    stat: "Smart",
    statSub: "Templates",
    gradient: "linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)",
    badge: "EXCLUSIVE",
  },
];

// 💎 BARTER DEAL CREATORS - Mini & Micro Influencers Ready for Product Exchange
const barterCreatorStats = [
  { value: "Zero", label: "Upfront Cash Needed", icon: "fa-wallet" },
  { value: "Micro", label: "& Nano Creators", icon: "fa-users" },
  { value: "Real", label: "Authentic Content", icon: "fa-heart" },
  { value: "Win", label: "Win Partnerships", icon: "fa-handshake-simple" },
];

const barterBenefits = [
  {
    icon: "fa-gift",
    title: "Product = Payment",
    description: "Send your product, get authentic content. No cash exchange needed. Perfect for startups & D2C brands.",
    gradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  },
  {
    icon: "fa-gem",
    title: "Nano & Micro Focus",
    description: "1K-50K followers with 8-15% engagement rates. Their audiences trust them more than mega influencers.",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
  {
    icon: "fa-fire-flame-curved",
    title: "Hungry Creators",
    description: "Rising stars eager to prove themselves. They'll create better content because they want to grow with you.",
    gradient: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
  },
  {
    icon: "fa-filter",
    title: "Barter-Ready Filter",
    description: "Our AI flags creators who've done barter deals before and are actively seeking product collaborations.",
    gradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
  },
];

const features = [
  {
    icon: "fa-crosshairs",
    title: "Brand DNA Matching",
    description: "AI analyzes your brand identity and finds creators who naturally speak your language.",
    gradient: "linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)",
  },
  {
    icon: "fa-brain",
    title: "Complete History Scan",
    description: "From first post to present - AI examines years of content, comments, and interactions.",
    gradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
    featured: true
  },
  {
    icon: "fa-chart-line",
    title: "Growth Trajectory",
    description: "Predict which creators will blow up next. Partner before they get expensive.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  },
  {
    icon: "fa-hashtag",
    title: "Niche Expertise",
    description: "Find creators with deep expertise in your specific niche and category.",
    gradient: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
  },
  {
    icon: "fa-calendar-check",
    title: "Posting Consistency",
    description: "Analyze posting frequency and reliability. Partner with consistent creators.",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
  },
  {
    icon: "fa-comments",
    title: "Engagement Quality",
    description: "Go beyond numbers - analyze comment quality and real audience interaction.",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  },
];

// Advanced Intelligence Features (unique capabilities not in superpowers)
const advancedFeatures = [
  {
    icon: "fa-magnifying-glass-chart",
    title: "Competitor Intelligence",
    description: "See which creators your competitors work with. Find untapped talent they haven't discovered yet.",
    stat: "Intel",
    statLabel: "Advantage",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  },
  {
    icon: "fa-users-between-lines",
    title: "Audience Overlap Analysis",
    description: "Avoid paying for the same audience twice. See overlap between creators before booking both.",
    stat: "Smart",
    statLabel: "Budgeting",
    gradient: "linear-gradient(135deg, #00f5ff 0%, #0099ff 100%)",
  },
  {
    icon: "fa-magnifying-glass",
    title: "Similar Creator Finder",
    description: "Found a creator you love? AI finds more like them across all platforms instantly.",
    stat: "7",
    statLabel: "Platforms",
    gradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  },
  {
    icon: "fa-scale-balanced",
    title: "Creator Comparison",
    description: "Compare multiple creators side-by-side. Engagement, authenticity, brand safety - all in one view.",
    stat: "Side",
    statLabel: "By Side",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #eab308 100%)",
  },
  {
    icon: "fa-language",
    title: "Multi-Language Detection",
    description: "Automatically detect what languages a creator speaks. Perfect for regional and multilingual campaigns.",
    stat: "50+",
    statLabel: "Languages",
    gradient: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
  },
  {
    icon: "fa-clock-rotate-left",
    title: "Best Time to Post",
    description: "Know when a creator's audience is most active. Schedule campaigns for maximum visibility.",
    stat: "Peak",
    statLabel: "Timing",
    gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
  },
];



const pricingPlans = [
  {
    name: "Starter",
    price: "₹4,999",
    originalPrice: "₹9,999",
    period: "/mo",
    description: "For D2C brands & small teams",
    features: [
      "50 vibeAI™ Analyses/month",
      "AI Fake Follower Detection",
      "3 Year History Analysis",
      "Email & Chat Support",
      "Up to 3 team members",
    ],
  },
  {
    name: "Growth",
    price: "₹14,999",
    originalPrice: "₹29,999",
    period: "/mo",
    description: "For agencies & mid-size brands",
    featured: true,
    features: [
      "250 vibeAI™ Analyses/month",
      "Advanced Brand Safety AI",
      "Complete History Analysis",
      "Priority Support + CSM",
      "Custom Brand DNA Profile",
      "Auto-negotiation AI",
      "Up to 10 team members",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large brands & agencies",
    features: [
      "Unlimited vibeAI™ Analyses",
      "White-label Solution",
      "Dedicated AI Engineer",
      "Custom AI Model Training",
      "SLA Guarantee (99.9%)",
      "API Access & Integrations",
      "Unlimited team members",
    ],
  },
];

const faqs = [
  { q: "How does vibeAI™ analyze creators?", a: "vibeAI™ analyzes every piece of content a creator has posted - examining patterns, values alignment, and predicting future behavior with advanced AI." },
  { q: "What makes vibeAI™ different?", a: "Unlike traditional tools, vibeAI™ analyzes past digital footprint to predict future performance, ensuring you partner with creators who will deliver results." },
  { q: "What platforms does vibeAI™ analyze?", a: "vibeAI™ processes data from all major platforms including Instagram, YouTube, Twitter, LinkedIn, Facebook, Twitch and emerging platforms." },
  { q: "How far back does analysis go?", a: "vibeAI™ analyzes a creator's complete digital history - from their very first post to their most recent activity, no time limit." },
  { q: "What is the beta program?", a: "Beta users get exclusive early access to vibeAI™ at 50% discounted rates, plus direct input into feature development and priority support." },
  { q: "Can I customize the AI model?", a: "Growth and Enterprise plans allow you to customize AI analysis based on your specific brand requirements and target criteria." },
];

const testimonials: { quote: string; name: string; role: string; company: string; avatar: string }[] = [];

export default function LandingPage() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ left: number; top: number; delay: number; duration: number }>>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    // Generate particle positions on client-side only to avoid hydration mismatch
    setParticles(
      Array.from({ length: 15 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 15 + Math.random() * 20,
      }))
    );
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
        {particles.map((particle, i) => (
          <div key={i} className="particle" style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="landing-nav glass">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <div className="logo-icon-new">
              <div className="logo-hexagon">
                <div className="hex-inner">
                  <span className="hex-v">V</span>
                  <span className="hex-pulse"></span>
                </div>
              </div>
            </div>
            <span className="logo-text">
              <span className="logo-vibe">VIBE</span>
              <span className="logo-vetting">VETTING</span>
            </span>
            <span className="beta-badge">BETA</span>
          </Link>
          <div className="nav-links">
            <a href="#problem" className="nav-link">Problem</a>
            <a href="#superpowers" className="nav-link" style={{ color: '#ef4444' }}>🔥 Superpowers</a>
            <a href="#barter-deals" className="nav-link" style={{ color: '#f472b6' }}>🎁 Barter Deals</a>
            <a href="#get-started" className="nav-link" style={{ color: '#8b5cf6' }}>🚀 Get Started</a>
            <a href="#pricing" className="nav-link">Pricing</a>
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
              <span className="status-text">vibeAI™ Beta Now Live</span>
              <span className="status-sparkle">✨</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="hero-title">
            <span className="title-line">Stop Paying Influencers</span>
            <span className="title-line title-gradient">Who Hurt Your Brand</span>
          </h1>

          <p className="hero-subtitle">
            AI vets creators before you pay. Detect fake followers, hidden controversies 
            and overpriced rates instantly. <strong>Save time. Save money.</strong>
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <Link href="/register" className="btn-primary-glow">
              <span>Get Started</span>
              <i className="fa-solid fa-arrow-right" />
            </Link>
            <Link href="/book-demo" className="btn-secondary-glass">
              <i className="fa-solid fa-calendar-check" />
              <span>Book Demo</span>
            </Link>
          </div>

          {/* Live Demo Preview */}
          <div className="hero-demo-preview glass">
            <div className="demo-header">
              <div className="demo-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="demo-title">vibeAI™ Creator Analysis</span>
              <span className="demo-live-badge">
                <span className="live-dot"></span> LIVE
              </span>
            </div>
            <div className="demo-content">
              <div className="demo-creator">
                <div className="demo-avatar">👩‍🎨</div>
                <div className="demo-info">
                  <span className="demo-name">Creator Profile</span>
                  <span className="demo-platform">Instagram • 847K followers</span>
                </div>
                <div className="demo-score">
                  <span className="score-value">94</span>
                  <span className="score-label">Trust Score</span>
                </div>
              </div>
              <div className="demo-metrics">
                <div className="demo-metric safe">
                  <i className="fa-solid fa-check-circle"></i>
                  <span>Authentic Audience</span>
                  <span className="metric-value">91%</span>
                </div>
                <div className="demo-metric safe">
                  <i className="fa-solid fa-check-circle"></i>
                  <span>Brand Safety</span>
                  <span className="metric-value">Clean</span>
                </div>
                <div className="demo-metric warning">
                  <i className="fa-solid fa-exclamation-triangle"></i>
                  <span>Price vs Market</span>
                  <span className="metric-value">+15%</span>
                </div>
                <div className="demo-metric safe">
                  <i className="fa-solid fa-check-circle"></i>
                  <span>Engagement Rate</span>
                  <span className="metric-value">4.2%</span>
                </div>
              </div>
              <div className="demo-recommendation">
                <span className="rec-badge">✓ RECOMMENDED</span>
                <span className="rec-text">High-quality creator. Negotiate rate down 10-15%.</span>
              </div>
            </div>
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

      {/* Problem Section */}
      <section className="problem-section" id="problem">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <span className="badge-pulse" style={{ background: '#ef4444' }} />
              <span>🔥</span>
              <span style={{ color: '#ef4444' }}>The Problem</span>
            </div>
            <h2 className="section-title">
              <span className="title-sub">Brands Lose Money Every Day On</span>
              <span className="title-gradient" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>Bad Influencer Deals</span>
            </h2>
          </div>

          <div className="problem-grid">
            <div className="problem-card glass">
              <div className="problem-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' }}>
                <i className="fa-solid fa-users-slash" />
              </div>
              <h3>Fake Followers</h3>
              <p>40-70% of influencer audiences are bots. You pay for reach that doesn&apos;t exist.</p>
              <div className="problem-stat">Billions wasted on fake engagement</div>
            </div>

            <div className="problem-card glass">
              <div className="problem-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)' }}>
                <i className="fa-solid fa-bomb" />
              </div>
              <h3>Hidden Controversies</h3>
              <p>Creators with controversial pasts surface after you&apos;ve paid. PR disasters follow.</p>
              <div className="problem-stat">One bad creator can destroy your brand</div>
            </div>

            <div className="problem-card glass">
              <div className="problem-icon" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                <i className="fa-solid fa-money-bill-wave" />
              </div>
              <h3>Overpriced Rates</h3>
              <p>No standard rates. Creators charge whatever they want. You have no leverage.</p>
              <div className="problem-stat">Brands overpay by 30-50%</div>
            </div>

            <div className="problem-card glass">
              <div className="problem-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <i className="fa-solid fa-clock" />
              </div>
              <h3>Time Wasted</h3>
              <p>Manual research takes hours per creator. Your team is exhausted.</p>
              <div className="problem-stat">20+ hours/week on research</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 SUPERPOWER FEATURES - The Game Changers */}
      <section className="superpower-section" id="superpowers">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass superpower-badge">
              <span className="badge-pulse" style={{ background: '#ef4444' }} />
              <span>🔥</span>
              <span style={{ color: '#ef4444' }}>Only We Have This</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient superpower-title">Features So Powerful,</span>
              <span className="title-sub">You&apos;ll Wonder How You Survived Without Them</span>
            </h2>
            <p className="section-desc superpower-desc">
              These aren&apos;t just features. These are superpowers your competitors don&apos;t have.
            </p>
          </div>

          <div className="superpower-grid">
            {superpowerFeatures.map((feature, index) => (
              <div key={index} className="superpower-card glass">
                <div className="superpower-badge-label">{feature.badge}</div>
                <div className="superpower-icon" style={{ background: feature.gradient }}>
                  <i className={`fa-solid ${feature.icon}`}></i>
                </div>
                <div className="superpower-content">
                  <h3 className="superpower-card-title">{feature.title}</h3>
                  <p className="superpower-headline">{feature.headline}</p>
                  <p className="superpower-description">{feature.description}</p>
                </div>
                <div className="superpower-stat" style={{ background: feature.gradient }}>
                  <span className="stat-main">{feature.stat}</span>
                  <span className="stat-sub">{feature.statSub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="superpower-cta">
            <p className="cta-text">Stop letting competitors steal your best influencers.</p>
            <Link href="/register" className="btn-superpower">
              <span>Get These Superpowers Now</span>
              <i className="fa-solid fa-bolt"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* 💎 BARTER DEAL CREATORS - Unique USP Section */}
      <section className="barter-section" id="barter-deals">
        <div className="section-container">
          {/* Floating Elements */}
          <div className="barter-floating-icons">
            <div className="floating-icon fi-1">🎁</div>
            <div className="floating-icon fi-2">💎</div>
            <div className="floating-icon fi-3">🤝</div>
            <div className="floating-icon fi-4">✨</div>
          </div>

          <div className="barter-hero-content">
            <div className="barter-badge-container">
              <div className="barter-exclusive-badge">
                <span className="sparkle">✦</span>
                <span>SMART BRAND BUILDING</span>
                <span className="sparkle">✦</span>
              </div>
            </div>
            
            <h2 className="barter-main-title">
              <span className="barter-title-small">No Budget? No Problem</span>
              <span className="barter-title-gradient">Find Creators Who Accept</span>
              <span className="barter-title-highlight">
                <span className="highlight-icon">🎁</span>
                Barter Deals
                <span className="highlight-icon">🎁</span>
              </span>
            </h2>

            <p className="barter-subtitle">
              Find <strong>mini &amp; micro influencers</strong> who are excited to collaborate 
              for <strong>free products</strong> instead of cash. 
              Perfect for startups, D2C brands, and lean marketing teams.
            </p>

            {/* Barter Stats */}
            <div className="barter-stats-grid">
              {barterCreatorStats.map((stat, index) => (
                <div key={index} className="barter-stat-card glass">
                  <div className="barter-stat-icon">
                    <i className={`fa-solid ${stat.icon}`}></i>
                  </div>
                  <div className="barter-stat-value">{stat.value}</div>
                  <div className="barter-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How Barter Works Visual - Creative Timeline */}
          <div className="barter-flow-section">
            <h3 className="barter-flow-title">The Barter Deal Journey</h3>
            
            {/* Creative Flow Visualization */}
            <div className="barter-journey">
              <div className="journey-steps">
                <div className="journey-step">
                  <div className="step-beacon">
                    <div className="beacon-ring"></div>
                    <div className="beacon-core">🎯</div>
                  </div>
                  <div className="step-content">
                    <h4>Find Match</h4>
                    <p>AI finds creators who love your product</p>
                  </div>
                </div>
                
                <div className="journey-step">
                  <div className="step-beacon">
                    <div className="beacon-ring"></div>
                    <div className="beacon-core">📦</div>
                  </div>
                  <div className="step-content">
                    <h4>Send Product</h4>
                    <p>Ship your product to the creator</p>
                  </div>
                </div>
                
                <div className="journey-step">
                  <div className="step-beacon">
                    <div className="beacon-ring"></div>
                    <div className="beacon-core">✨</div>
                  </div>
                  <div className="step-content">
                    <h4>Create Magic</h4>
                    <p>They create authentic content</p>
                  </div>
                </div>
                
                <div className="journey-step">
                  <div className="step-beacon">
                    <div className="beacon-ring"></div>
                    <div className="beacon-core">🚀</div>
                  </div>
                  <div className="step-content">
                    <h4>You Grow</h4>
                    <p>Content goes live, audience grows</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Value Exchange Visual */}
            <div className="value-exchange-visual">
              <div className="exchange-party brand">
                <div className="party-icon">🏢</div>
                <span className="party-name">Your Brand</span>
                <div className="gives-badge">
                  <i className="fa-solid fa-gift"></i> Product
                </div>
              </div>
              
              <div className="exchange-flow">
                <div className="flow-arrow top">
                  <span>Give</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
                <div className="exchange-heart">🤝</div>
                <div className="flow-arrow bottom">
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Get</span>
                </div>
              </div>
              
              <div className="exchange-party creator">
                <div className="party-icon">🎨</div>
                <span className="party-name">Creator</span>
                <div className="gives-badge">
                  <i className="fa-solid fa-camera"></i> Content
                </div>
              </div>
            </div>
            
            <p className="barter-flow-note">
              <i className="fa-solid fa-circle-check"></i>
              Zero cash exchanged. 100% authentic content. Both parties win.
            </p>
          </div>

          {/* Barter Benefits Grid */}
          <div className="barter-benefits-grid">
            {barterBenefits.map((benefit, index) => (
              <div key={index} className="barter-benefit-card glass">
                <div className="benefit-icon-wrap" style={{ background: benefit.gradient }}>
                  <i className={`fa-solid ${benefit.icon}`}></i>
                </div>
                <h4 className="benefit-title">{benefit.title}</h4>
                <p className="benefit-desc">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Creator Showcase */}
          <div className="barter-creator-showcase glass">
            <div className="showcase-header">
              <div className="showcase-badge">
                <span className="live-pulse"></span>
                LIVE BARTER-READY CREATORS
              </div>
            </div>
            <div className="showcase-creators">
              <div className="showcase-creator">
                <div className="creator-avatar">👩‍🎨</div>
                <div className="creator-info">
                  <span className="creator-niche">Beauty & Skincare</span>
                  <span className="creator-followers">12.4K followers</span>
                </div>
                <span className="barter-tag">🎁 Barter Ready</span>
              </div>
              <div className="showcase-creator">
                <div className="creator-avatar">🧑‍💻</div>
                <div className="creator-info">
                  <span className="creator-niche">Tech Reviews</span>
                  <span className="creator-followers">8.2K followers</span>
                </div>
                <span className="barter-tag">🎁 Barter Ready</span>
              </div>
              <div className="showcase-creator">
                <div className="creator-avatar">🏃‍♀️</div>
                <div className="creator-info">
                  <span className="creator-niche">Fitness & Health</span>
                  <span className="creator-followers">23.1K followers</span>
                </div>
                <span className="barter-tag">🎁 Barter Ready</span>
              </div>
              <div className="showcase-creator">
                <div className="creator-avatar">👨‍🍳</div>
                <div className="creator-info">
                  <span className="creator-niche">Food & Cooking</span>
                  <span className="creator-followers">15.7K followers</span>
                </div>
                <span className="barter-tag">🎁 Barter Ready</span>
              </div>
              <div className="showcase-creator">
                <div className="creator-avatar">🎮</div>
                <div className="creator-info">
                  <span className="creator-niche">Gaming</span>
                  <span className="creator-followers">31.5K followers</span>
                </div>
                <span className="barter-tag">🎁 Barter Ready</span>
              </div>
              <div className="showcase-creator">
                <div className="creator-avatar">✈️</div>
                <div className="creator-info">
                  <span className="creator-niche">Travel & Lifestyle</span>
                  <span className="creator-followers">18.9K followers</span>
                </div>
                <span className="barter-tag">🎁 Barter Ready</span>
              </div>
              <div className="showcase-more">
                <div className="more-content">
                  <span className="more-icon-wrap">🚀</span>
                  <span className="more-label">Growing Fast</span>
                  <span className="more-sublabel">Join the Network</span>
                </div>
                <div className="more-arrow">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="barter-cta-section">
            <div className="barter-cta-content">
              <h3>Are You a Creator? Join Our Barter Network</h3>
              <p>Get free products from brands in exchange for authentic content you love creating.</p>
            </div>
            <Link href="/register-barter" className="barter-cta-button">
              <span className="cta-icon">🎁</span>
              <span>Join as Barter Creator</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* 🎯 GET STARTED - Choose Your Path Section */}
      <section className="choose-path-section" id="get-started">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <span className="badge-pulse" style={{ background: '#8b5cf6' }} />
              <span>🚀</span>
              <span style={{ color: '#8b5cf6' }}>Get Started</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">Choose Your Path</span>
              <span className="title-sub">Two Ways to Join the Barter Revolution</span>
            </h2>
            <p className="section-desc">
              Whether you're a brand looking for creators or a creator seeking collaborations — we've got you covered
            </p>
          </div>

          <div className="path-cards-container">
            {/* Barter Company Path */}
            <div className="path-card company-path glass">
              <div className="path-ribbon">FOR BRANDS</div>
              <div className="path-icon-wrapper company">
                <div className="path-icon-bg"></div>
                <div className="path-icon">
                  <i className="fa-solid fa-building"></i>
                </div>
                <div className="path-icon-ring"></div>
              </div>
              
              <h3 className="path-title">Barter Company</h3>
              <p className="path-subtitle">Post barter deals & find creators</p>
              
              <div className="path-how-it-works">
                <div className="path-step">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <span className="step-icon">📝</span>
                    <span className="step-text">Create Account</span>
                  </div>
                </div>
                <div className="path-arrow"><i className="fa-solid fa-chevron-down"></i></div>
                <div className="path-step">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <span className="step-icon">🎁</span>
                    <span className="step-text">Post Barter Offers</span>
                  </div>
                </div>
                <div className="path-arrow"><i className="fa-solid fa-chevron-down"></i></div>
                <div className="path-step">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <span className="step-icon">👀</span>
                    <span className="step-text">Review Applications</span>
                  </div>
                </div>
                <div className="path-arrow"><i className="fa-solid fa-chevron-down"></i></div>
                <div className="path-step">
                  <div className="step-num">4</div>
                  <div className="step-content">
                    <span className="step-icon">🤝</span>
                    <span className="step-text">Collaborate & Grow</span>
                  </div>
                </div>
              </div>

              <div className="path-benefits">
                <div className="benefit-item"><i className="fa-solid fa-check"></i> Zero cash investment</div>
                <div className="benefit-item"><i className="fa-solid fa-check"></i> AI-vetted creators</div>
                <div className="benefit-item"><i className="fa-solid fa-check"></i> Authentic content</div>
              </div>

              <div className="path-buttons">
                <Link href="/login-barter-company" className="path-btn login">
                  <i className="fa-solid fa-sign-in-alt"></i>
                  <span>Login</span>
                </Link>
                <Link href="/register-barter-company" className="path-btn register">
                  <span>Register</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* Center VS Divider */}
            <div className="path-divider">
              <div className="divider-line"></div>
              <div className="divider-circle">
                <span>OR</span>
              </div>
              <div className="divider-line"></div>
            </div>

            {/* Creator Path */}
            <div className="path-card creator-path glass">
              <div className="path-ribbon creator">FOR CREATORS</div>
              <div className="path-icon-wrapper creator">
                <div className="path-icon-bg"></div>
                <div className="path-icon">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div className="path-icon-ring"></div>
              </div>
              
              <h3 className="path-title">Barter Creator</h3>
              <p className="path-subtitle">Get free products & create content</p>
              
              <div className="path-how-it-works">
                <div className="path-step">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <span className="step-icon">✨</span>
                    <span className="step-text">Join Network</span>
                  </div>
                </div>
                <div className="path-arrow"><i className="fa-solid fa-chevron-down"></i></div>
                <div className="path-step">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <span className="step-icon">🔍</span>
                    <span className="step-text">Browse Offers</span>
                  </div>
                </div>
                <div className="path-arrow"><i className="fa-solid fa-chevron-down"></i></div>
                <div className="path-step">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <span className="step-icon">📦</span>
                    <span className="step-text">Receive Products</span>
                  </div>
                </div>
                <div className="path-arrow"><i className="fa-solid fa-chevron-down"></i></div>
                <div className="path-step">
                  <div className="step-num">4</div>
                  <div className="step-content">
                    <span className="step-icon">📸</span>
                    <span className="step-text">Create & Shine</span>
                  </div>
                </div>
              </div>

              <div className="path-benefits">
                <div className="benefit-item"><i className="fa-solid fa-check"></i> Free products</div>
                <div className="benefit-item"><i className="fa-solid fa-check"></i> Build portfolio</div>
                <div className="benefit-item"><i className="fa-solid fa-check"></i> Grow your reach</div>
              </div>

              <div className="path-buttons">
                <Link href="/login-barter" className="path-btn login creator">
                  <i className="fa-solid fa-sign-in-alt"></i>
                  <span>Login</span>
                </Link>
                <Link href="/register-barter" className="path-btn register creator">
                  <span>Register</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="path-info-banner glass">
            <div className="info-icon">💡</div>
            <div className="info-content">
              <p><strong>How does barter work?</strong> Brands send free products to creators, who create authentic content in return. No money changes hands — just great products and genuine content!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="differentiators-section" id="why-us">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass" style={{ background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)' }}>
              <span className="badge-pulse" />
              <span>✨</span>
              <span>Why Choose Us</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">Other Tools Find Creators.</span>
              <span className="title-sub">We Protect Your Brand.</span>
            </h2>
          </div>

          <div className="differentiators-grid">
            {differentiators.map((item, index) => (
              <div key={index} className="differentiator-card glass">
                <div className="diff-icon">
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <div className="diff-stat">
                  <span className="diff-stat-value">{item.stat}</span>
                  <span className="diff-stat-label">{item.statLabel}</span>
                </div>
                <h3 className="diff-title">{item.title}</h3>
                <p className="diff-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="urgency-section">
        <div className="section-container">
          <div className="urgency-banner glass">
            <div className="urgency-icon">🎯</div>
            <div className="urgency-content">
              <h3>Ready to Stop Wasting Money?</h3>
              <p>Start vetting creators <strong>today</strong>. Book a demo to see it in action.</p>
            </div>
            <Link href="/book-demo" className="urgency-cta">
              Book Demo
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
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
              <span>vibeAI™ Analysis</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">How vibeAI™ Scores Creators</span>
              <span className="title-sub">6 Dimensions of Analysis</span>
            </h2>
            <p className="section-desc">
              Every creator gets a comprehensive score based on six key factors
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

      {/* Advanced Intelligence Section - Strategic Tools */}
      <section className="advanced-section" id="advanced">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass">
              <span className="badge-pulse" />
              <span>🎯</span>
              <span>Strategic Tools</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">Outsmart Your Competition</span>
              <span className="title-sub">Data-Driven Decisions</span>
            </h2>
            <p className="section-desc">
              Make smarter partnership decisions with competitive intelligence and comparison tools
            </p>
          </div>

          <div className="advanced-grid">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="advanced-card glass">
                <div className="advanced-card-header">
                  <div className="advanced-icon" style={{ background: feature.gradient }}>
                    <i className={`fa-solid ${feature.icon}`} />
                  </div>
                  <div className="advanced-stat">
                    <span className="stat-number">{feature.stat}</span>
                    <span className="stat-text">{feature.statLabel}</span>
                  </div>
                </div>
                <h3 className="advanced-title">{feature.title}</h3>
                <p className="advanced-desc">{feature.description}</p>
                <div className="advanced-card-line" style={{ background: feature.gradient }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Animated Steps */}
      <section className="how-it-works-section animated-steps" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <span className="badge-pulse" style={{ background: '#22c55e' }} />
              <span>⚡</span>
              <span style={{ color: '#22c55e' }}>Complete Journey</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">From Discovery to Results</span>
              <span className="title-sub">Your Complete Influencer Marketing Workflow</span>
            </h2>
          </div>

          {/* Row 1: Discovery Phase (Steps 1-4) */}
          <div className="steps-row-label">
            <span className="row-label-icon"><i className="fa-solid fa-search"></i></span>
            <span>Discovery & Vetting</span>
          </div>
          <div className="steps-showcase">
            {howItWorks.slice(0, 4).map((item, index) => (
              <div key={index} className="step-showcase-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="step-visual">
                  <div className="step-orb">
                    <div className="orb-glow"></div>
                    <div className="orb-ring"></div>
                    <span className="orb-number">{item.step}</span>
                  </div>
                  {index < 3 && (
                    <div className="step-connector-line">
                      <div className="connector-flow"></div>
                    </div>
                  )}
                </div>
                <div className="step-info-card">
                  <div className="card-icon">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Execution Phase (Steps 5-8) */}
          <div className="steps-row-label row-2">
            <span className="row-label-icon"><i className="fa-solid fa-rocket"></i></span>
            <span>Outreach & Results</span>
          </div>
          <div className="steps-showcase steps-row-2">
            {howItWorks.slice(4, 8).map((item, index) => (
              <div key={index} className={`step-showcase-item step-${index + 5}`} style={{ animationDelay: `${(index + 4) * 0.1}s` }}>
                <div className="step-visual">
                  <div className="step-orb">
                    <div className="orb-glow"></div>
                    <div className="orb-ring"></div>
                    <span className="orb-number">{item.step}</span>
                  </div>
                  {index < 3 && (
                    <div className="step-connector-line">
                      <div className="connector-flow"></div>
                    </div>
                  )}
                </div>
                <div className="step-info-card">
                  <div className="card-icon">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="steps-cta">
            <Link href="/register" className="steps-cta-btn">
              <span>Start Your Journey</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="pricing">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge glass">
              <span className="badge-pulse" />
              <span>💎</span>
              <span>Beta Pricing</span>
            </div>
            <h2 className="section-title">
              <span className="title-gradient">Simple Pricing</span>
              <span className="title-sub">No Hidden Fees</span>
            </h2>
            <p className="section-desc">
              Choose the plan that fits your needs.
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
          
          <p className="gst-note">
            <span className="gst-icon">ℹ️</span>
            Prices are exclusive of 18% GST for Indian customers
          </p>
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

      {/* Final CTA Section - Ultra Premium */}
      <section className="final-cta-section">
        <div className="cta-cosmic-bg">
          <div className="cta-stars"></div>
          <div className="cta-stars cta-stars-2"></div>
          <div className="cta-nebula"></div>
          <div className="cta-nebula cta-nebula-2"></div>
        </div>
        
        <div className="section-container">
          <div className="cta-card-ultra">
            {/* Animated border */}
            <div className="cta-border-glow"></div>
            
            {/* Floating orbs */}
            <div className="cta-orb cta-orb-1"></div>
            <div className="cta-orb cta-orb-2"></div>
            <div className="cta-orb cta-orb-3"></div>
            
            {/* Content */}
            <div className="cta-inner">
              <div className="cta-badge-ultra">
                <span className="badge-icon-pulse"></span>
                <span className="badge-text">EARLY ACCESS</span>
              </div>
              
              <h2 className="cta-title-ultra">
                <span className="title-line-1">The Future of Influencer Marketing</span>
                <span className="title-line-2">
                  <span className="word-highlight">Starts Here</span>
                </span>
              </h2>
              
              <p className="cta-tagline">
                Be among the first to transform how you discover, vet, and partner with creators.
              </p>
              
              {/* Premium Features Row */}
              <div className="cta-features-row">
                <div className="cta-feature">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>AI-Powered Vetting</span>
                </div>
                <div className="cta-feature-divider"></div>
                <div className="cta-feature">
                  <i className="fa-solid fa-bolt"></i>
                  <span>Instant Analysis</span>
                </div>
                <div className="cta-feature-divider"></div>
                <div className="cta-feature">
                  <i className="fa-solid fa-handshake"></i>
                  <span>Smart Negotiation</span>
                </div>
              </div>
              
              <div className="cta-buttons-ultra">
                <Link href="/register" className="btn-ultra-primary">
                  <span className="btn-bg"></span>
                  <span className="btn-content">
                    <span>Get Early Access</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </span>
                  <span className="btn-glow"></span>
                </Link>
                <Link href="/book-demo" className="btn-ultra-secondary">
                  <span className="btn-ring"></span>
                  <i className="fa-solid fa-calendar"></i>
                  <span>Schedule Demo</span>
                </Link>
              </div>
              
              <p className="cta-subtext">
                <i className="fa-solid fa-star"></i>
                Limited beta spots available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                <div className="logo-icon-new footer-logo-icon">
                  <div className="logo-hexagon">
                    <div className="hex-inner">
                      <span className="hex-v">V</span>
                    </div>
                  </div>
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
              {/* Company, Legal, and Support columns disabled - pages not yet created
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
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="/help">Help Center</a>
                <a href="/docs">Documentation</a>
                <a href="/api">API Reference</a>
                <a href="/status">System Status</a>
              </div>
              */}
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
