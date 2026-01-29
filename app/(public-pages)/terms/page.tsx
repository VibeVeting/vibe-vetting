"use client";

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="brand-legal-wrapper">
      {/* Floating Elements */}
      <div className="brand-floating-elements">
        <div className="brand-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>📜</div>
        <div className="brand-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>⚖️</div>
        <div className="brand-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>✅</div>
        <div className="brand-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>🤝</div>
      </div>

      <div className="brand-legal-container">
        {/* Logo */}
        <div className="brand-login-logo">
          <Link href="/" className="brand-logo-link">
            <div className="brand-logo-hex">
              <div className="hex-glow"></div>
              <span className="hex-letter">V</span>
            </div>
            <span className="brand-logo-text">VibeVetting</span>
          </Link>
        </div>

        {/* Legal Card */}
        <div className="brand-legal-card">
          <div className="brand-card-header">
            <h1>Terms of Service</h1>
            <p>Last updated: January 29, 2026</p>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using VibeVetting ("the Service"), you accept and agree to be bound by the terms 
                and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Description of Service</h2>
              <p>
                VibeVetting is an AI-powered influencer vetting and creator discovery platform. Our service provides:
              </p>
              <ul>
                <li>AI-powered creator analysis and vetting</li>
                <li>Brand safety evaluation tools</li>
                <li>Campaign management and analytics</li>
                <li>Auto-negotiation features</li>
                <li>Creator-brand matching services</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. User Accounts</h2>
              <p>
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>4. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to systems or networks</li>
                <li>Engage in any activity that interferes with the Service</li>
                <li>Scrape or collect data without authorization</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>5. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by VibeVetting 
                and are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Payment Terms</h2>
              <p>
                Certain features of the Service require payment. You agree to pay all fees associated with 
                your selected plan. Fees are non-refundable except as required by law or as explicitly stated 
                in our refund policy.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Limitation of Liability</h2>
              <p>
                In no event shall VibeVetting, nor its directors, employees, partners, agents, suppliers, 
                or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other 
                intangible losses.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms. Upon 
                termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section className="legal-section">
              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                we will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="legal-section">
              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="contact-info">
                <strong>Email:</strong> legal@vibevetting.com<br />
                <strong>Address:</strong> VibeVetting Inc., Bangalore, India
              </p>
            </section>
          </div>

          <div className="legal-footer">
            <div className="legal-links">
              <Link href="/privacy" className="auth-link">Privacy Policy</Link>
              <span className="separator">•</span>
              <Link href="/login" className="auth-link">Sign In</Link>
              <span className="separator">•</span>
              <Link href="/register" className="auth-link">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
