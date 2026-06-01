"use client";

import Link from 'next/link';

export default function TermsBarterCompanyPage() {
  return (
    <div className="barter-legal-wrapper company-terms">
      {/* Floating Elements */}
      <div className="barter-floating-elements">
        <div className="barter-float-icon" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>📜</div>
        <div className="barter-float-icon" style={{ top: '20%', right: '8%', animationDelay: '1s' }}>🏢</div>
        <div className="barter-float-icon" style={{ bottom: '25%', left: '3%', animationDelay: '2s' }}>📦</div>
        <div className="barter-float-icon" style={{ bottom: '15%', right: '5%', animationDelay: '0.5s' }}>🤝</div>
        <div className="barter-float-icon" style={{ top: '40%', left: '8%', animationDelay: '1.5s' }}>⚖️</div>
        <div className="barter-float-icon" style={{ top: '50%', right: '3%', animationDelay: '2.5s' }}>✅</div>
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
              <span className="badge-icon">🏢</span>
              <span className="badge-text">Barter Program - Brands</span>
            </div>
            <h1>Brand Partner Terms of Service</h1>
            <p>Last updated: January 30, 2026</p>
          </div>

          <div className="barter-legal-content">
            <section className="barter-legal-section">
              <h2><span className="section-icon">📋</span> 1. Acceptance of Terms</h2>
              <p>
                By registering as a Brand Partner in the VibeVetting Barter Program ("the Program"), 
                you agree to be bound by these Brand Partner Terms of Service. These terms govern 
                your participation as a company offering products to creators in exchange for content creation.
              </p>
              <p>
                These terms are in addition to and do not replace the general VibeVetting Terms of Service, 
                which continue to apply to your use of our platform.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🎯</span> 2. Program Overview</h2>
              <p>
                The VibeVetting Barter Program enables brands to collaborate with verified creators through 
                product-for-content exchanges. As a Brand Partner, you can:
              </p>
              <ul>
                <li>Create and publish barter offers for your products</li>
                <li>Review and select creators who apply to your campaigns</li>
                <li>Ship products to selected creators</li>
                <li>Review and approve content created by creators</li>
                <li>Access performance analytics and ROI metrics</li>
                <li>Build long-term relationships with top-performing creators</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">✅</span> 3. Brand Eligibility Requirements</h2>
              <p>To participate in the Barter Program as a Brand Partner, you must:</p>
              <ul>
                <li>Be a legally registered business entity</li>
                <li>Provide accurate company information including GST/registration details</li>
                <li>Have products that comply with all applicable laws and regulations</li>
                <li>Not deal in prohibited or restricted product categories</li>
                <li>Have the authority to bind your company to these terms</li>
                <li>Maintain accurate contact and shipping information</li>
              </ul>
              <div className="highlight-box">
                <span className="highlight-icon">⚠️</span>
                <p>We reserve the right to verify your business credentials and reject applications that do not meet our standards.</p>
              </div>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🚫</span> 4. Prohibited Products</h2>
              <p>The following product categories are NOT permitted in the Barter Program:</p>
              <ul>
                <li>Tobacco, alcohol, or cannabis products</li>
                <li>Weapons, ammunition, or explosives</li>
                <li>Adult content or products</li>
                <li>Counterfeit or unauthorized replicas</li>
                <li>Pharmaceutical drugs requiring prescription</li>
                <li>Financial instruments or cryptocurrency</li>
                <li>Multi-level marketing (MLM) products</li>
                <li>Products making unsubstantiated health claims</li>
                <li>Hazardous materials</li>
                <li>Stolen or illegally obtained goods</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📦</span> 5. Product & Shipping Obligations</h2>
              <p>As a Brand Partner, you agree to:</p>
              <ul>
                <li>Accurately describe products including value, specifications, and any limitations</li>
                <li>Ship products within the timeframe specified in your offer (typically 7-14 days)</li>
                <li>Bear all costs of shipping and handling</li>
                <li>Use reliable shipping methods with tracking capabilities</li>
                <li>Package products appropriately to prevent damage during transit</li>
                <li>Handle returns for defective products at your expense</li>
                <li>Not substitute products without creator consent</li>
              </ul>
              <p className="highlight-note">
                <span className="note-icon">💡</span>
                Failure to ship products within agreed timelines may result in penalties, reduced visibility, 
                or removal from the program.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📝</span> 6. Offer Requirements</h2>
              <p>When creating barter offers, you must:</p>
              <ul>
                <li>Provide clear and accurate product descriptions with images</li>
                <li>Specify realistic content requirements and deliverables</li>
                <li>Set reasonable deadlines for content creation (minimum 7 days)</li>
                <li>Disclose any usage rights you require for creator content</li>
                <li>Include any brand guidelines or restrictions</li>
                <li>Not request excessive deliverables relative to product value</li>
                <li>Honor all terms stated in your published offers</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🎨</span> 7. Content Rights & Usage</h2>
              <p>Regarding creator content:</p>
              <ul>
                <li>Creators retain ownership of their original content</li>
                <li>You receive a license to use approved content as specified in your offer</li>
                <li>Standard license includes social media reposts and website usage</li>
                <li>Extended usage (ads, commercials, print) requires explicit agreement</li>
                <li>You must credit creators when reposting their content</li>
                <li>Usage rights are limited to 12 months unless otherwise specified</li>
              </ul>
              <div className="highlight-box">
                <span className="highlight-icon">📢</span>
                <p>If you require exclusive or buyout rights, this must be clearly stated in your offer 
                and may require additional compensation.</p>
              </div>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📊</span> 8. Creator Selection & Communication</h2>
              <p>When working with creators:</p>
              <ul>
                <li>Review applications fairly based on stated criteria</li>
                <li>Respond to applications within 7 business days</li>
                <li>Communicate professionally and respectfully</li>
                <li>Provide constructive feedback on content submissions</li>
                <li>Not make unreasonable revision requests</li>
                <li>Not discriminate based on protected characteristics</li>
                <li>Report any policy violations through proper channels</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">💳</span> 9. Fees & Payments</h2>
              <p>Regarding program fees:</p>
              <ul>
                <li>Basic barter offer listing is free during the beta period</li>
                <li>Premium features may require subscription or per-use fees</li>
                <li>Applicable platform fees will be clearly disclosed</li>
                <li>You are responsible for all product and shipping costs</li>
                <li>Any paid campaigns are non-refundable once creators are selected</li>
                <li>GST/taxes apply as per applicable laws</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">⭐</span> 10. Brand Ratings & Performance</h2>
              <p>Your performance as a Brand Partner affects your visibility and opportunities:</p>
              <ul>
                <li>Creators can rate their experience working with you</li>
                <li>Timely shipping improves your brand score</li>
                <li>Quick responses and fair reviews boost your ranking</li>
                <li>Negative feedback may reduce your visibility to creators</li>
                <li>Consistent policy violations will result in account restrictions</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🛡️</span> 11. Compliance & Legal Requirements</h2>
              <p>You agree to comply with:</p>
              <ul>
                <li>All applicable advertising and marketing laws</li>
                <li>FTC guidelines and ASCI guidelines for influencer marketing</li>
                <li>Consumer protection regulations</li>
                <li>Data protection and privacy laws</li>
                <li>Product safety and labeling requirements</li>
                <li>Tax and GST obligations</li>
              </ul>
              <p>
                You are responsible for ensuring your products and marketing comply with all applicable laws 
                in the jurisdictions where creators will promote them.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🔒</span> 12. Confidentiality</h2>
              <p>
                You agree to keep confidential any non-public information about creators, including:
              </p>
              <ul>
                <li>Personal contact information</li>
                <li>Shipping addresses</li>
                <li>Financial or payment details</li>
                <li>Private communications</li>
              </ul>
              <p>
                This information is provided solely for the purpose of fulfilling barter collaborations 
                and must not be used for any other purpose or shared with third parties.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">⚡</span> 13. Dispute Resolution</h2>
              <p>In case of disputes with creators:</p>
              <ul>
                <li>First attempt to resolve directly through platform messaging</li>
                <li>Submit dispute to VibeVetting for mediation if unresolved</li>
                <li>Provide documentation and evidence to support your position</li>
                <li>Accept VibeVetting's final decision in mediation</li>
                <li>Legal action should be a last resort after exhausting platform processes</li>
              </ul>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">⚠️</span> 14. Termination & Suspension</h2>
              <p>We may suspend or terminate your Brand Partner account for:</p>
              <ul>
                <li>Violation of these terms or platform policies</li>
                <li>Fraudulent or deceptive practices</li>
                <li>Failure to fulfill product shipment obligations</li>
                <li>Consistently poor ratings from creators</li>
                <li>Offering prohibited products</li>
                <li>Harassment or unprofessional conduct</li>
                <li>Any activity that damages the platform or its users</li>
              </ul>
              <p>
                Upon termination, you must fulfill all pending obligations to creators. We reserve the 
                right to terminate accounts without notice in cases of serious violations.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📜</span> 15. Limitation of Liability</h2>
              <p>
                VibeVetting acts as a platform connecting brands with creators. We are not responsible for:
              </p>
              <ul>
                <li>Quality or accuracy of content created by creators</li>
                <li>Performance or reach of creator content</li>
                <li>Losses due to shipping delays or product damage</li>
                <li>Disputes between brands and creators</li>
                <li>Third-party claims arising from your products</li>
              </ul>
              <p>
                You agree to indemnify VibeVetting against any claims arising from your use of the program 
                or your products.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">🔄</span> 16. Changes to Terms</h2>
              <p>
                We may update these Brand Partner Terms from time to time. We will notify you of significant 
                changes via email or platform notification. Continued participation in the Barter Program 
                after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="barter-legal-section">
              <h2><span className="section-icon">📧</span> 17. Contact Us</h2>
              <p>
                For questions about these Brand Partner Terms:
              </p>
              <div className="barter-contact-box">
                <p><strong>Email:</strong> brands@vibevetting.com</p>
                <p><strong>Support:</strong> barter-brands@vibevetting.com</p>
                <p><strong>Legal:</strong> legal@vibevetting.com</p>
                <p><strong>Address:</strong> VibeVetting Inc., Bangalore, India</p>
              </div>
            </section>
          </div>

          <div className="barter-legal-footer">
            <div className="barter-legal-links">
              <Link href="/privacy-barter-company" className="barter-link">Brand Privacy Policy</Link>
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
