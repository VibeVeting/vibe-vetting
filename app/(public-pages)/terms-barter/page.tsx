"use client";

import Link from 'next/link';

export default function TermsBarterPage() {
  return (
    <div className="barter-legal-wrapper">
      {/* Floating Elements */}
      <div className="barter-floating-elements">
        <div className="barter-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>📜</div>
        <div className="barter-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>⚖️</div>
        <div className="barter-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>🎁</div>
        <div className="barter-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>🤝</div>
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
              <span className="badge-icon">🎁</span>
              <span className="badge-text">Barter Program</span>
            </div>
            <h1>Creator Terms of Service</h1>
            <p>Last updated: January 29, 2026</p>
          </div>

          <div className="barter-legal-content">
            <section className="barter-legal-section">
              <h2><span className="section-icon">📋</span> 1. Acceptance of Terms</h2>
              <p>
                By participating in the VibeVetting Barter Program ("the Program"), you agree to be bound 
                by these Creator Terms of Service. These terms apply specifically to creators who participate 
                in product-for-content exchanges with brands through our platform.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🎁</span> 2. Barter Program Overview</h2>
              <p>
                The VibeVetting Barter Program connects creators with brands for product-based collaborations. 
                As a participating creator, you will:
              </p>
              <ul>
                <li>Receive free products from partner brands</li>
                <li>Create and publish authentic content featuring received products</li>
                <li>Submit content for brand review and approval</li>
                <li>Maintain transparency about sponsored relationships</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">✅</span> 3. Creator Eligibility</h2>
              <p>To participate in the Barter Program, you must:</p>
              <ul>
                <li>Be at least 18 years old</li>
                <li>Have an active social media presence with minimum 1,000 followers</li>
                <li>Provide accurate information about your following and engagement</li>
                <li>Maintain authentic, organic follower growth</li>
                <li>Comply with platform-specific terms of service</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📸</span> 4. Content Requirements</h2>
              <p>When creating content for barter collaborations, you agree to:</p>
              <ul>
                <li>Create original, high-quality content that authentically showcases the product</li>
                <li>Follow brand guidelines and creative briefs provided</li>
                <li>Submit content within agreed-upon deadlines</li>
                <li>Include proper disclosures (e.g., #gifted, #ad) as required by law</li>
                <li>Not edit or delete published content without brand approval</li>
                <li>Grant brands license to reuse and repurpose your content</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🚫</span> 5. Prohibited Activities</h2>
              <p>Creators in the Barter Program may not:</p>
              <ul>
                <li>Provide false or misleading information about metrics</li>
                <li>Use fake followers, bots, or engagement pods</li>
                <li>Accept products with intent not to create content</li>
                <li>Sell or transfer received products</li>
                <li>Create content that is harmful, offensive, or misleading</li>
                <li>Violate intellectual property or third-party rights</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📦</span> 6. Product Shipments</h2>
              <p>Regarding product deliveries:</p>
              <ul>
                <li>Products are shipped to the address you provide</li>
                <li>You are responsible for ensuring accurate shipping information</li>
                <li>Delivery times may vary based on brand and location</li>
                <li>Products become your property upon successful content completion</li>
                <li>Damaged or lost shipments should be reported immediately</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">⭐</span> 7. Creator Ratings & Standing</h2>
              <p>
                Your performance in the Program affects your creator score and future opportunities:
              </p>
              <ul>
                <li>Timely content submissions improve your standing</li>
                <li>Quality content leads to better brand matches</li>
                <li>Violations may result in reduced opportunities or removal</li>
                <li>Brands can rate your collaboration experience</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🔒</span> 8. Intellectual Property</h2>
              <p>
                By submitting content, you grant VibeVetting and the associated brand a non-exclusive, 
                royalty-free license to use, reproduce, and display your content for marketing purposes. 
                You retain ownership of your original creative work.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">⚠️</span> 9. Account Termination</h2>
              <p>
                We reserve the right to suspend or terminate your participation in the Barter Program 
                for violations of these terms, fraudulent activity, or at our discretion. Upon termination, 
                pending collaborations may be cancelled.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📧</span> 10. Contact Us</h2>
              <p>
                For questions about the Barter Program Terms:
              </p>
              <div className="barter-contact-box">
                <p><strong>Email:</strong> creators@vibevetting.com</p>
                <p><strong>Support:</strong> barter-support@vibevetting.com</p>
                <p><strong>Address:</strong> VibeVetting Inc., Bangalore, India</p>
              </div>
            </section>
          </div>

          <div className="barter-legal-footer">
            <div className="barter-legal-links">
              <Link href="/privacy-barter" className="barter-link">Privacy Policy</Link>
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
