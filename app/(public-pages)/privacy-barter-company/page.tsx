"use client";

import Link from 'next/link';

export default function PrivacyBarterCompanyPage() {
  return (
    <div className="barter-legal-wrapper company-privacy">
      {/* Floating Elements */}
      <div className="barter-floating-elements">
        <div className="barter-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>🔒</div>
        <div className="barter-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>🏢</div>
        <div className="barter-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>🛡️</div>
        <div className="barter-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>📊</div>
        <div className="barter-float-icon" style={{ top: '40%', left: '8%', animationDelay: '1.5s' }}>✨</div>
        <div className="barter-float-icon" style={{ top: '50%', right: '3%', animationDelay: '2.5s' }}>🔐</div>
      </div>

      <div className="barter-legal-container">
        {/* Header */}
        <div className="barter-register-header">
          <Link href="/" className="barter-back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Back to Home
          </Link>
          <div className="barter-logo">
            <div className="barter-logo-hexagon company-hex">
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
            <div className="barter-legal-badge company-badge">
              <span className="badge-icon">🔐</span>
              <span className="badge-text">Brand Privacy</span>
            </div>
            <h1>Brand Partner Privacy Policy</h1>
            <p>Last updated: January 30, 2026</p>
          </div>

          <div className="barter-legal-content">
            <section className="barter-legal-section">
              <h2><span className="section-icon">👋</span> 1. Introduction</h2>
              <p>
                This Brand Partner Privacy Policy explains how VibeVetting collects, uses, and protects 
                your company's information when you participate in our Barter Program as a Brand Partner. 
                We are committed to protecting your business data and ensuring transparency in how we 
                handle your information.
              </p>
              <p>
                This policy applies specifically to Brand Partners in the Barter Program and supplements 
                our general Privacy Policy.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📋</span> 2. Information We Collect</h2>
              
              <h3>Company Registration Information</h3>
              <ul>
                <li>Company name and legal entity type</li>
                <li>Business registration/GST number</li>
                <li>Industry and product categories</li>
                <li>Company website and social media profiles</li>
                <li>Business address and contact details</li>
              </ul>
              
              <h3>Contact Person Details</h3>
              <ul>
                <li>Name and designation of authorized representatives</li>
                <li>Email addresses and phone numbers</li>
                <li>Account login credentials (encrypted)</li>
              </ul>

              <h3>Campaign & Offer Data</h3>
              <ul>
                <li>Product information and images you upload</li>
                <li>Barter offer details and requirements</li>
                <li>Creator selection preferences and criteria</li>
                <li>Campaign performance data and analytics</li>
              </ul>

              <h3>Transaction Records</h3>
              <ul>
                <li>Shipment tracking information</li>
                <li>Creator collaboration history</li>
                <li>Content approvals and communications</li>
                <li>Payment and subscription records</li>
              </ul>

              <h3>Usage Data</h3>
              <ul>
                <li>Platform login history and activity</li>
                <li>Feature usage and navigation patterns</li>
                <li>Device and browser information</li>
                <li>IP addresses and location data</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🎯</span> 3. How We Use Your Information</h2>
              <p>We use your company information to:</p>
              <ul>
                <li>Verify your business legitimacy and eligibility</li>
                <li>Create and manage your Brand Partner account</li>
                <li>Display your brand profile to potential creator partners</li>
                <li>Process and facilitate barter collaborations</li>
                <li>Share relevant creator details when matches are made</li>
                <li>Provide customer support and resolve issues</li>
                <li>Send important updates about your campaigns</li>
                <li>Generate analytics and performance reports</li>
                <li>Improve our platform and matching algorithms</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🤝</span> 4. Information Sharing</h2>
              <p>We share your company information with:</p>
              <ul>
                <li><strong>Creators:</strong> Brand name, product details, offer information, and contact for accepted collaborations</li>
                <li><strong>Service Providers:</strong> Hosting, analytics, email services that help operate our platform</li>
                <li><strong>Payment Processors:</strong> When you subscribe to paid features</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <div className="highlight-box">
                <span className="highlight-icon">💡</span>
                <p>We never sell your company data to third-party advertisers or data brokers.</p>
              </div>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">👤</span> 5. Creator Data Access</h2>
              <p>
                When creators apply to your offers or you select them for collaborations, you will receive:
              </p>
              <ul>
                <li>Creator public profile and social media statistics</li>
                <li>Portfolio and past work samples</li>
                <li>Shipping address (after selection for product delivery only)</li>
                <li>Contact information for campaign coordination</li>
              </ul>
              <p>
                <strong>Important:</strong> Creator personal data shared with you must be used solely 
                for the purpose of fulfilling barter collaborations. Misuse of creator data is a 
                violation of these terms and may result in account termination.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🔒</span> 6. Data Security</h2>
              <p>We protect your company data with:</p>
              <ul>
                <li>Industry-standard encryption (TLS/SSL) for data in transit</li>
                <li>Encrypted database storage for sensitive information</li>
                <li>Role-based access controls limiting data access</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure cloud infrastructure with redundancy</li>
                <li>Two-factor authentication options</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">⏰</span> 7. Data Retention</h2>
              <p>We retain your company data as follows:</p>
              <ul>
                <li><strong>Active Account:</strong> Data retained while your account is active</li>
                <li><strong>Campaign Data:</strong> Kept for 3 years after campaign completion for analytics</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years for legal/tax compliance</li>
                <li><strong>Account Deletion:</strong> Core data deleted within 90 days of request</li>
                <li><strong>Backup Data:</strong> Removed from backups within 12 months</li>
              </ul>
              <p>
                Some data may be retained in anonymized form for aggregate analytics and platform improvement.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">⚙️</span> 8. Your Rights & Controls</h2>
              <p>As a Brand Partner, you have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your company data we hold</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your campaign data in common formats</li>
                <li><strong>Restriction:</strong> Limit how we process certain data</li>
                <li><strong>Objection:</strong> Opt out of certain data processing activities</li>
                <li><strong>Withdraw Consent:</strong> Revoke previously given consent</li>
              </ul>
              <p>
                To exercise these rights, contact us at privacy@vibevetting.com or use the settings 
                in your Brand Partner dashboard.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🍪</span> 9. Cookies & Tracking</h2>
              <p>
                We use cookies and similar technologies on our platform to:
              </p>
              <ul>
                <li>Remember your login sessions and preferences</li>
                <li>Analyze platform usage and performance</li>
                <li>Improve user experience and features</li>
                <li>Provide relevant recommendations</li>
              </ul>
              <p>
                You can manage cookie preferences through your browser settings. Note that disabling 
                certain cookies may affect platform functionality.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🌍</span> 10. International Data Transfers</h2>
              <p>
                Your company data may be processed in countries outside India, including:
              </p>
              <ul>
                <li>Cloud servers located in the United States</li>
                <li>Service providers operating globally</li>
              </ul>
              <p>
                We ensure appropriate safeguards are in place for international transfers, including 
                standard contractual clauses and compliance with applicable data protection regulations 
                (GDPR for EU partners, IT Act for Indian regulations).
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🏢</span> 11. Business Account Users</h2>
              <p>
                If you authorize multiple team members to access your Brand Partner account:
              </p>
              <ul>
                <li>Each user must have their own login credentials</li>
                <li>You are responsible for managing user access and permissions</li>
                <li>Activity logs may be visible to account administrators</li>
                <li>Removing a user revokes their access immediately</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🔔</span> 12. Communications</h2>
              <p>We may contact you regarding:</p>
              <ul>
                <li><strong>Transactional:</strong> Campaign updates, creator responses, content submissions</li>
                <li><strong>Service:</strong> Platform updates, policy changes, security alerts</li>
                <li><strong>Marketing:</strong> New features, tips, promotional offers (with consent)</li>
              </ul>
              <p>
                You can manage your communication preferences in your account settings. Note that you 
                cannot opt out of essential service communications.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">👶</span> 13. Children's Privacy</h2>
              <p>
                The Barter Program is designed for businesses and is not intended for individuals 
                under 18 years of age. We do not knowingly collect information from minors. If you 
                become aware that a minor has provided us with information, please contact us immediately.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🔄</span> 14. Policy Updates</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or legal requirements. We will notify you of significant changes via:
              </p>
              <ul>
                <li>Email notification to your registered address</li>
                <li>Platform notification when you log in</li>
                <li>Updated "Last modified" date on this page</li>
              </ul>
              <p>
                We encourage you to review this policy periodically. Continued use of the Barter Program 
                after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📧</span> 15. Contact Us</h2>
              <p>
                For privacy-related questions or to exercise your data rights:
              </p>
              <div className="barter-contact-box">
                <p><strong>Privacy Team:</strong> privacy@vibevetting.com</p>
                <p><strong>Brand Support:</strong> brands@vibevetting.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@vibevetting.com</p>
                <p><strong>Address:</strong> VibeVetting Inc., Bangalore, India</p>
              </div>
              <p>
                We aim to respond to all privacy inquiries within 30 days.
              </p>
            </section>
          </div>

          <div className="barter-legal-footer">
            <div className="barter-legal-links">
              <Link href="/terms-barter-company" className="barter-link">Brand Terms of Service</Link>
              <span className="separator">•</span>
              <Link href="/login-barter-company" className="barter-link">Brand Login</Link>
              <span className="separator">•</span>
              <Link href="/register-barter-company" className="barter-link">Register as Brand</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
