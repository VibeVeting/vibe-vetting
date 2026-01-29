"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CompanyData {
  companyName: string;
  industry?: string;
  brandVoice?: string;
  targetAudience?: string;
  brandSafetyScore?: number;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token) return;

        // Fetch user stats
        const statsResponse = await fetch('/api/user/stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data.stats);
        }

        // Fetch company data if user has company name
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
    { label: 'Verified Creators', value: loading ? '...' : (stats?.totalCreatorsVerified?.toString() || '0'), change: '+0%', icon: 'fa-users', iconBg: 'rgba(34, 197, 94, 0.15)', iconColor: '#22c55e' },
    { label: 'Active Campaigns', value: loading ? '...' : (stats?.activeCampaigns?.toString() || '0'), change: '+0%', icon: 'fa-bullhorn', iconBg: 'rgba(102, 126, 234, 0.15)', iconColor: '#667eea' },
    { label: 'Avg. Score', value: loading ? '...' : `${stats?.avgAlignmentScore?.toFixed(0) || 0}%`, change: '+0%', icon: 'fa-percent', iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#f59e0b' },
    { label: 'High Risk', value: loading ? '...' : (stats?.highRiskDetected?.toString() || '0'), change: '0%', icon: 'fa-triangle-exclamation', iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#ef4444' },
  ];

  // Get brand safety score and label
  const getBrandSafetyData = () => {
    if (!company?.brandSafetyScore) {
      return { score: null, label: null };
    }
    const score = company.brandSafetyScore;
    let label = 'Good';
    if (score >= 90) label = 'Excellent';
    else if (score >= 80) label = 'Very Good';
    else if (score >= 70) label = 'Good';
    else if (score >= 60) label = 'Fair';
    else label = 'Needs Improvement';
    return { score, label };
  };

  const brandSafety = getBrandSafetyData();

  // Get risk items from company data or show defaults with "Not Set"
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

  return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container">
            <TopBar
              title="Brand Compatibility & Risk"
              subtitle="Digital brand blueprint and risk assessment"
            />

            {/* KPI Grid */}
            <div className="kpi-grid">
              {kpis.map((kpi, index) => (
                <div key={index} className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-label">{kpi.label}</span>
                    <div className="kpi-icon" style={{ background: kpi.iconBg, color: kpi.iconColor }}>
                      <i className={`fa-solid ${kpi.icon}`}></i>
                    </div>
                  </div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-change">{kpi.change}</div>
                </div>
              ))}
            </div>

          {/* Show setup prompt if no company data */}
          {!companyLoading && !company && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 40px', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏢</div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#1a202c' }}>Set Up Your Company Profile</h2>
              <p style={{ color: '#718096', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                To see your Brand DNA, Safety Score, and Risk Tolerance settings, please set up your company profile first.
              </p>
              <Link href="/settings" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-building"></i>
                Set Up Company Profile
              </Link>
            </div>
          )}

          {/* Main Content Grid - Only show if company data exists */}
          {company && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Brand DNA */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fa-solid fa-dna" style={{ marginRight: '10px', color: '#667eea' }}></i>
                      Brand DNA
                    </h3>
                  </div>
                  <div className="card-metrics" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <div className="metric" style={{ textAlign: 'left', padding: '16px' }}>
                      <div className="metric-label">Industry</div>
                      <div className="metric-value" style={{ fontSize: '14px' }}>{company.industry || 'Not specified'}</div>
                    </div>
                    <div className="metric" style={{ textAlign: 'left', padding: '16px' }}>
                      <div className="metric-label">Tone</div>
                      <div className="metric-value" style={{ fontSize: '14px' }}>{company.brandInsights?.brandVoice || company.brandVoice || 'Not specified'}</div>
                    </div>
                    <div className="metric" style={{ textAlign: 'left', padding: '16px' }}>
                      <div className="metric-label">Audience</div>
                      <div className="metric-value" style={{ fontSize: '14px' }}>{company.brandInsights?.targetAudience || company.targetAudience || 'Not specified'}</div>
                    </div>
                    <div className="metric" style={{ textAlign: 'left', padding: '16px' }}>
                      <div className="metric-label">Company</div>
                      <div className="metric-value" style={{ fontSize: '14px' }}>{company.companyName}</div>
                    </div>
                  </div>
                </div>

                {/* Brand Safety Score */}
                <div className="card" style={{ textAlign: 'center' }}>
                  <div className="card-header" style={{ justifyContent: 'center' }}>
                    <h3 className="card-title">
                      <i className="fa-solid fa-shield-halved" style={{ marginRight: '10px', color: '#667eea' }}></i>
                      Brand Safety Score
                    </h3>
                  </div>
                  {brandSafety.score !== null ? (
                    <>
                      <div style={{ fontSize: '72px', fontWeight: 900, color: '#667eea', margin: '20px 0' }}>{brandSafety.score}</div>
                      <span className="badge badge-verified" style={{ fontSize: '14px', padding: '8px 20px' }}>{brandSafety.label}</span>
                    </>
                  ) : (
                    <div style={{ padding: '30px 20px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🛡️</div>
                      <p style={{ color: '#718096', fontSize: '14px' }}>Complete your brand profile to calculate safety score</p>
                    </div>
                  )}
                </div>

                {/* Risk Tolerance Matrix */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '10px', color: '#667eea' }}></i>
                      Risk Tolerance Matrix
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {riskItems.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '16px 20px', 
                        background: '#f7fafc', 
                        borderRadius: '12px' 
                      }}>
                        <span style={{ fontWeight: 700 }}>{item.title}</span>
                        <span className={`risk-level risk-${item.level}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons" style={{ marginTop: '30px' }}>
                <button className="btn btn-secondary">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  View Change History
                </button>
                <button className="btn btn-primary">
                  <i className="fa-solid fa-shield"></i>
                  Lock Blueprint
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
  );
}
