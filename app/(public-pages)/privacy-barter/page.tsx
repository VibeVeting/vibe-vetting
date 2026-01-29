"use client";

import Link from 'next/link';

export default function PrivacyBarterPage() {
  return (
    <div className="barter-legal-wrapper">
      {/* Floating Elements */}
      <div className="barter-floating-elements">
        <div className="barter-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>🔒</div>
        <div className="barter-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>🛡️</div>
        <div className="barter-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>🎁</div>
        <div className="barter-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>✨</div>
      </div>

      <div className="barter-legal-container">
        {/* Header */}
        <div className="barter-register-header">
          <Link href="/" className="barter-back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Back to Home
          </Link>
          <div className="barter-logo">
            <div className="barter-logo-hexagon">
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

        {/* Legal Card */}
        <div className="barter-legal-card">
          <div className="barter-legal-header">
            <div className="barter-legal-badge">
              <span className="badge-icon">🔐</span>
              <span className="badge-text">Creator Privacy</span>
            </div>
            <h1>Creator Privacy Policy</h1>
            <p>Last updated: January 29, 2026</p>
          </div>

          <div className="barter-legal-content">
            <section className="barter-legal-section">
              <h2><span className="section-icon">👋</span> 1. Introduction</h2>
              <p>
                This Creator Privacy Policy explains how VibeVetting collects, uses, and protects your 
                personal information when you participate in our Barter Program as a content creator. 
                We are committed to protecting your privacy and ensuring transparency in how we handle your data.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📋</span> 2. Information We Collect</h2>
              <h3>Account Information</h3>
              <ul>
                <li>Full name and email address</li>
                <li>Password (encrypted)</li>
                <li>Profile photo</li>
                <li>City/location for shipping purposes</li>
              </ul>
              
              <h3>Creator Profile Data</h3>
              <ul>
                <li>Social media handles and profile URLs</li>
                <li>Follower counts and engagement metrics</li>
                <li>Content niche and categories</li>
                <li>Portfolio and past work samples</li>
              </ul>

              <h3>Shipping Information</h3>
              <ul>
                <li>Full shipping address</li>
                <li>Phone number for delivery notifications</li>
              </ul>

              <h3>Activity Data</h3>
              <ul>
                <li>Barter offers you apply to and accept</li>
                <li>Content submissions and their status</li>
                <li>Communication with brands</li>
                <li>Platform usage and interaction history</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🎯</span> 3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Match you with relevant brand opportunities</li>
                <li>Facilitate product shipments to your address</li>
                <li>Communicate about offers, deadlines, and updates</li>
                <li>Verify your social media presence and metrics</li>
                <li>Calculate your creator score and ratings</li>
                <li>Improve our matching algorithms</li>
                <li>Prevent fraud and ensure platform integrity</li>
                <li>Send you promotional updates (with consent)</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🤝</span> 4. Information Sharing</h2>
              <p>We share your information with:</p>
              <ul>
                <li><strong>Partner Brands:</strong> Your public profile, social stats, and shipping address (when you accept an offer)</li>
                <li><strong>Shipping Partners:</strong> Delivery address and contact information</li>
                <li><strong>Service Providers:</strong> Third parties that help operate our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="highlight-note">
                <span className="note-icon">💡</span>
                We never sell your personal data to third parties.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📱</span> 5. Social Media Data</h2>
              <p>
                When you connect your social media accounts, we may access:
              </p>
              <ul>
                <li>Public profile information</li>
                <li>Follower and following counts</li>
                <li>Public post engagement metrics</li>
                <li>Content categories and themes</li>
              </ul>
              <p>
                We use this data to verify your creator profile and help brands find the right matches. 
                We do not post on your behalf without explicit permission.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🔒</span> 6. Data Security</h2>
              <p>We protect your data with:</p>
              <ul>
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure servers with regular security audits</li>
                <li>Access controls limiting who can view your information</li>
                <li>Two-factor authentication options</li>
                <li>Regular security training for our team</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">⚙️</span> 7. Your Rights & Controls</h2>
              <p>As a creator, you can:</p>
              <ul>
                <li>Access and download your personal data</li>
                <li>Update or correct your profile information</li>
                <li>Control visibility settings for your profile</li>
                <li>Opt out of promotional communications</li>
                <li>Request deletion of your account and data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
              <p>
                To exercise these rights, visit your account settings or contact privacy@vibevetting.com.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🍪</span> 8. Cookies & Tracking</h2>
              <p>
                We use cookies and similar technologies to remember your preferences, analyze platform usage, 
                and improve your experience. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📦</span> 9. Data Retention</h2>
              <p>
                We retain your creator profile data for as long as your account is active. After account 
                deletion, we may retain anonymized data for analytics and certain records as required by law. 
                Shipping records are kept for 2 years for customer service purposes.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🌍</span> 10. International Creators</h2>
              <p>
                If you're located outside the United States, your data may be transferred to and processed 
                in the US. We ensure appropriate safeguards are in place to protect your information in 
                compliance with applicable data protection laws, including GDPR where applicable.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🔄</span> 11. Policy Updates</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant 
                changes via email or through the platform. Continued use of the Barter Program after 
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📧</span> 12. Contact Us</h2>
              <p>
                For privacy-related questions or concerns:
              </p>
              <div className="barter-contact-box">
                <p><strong>Privacy Team:</strong> privacy@vibevetting.com</p>
                <p><strong>Creator Support:</strong> creators@vibevetting.com</p>
                <p><strong>Data Protection:</strong> dpo@vibevetting.com</p>
                <p><strong>Address:</strong> VibeVetting Inc., Bangalore, India</p>
              </div>
            </section>
          </div>

          <div className="barter-legal-footer">
            <div className="barter-legal-links">
              <Link href="/terms-barter" className="barter-link">Terms of Service</Link>
              <span className="separator">•</span>
              <Link href="/login-barter" className="barter-link">Creator Login</Link>
              <span className="separator">•</span>
              <Link href="/register-barter" className="barter-link">Join as Creator</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
