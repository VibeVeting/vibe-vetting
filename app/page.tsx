"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

const analysisMessages = [
  "AI scanning creator digital footprint - 55 creators",
  "AI computing brand impact potential - 26 creators",
  "Verifying creator credibility score - 68 creators",
  "Processing audience demographics - 28 creators",
  "Predicting future content performance - 47 creators",
  "AI analyzing values alignment - 28 creators",
  "Verifying audience authenticity - 42 creators",
  "Evaluating content quality patterns - 28 creators",
  "Analyzing creator growth trajectory - 72 creators",
];

const stats = [
  { value: "10M+", label: "Creators Analyzed", icon: "🧠" },
  { value: "500+", label: "Brands Protected", icon: "🛡️" },
  { value: "99.9%", label: "AI Accuracy", icon: "🎯" },
  { value: "0", label: "Brand Incidents", icon: "✨" },
];

const trustedBrands = [
  "Nike", "Apple", "Google", "Amazon", "Meta", "Netflix", "Spotify", "Adobe"
];

export default function LandingPage() {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % analysisMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Floating Background Elements */}
      <div className="floating-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <span className="logo-vibe">VIBE</span>
            <span className="logo-vetting">VETTING</span>
            <span className="beta-badge">BETA</span>
          </Link>
          <div className="nav-links">
            <Link href="#matching">AI Matching</Link>
            <Link href="#protection">Brand Shield</Link>
            <Link href="#analysis">Deep Analysis</Link>
            <Link href="#find">vibeAI Engine</Link>
          </div>
          <Link href="/login" className="nav-cta">
            <span className="cta-icon">�</span> Find Creator
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badges">
            <div className="hero-badge ai-badge">
              <span className="ai-pulse"></span>
              <span className="badge-icon">🤖</span>
              vibeAI™ Powered Platform
            </div>
            <div className="hero-badge secondary">
              <span className="status-dot"></span>
              {analysisMessages[currentMessage]}
            </div>
          </div>
          
          <h1 className="hero-title">
            <span className="neon-text">NEXT-GEN</span>
            <span className="cyber-text">AI CREATOR</span>
            <span className="gradient-text">INTELLIGENCE</span>
            <span className="light-text">PLATFORM</span>
          </h1>

          <p className="hero-subtitle">
            Powered by <span className="highlight-vibe">vibeAI™</span> intelligence. Our AI analyzes past digital footprint 
            to predict future performance and find creators who perfectly align with your brand.
          </p>

          <div className="hero-buttons">
            <Link href="/campaigns/create" className="btn-hero-primary neon-btn">
              <span className="btn-icon">🚀</span> LAUNCH vibeAI
            </Link>
            <Link href="#demo" className="btn-hero-secondary cyber-btn">
              <span className="btn-icon">⚡</span> WATCH DEMO
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="stats-bar futuristic">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value-hero">{stat.value}</div>
                <div className="stat-label-hero">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="trusted-section">
        <div className="section-container">
          <p className="trusted-label">TRUSTED BY LEADING BRANDS WORLDWIDE</p>
          <div className="trusted-logos">
            {trustedBrands.map((brand, index) => (
              <div key={index} className="brand-logo">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Protection Section */}
      <section className="section-dark" id="protection">
        <div className="section-container">
          <div className="ai-indicator">
            <span className="ai-dot"></span>
            vibeAI™ BRAND PROTECTION ACTIVE
          </div>
          <h2 className="section-heading-light">AI-POWERED BRAND PROTECTION</h2>
          <p className="section-desc-light">
            Our <span className="highlight-vibe">vibeAI™</span> analyzes every post, comment, and action from a creator&apos;s entire history. 
            We scan their complete digital footprint to predict future behavior and find only those who genuinely 
            align with your brand values and will elevate your reputation.
          </p>
        </div>
      </section>

      {/* Analysis Section */}
      <section className="section-dark" id="analysis">
        <div className="section-container">
          <div className="section-badges">
            <div className="hero-badge ai-badge">
              <span className="ai-pulse"></span>
              <span className="badge-icon">🧠</span>
              Deep AI Analysis Engine
            </div>
            <div className="hero-badge secondary">
              <span className="status-dot"></span>
              {analysisMessages[(currentMessage + 2) % analysisMessages.length]}
            </div>
          </div>

          <h2 className="section-title-gradient">
            <span className="neon-text">Every Post, Every Action</span>
            <span className="cyber-text">Analyzed by vibeAI™</span>
          </h2>

          <p className="section-desc-light">
            Our AI digs deep into creators&apos; complete digital footprint - analyzing years of content 
            to predict future performance and ensure perfect brand alignment
          </p>

          {/* Feature Cards Grid */}
          <div className="feature-cards-grid">
            <div className="feature-card cyber-card">
              <div className="card-glow"></div>
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Values Alignment</h3>
              <p className="feature-desc">
                vibeAI™ analyzes every piece of content to ensure creators&apos; personal values, 
                messaging, and behavior align with your brand&apos;s identity.
              </p>
              <button className="feature-btn neon">AI MATCH</button>
            </div>

            <div className="feature-card cyber-card highlighted">
              <div className="card-glow gold"></div>
              <div className="feature-icon">🧠</div>
              <h3 className="feature-title">Digital Footprint Analysis</h3>
              <p className="feature-desc">
                From first post to present - our AI examines years of content, comments, interactions 
                to predict future behavior and identify any red flags.
              </p>
              <button className="feature-btn neon">DEEP SCAN</button>
            </div>

            <div className="feature-card cyber-card">
              <div className="card-glow"></div>
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Audience Intelligence</h3>
              <p className="feature-desc">
                AI verification ensures creators&apos; audiences match your target demographic with 
                genuinely engaged, real followers who trust the creator.
              </p>
              <button className="feature-btn neon">VERIFY</button>
            </div>

            <div className="feature-card cyber-card pink-border">
              <div className="card-glow pink"></div>
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">Zero-Risk Shield</h3>
              <p className="feature-desc">
                Comprehensive AI screening eliminates any creators with potential brand risks, ensuring 
                your partnerships are always safe and secure.
              </p>
            </div>

            <div className="feature-card cyber-card gold-border">
              <div className="card-glow gold"></div>
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">Future Performance Prediction</h3>
              <p className="feature-desc">
                vibeAI™ predicts creator growth trajectory and recommends only those who will actively 
                elevate your brand through authentic content.
              </p>
            </div>

            <div className="feature-card cyber-card cyan-border">
              <div className="card-glow cyan"></div>
              <div className="feature-icon">💎</div>
              <h3 className="feature-title">Perfect Brand Match</h3>
              <p className="feature-desc">
                Through AI analysis of communication patterns, content quality, and brand affinity, 
                we find creators who are your brand&apos;s perfect match.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Process Section */}
      <section className="section-dark" id="matching">
        <div className="section-container">
          <div className="matching-engine-card">
            <div className="hero-badge secondary floating-badge">
              <span className="status-dot"></span>
              {analysisMessages[(currentMessage + 4) % analysisMessages.length]}
            </div>
            
            <div className="matching-header">
              <span className="matching-icon">🧠</span>
              <h2 className="matching-title">vibeAI™ Smart Matching Engine</h2>
              <p className="matching-subtitle">6-step AI process to find your perfect creator match</p>
            </div>

            <div className="matching-grid">
              <div className="matching-step">
                <div className="step-badge">01</div>
                <h4 className="step-name">Deep Content Scan</h4>
                <p className="step-info">AI analyzes every post, story, comment for brand alignment patterns</p>
              </div>
              <div className="matching-step">
                <div className="step-badge">02</div>
                <h4 className="step-name">Voice Style Matching</h4>
                <p className="step-info">AI identifies creators whose communication style matches your brand voice</p>
              </div>
              <div className="matching-step">
                <div className="step-badge">03</div>
                <h4 className="step-name">Risk Assessment</h4>
                <p className="step-info">AI screening eliminates any potential brand damage with 99.9% accuracy</p>
              </div>
              <div className="matching-step">
                <div className="step-badge">04</div>
                <h4 className="step-name">Audience Verification</h4>
                <p className="step-info">AI verifies authentic, engaged audiences matching your target demographics</p>
              </div>
              <div className="matching-step">
                <div className="step-badge">05</div>
                <h4 className="step-name">Growth Prediction</h4>
                <p className="step-info">AI predicts creator growth trajectory and future brand impact potential</p>
              </div>
              <div className="matching-step">
                <div className="step-badge">06</div>
                <h4 className="step-name">24/7 Monitoring</h4>
                <p className="step-info">Continuous AI tracking ensures creators maintain brand alignment over time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Find Section */}
      <section className="section-dark" id="find">
        <div className="section-container">
          <div className="section-badges">
            <div className="hero-badge ai-badge">
              <span className="ai-pulse"></span>
              <span className="badge-icon">⚡</span>
              vibeAI™ Smart Engine
            </div>
            <div className="hero-badge secondary">
              <span className="status-dot"></span>
              {analysisMessages[(currentMessage + 6) % analysisMessages.length]}
            </div>
          </div>

          <h2 className="section-title-gradient">
            <span className="neon-text">How vibeAI™ Discovers Your</span>
            <span className="cyber-text">Perfect Creator Match</span>
          </h2>

          <p className="section-desc-light">
            Our AI analyzes complete digital history to predict future performance and ensures every 
            recommended creator will enhance your brand with <span className="highlight-vibe">99.9% accuracy</span>
          </p>

          {/* Pipeline Section */}
          <div className="pipeline-card cyber-pipeline">
            <h3 className="pipeline-title">
              <span className="emoji">🔬</span> vibeAI™ Analysis Pipeline
            </h3>

            <div className="pipeline-steps">
              <div className="pipeline-step cyber-step">
                <div className="step-number">PHASE 01</div>
                <div className="step-icon">📊</div>
                <h4 className="step-title">Complete History Analysis</h4>
                <p className="step-desc">
                  vibeAI™ processes every piece of content creators have published across all platforms - from their 
                  first post to latest activity. AI examines language patterns, messaging consistency, 
                  and value alignment to predict future behavior and ensure brand fit.
                </p>
              </div>

              <div className="step-arrow cyber-arrow">
                <span className="arrow-line"></span>
                <span className="arrow-icon">⚡</span>
                <span className="arrow-line"></span>
              </div>

              <div className="pipeline-step cyber-step">
                <div className="step-number">PHASE 02</div>
                <div className="step-icon">🎯</div>
                <h4 className="step-title">Values Compatibility Check</h4>
                <p className="step-desc">
                  Our AI compares creator values, messaging tone, and content themes against your brand guidelines 
                  to identify creators who naturally speak your brand language and share your values.
                </p>
              </div>

              <div className="step-arrow cyber-arrow">
                <span className="arrow-line"></span>
                <span className="arrow-icon">⚡</span>
                <span className="arrow-line"></span>
              </div>

              <div className="pipeline-step cyber-step">
                <div className="step-number">PHASE 03</div>
                <div className="step-icon">✨</div>
                <h4 className="step-title">Perfect Match Verification</h4>
                <p className="step-desc">
                  Only creators who pass our comprehensive AI screening and demonstrate consistent brand value 
                  enhancement potential are recommended. We guarantee 99.9% accuracy on every match.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UGC Rising Stars Section */}
      <section className="section-dark ugc-section">
        <div className="section-container">
          <div className="ai-indicator centered">
            <span className="ai-dot"></span>
            HIDDEN GEMS DISCOVERED BY vibeAI™
          </div>

          <h2 className="section-title-gradient">
            <span className="neon-text">Rising Stars:</span>
            <span className="cyber-text">UGC Creators (1K-50K)</span>
          </h2>

          <p className="section-desc-light">
            The most valuable creators aren&apos;t always the biggest. Our AI identifies <span className="highlight-vibe">micro-creators</span> with 
            extreme engagement, authentic trust, and explosive growth potential.
          </p>

          <div className="ugc-highlight-card">
            <div className="ugc-header">
              <div className="ugc-icon">💎</div>
              <div className="ugc-badge">HIGH ROI OPPORTUNITY</div>
            </div>
            
            <h3 className="ugc-title">Why Micro-Creators (1K-50K) Deliver Maximum Impact</h3>
            
            <div className="ugc-grid">
              <div className="ugc-benefit-card">
                <div className="ugc-benefit-icon">🔥</div>
                <h4>Extreme Engagement</h4>
                <p>5-10x higher engagement rates than mega-influencers. Their audience actually listens and acts.</p>
                <div className="ugc-stat">
                  <span className="ugc-stat-value">8.7%</span>
                  <span className="ugc-stat-label">Avg. Engagement Rate</span>
                </div>
              </div>
              
              <div className="ugc-benefit-card">
                <div className="ugc-benefit-icon">🤝</div>
                <h4>Authentic Trust</h4>
                <p>Deep personal connection with followers. When they recommend, their audience believes and buys.</p>
                <div className="ugc-stat">
                  <span className="ugc-stat-value">92%</span>
                  <span className="ugc-stat-label">Trust Score</span>
                </div>
              </div>
              
              <div className="ugc-benefit-card">
                <div className="ugc-benefit-icon">💪</div>
                <h4>Maximum Effort</h4>
                <p>Hungry to prove themselves. They put 10x more effort into every piece of content for your brand.</p>
                <div className="ugc-stat">
                  <span className="ugc-stat-value">3x</span>
                  <span className="ugc-stat-label">Content Output</span>
                </div>
              </div>
              
              <div className="ugc-benefit-card">
                <div className="ugc-benefit-icon">🚀</div>
                <h4>Explosive Growth Potential</h4>
                <p>Partner early. When their content blasts viral, your brand goes with them. 100x ROI potential.</p>
                <div className="ugc-stat">
                  <span className="ugc-stat-value">47%</span>
                  <span className="ugc-stat-label">Avg. Monthly Growth</span>
                </div>
              </div>
              
              <div className="ugc-benefit-card">
                <div className="ugc-benefit-icon">💰</div>
                <h4>Budget-Friendly</h4>
                <p>10-50x lower cost than mega-influencers with better conversion rates. Maximum ROI per dollar.</p>
                <div className="ugc-stat">
                  <span className="ugc-stat-value">$50-500</span>
                  <span className="ugc-stat-label">Per Post</span>
                </div>
              </div>
              
              <div className="ugc-benefit-card">
                <div className="ugc-benefit-icon">🎯</div>
                <h4>Niche Authority</h4>
                <p>Laser-focused on specific niches. Perfect for targeted campaigns that convert like crazy.</p>
                <div className="ugc-stat">
                  <span className="ugc-stat-value">4.2x</span>
                  <span className="ugc-stat-label">Conversion Rate</span>
                </div>
              </div>
            </div>

            <div className="ugc-cta">
              <p className="ugc-cta-text">
                <span className="highlight-vibe">vibeAI™</span> scans millions of micro-creators to find the hidden gems 
                with the highest growth trajectory and brand alignment score.
              </p>
              <Link href="/campaigns/create" className="neon-btn">
                <span className="btn-icon">🔍</span> DISCOVER RISING STARS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="section-dark">
        <div className="section-container">
          <div className="ai-indicator centered">
            <span className="ai-dot"></span>
            POWERED BY vibeAI™ INTELLIGENCE
          </div>
          
          <h2 className="section-title-gradient">
            <span className="cyan-text">Built on Next-Gen</span>
            <span className="neon-text">AI Technology</span>
          </h2>

          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">🧠</div>
              <h3>Smart AI</h3>
              <p>Advanced AI trained on billions of creator data points</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">⚡</div>
              <h3>Real-time Processing</h3>
              <p>Lightning-fast analysis with sub-second response times</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🔮</div>
              <h3>Predictive AI</h3>
              <p>Forecast creator growth and brand impact</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🛡️</div>
              <h3>Enterprise Security</h3>
              <p>Bank-grade protection for your brand data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Section */}
      <section className="section-dark">
        <div className="section-container">
          <div className="code-cards-grid">
            <div className="code-card">
              <div className="code-card-icon">📝</div>
              <h3 className="code-card-title cyan">Content History Analysis System</h3>
              <div className="code-block">
                <div className="code-label">Creator Analysis System</div>
                <pre className="code-content">
{`function analyzeCreatorHistory(creator) {
  const analysisResults = {
    contentConsistency: 0,
    valueAlignment: 0,
    brandSafety: 0,
    audienceQuality: 0
  };
  
  // Analyze all historical posts
  creator.posts.forEach(post => {
    analysisResults.contentConsistency += 
      checkContentQuality(post.text);
    analysisResults.valueAlignment += 
      compareWithBrandValues(post.message);
    analysisResults.brandSafety += 
      scanForRiskFactors(post.content);
  });
  
  return analysisResults;
}`}
                </pre>
              </div>
              <p className="code-card-desc">
                Comprehensive content analysis examining <span className="highlight-cyan">years of creator history</span> to ensure perfect brand alignment
              </p>
            </div>

            <div className="code-card">
              <div className="code-card-icon">🎯</div>
              <h3 className="code-card-title cyan">Brand Voice & Values Matching</h3>
              <div className="code-block">
                <div className="code-label">Creator Analysis System</div>
                <pre className="code-content">
{`function findPerfectBrandMatch(brand, creators) {
  const brandCharacteristics = {
    communicationStyle: brand.voiceTone,
    coreValues: brand.values,
    targetAudience: brand.demographics,
    contentThemes: brand.preferredTopics
  };
  
  const perfectMatches = [];
  creators.forEach(creator => {
    const matchScore = {
      voiceAlignment: calculateVoiceMatch(
        creator.style, brandCharacteristics),
      valuesSynergy: compareValues(
        creator.values, brand.values)
    };
    if (matchScore.overall > 90) {
      perfectMatches.push(creator);
    }
  });
  
  return perfectMatches;
}`}
                </pre>
              </div>
              <p className="code-card-desc">
                Advanced matching algorithms ensuring <span className="highlight-cyan">perfect brand voice alignment</span> and value compatibility
              </p>
            </div>

            <div className="code-card">
              <div className="code-card-icon">🛡️</div>
              <h3 className="code-card-title cyan">Brand Protection & Risk Assessment</h3>
              <div className="code-block">
                <div className="code-label">Creator Analysis System</div>
                <pre className="code-content">
{`function comprehensiveRiskAssessment(creator) {
  const riskFactors = {
    contentRisks: 0,
    behaviouralRisks: 0,
    associationRisks: 0,
    reputationRisks: 0
  };
  
  // Analyze all creator content
  creator.completeHistory.forEach(content => {
    riskFactors.contentRisks += 
      scanForControversialContent(content);
    riskFactors.behaviouralRisks += 
      assessBehaviouralPatterns(content);
  });
  
  return {
    overallRiskScore: calculateRisk(riskFactors),
    protectionGuarantee: 
      riskFactors.total < 5 ? 'FULL' : 'REVIEW'
  };
}`}
                </pre>
              </div>
              <p className="code-card-desc">
                Comprehensive risk screening with <span className="highlight-pink">zero-tolerance policy</span> for brand-damaging content
              </p>
            </div>

            <div className="code-card">
              <div className="code-card-icon">📈</div>
              <h3 className="code-card-title cyan">Brand Value Enhancement Prediction</h3>
              <div className="code-block">
                <div className="code-label">Creator Analysis System</div>
                <pre className="code-content">
{`function predictBrandEnhancement(creator, brand) {
  const enhancementFactors = {
    audienceOverlap: calculateOverlap(
      creator.audience, brand.target),
    engagementQuality: analyzeEngagement(
      creator.metrics),
    contentResonance: predictResonance(
      creator.style, brand.voice)
  };
  
  const projectedImpact = {
    brandAwareness: estimateAwarenessGain(),
    brandSentiment: predictSentimentShift(),
    valueEnhancement: calculateValueIncrease()
  };
  
  return {
    score: calculateEnhancementScore(),
    recommendation: 'HIGHLY_RECOMMENDED'
  };
}`}
                </pre>
              </div>
              <p className="code-card-desc">
                Predictive analytics showing <span className="highlight-gold">expected brand value enhancement</span> from each creator partnership
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section cyber-cta">
        <div className="section-container">
          <div className="ai-indicator centered">
            <span className="ai-dot"></span>
            vibeAI™ READY TO LAUNCH
          </div>
          <h2 className="cta-title neon-glow">Experience the Future of Creator Intelligence</h2>
          <p className="cta-desc">
            Join the beta program and be among the first to experience vibeAI™ powered creator matching
          </p>
          <div className="cta-buttons">
            <Link href="/register" className="btn-hero-primary neon-btn">
              <span className="btn-icon">🚀</span> JOIN BETA
            </Link>
            <Link href="/login" className="btn-hero-secondary cyber-btn">
              <span className="btn-icon">⚡</span> SIGN IN
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-dark">
        <div className="section-container">
          <h2 className="section-title-gradient">
            <span className="cyan-text">Why Brands Choose</span>
            <span className="neon-text">VibeVetting</span>
          </h2>

          <div className="benefits-grid">
            <div className="benefit-card cyber-benefit">
              <div className="benefit-icon">🧠</div>
              <h3 className="benefit-title">vibeAI™ Powered</h3>
              <p className="benefit-desc">Next-gen AI for unmatched accuracy in creator matching.</p>
            </div>
            <div className="benefit-card cyber-benefit">
              <div className="benefit-icon">⚡</div>
              <h3 className="benefit-title">Lightning Speed</h3>
              <p className="benefit-desc">Get perfect creator matches in milliseconds, not weeks of manual research.</p>
            </div>
            <div className="benefit-card cyber-benefit">
              <div className="benefit-icon">🎯</div>
              <h3 className="benefit-title">99.9% Accuracy</h3>
              <p className="benefit-desc">AI-powered matching ensures creators align with your brand values.</p>
            </div>
            <div className="benefit-card cyber-benefit">
              <div className="benefit-icon">📊</div>
              <h3 className="benefit-title">Digital Footprint Analysis</h3>
              <p className="benefit-desc">Years of content history processed to predict future behavior.</p>
            </div>
            <div className="benefit-card cyber-benefit">
              <div className="benefit-icon">🛡️</div>
              <h3 className="benefit-title">Zero-Risk Shield</h3>
              <p className="benefit-desc">Continuous AI monitoring alerts you to any potential brand risks.</p>
            </div>
            <div className="benefit-card cyber-benefit">
              <div className="benefit-icon">💎</div>
              <h3 className="benefit-title">Growth Prediction</h3>
              <p className="benefit-desc">Find creators with high growth potential before they blow up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Pricing Section */}
      <section className="pricing-section cyber-pricing" id="pricing">
        <div className="section-container">
        
          <h2 className="section-title-gradient">
            <span className="neon-text">Beta Access</span>
            <span className="cyber-text">Pricing</span>
          </h2>
          <p className="section-desc-light">Join the future of creator intelligence at exclusive beta rates</p>

          <div className="pricing-grid">
            <div className="pricing-card cyber-pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-name">Explorer</h3>
                <div className="pricing-price">$99<span>/mo</span></div>
                <div className="original-price">$299/mo after beta</div>
                <p className="pricing-desc">Perfect for startups</p>
              </div>
              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> 25 vibeAI™ Analyses/month</li>
                <li><span className="check-icon">✓</span> Basic Neural Safety Check</li>
                <li><span className="check-icon">✓</span> 2 Year History Analysis</li>
                <li><span className="check-icon">✓</span> Email Support</li>
              </ul>
              <Link href="/register" className="pricing-btn cyber-btn-outline">Join Beta</Link>
            </div>

            <div className="pricing-card cyber-pricing-card featured">
              <div className="pricing-badge neon-badge">MOST POPULAR</div>
              <div className="pricing-header">
                <h3 className="pricing-name">Pioneer</h3>
                <div className="pricing-price">$299<span>/mo</span></div>
                <div className="original-price">$799/mo after beta</div>
                <p className="pricing-desc">For growing brands</p>
              </div>
              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> 100 vibeAI™ Analyses/month</li>
                <li><span className="check-icon">✓</span> Advanced Neural Safety</li>
                <li><span className="check-icon">✓</span> Complete History Analysis</li>
                <li><span className="check-icon">✓</span> Priority Support</li>
                <li><span className="check-icon">✓</span> Custom Brand DNA Profile</li>
              </ul>
              <Link href="/register" className="pricing-btn neon-btn-full">Join Beta</Link>
            </div>

            <div className="pricing-card cyber-pricing-card">
              <div className="pricing-header">
                <h3 className="pricing-name">Visionary</h3>
                <div className="pricing-price">Custom</div>
                <p className="pricing-desc">For enterprise leaders</p>
              </div>
              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> Unlimited vibeAI™ Analyses</li>
                <li><span className="check-icon">✓</span> White-label Solution</li>
                <li><span className="check-icon">✓</span> Dedicated AI Engineer</li>
                <li><span className="check-icon">✓</span> Custom Neural Training</li>
                <li><span className="check-icon">✓</span> SLA Guarantee</li>
              </ul>
              <Link href="/contact" className="pricing-btn cyber-btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-dark">
        <div className="section-container">
          <h2 className="section-title-gradient">
            <span className="cyan-text">Frequently Asked</span>
            <span className="neon-text">Questions</span>
          </h2>

          <div className="faq-grid cyber-faq">
            <div className="faq-item cyber-faq-item">
              <h4 className="faq-question">How does vibeAI™ analyze creators?</h4>
              <p className="faq-answer">vibeAI™ analyzes every piece of content a creator has posted - their complete digital footprint - examining patterns, values alignment, and predicting future behavior with 99.9% accuracy.</p>
            </div>
            <div className="faq-item cyber-faq-item">
              <h4 className="faq-question">What makes vibeAI™ different?</h4>
              <p className="faq-answer">Unlike traditional tools, vibeAI™ analyzes past digital footprint to predict future performance, ensuring you partner with creators who will grow and deliver results.</p>
            </div>
            <div className="faq-item cyber-faq-item">
              <h4 className="faq-question">What platforms does vibeAI™ analyze?</h4>
              <p className="faq-answer">vibeAI™ processes data from all major platforms including Instagram, YouTube, TikTok, Twitter, LinkedIn, Facebook, and emerging platforms.</p>
            </div>
            <div className="faq-item cyber-faq-item">
              <h4 className="faq-question">How far back does AI analysis go?</h4>
              <p className="faq-answer">vibeAI™ analyzes a creator&apos;s complete digital history - from their very first post to their most recent activity, no time limit.</p>
            </div>
            <div className="faq-item cyber-faq-item">
              <h4 className="faq-question">What is the beta program?</h4>
              <p className="faq-answer">Beta users get exclusive early access to vibeAI™ at discounted rates, plus direct input into feature development and priority support.</p>
            </div>
            <div className="faq-item cyber-faq-item">
              <h4 className="faq-question">Can I customize the AI model?</h4>
              <p className="faq-answer">Pioneer and Visionary plans allow you to customize AI analysis based on your specific brand requirements and target criteria.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section cyber-final-cta">
        <div className="section-container">
          <div className="final-cta-card cyber-cta-card">
            <div className="cta-glow"></div>
            <div className="ai-indicator">
              <span className="ai-dot"></span>
              vibeAI™ SYSTEM ONLINE
            </div>
            <h2 className="final-cta-title neon-glow">Join the Future of Creator Intelligence</h2>
            <p className="final-cta-desc">
              Be among the first to experience vibeAI™ - the next generation of AI-powered creator matching technology.
            </p>
            <div className="cta-buttons">
              <Link href="/register" className="btn-hero-primary neon-btn large">
                <span className="btn-icon">🚀</span> JOIN BETA NOW
              </Link>
              <Link href="/contact" className="btn-hero-secondary cyber-btn">
                <span className="btn-icon">📞</span> BOOK DEMO
              </Link>
            </div>
            <p className="cta-note">No credit card required • Exclusive beta pricing • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer cyber-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">
              <span className="logo-vibe">VIBE</span>
              <span className="logo-vetting">VETTING</span>
              <span className="beta-badge small">BETA</span>
            </Link>
            <p className="footer-tagline">Powered by vibeAI™ Intelligence</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <Link href="#matching">AI Matching</Link>
              <Link href="#protection">Brand Shield</Link>
              <Link href="#analysis">Deep Analysis</Link>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/careers">Careers</Link>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 VibeVetting. Powered by vibeAI™. All rights reserved.</p>
            <div className="footer-status">
              <span className="status-indicator"></span>
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
