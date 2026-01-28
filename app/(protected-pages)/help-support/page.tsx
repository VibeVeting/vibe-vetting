"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I add creators to my campaigns?',
    answer: 'Navigate to the Creators section, use the Discover feature to find relevant creators, then click "Add to Campaign" on any creator profile. You can also import creators via CSV or add them manually.'
  },
  {
    category: 'Getting Started',
    question: 'What is the Vibe Score and how is it calculated?',
    answer: 'The Vibe Score is our AI-powered alignment metric that measures how well a creator matches your brand values. It analyzes content themes, engagement patterns, audience demographics, and brand safety factors to generate a score from 0-100.'
  },
  {
    category: 'Getting Started',
    question: 'How do I create my first campaign?',
    answer: 'Go to Campaigns → Create New Campaign. Fill in your campaign details, set your budget and timeline, define your target audience, and specify the type of creators you\'re looking for. Our AI will then help you find matching creators.'
  },
  {
    category: 'Analytics',
    question: 'How often is analytics data updated?',
    answer: 'Analytics data is refreshed every 24 hours for standard metrics. Real-time engagement metrics are updated every 6 hours. Campaign performance data updates in real-time as interactions occur.'
  },
  {
    category: 'Analytics',
    question: 'Can I export my analytics reports?',
    answer: 'Yes! You can export analytics reports in PDF, CSV, or Excel formats. Go to Analytics → Export and select your preferred format and date range. Enterprise users can also schedule automated report delivery.'
  },
  {
    category: 'Billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, UPI, and net banking. Enterprise customers can also pay via invoice with NET-30 terms.'
  },
  {
    category: 'Billing',
    question: 'How do I upgrade my plan?',
    answer: 'Go to Settings → Billing tab to view available plans and upgrade. Your new features will be available immediately, and we\'ll prorate any charges based on your billing cycle.'
  },
  {
    category: 'Billing',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time from Settings → Billing. You\'ll continue to have access until the end of your current billing period. No refunds are provided for partial months.'
  },
  {
    category: 'Contracts',
    question: 'How do digital contracts work?',
    answer: 'Our contract system allows you to create, send, and track influencer agreements digitally. Creators can sign contracts electronically, and you\'ll receive notifications when contracts are signed. All contracts are legally binding and stored securely.'
  },
  {
    category: 'Contracts',
    question: 'Can I customize contract templates?',
    answer: 'Yes! You can create custom contract templates with your specific terms, payment conditions, deliverables, and legal clauses. Go to Contracts → Templates to create and manage your templates.'
  },
  {
    category: 'Technical',
    question: 'Which social platforms do you support?',
    answer: 'We currently support Instagram, Twitter/X, LinkedIn, YouTube, and TikTok. We\'re continuously adding support for more platforms based on user demand.'
  },
  {
    category: 'Technical',
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard AES-256 encryption for all data at rest and TLS 1.3 for data in transit. We\'re SOC 2 Type II compliant and regularly undergo security audits. Your data is never shared with third parties.'
  },
];

const categories = ['All', 'Getting Started', 'Analytics', 'Billing', 'Contracts', 'Technical'];

export default function HelpSupportPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitMessage({
        type: 'success',
        text: 'Your support ticket has been submitted successfully! We\'ll get back to you within 24 hours.',
      });
      setContactForm({ subject: '', category: 'general', message: '' });
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Failed to submit ticket. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="main-content">
        <TopBar title="Help & Support" />
        
        <div className="page-content">
          {/* Hero Section */}
          <div className="help-hero">
            <div className="help-hero-content">
              <h1>How can we help you?</h1>
              <p>Search our knowledge base or browse categories below</p>
              <div className="help-search-box">
                <i className="fa-solid fa-search"></i>
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="help-quick-links">
            <div className="quick-link-card">
              <div className="quick-link-icon">
                <i className="fa-solid fa-book"></i>
              </div>
              <h3>Documentation</h3>
              <p>Explore detailed guides and tutorials</p>
            </div>
            <div className="quick-link-card">
              <div className="quick-link-icon">
                <i className="fa-solid fa-video"></i>
              </div>
              <h3>Video Tutorials</h3>
              <p>Watch step-by-step video guides</p>
            </div>
            <div className="quick-link-card">
              <div className="quick-link-icon">
                <i className="fa-solid fa-comments"></i>
              </div>
              <h3>Community</h3>
              <p>Connect with other users</p>
            </div>
            <div className="quick-link-card">
              <div className="quick-link-icon">
                <i className="fa-solid fa-headset"></i>
              </div>
              <h3>Live Chat</h3>
              <p>Talk to our support team</p>
            </div>
          </div>

          <div className="help-content-grid">
            {/* FAQ Section */}
            <div className="help-faq-section">
              <div className="section-header">
                <h2>Frequently Asked Questions</h2>
              </div>
              
              <div className="faq-categories">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`faq-category-btn ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="faq-list">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <div 
                      key={index} 
                      className={`faq-item ${expandedFAQ === index ? 'expanded' : ''}`}
                    >
                      <button 
                        className="faq-question"
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      >
                        <span>{faq.question}</span>
                        <i className={`fa-solid fa-chevron-${expandedFAQ === index ? 'up' : 'down'}`}></i>
                      </button>
                      {expandedFAQ === index && (
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <i className="fa-solid fa-search"></i>
                    <p>No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support Section */}
            <div className="help-contact-section">
              <div className="section-header">
                <h2>Contact Support</h2>
              </div>
              
              <form onSubmit={handleSubmitTicket} className="contact-form">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your issue or question in detail..."
                    rows={6}
                    required
                  />
                </div>

                {submitMessage && (
                  <div className={`form-message ${submitMessage.type}`}>
                    <i className={`fa-solid fa-${submitMessage.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                    {submitMessage.text}
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Submit Ticket
                    </>
                  )}
                </button>
              </form>

              <div className="contact-info">
                <h3>Other Ways to Reach Us</h3>
                <div className="contact-methods">
                  <div className="contact-method">
                    <i className="fa-solid fa-envelope"></i>
                    <div>
                      <span>Email</span>
                      <a href="mailto:support@vibevetting.com">support@vibevetting.com</a>
                    </div>
                  </div>
                  <div className="contact-method">
                    <i className="fa-solid fa-clock"></i>
                    <div>
                      <span>Response Time</span>
                      <p>Within 24 hours</p>
                    </div>
                  </div>
                  <div className="contact-method">
                    <i className="fa-brands fa-twitter"></i>
                    <div>
                      <span>Twitter</span>
                      <a href="https://twitter.com/vibevetting" target="_blank" rel="noopener noreferrer">@vibevetting</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .page-content {
          padding: 0 24px 24px;
        }

        .help-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 48px;
          margin-bottom: 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .help-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .help-hero-content {
          position: relative;
          z-index: 1;
        }

        .help-hero h1 {
          color: white;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .help-hero p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin: 0 0 24px;
        }

        .help-search-box {
          max-width: 500px;
          margin: 0 auto;
          position: relative;
        }

        .help-search-box i {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #667eea;
          font-size: 16px;
        }

        .help-search-box input {
          width: 100%;
          padding: 16px 20px 16px 50px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          background: #ffffff;
          color: #1a202c;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .help-search-box input:focus {
          outline: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .help-search-box input::placeholder {
          color: #a0aec0;
        }

        .help-quick-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .quick-link-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-link-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #667eea;
        }

        .quick-link-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .quick-link-icon i {
          font-size: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .quick-link-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 4px;
        }

        .quick-link-card p {
          font-size: 13px;
          color: #718096;
          margin: 0;
        }

        .help-content-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .section-header {
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
        }

        .help-faq-section {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
        }

        .faq-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .faq-category-btn {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #ffffff;
          color: #718096;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .faq-category-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .faq-category-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          background: #ffffff;
        }

        .faq-item.expanded {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .faq-question {
          width: 100%;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #1a202c;
          text-align: left;
        }

        .faq-question:hover {
          background: #f7fafc;
        }

        .faq-question i {
          color: #667eea;
          font-size: 12px;
        }

        .faq-answer {
          padding: 0 16px 16px;
          animation: fadeIn 0.2s ease;
        }

        .faq-answer p {
          font-size: 14px;
          color: #718096;
          line-height: 1.6;
          margin: 0;
        }

        .no-results {
          text-align: center;
          padding: 40px 20px;
          color: #a0aec0;
        }

        .no-results i {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .help-contact-section {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          height: fit-content;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #4a5568;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #1a202c;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #a0aec0;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .form-message {
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .form-message.success {
          background: #ecfdf5;
          color: #059669;
        }

        .form-message.error {
          background: #fef2f2;
          color: #dc2626;
        }

        .submit-btn {
          padding: 14px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .contact-info {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }

        .contact-info h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1a202c;
          margin: 0 0 16px;
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-method {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-method > i {
          width: 36px;
          height: 36px;
          background: #edf2f7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
        }

        .contact-method span {
          font-size: 11px;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }

        .contact-method a,
        .contact-method p {
          font-size: 13px;
          color: #1a202c;
          margin: 0;
          text-decoration: none;
        }

        .contact-method a:hover {
          color: #667eea;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .help-quick-links {
            grid-template-columns: repeat(2, 1fr);
          }

          .help-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .help-quick-links {
            grid-template-columns: 1fr;
          }

          .help-hero {
            padding: 32px 20px;
          }

          .help-hero h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
