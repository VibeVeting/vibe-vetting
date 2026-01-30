'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface BrandInsights {
  summary: string;
  marketPosition: string;
  brandPersonality: string[];
  targetAudience: string;
  recommendedCreatorTypes: string[];
}

interface Company {
  companyName: string;
  industry?: string;
  location?: string;
  employee_range?: string;
  total_funding_amount_usd?: number;
}

export function CompanyInfoSection() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [insights, setInsights] = useState<BrandInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 400);
    
    const fetchCompanyInfo = async () => {
      if (!user?.company) {
        setCompany({
          companyName: user?.name ? `${user.name}'s Brand` : 'Your Brand',
          industry: 'Technology',
          location: 'Global',
          employee_range: '1-10',
        });
        setInsights(getDemoInsights());
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/company?name=${encodeURIComponent(user.company)}&insights=true`);
        const data = await res.json();

        if (data.success && data.company) {
          setCompany(data.company);
          setInsights(data.insights);
        } else {
          setCompany({ companyName: user.company, industry: 'Technology' });
          setInsights(getDemoInsights());
        }
      } catch {
        setInsights(getDemoInsights());
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [user]);

  const getDemoInsights = (): BrandInsights => ({
    summary: 'A forward-thinking brand positioned for growth in the digital marketplace with AI-powered solutions.',
    marketPosition: 'Growth Stage Innovator',
    brandPersonality: ['Innovative', 'Authentic', 'Customer-Focused'],
    targetAudience: 'Tech-savvy professionals ages 25-45 who value quality and efficiency.',
    recommendedCreatorTypes: ['Thought Leaders', 'Tech Reviewers', 'Industry Experts'],
  });

  const formatFunding = (amount?: number) => {
    if (!amount) return 'Private';
    if (amount >= 1000000000) return `₹${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `₹${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <div className="yc-company-section">
        <div className="yc-company-loading">
          <div className="yc-loading-shimmer"></div>
          <div className="yc-loading-shimmer short"></div>
          <div className="yc-loading-shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`yc-company-section ${isVisible ? 'visible' : ''}`}>
      {/* Header */}
      <div className="yc-company-header">
        <div className="yc-company-title-row">
          <div className="yc-company-icon">
            <i className="fa-solid fa-building"></i>
          </div>
          <div>
            <h3>Brand Intelligence</h3>
            <span className="yc-ai-badge">
              <i className="fa-solid fa-star"></i>
              AI Insights
            </span>
          </div>
        </div>
      </div>

      {/* Company Card */}
      <div className="yc-company-card">
        <div className="yc-company-avatar">
          {company?.companyName?.charAt(0) || 'B'}
        </div>
        <div className="yc-company-info">
          <h4>{company?.companyName}</h4>
          <div className="yc-company-meta">
            {company?.industry && (
              <span className="yc-meta-item">
                <i className="fa-solid fa-briefcase"></i>
                {company.industry}
              </span>
            )}
            {company?.location && (
              <span className="yc-meta-item">
                <i className="fa-solid fa-location-dot"></i>
                {company.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="yc-company-stats">
        <div className="yc-cs-item">
          <span className="yc-cs-value">{company?.employee_range || 'N/A'}</span>
          <span className="yc-cs-label">Team</span>
        </div>
        <div className="yc-cs-divider"></div>
        <div className="yc-cs-item">
          <span className="yc-cs-value">{formatFunding(company?.total_funding_amount_usd)}</span>
          <span className="yc-cs-label">Raised</span>
        </div>
        <div className="yc-cs-divider"></div>
        <div className="yc-cs-item">
          <span className="yc-cs-value">{insights?.marketPosition?.split(' ')[0] || 'Growing'}</span>
          <span className="yc-cs-label">Stage</span>
        </div>
      </div>

      {/* AI Summary */}
      {insights?.summary && (
        <div className="yc-insight-box">
          <div className="yc-insight-header">
            <i className="fa-solid fa-brain"></i>
            <span>AI Analysis</span>
          </div>
          <p className="yc-insight-text">{insights.summary}</p>
        </div>
      )}

      {/* Brand Personality */}
      {insights?.brandPersonality && (
        <div className="yc-personality-section">
          <span className="yc-section-label">Brand Personality</span>
          <div className="yc-personality-tags">
            {insights.brandPersonality.slice(0, 4).map((trait, i) => (
              <span key={i} className="yc-personality-tag">{trait}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Creators */}
      {insights?.recommendedCreatorTypes && (
        <div className="yc-creators-section">
          <span className="yc-section-label">Ideal Creators</span>
          <ul className="yc-creator-list">
            {insights.recommendedCreatorTypes.slice(0, 3).map((type, i) => (
              <li key={i}>
                <i className="fa-solid fa-check-circle"></i>
                <span>{type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <Link href="/settings" className="yc-company-action">
        <span>Manage Brand Profile</span>
        <i className="fa-solid fa-arrow-right"></i>
      </Link>
    </div>
  );
}
