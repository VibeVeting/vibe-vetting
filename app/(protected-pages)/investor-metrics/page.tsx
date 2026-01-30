"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CompanyData {
  companyName: string;
  industry?: string;
  brandVoice?: string;
  targetAudience?: string;
  brandSafetyScore?: number;
  blueprintLocked?: boolean;
  blueprintLockedAt?: string;
  blueprintLockedBy?: string;
  riskTolerance?: {
    politicalContent?: string;
    financialAdvice?: string;
    humorSatire?: string;
    cryptoHighRisk?: string;
  };
  brandInsights?: {
    summary?: string;
    values?: string[];
    targetAudience?: string;
    brandVoice?: string;
  };
}

export default function InvestorMetricsPage() {
  const [stats, setStats] = useState<any>(null);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [lockingBlueprint, setLockingBlueprint] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleToggleBlueprintLock = async () => {
    if (!company) return;
    
    setLockingBlueprint(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/company/lock-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: company.companyName,
          locked: !company.blueprintLocked,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCompany({
          ...company,
          blueprintLocked: data.company.blueprintLocked,
          blueprintLockedAt: data.company.blueprintLockedAt,
          blueprintLockedBy: data.company.blueprintLockedBy,
        });
      } else {
        console.error('Failed to toggle blueprint lock');
      }
    } catch (error) {
      console.error('Error toggling blueprint lock:', error);
    } finally {
      setLockingBlueprint(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token) return;

        const statsResponse = await fetch('/api/user/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data.stats);
        }

        if (user) {
          const userData = JSON.parse(user);
          if (userData.companyName) {
            const companyResponse = await fetch(`/api/company?name=${encodeURIComponent(userData.companyName)}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });

            if (companyResponse.ok) {
              const companyData = await companyResponse.json();
              setCompany(companyData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setCompanyLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpis = [
    { label: 'Verified Creators', value: loading ? '...' : (stats?.totalCreatorsVerified?.toString() || '0'), icon: 'fa-users', color: '#22c55e' },
    { label: 'Active Campaigns', value: loading ? '...' : (stats?.activeCampaigns?.toString() || '0'), icon: 'fa-bullhorn', color: '#667eea' },
    { label: 'Avg. Score', value: loading ? '...' : `${stats?.avgAlignmentScore?.toFixed(0) || 0}%`, icon: 'fa-percent', color: '#f59e0b' },
    { label: 'High Risk', value: loading ? '...' : (stats?.highRiskDetected?.toString() || '0'), icon: 'fa-triangle-exclamation', color: '#ef4444' },
  ];

  const getBrandSafetyData = () => {
    if (!company?.brandSafetyScore) {
      return { score: null, label: null, color: '#667eea' };
    }
    const score = company.brandSafetyScore;
    let label = 'Good';
    let color = '#22c55e';
    if (score >= 90) { label = 'Excellent'; color = '#22c55e'; }
    else if (score >= 80) { label = 'Very Good'; color = '#22c55e'; }
    else if (score >= 70) { label = 'Good'; color = '#f59e0b'; }
    else if (score >= 60) { label = 'Fair'; color = '#f59e0b'; }
    else { label = 'Needs Improvement'; color = '#ef4444'; }
    return { score, label, color };
  };

  const brandSafety = getBrandSafetyData();

  const getRiskItems = () => {
    if (!company?.riskTolerance) {
      return [
        { title: 'Political Content', level: 'unset', label: 'Not Set' },
        { title: 'Financial Advice', level: 'unset', label: 'Not Set' },
        { title: 'Humor / Satire', level: 'unset', label: 'Not Set' },
        { title: 'Crypto / High Risk', level: 'unset', label: 'Not Set' },
      ];
    }
    return [
      { title: 'Political Content', level: company.riskTolerance.politicalContent === 'Not Allowed' ? 'high' : company.riskTolerance.politicalContent === 'With Disclaimers' ? 'medium' : 'low', label: company.riskTolerance.politicalContent || 'Not Set' },
      { title: 'Financial Advice', level: company.riskTolerance.financialAdvice === 'Not Allowed' ? 'high' : company.riskTolerance.financialAdvice === 'With Disclaimers' ? 'medium' : 'low', label: company.riskTolerance.financialAdvice || 'Not Set' },
      { title: 'Humor / Satire', level: company.riskTolerance.humorSatire === 'Not Allowed' ? 'high' : company.riskTolerance.humorSatire === 'With Disclaimers' ? 'medium' : 'low', label: company.riskTolerance.humorSatire || 'Not Set' },
      { title: 'Crypto / High Risk', level: company.riskTolerance.cryptoHighRisk === 'Not Allowed' ? 'high' : company.riskTolerance.cryptoHighRisk === 'With Disclaimers' ? 'medium' : 'low', label: company.riskTolerance.cryptoHighRisk || 'Not Set' },
    ];
  };

  const riskItems = getRiskItems();

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

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

          {/* YC Page Header */}
          <div className={`yc-page-header ${isVisible ? 'visible' : ''}`}>
            <div className="yc-page-header-content">
              <div className="yc-page-title-section">
                <div className="yc-page-icon yc-page-icon-purple">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h1 className="yc-page-title">Brand Compatibility & Risk</h1>
                  <p className="yc-page-subtitle">Digital brand blueprint and risk assessment</p>
                </div>
              </div>
              <div className="yc-page-actions">
                <button className="yc-btn-secondary">
                  <i className="fa-solid fa-clock-rotate-left"></i> View History
                </button>
                {company && (
                  <button 
                    className={company.blueprintLocked ? "yc-btn-secondary" : "yc-btn-primary"}
                    onClick={handleToggleBlueprintLock}
                    disabled={lockingBlueprint}
                    style={company.blueprintLocked ? { 
                      background: 'rgba(34, 197, 94, 0.1)', 
                      borderColor: '#22c55e',
                      color: '#22c55e'
                    } : {}}
                  >
                    {lockingBlueprint ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                      </>
                    ) : company.blueprintLocked ? (
                      <>
                        <i className="fa-solid fa-lock"></i> Blueprint Locked
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield"></i> Lock Blueprint
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* YC KPI Grid */}
          <div className="yc-kpi-grid" style={{ position: 'relative', zIndex: 10 }}>
            {kpis.map((kpi, index) => (
              <div key={index} className="yc-kpi-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="yc-kpi-header">
                  <span className="yc-kpi-label">{kpi.label}</span>
                  <div className="yc-kpi-icon" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                    <i className={`fa-solid ${kpi.icon}`}></i>
                  </div>
                </div>
                <div className="yc-kpi-value">{kpi.value}</div>
                <div className="yc-kpi-trend positive">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                  <span>+0% from last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Blueprint Locked Banner */}
          {company?.blueprintLocked && (
            <div style={{ 
              position: 'relative', 
              zIndex: 10, 
              marginBottom: '24px',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>
                <i className="fa-solid fa-lock"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e', marginBottom: '2px' }}>
                  Blueprint Locked
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Your brand configuration is protected. Locked {company.blueprintLockedAt ? new Date(company.blueprintLockedAt).toLocaleDateString() : ''} by {company.blueprintLockedBy || 'admin'}.
                  Click the button above to unlock and make changes.
                </div>
              </div>
              <div style={{ 
                padding: '6px 12px', 
                background: 'rgba(34, 197, 94, 0.15)', 
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#22c55e',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Protected
              </div>
            </div>
          )}

          {/* Setup Prompt or Main Content */}
          {!companyLoading && !company ? (
            <div className="yc-empty-state-card" style={{ position: 'relative', zIndex: 10, marginBottom: '32px' }}>
              <div className="yc-empty-icon">
                <svg viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="40" stroke="url(#setupGrad)" strokeWidth="2" strokeDasharray="4 4"/>
                  <rect x="35" y="35" width="30" height="30" rx="4" stroke="url(#setupGrad)" strokeWidth="2"/>
                  <defs>
                    <linearGradient id="setupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6"/>
                      <stop offset="100%" stopColor="#ec4899"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h3>Set Up Your Company Profile</h3>
              <p>To see your Brand DNA, Safety Score, and Risk Tolerance settings, please set up your company profile first.</p>
              <Link href="/settings" className="yc-btn-primary" style={{ marginTop: '16px' }}>
                <i className="fa-solid fa-building"></i>
                Set Up Company Profile
              </Link>
            </div>
          ) : company && (
            <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Brand DNA Card */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '0.4s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--gradient-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                    <i className="fa-solid fa-dna"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Brand DNA</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { label: 'Industry', value: company.industry || 'Not specified' },
                    { label: 'Tone', value: company.brandInsights?.brandVoice || company.brandVoice || 'Not specified' },
                    { label: 'Audience', value: company.brandInsights?.targetAudience || company.targetAudience || 'Not specified' },
                    { label: 'Company', value: company.companyName },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{item.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Safety Score Card */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', textAlign: 'center', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '0.5s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--gradient-success)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Brand Safety Score</h3>
                </div>
                {brandSafety.score !== null ? (
                  <>
                    <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(102, 126, 234, 0.1)" strokeWidth="8"/>
                        <circle cx="50" cy="50" r="42" fill="none" stroke={brandSafety.color} strokeWidth="8" strokeDasharray={`${(brandSafety.score / 100) * 264} 264`} strokeLinecap="round"/>
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '42px', fontWeight: 900, background: `linear-gradient(135deg, ${brandSafety.color} 0%, #00f5ff 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{brandSafety.score}</div>
                      </div>
                    </div>
                    <span style={{ display: 'inline-block', padding: '8px 20px', background: `${brandSafety.color}15`, color: brandSafety.color, borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>{brandSafety.label}</span>
                  </>
                ) : (
                  <div style={{ padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.7 }}>🛡️</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Complete your brand profile to calculate safety score</p>
                  </div>
                )}
              </div>

              {/* Risk Tolerance Matrix - Full Width */}
              <div style={{ gridColumn: 'span 2', background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '0.6s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Risk Tolerance Matrix</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {riskItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                      <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: `${getRiskColor(item.level)}15`, color: getRiskColor(item.level) }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
