"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useState, useEffect } from 'react';

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
    answer: 'We currently support Instagram, Twitter/X, LinkedIn, YouTube, Facebook, and Twitch. We\'re continuously adding support for more platforms based on user demand.'
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

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

  const quickLinks = [
    { icon: 'fa-book', title: 'Documentation', desc: 'Explore detailed guides and tutorials', color: '#667eea' },
    { icon: 'fa-video', title: 'Video Tutorials', desc: 'Watch step-by-step video guides', color: '#ec4899' },
    { icon: 'fa-comments', title: 'Community', desc: 'Connect with other users', color: '#22c55e' },
    { icon: 'fa-headset', title: 'Live Chat', desc: 'Talk to our support team', color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="yc-page">
          {/* YC Background Effects */}
          <div className="yc-page-bg">
            <div className="yc-page-orb yc-page-orb-1"></div>
            <div className="yc-page-orb yc-page-orb-2"></div>
            <div className="yc-page-grid"></div>
          </div>

          {/* YC Hero Header */}
          <div className={`yc-page-header ${isVisible ? 'visible' : ''}`} style={{ background: 'linear-gradient(135deg, rgba(var(--primary-rgb, 102, 126, 234), 0.1) 0%, rgba(var(--secondary-rgb, 118, 75, 162), 0.1) 100%)', borderRadius: '24px', padding: '48px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 50%, var(--bg-hover) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none', opacity: 0.5 }}></div>
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--gradient-primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 20px 40px var(--gradient-glow)` }}>
                <i className="fa-solid fa-circle-question" style={{ fontSize: '36px', color: 'white' }}></i>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>How can we help you?</h1>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '0 0 32px' }}>Search our knowledge base or browse categories below</p>
              <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
                <i className="fa-solid fa-search" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontSize: '16px' }}></i>
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '18px 20px 18px 50px', border: '2px solid transparent', borderRadius: '16px', fontSize: '16px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', boxShadow: `0 8px 32px var(--gradient-glow)`, transition: '0.3s' }}
                />
              </div>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {quickLinks.map((link, index) => (
              <div key={index} style={{ background: 'var(--bg-elevated)', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.3s ease', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: `${index * 0.1}s`, opacity: 0 }}>
                <div style={{ width: '56px', height: '56px', background: `${link.color}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <i className={`fa-solid ${link.icon}`} style={{ fontSize: '24px', color: link.color }}></i>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>{link.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{link.desc}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            {/* FAQ Section */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '0.4s', opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--gradient-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <i className="fa-solid fa-circle-question"></i>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Frequently Asked Questions</h2>
              </div>
              
              {/* Category Tabs */}
              <div className="yc-tabs" style={{ marginBottom: '20px', flexWrap: 'wrap' }}>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`yc-tab ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        border: `1px solid ${expandedFAQ === index ? 'rgba(102, 126, 234, 0.3)' : 'var(--border-color)'}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        background: expandedFAQ === index ? 'rgba(102, 126, 234, 0.03)' : 'transparent'
                      }}
                    >
                      <button 
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        style={{ 
                          width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                          color: 'var(--text-primary)', textAlign: 'left'
                        }}
                      >
                        <span>{faq.question}</span>
                        <i className={`fa-solid fa-chevron-${expandedFAQ === index ? 'up' : 'down'}`} style={{ color: 'var(--primary)', fontSize: '12px' }}></i>
                      </button>
                      {expandedFAQ === index && (
                        <div style={{ padding: '0 20px 16px' }}>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-search" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}></i>
                    <p style={{ margin: 0 }}>No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support Section */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', height: 'fit-content', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '0.5s', opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--gradient-success)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <i className="fa-solid fa-paper-plane"></i>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Contact Support</h2>
              </div>
              
              <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                    className="yc-filter-select"
                    style={{ width: '100%' }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {submitMessage && (
                  <div style={{ padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', background: submitMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: submitMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
                    <i className={`fa-solid fa-${submitMessage.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                    {submitMessage.text}
                  </div>
                )}

                <button type="submit" className="yc-btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
                  {isSubmitting ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</>
                  ) : (
                    <><i className="fa-solid fa-paper-plane"></i> Submit Ticket</>
                  )}
                </button>
              </form>

              {/* Contact Info */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Other Ways to Reach Us</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: 'fa-envelope', label: 'Email', value: 'support@vibevetting.com', href: 'mailto:support@vibevetting.com' },
                    { icon: 'fa-clock', label: 'Response Time', value: 'Within 24 hours' },
                    { icon: 'fa-brands fa-twitter', label: 'Twitter', value: '@vibevetting', href: 'https://twitter.com/vibevetting' },
                  ].map((contact, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667eea' }}>
                        <i className={contact.icon.startsWith('fa-brands') ? contact.icon : `fa-solid ${contact.icon}`}></i>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{contact.label}</span>
                        {contact.href ? (
                          <a href={contact.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', textDecoration: 'none' }}>{contact.value}</a>
                        ) : (
                          <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>{contact.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
