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
    { label: 'Verified Creators', value: '—', icon: 'fa-users', color: '#22c55e', subtext: 'Coming Soon' },
    { label: 'Active Campaigns', value: '—', icon: 'fa-bullhorn', color: '#667eea', subtext: 'Coming Soon' },
    { label: 'Avg. Score', value: '—', icon: 'fa-percent', color: '#f59e0b', subtext: 'Coming Soon' },
    { label: 'High Risk', value: '—', icon: 'fa-triangle-exclamation', color: '#ef4444', subtext: 'Coming Soon' },
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
          <div className={`yc-kpi-grid ${isVisible ? 'visible' : ''}`} style={{ position: 'relative', zIndex: 10 }}>
            {kpis.map((kpi, index) => (
              <div key={index} className="yc-kpi-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="yc-kpi-header">
                  <span className="yc-kpi-label">{kpi.label}</span>
                  <div className="yc-kpi-icon" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                    <i className={`fa-solid ${kpi.icon}`}></i>
                  </div>
                </div>
                <div className="yc-kpi-value" style={{ opacity: 0.5 }}>{kpi.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', padding: '4px 8px', background: 'rgba(102, 126, 234, 0.08)', borderRadius: '8px', display: 'inline-block' }}>
                  <i className="fa-solid fa-clock" style={{ marginRight: '4px', fontSize: '10px' }}></i>
                  Launching Soon
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

          {/* Setup Prompt Banner */}
          {!companyLoading && !company && (
            <div style={{ 
              position: 'relative', 
              zIndex: 10, 
              marginBottom: '24px',
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px',
                    minWidth: '44px',
                    minHeight: '44px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    flexShrink: 0,
                    aspectRatio: '1 / 1'
                  }}>
                    <i className="fa-solid fa-building" style={{ lineHeight: 1 }}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Complete Your Company Profile
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Unlock personalized Brand DNA, Safety Score, and Risk Tolerance settings.
                    </div>
                  </div>
                </div>
                <Link href="/settings" className="yc-btn-primary" style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 600 }}>
                  Set Up Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                </Link>
              </div>
            </div>
          )}

          {/* Main Content - Always Visible */}
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
                  { label: 'Industry', value: company?.industry || 'Technology' },
                  { label: 'Tone', value: company?.brandInsights?.brandVoice || company?.brandVoice || 'Professional & Friendly' },
                  { label: 'Audience', value: company?.brandInsights?.targetAudience || company?.targetAudience || 'Gen Z & Millennials' },
                  { label: 'Company', value: company?.companyName || 'Your Brand' },
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
                <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(102, 126, 234, 0.1)" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeDasharray="0 264" strokeLinecap="round" style={{ animation: 'pulse 2s ease-in-out infinite' }}/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>—</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Pending Setup</div>
                  </div>
                </div>
                <span style={{ display: 'inline-block', padding: '8px 20px', background: 'rgba(102, 126, 234, 0.1)', color: '#667eea', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                  <i className="fa-solid fa-hourglass-half" style={{ marginRight: '8px' }}></i>
                  Awaiting Launch
                </span>
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

              {/* Creator Compatibility Analysis */}
              <div style={{ gridColumn: 'span 2', background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '0.7s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                      <i className="fa-solid fa-user-check"></i>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Creator Compatibility Analysis</h3>
                  </div>
                  <Link href="/creators" className="yc-btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                    <i className="fa-solid fa-arrow-right"></i> View All Creators
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Perfect Match', icon: 'fa-star', color: '#22c55e', percent: '90-100%' },
                    { label: 'Good Fit', icon: 'fa-thumbs-up', color: '#667eea', percent: '70-89%' },
                    { label: 'Moderate Risk', icon: 'fa-exclamation-circle', color: '#f59e0b', percent: '50-69%' },
                    { label: 'High Risk', icon: 'fa-ban', color: '#ef4444', percent: '<50%' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '20px', background: `${item.color}08`, borderRadius: '16px', border: `1px solid ${item.color}20`, textAlign: 'center' }}>
                      <div style={{ width: '50px', height: '50px', background: `${item.color}15`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: item.color, fontSize: '20px' }}>
                        <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: item.color, marginBottom: '4px', opacity: 0.5 }}>—</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '4px 8px', background: `${item.color}10`, borderRadius: '6px', display: 'inline-block' }}>Score: {item.percent}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Risk Monitoring */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '0.8s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                    <i className="fa-solid fa-radar"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Content Risk Monitoring</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { type: 'Profanity Detection', status: 'Ready', color: '#667eea' },
                    { type: 'Competitor Mentions', status: 'Ready', color: '#667eea' },
                    { type: 'Political Content', status: 'Ready', color: '#667eea' },
                    { type: 'Controversial Topics', status: 'Ready', color: '#667eea' },
                    { type: 'Brand Guidelines', status: 'Ready', color: '#667eea' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-hover)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, animation: 'pulse 2s ease-in-out infinite' }}></div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.type}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ padding: '4px 10px', background: `${item.color}15`, color: item.color, borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                          <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }}></i>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Safety Trends */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '0.9s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Brand Safety Trends</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { period: 'This Week', icon: 'fa-calendar-day' },
                    { period: 'Last Week', icon: 'fa-calendar-week' },
                    { period: '2 Weeks Ago', icon: 'fa-calendar' },
                    { period: '3 Weeks Ago', icon: 'fa-calendar-minus' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border-color)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className={`fa-solid ${item.icon}`} style={{ color: 'var(--text-muted)', fontSize: '12px' }}></i>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.period}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.5 }}>—</span>
                        <span style={{ padding: '4px 8px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '6px', fontSize: '10px', color: '#667eea' }}>
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flagged Content */}
              <div style={{ gridColumn: 'span 2', background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '1s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                      <i className="fa-solid fa-flag"></i>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Flagged Content</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Content requiring review from active campaigns</p>
                    </div>
                  </div>
                  <button className="yc-btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                    <i className="fa-solid fa-filter"></i> Filter
                  </button>
                </div>
                {/* Empty State - No Content Yet */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '48px 24px',
                  background: 'var(--bg-hover)',
                  borderRadius: '16px',
                  border: '1px dashed var(--border-color)'
                }}>
                  <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <i className="fa-solid fa-inbox" style={{ fontSize: '28px', color: '#667eea' }}></i>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                    No Flagged Content Yet
                  </h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, textAlign: 'center', maxWidth: '320px' }}>
                    Once your campaigns are live, any flagged content will appear here for review
                  </p>
                  <div style={{ 
                    marginTop: '20px',
                    padding: '8px 16px',
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#667eea',
                    fontWeight: 600
                  }}>
                    <i className="fa-solid fa-clock" style={{ marginRight: '6px' }}></i>
                    Awaiting Launch
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)', borderRadius: '20px', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '1.1s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>AI-Powered Recommendations</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Smart suggestions to improve your brand safety</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { 
                      title: 'Update Content Guidelines', 
                      description: 'Your brand guidelines haven\'t been updated in 45 days. Consider adding recent campaign learnings.',
                      icon: 'fa-file-lines',
                      action: 'Update Now',
                      priority: 'Medium'
                    },
                    { 
                      title: 'Review High-Risk Creators', 
                      description: '3 creators have flagged content pending review. Address these before next campaign launch.',
                      icon: 'fa-user-shield',
                      action: 'Review',
                      priority: 'High'
                    },
                    { 
                      title: 'Enable Auto-Scanning', 
                      description: 'Enable AI content scanning for real-time brand safety monitoring across all platforms.',
                      icon: 'fa-robot',
                      action: 'Enable',
                      priority: 'Low'
                    },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '20px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontSize: '16px' }}>
                          <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '10px', 
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          background: item.priority === 'High' ? '#ef444415' : item.priority === 'Medium' ? '#f59e0b15' : '#22c55e15',
                          color: item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#22c55e'
                        }}>
                          {item.priority}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{item.title}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, flex: 1 }}>{item.description}</p>
                      <button style={{ 
                        padding: '10px 16px', 
                        background: 'rgba(139, 92, 246, 0.1)', 
                        border: '1px solid rgba(139, 92, 246, 0.3)', 
                        borderRadius: '10px', 
                        color: '#8b5cf6', 
                        fontSize: '13px', 
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        {item.action} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Safety Checklist */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '1.2s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                    <i className="fa-solid fa-clipboard-check"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Brand Safety Checklist</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { task: 'Brand guidelines defined', completed: false },
                    { task: 'Risk tolerance configured', completed: false },
                    { task: 'Competitor blacklist set', completed: false },
                    { task: 'Content approval workflow', completed: false },
                    { task: 'Crisis response plan', completed: false },
                    { task: 'Creator vetting criteria', completed: false },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: item.completed ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-hover)', borderRadius: '10px', border: `1px solid ${item.completed ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}` }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: item.completed ? '#22c55e' : 'transparent',
                        border: item.completed ? 'none' : '2px solid var(--border-color)',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {item.completed && <i className="fa-solid fa-check"></i>}
                      </div>
                      <span style={{ fontSize: '14px', color: item.completed ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: item.completed ? 500 : 400 }}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(102, 126, 234, 0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Setup Progress:</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px', animation: 'shimmer 2s ease-in-out infinite' }}></div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#667eea', padding: '2px 8px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '6px' }}>Not Started</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '24px', animation: 'ycCardFadeIn 0.6s ease forwards', animationDelay: '1.3s', opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Quick Actions</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Run Brand Audit', icon: 'fa-magnifying-glass-chart', color: '#667eea' },
                    { label: 'Update Guidelines', icon: 'fa-pen-to-square', color: '#22c55e' },
                    { label: 'Scan New Creator', icon: 'fa-user-plus', color: '#f59e0b' },
                    { label: 'Export Report', icon: 'fa-file-export', color: '#06b6d4' },
                    { label: 'Add Blacklist', icon: 'fa-ban', color: '#ef4444' },
                    { label: 'Schedule Review', icon: 'fa-calendar-check', color: '#8b5cf6' },
                  ].map((item, i) => (
                    <button key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '14px', 
                      background: `${item.color}08`, 
                      border: `1px solid ${item.color}20`, 
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      color: item.color,
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}>
                      <i className={`fa-solid ${item.icon}`} style={{ fontSize: '16px' }}></i>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          {/* ============================================= */}
          {/* ULTRA-PREMIUM PLATFORM FLOW SECTION */}
          {/* ============================================= */}
          <div style={{ 
            position: 'relative', 
            zIndex: 10, 
            marginTop: '48px',
            animation: 'ycCardFadeIn 0.8s ease forwards',
            animationDelay: '1.4s',
            opacity: 0
          }}>
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '100px',
                marginBottom: '20px'
              }}>
                <i className="fa-solid fa-sparkles" style={{ color: '#8b5cf6', fontSize: '12px' }}></i>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1.5px' }}>How It Works</span>
              </div>
              <h2 style={{ 
                fontSize: '42px', 
                fontWeight: 900, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px',
                letterSpacing: '-1px'
              }}>
                The Future of Brand-Creator Synergy
              </h2>
              <p style={{ 
                fontSize: '18px', 
                color: 'var(--text-secondary)', 
                maxWidth: '600px', 
                margin: '0 auto',
                lineHeight: 1.7
              }}>
                From discovery to deployment — a seamless journey powered by AI intelligence
              </p>
            </div>

            {/* Premium Flow Container */}
            <div style={{
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.03) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(236, 72, 153, 0.03) 100%)',
              borderRadius: '32px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              padding: '48px',
              overflow: 'hidden'
            }}>
              {/* Animated Background Orbs */}
              <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite' }}></div>
              <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'float 10s ease-in-out infinite reverse' }}></div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 60%)', filter: 'blur(80px)' }}></div>

              {/* Flow Steps */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Connection Line */}
                <div style={{ 
                  position: 'absolute', 
                  top: '80px', 
                  left: '12.5%', 
                  right: '12.5%', 
                  height: '4px', 
                  background: 'linear-gradient(90deg, #667eea 0%, #8b5cf6 25%, #a855f7 50%, #d946ef 75%, #ec4899 100%)',
                  borderRadius: '2px',
                  opacity: 0.3
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    height: '100%', 
                    width: '30%',
                    background: 'linear-gradient(90deg, #667eea, #ec4899)',
                    borderRadius: '2px',
                    animation: 'flowProgress 3s ease-in-out infinite'
                  }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '24px' }}>
                  {[
                    { 
                      step: 'Step 01', 
                      title: 'Brand Blueprint', 
                      subtitle: 'Define Your DNA',
                      description: 'AI analyzes your brand identity, values, and voice to create a unique digital fingerprint',
                      icon: 'fa-dna',
                      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      features: ['Brand Voice Analysis', 'Value Extraction', 'Audience Mapping']
                    },
                    { 
                      step: 'Step 02', 
                      title: 'Smart Discovery', 
                      subtitle: 'Find Perfect Matches',
                      description: 'Advanced algorithms scan creators across platforms to find ideal brand ambassadors',
                      icon: 'fa-radar',
                      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                      features: ['Multi-Platform Scan', 'Audience Analysis', 'Content Scoring']
                    },
                    { 
                      step: 'Step 03', 
                      title: 'Deep Vetting', 
                      subtitle: 'Risk Intelligence',
                      description: 'Comprehensive content analysis detects risks, sentiment, and brand alignment',
                      icon: 'fa-shield-halved',
                      gradient: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                      features: ['Content History', 'Sentiment Analysis', 'Risk Detection']
                    },
                    { 
                      step: 'Step 04', 
                      title: 'Smart Contracts', 
                      subtitle: 'Seamless Deals',
                      description: 'AI-powered negotiation and automated contract generation for faster deals',
                      icon: 'fa-file-signature',
                      gradient: 'linear-gradient(135deg, #d946ef 0%, #ec4899 100%)',
                      features: ['Auto Negotiation', 'Smart Pricing', 'Digital Signatures']
                    },
                    { 
                      step: 'Step 05', 
                      title: 'Live Monitoring', 
                      subtitle: 'Real-time Guard',
                      description: 'Continuous campaign monitoring with instant alerts for brand safety issues',
                      icon: 'fa-satellite-dish',
                      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                      features: ['24/7 Monitoring', 'Instant Alerts', 'Crisis Prevention']
                    }
                  ].map((item, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      {/* Step Number Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '20%',
                        padding: '4px 12px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        zIndex: 3
                      }}>
                        {item.step}
                      </div>

                      {/* Icon Container */}
                      <div style={{
                        width: '100px',
                        height: '100px',
                        background: item.gradient,
                        borderRadius: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        boxShadow: `0 20px 40px -10px ${item.gradient.includes('667eea') ? 'rgba(102, 126, 234, 0.4)' : item.gradient.includes('8b5cf6') ? 'rgba(139, 92, 246, 0.4)' : item.gradient.includes('a855f7') ? 'rgba(168, 85, 247, 0.4)' : item.gradient.includes('d946ef') ? 'rgba(217, 70, 239, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Shimmer Effect */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          animation: 'shimmer 3s infinite',
                          animationDelay: `${i * 0.3}s`
                        }}></div>
                        <i className={`fa-solid ${item.icon}`} style={{ fontSize: '36px', color: 'white' }}></i>
                      </div>

                      {/* Content */}
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: 800, 
                        color: 'var(--text-primary)', 
                        margin: '0 0 4px 0' 
                      }}>
                        {item.title}
                      </h4>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        background: item.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {item.subtitle}
                      </span>
                      <p style={{ 
                        fontSize: '13px', 
                        color: 'var(--text-secondary)', 
                        margin: '0 0 16px 0',
                        lineHeight: 1.6
                      }}>
                        {item.description}
                      </p>

                      {/* Feature Pills */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                        {item.features.map((feature, fi) => (
                          <div key={fi} style={{
                            padding: '8px 12px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              background: item.gradient
                            }}></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Tagline */}
                <div style={{ 
                  marginTop: '48px', 
                  padding: '24px 40px',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'linear-gradient(135deg, #667eea 0%, #ec4899 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="fa-solid fa-bolt" style={{ fontSize: '24px', color: 'white' }}></i>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        End-to-End Automation
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        From discovery to delivery — save hours of manual work with AI-powered workflows
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ 
                      padding: '12px 20px', 
                      background: 'var(--bg-elevated)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#667eea' }}>—</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time Saved</div>
                    </div>
                    <div style={{ 
                      padding: '12px 20px', 
                      background: 'var(--bg-elevated)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#8b5cf6' }}>—</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk Reduced</div>
                    </div>
                    <div style={{ 
                      padding: '12px 20px', 
                      background: 'var(--bg-elevated)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: '#ec4899' }}>—</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ROI Boost</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Launching Soon Banner */}
            <div style={{ 
              marginTop: '32px',
              padding: '32px 48px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Animated Pulse */}
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '30px', 
                transform: 'translateY(-50%)',
                width: '12px', 
                height: '12px', 
                background: '#22c55e',
                borderRadius: '50%',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  right: '-4px',
                  bottom: '-4px',
                  border: '2px solid #22c55e',
                  borderRadius: '50%',
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }}></div>
              </div>

              <div style={{ marginLeft: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e', margin: 0 }}>
                    Launching Soon
                  </h3>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: 'rgba(34, 197, 94, 0.15)', 
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#22c55e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Beta Access
                  </span>
                </div>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
                  Be among the first to experience the future of creator marketing intelligence
                </p>
              </div>
              <Link href="/book-demo" style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                boxShadow: '0 8px 24px -4px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.3s ease'
              }}>
                Request Early Access
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* Custom Animations */}
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(5deg); }
            }
            @keyframes flowProgress {
              0% { left: 0%; width: 30%; }
              50% { left: 35%; width: 30%; }
              100% { left: 70%; width: 30%; }
            }
            @keyframes shimmer {
              0% { left: -100%; }
              100% { left: 200%; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.05); }
            }
            @keyframes ping {
              0% { transform: scale(1); opacity: 1; }
              75%, 100% { transform: scale(2); opacity: 0; }
            }
          `}</style>          </div>
        </div>
      </div>
  );
}
