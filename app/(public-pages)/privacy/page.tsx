"use client";

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="brand-legal-wrapper">
      {/* Floating Elements */}
      <div className="brand-floating-elements">
        <div className="brand-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>🔒</div>
        <div className="brand-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>🛡️</div>
        <div className="brand-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>🔐</div>
        <div className="brand-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>✨</div>
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
            <h1>Privacy Policy</h1>
            <p>Last updated: January 29, 2026</p>
          </div>

          <div className="legal-content">
            <section className="legal-section">
              <h2>1. Introduction</h2>
              <p>
                VibeVetting ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                AI-powered influencer vetting platform.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>We may collect the following personal information:</p>
              <ul>
                <li>Name and email address</li>
                <li>Company name and job title</li>
                <li>Phone number</li>
                <li>Billing and payment information</li>
                <li>Profile information and preferences</li>
              </ul>
              
              <h3>Usage Information</h3>
              <p>We automatically collect certain information when you use our Service:</p>
              <ul>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Pages visited and features used</li>
                <li>Time and date of visits</li>
                <li>Referring websites or links</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain our Service</li>
                <li>Process your transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve our Service</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Send promotional communications (with your consent)</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>4. AI and Data Processing</h2>
              <p>
                Our AI-powered features analyze publicly available creator data to provide vetting scores 
                and insights. We process this data to:
              </p>
              <ul>
                <li>Generate creator authenticity scores</li>
                <li>Identify potential brand safety issues</li>
                <li>Analyze engagement patterns and audience demographics</li>
                <li>Provide matching recommendations between brands and creators</li>
              </ul>
              <p>
                We do not use your personal data to train our AI models without explicit consent.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Data Sharing and Disclosure</h2>
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Third parties that help us operate our Service</li>
                <li><strong>Business Partners:</strong> With your consent, for co-marketing activities</li>
                <li><strong>Legal Compliance:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale</li>
              </ul>
              <p>
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                information, including:
              </p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>7. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@vibevetting.com.
              </p>
            </section>

            <section className="legal-section">
              <h2>8. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to collect and track information about 
                your activity on our Service. You can instruct your browser to refuse all cookies or to 
                indicate when a cookie is being sent.
              </p>
            </section>

            <section className="legal-section">
              <h2>9. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes 
                outlined in this Privacy Policy, unless a longer retention period is required or permitted 
                by law. Account data is typically retained for the duration of your account plus 30 days 
                after deletion.
              </p>
            </section>

            <section className="legal-section">
              <h2>10. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information in compliance 
                with applicable data protection laws.
              </p>
            </section>

            <section className="legal-section">
              <h2>11. Children's Privacy</h2>
              <p>
                Our Service is not directed to individuals under 18 years of age. We do not knowingly 
                collect personal information from children. If you become aware that a child has provided 
                us with personal information, please contact us.
              </p>
            </section>

            <section className="legal-section">
              <h2>12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="legal-section">
              <h2>13. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="contact-info">
                <strong>Email:</strong> privacy@vibevetting.com<br />
                <strong>Data Protection Officer:</strong> dpo@vibevetting.com<br />
                <strong>Address:</strong> VibeVetting Inc., Bangalore, India
              </p>
            </section>
          </div>

          <div className="legal-footer">
            <div className="legal-links">
              <Link href="/terms" className="auth-link">Terms of Service</Link>
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
