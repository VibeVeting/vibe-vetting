'use client';

import { useState } from 'react';
import { exportAIInsights } from '@/lib/export-utils';

interface AIButtonProps {
  type: 'analyze-bio' | 'outreach-email' | 'campaign-brief' | 'hashtag-analysis' | 'caption-ideas' | 'risk-assessment' | 'rate-negotiation' | 'find-similar' | 'find-creators' | 'compare-creators' | 'audience-analysis';
  data: Record<string, string | number>;
  label?: string;
  icon?: string;
  onResult?: (result: unknown) => void;
  variant?: 'button' | 'inline' | 'card';
  className?: string;
}

export function AIButton({ type, data, label, icon = 'fa-wand-magic-sparkles', onResult, variant = 'button', className = '' }: AIButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setResult(responseData.data);
        setShowResult(true);
        if (onResult) onResult(responseData.data);
      } else {
        setError(responseData.error || 'AI analysis failed');
      }
    } catch {
      setError('Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultLabels: Record<string, string> = {
    'analyze-bio': 'Analyze with AI',
    'outreach-email': 'Generate Email',
    'campaign-brief': 'Create Brief',
    'hashtag-analysis': 'Analyze Hashtags',
    'caption-ideas': 'Get Caption Ideas',
    'risk-assessment': 'Assess Risk',
    'rate-negotiation': 'Suggest Rates',
    'find-similar': 'Find Similar',
    'find-creators': 'Find Creators',
    'compare-creators': 'Compare',
    'audience-analysis': 'Analyze Audience',
  };

  const buttonLabel = label || defaultLabels[type] || 'AI Assist';

  if (variant === 'inline') {
    return (
      <button 
        className={`ai-inline-btn ${className} ${isLoading ? 'loading' : ''}`}
        onClick={handleClick}
        disabled={isLoading}
      >
        <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : icon}`}></i>
        <style jsx>{`
          .ai-inline-btn {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: none;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }
          .ai-inline-btn:hover:not(:disabled) {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .ai-inline-btn:disabled {
            opacity: 0.7;
            cursor: wait;
          }
        `}</style>
      </button>
    );
  }

  return (
    <>
      <button 
        className={`ai-assist-btn ${className} ${isLoading ? 'loading' : ''}`}
        onClick={handleClick}
        disabled={isLoading}
      >
        <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : icon}`}></i>
        <span>{isLoading ? 'Analyzing...' : buttonLabel}</span>
        <style jsx>{`
          .ai-assist-btn {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 6px 10px;
            border-radius: 6px;
            border: none;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .ai-assist-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
          }
          .ai-assist-btn:disabled {
            opacity: 0.7;
            cursor: wait;
          }
          .ai-assist-btn i {
            font-size: 10px;
          }
        `}</style>
      </button>

      {showResult && (
        <AIResultModal 
          type={type} 
          result={result} 
          error={error}
          onClose={() => setShowResult(false)} 
        />
      )}
    </>
  );
}

interface AIResultModalProps {
  type: string;
  result: unknown;
  error?: string;
  onClose: () => void;
}

function AIResultModal({ type, result, error, onClose }: AIResultModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const title = titles[type] || 'AI Analysis';
    const content = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
    exportAIInsights(title, content);
  };

  const titles: Record<string, string> = {
    'analyze-bio': 'Creator Profile Analysis',
    'outreach-email': 'Generated Outreach Email',
    'campaign-brief': 'Campaign Brief',
    'hashtag-analysis': 'Hashtag Analysis',
    'caption-ideas': 'Caption Ideas',
    'risk-assessment': 'Risk Assessment',
    'rate-negotiation': 'Rate Suggestion',
    'find-similar': 'Similar Creators Found',
    'find-creators': 'Matching Creators',
    'compare-creators': 'Creator Comparison',
    'audience-analysis': 'Audience Insights',
  };

  const renderContent = () => {
    if (error) {
      return <div className="error-message"><i className="fa-solid fa-exclamation-circle"></i> {error}</div>;
    }

    if (typeof result === 'string') {
      return (
        <div className="text-result">
          <pre>{result}</pre>
          <button className="copy-btn" onClick={() => handleCopy(result)}>
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      );
    }

    // Handle different result types
    const data = result as Record<string, unknown>;

    if (type === 'analyze-bio') {
      return (
        <div className="bio-analysis">
          <div className="analysis-grid">
            <div className="analysis-item">
              <span className="label">Niche</span>
              <span className="value">{data.niche as string}</span>
            </div>
            <div className="analysis-item">
              <span className="label">Tone</span>
              <span className="value">{data.tone as string}</span>
            </div>
            <div className="analysis-item highlight">
              <span className="label">Brand Fit Score</span>
              <span className="value score">{data.brandFit as number}%</span>
            </div>
          </div>
          <div className="analysis-section">
            <h4><i className="fa-solid fa-check-circle" style={{ color: '#22c55e' }}></i> Strengths</h4>
            <ul>
              {(data.strengths as string[])?.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="analysis-section">
            <h4><i className="fa-solid fa-exclamation-triangle" style={{ color: '#f59e0b' }}></i> Concerns</h4>
            <ul>
              {(data.concerns as string[])?.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div className="recommendation-box">
            <i className="fa-solid fa-lightbulb"></i>
            <p>{data.recommendation as string}</p>
          </div>
        </div>
      );
    }

    if (type === 'caption-ideas') {
      return (
        <div className="caption-ideas">
          <div className="ideas-section">
            <h4><i className="fa-solid fa-quote-left"></i> Caption Options</h4>
            {(data.captions as string[])?.map((caption: string, i: number) => (
              <div key={i} className="idea-card" onClick={() => handleCopy(caption)}>
                <p>{caption}</p>
                <i className="fa-solid fa-copy copy-icon"></i>
              </div>
            ))}
          </div>
          <div className="ideas-section">
            <h4><i className="fa-solid fa-bolt"></i> Hook Ideas</h4>
            {(data.hooks as string[])?.map((hook: string, i: number) => (
              <div key={i} className="idea-card small" onClick={() => handleCopy(hook)}>
                <p>{hook}</p>
                <i className="fa-solid fa-copy copy-icon"></i>
              </div>
            ))}
          </div>
          <div className="ideas-section">
            <h4><i className="fa-solid fa-bullhorn"></i> Call to Actions</h4>
            {(data.cta as string[])?.map((cta: string, i: number) => (
              <div key={i} className="idea-card small" onClick={() => handleCopy(cta)}>
                <p>{cta}</p>
                <i className="fa-solid fa-copy copy-icon"></i>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'hashtag-analysis') {
      return (
        <div className="hashtag-analysis">
          <div className="hashtag-group">
            <h4><i className="fa-solid fa-fire" style={{ color: '#ef4444' }}></i> Trending</h4>
            <div className="hashtag-tags">
              {(data.trending as string[])?.map((tag: string, i: number) => (
                <span key={i} className="hashtag trending" onClick={() => handleCopy(tag)}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="hashtag-group">
            <h4><i className="fa-solid fa-bullseye" style={{ color: '#667eea' }}></i> Niche</h4>
            <div className="hashtag-tags">
              {(data.niche as string[])?.map((tag: string, i: number) => (
                <span key={i} className="hashtag niche" onClick={() => handleCopy(tag)}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="recommendation-box">
            <i className="fa-solid fa-lightbulb"></i>
            <p>{data.recommendation as string}</p>
          </div>
        </div>
      );
    }

    if (type === 'risk-assessment') {
      const factors = data.factors as { name: string; status: string; detail: string }[];
      return (
        <div className="risk-assessment">
          <div className={`risk-score ${(data.overallRisk as string)?.toLowerCase()}`}>
            <div className="score-circle">
              <span className="score-value">{data.score as number}</span>
              <span className="score-label">Safety Score</span>
            </div>
            <div className="risk-level">
              <span className="risk-badge">{data.overallRisk as string} Risk</span>
            </div>
          </div>
          <div className="risk-factors">
            {factors?.map((factor: { name: string; status: string; detail: string }, i: number) => (
              <div key={i} className="factor-item">
                <div className="factor-header">
                  <span className="factor-name">{factor.name}</span>
                  <span className={`factor-status ${factor.status.toLowerCase()}`}>{factor.status}</span>
                </div>
                <p className="factor-detail">{factor.detail}</p>
              </div>
            ))}
          </div>
          <div className="recommendation-box">
            <i className="fa-solid fa-shield-halved"></i>
            <p>{data.recommendation as string}</p>
          </div>
        </div>
      );
    }

    if (type === 'rate-negotiation') {
      const dealStructure = data.dealStructure as Record<string, string>;
      return (
        <div className="rate-suggestion">
          <div className="suggested-rate">
            <span className="label">Suggested Rate Range</span>
            <span className="rate">{data.suggestedRate as string}</span>
            <span className="comparison">{data.marketComparison as string}</span>
          </div>
          <div className="tips-section">
            <h4><i className="fa-solid fa-lightbulb"></i> Negotiation Tips</h4>
            <ul>
              {(data.negotiationTips as string[])?.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
          <div className="deal-structure">
            <h4><i className="fa-solid fa-file-invoice-dollar"></i> Suggested Deal Structure</h4>
            <div className="deal-items">
              {Object.entries(dealStructure || {}).map(([key, value]) => (
                <div key={key} className="deal-item">
                  <span className="deal-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="deal-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (type === 'find-similar' || type === 'find-creators') {
      const suggestions = (data.suggestions || data.recommendations) as { name: string; handle: string; followers: string; engagement: string; matchScore: number; reason?: string; niche?: string; estimatedRate?: string }[];
      const insights = data.insights as string | undefined;
      const searchTips = data.searchTips as string[] | undefined;
      return (
        <div className="find-creators-result">
          {insights && (
            <div className="ai-insight-box">
              <i className="fa-solid fa-lightbulb"></i>
              <p>{insights}</p>
            </div>
          )}
          <div className="creators-list">
            {suggestions?.map((creator, i: number) => (
              <div key={i} className="creator-suggestion-card">
                <div className="creator-main">
                  <div className="creator-avatar-small">{creator.name.charAt(0)}</div>
                  <div className="creator-info">
                    <span className="creator-name">{creator.name}</span>
                    <span className="creator-handle">{creator.handle}</span>
                  </div>
                  <div className="match-score">
                    <span className="score-value">{creator.matchScore}%</span>
                    <span className="score-label">Match</span>
                  </div>
                </div>
                <div className="creator-stats-row">
                  <span><i className="fa-solid fa-users"></i> {creator.followers}</span>
                  <span><i className="fa-solid fa-heart"></i> {creator.engagement}</span>
                  {creator.niche && <span><i className="fa-solid fa-tag"></i> {creator.niche}</span>}
                  {creator.estimatedRate && <span><i className="fa-solid fa-dollar-sign"></i> {creator.estimatedRate}</span>}
                </div>
                {creator.reason && <p className="match-reason">{creator.reason}</p>}
                <button className="add-creator-btn" onClick={() => handleCopy(creator.handle)}>
                  <i className="fa-solid fa-plus"></i> Add to Campaign
                </button>
              </div>
            ))}
          </div>
          {searchTips && searchTips.length > 0 && (
            <div className="search-tips">
              <h4><i className="fa-solid fa-wand-magic-sparkles"></i> Pro Tips</h4>
              <ul>
                {searchTips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (type === 'compare-creators') {
      const comparison = data.comparison as { metric: string; creator1: string; creator2: string; winner: string }[];
      const bestFor = data.bestFor as Record<string, string>;
      return (
        <div className="compare-result">
          <div className="comparison-table">
            <div className="table-header">
              <span>Metric</span>
              <span>Creator 1</span>
              <span>Creator 2</span>
              <span>Winner</span>
            </div>
            {comparison?.map((row, i: number) => (
              <div key={i} className="table-row">
                <span className="metric-name">{row.metric}</span>
                <span>{row.creator1}</span>
                <span>{row.creator2}</span>
                <span className={`winner ${row.winner === 'Creator 1' ? 'c1' : 'c2'}`}>{row.winner}</span>
              </div>
            ))}
          </div>
          <div className="best-for-section">
            <h4><i className="fa-solid fa-bullseye"></i> Best For</h4>
            <div className="best-for-cards">
              {Object.entries(bestFor || {}).map(([creator, useCase]) => (
                <div key={creator} className="best-for-card">
                  <span className="creator-label">{creator.replace(/([0-9])/g, ' $1')}</span>
                  <span className="use-case">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="recommendation-box">
            <i className="fa-solid fa-lightbulb"></i>
            <p>{data.recommendation as string}</p>
          </div>
        </div>
      );
    }

    if (type === 'audience-analysis') {
      const demographics = data.demographics as { ageGroups: { range: string; percentage: number }[]; gender: Record<string, number>; topLocations: string[]; interests: string[] };
      const audienceQuality = data.audienceQuality as Record<string, string | number>;
      return (
        <div className="audience-result">
          <div className="demographics-section">
            <h4><i className="fa-solid fa-users"></i> Demographics</h4>
            <div className="demo-grid">
              <div className="age-chart">
                <h5>Age Distribution</h5>
                {demographics?.ageGroups?.map((age, i: number) => (
                  <div key={i} className="age-bar-row">
                    <span className="age-label">{age.range}</span>
                    <div className="age-bar">
                      <div className="age-fill" style={{ width: `${age.percentage}%` }}></div>
                    </div>
                    <span className="age-pct">{age.percentage}%</span>
                  </div>
                ))}
              </div>
              <div className="gender-chart">
                <h5>Gender</h5>
                <div className="gender-bars">
                  {Object.entries(demographics?.gender || {}).map(([gender, pct]) => (
                    <div key={gender} className="gender-item">
                      <span className="gender-label">{gender}</span>
                      <span className="gender-pct">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="locations-interests">
              <div className="locations">
                <h5><i className="fa-solid fa-location-dot"></i> Top Locations</h5>
                <ul>
                  {demographics?.topLocations?.map((loc: string, i: number) => <li key={i}>{loc}</li>)}
                </ul>
              </div>
              <div className="interests">
                <h5><i className="fa-solid fa-heart"></i> Interests</h5>
                <div className="interest-tags">
                  {demographics?.interests?.map((interest: string, i: number) => (
                    <span key={i} className="interest-tag">{interest}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="quality-section">
            <h4><i className="fa-solid fa-chart-line"></i> Audience Quality</h4>
            <div className="quality-metrics">
              {Object.entries(audienceQuality || {}).map(([key, value]) => (
                <div key={key} className="quality-metric">
                  <span className="metric-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="metric-value">{typeof value === 'number' ? `${value}%` : value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="recommendation-box">
            <i className="fa-solid fa-bullseye"></i>
            <p>{data.brandAlignment as string}</p>
          </div>
        </div>
      );
    }

    // Default: show as formatted JSON
    return (
      <div className="text-result">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <div className="ai-icon">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h2>{titles[type] || 'AI Analysis'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <div className="modal-content">
          {renderContent()}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={handleExport}>
            <i className="fa-solid fa-download"></i>
            Export Report
          </button>
        </div>

        <style jsx>{`
          .ai-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            animation: fadeIn 0.2s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .ai-modal {
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 600px;
            max-height: 85vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid #e2e8f0;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          }

          .header-title {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .ai-icon {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
          }

          .modal-header h2 {
            font-size: 18px;
            font-weight: 700;
            color: #1a202c;
            margin: 0;
          }

          .close-btn {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            border: none;
            background: rgba(0, 0, 0, 0.05);
            color: #718096;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: rgba(0, 0, 0, 0.1);
            color: #1a202c;
          }

          .modal-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid #e2e8f0;
            background: #f8fafc;
          }

          .btn-secondary, .btn-primary {
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .btn-secondary {
            border: 1px solid #e2e8f0;
            background: white;
            color: #4a5568;
          }

          .btn-secondary:hover {
            background: #f1f5f9;
          }

          .btn-primary {
            border: none;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          /* Content Styles */
          .error-message {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 16px;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 12px;
            color: #ef4444;
          }

          .text-result {
            position: relative;
          }

          .text-result pre {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            overflow-x: auto;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 8px 14px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #667eea;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
          }

          .copy-btn:hover {
            background: #667eea;
            color: white;
          }

          /* Bio Analysis Styles */
          .analysis-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }

          .analysis-item {
            background: #f8fafc;
            padding: 16px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .analysis-item.highlight {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          }

          .analysis-item .label {
            font-size: 11px;
            color: #718096;
            text-transform: uppercase;
            font-weight: 600;
          }

          .analysis-item .value {
            font-size: 15px;
            font-weight: 600;
            color: #1a202c;
          }

          .analysis-item .value.score {
            font-size: 28px;
            color: #667eea;
          }

          .analysis-section {
            margin-bottom: 16px;
          }

          .analysis-section h4 {
            font-size: 14px;
            color: #1a202c;
            margin: 0 0 10px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .analysis-section ul {
            margin: 0;
            padding-left: 20px;
          }

          .analysis-section li {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 6px;
          }

          .recommendation-box {
            display: flex;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);
            border-radius: 12px;
            border-left: 4px solid #f59e0b;
          }

          .recommendation-box i {
            color: #f59e0b;
            font-size: 18px;
            flex-shrink: 0;
          }

          .recommendation-box p {
            margin: 0;
            font-size: 14px;
            color: #1a202c;
            line-height: 1.5;
          }

          /* Caption Ideas Styles */
          .ideas-section {
            margin-bottom: 20px;
          }

          .ideas-section h4 {
            font-size: 14px;
            color: #1a202c;
            margin: 0 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .idea-card {
            position: relative;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
          }

          .idea-card:hover {
            background: #f1f5f9;
            border-color: #667eea;
          }

          .idea-card.small {
            padding: 12px 16px;
          }

          .idea-card p {
            margin: 0;
            font-size: 14px;
            color: #1a202c;
            line-height: 1.5;
            padding-right: 30px;
          }

          .copy-icon {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #667eea;
            opacity: 0;
            transition: opacity 0.2s;
          }

          .idea-card:hover .copy-icon {
            opacity: 1;
          }

          /* Hashtag Styles */
          .hashtag-group {
            margin-bottom: 20px;
          }

          .hashtag-group h4 {
            font-size: 14px;
            color: #1a202c;
            margin: 0 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .hashtag-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .hashtag {
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .hashtag.trending {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }

          .hashtag.niche {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
          }

          .hashtag:hover {
            transform: scale(1.05);
          }

          /* Risk Assessment Styles */
          .risk-score {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 16px;
            margin-bottom: 20px;
          }

          .risk-score.low {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
          }

          .risk-score.medium {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);
          }

          .risk-score.high {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.1) 100%);
          }

          .score-circle {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .score-value {
            font-size: 28px;
            font-weight: 700;
            color: #22c55e;
          }

          .score-label {
            font-size: 9px;
            color: #718096;
            text-transform: uppercase;
          }

          .risk-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            background: #22c55e;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .risk-factors {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
          }

          .factor-item {
            padding: 14px;
            background: #f8fafc;
            border-radius: 12px;
          }

          .factor-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
          }

          .factor-name {
            font-size: 14px;
            font-weight: 600;
            color: #1a202c;
          }

          .factor-status {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }

          .factor-status.good {
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
          }

          .factor-status.excellent {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
          }

          .factor-detail {
            font-size: 13px;
            color: #718096;
            margin: 0;
          }

          /* Rate Suggestion Styles */
          .suggested-rate {
            text-align: center;
            padding: 24px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            border-radius: 16px;
            margin-bottom: 20px;
          }

          .suggested-rate .label {
            display: block;
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            margin-bottom: 8px;
          }

          .suggested-rate .rate {
            display: block;
            font-size: 32px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 4px;
          }

          .suggested-rate .comparison {
            font-size: 13px;
            color: #22c55e;
          }

          .tips-section, .deal-structure {
            margin-bottom: 20px;
          }

          .tips-section h4, .deal-structure h4 {
            font-size: 14px;
            color: #1a202c;
            margin: 0 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .tips-section ul {
            margin: 0;
            padding-left: 20px;
          }

          .tips-section li {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 8px;
            line-height: 1.5;
          }

          .deal-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .deal-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 10px;
          }

          .deal-label {
            font-size: 14px;
            color: #4a5568;
            text-transform: capitalize;
          }

          .deal-value {
            font-size: 14px;
            font-weight: 600;
            color: #1a202c;
          }

          /* Find Creators Result */
          .find-creators-result {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .ai-insight-box {
            display: flex;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            border-radius: 12px;
            border-left: 4px solid #667eea;
          }

          .ai-insight-box i {
            color: #667eea;
            font-size: 18px;
          }

          .ai-insight-box p {
            margin: 0;
            font-size: 14px;
            color: #1a202c;
            line-height: 1.5;
          }

          .creators-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .creator-suggestion-card {
            padding: 16px;
            background: #f8fafc;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
          }

          .creator-main {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }

          .creator-avatar-small {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 16px;
          }

          .creator-info {
            flex: 1;
          }

          .creator-info .creator-name {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #1a202c;
          }

          .creator-info .creator-handle {
            font-size: 12px;
            color: #667eea;
          }

          .match-score {
            text-align: center;
            padding: 8px 12px;
            background: rgba(34, 197, 94, 0.1);
            border-radius: 10px;
          }

          .match-score .score-value {
            display: block;
            font-size: 18px;
            font-weight: 700;
            color: #22c55e;
          }

          .match-score .score-label {
            font-size: 10px;
            color: #22c55e;
            text-transform: uppercase;
          }

          .creator-stats-row {
            display: flex;
            gap: 16px;
            margin-bottom: 10px;
            flex-wrap: wrap;
          }

          .creator-stats-row span {
            font-size: 12px;
            color: #718096;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .match-reason {
            font-size: 13px;
            color: #4a5568;
            margin: 0 0 12px 0;
            font-style: italic;
          }

          .add-creator-btn {
            width: 100%;
            padding: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
          }

          .add-creator-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .search-tips {
            padding: 16px;
            background: rgba(245, 158, 11, 0.1);
            border-radius: 12px;
          }

          .search-tips h4 {
            font-size: 14px;
            color: #1a202c;
            margin: 0 0 10px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .search-tips h4 i {
            color: #f59e0b;
          }

          .search-tips ul {
            margin: 0;
            padding-left: 20px;
          }

          .search-tips li {
            font-size: 13px;
            color: #4a5568;
            margin-bottom: 6px;
          }

          /* Compare Result */
          .compare-result {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .comparison-table {
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }

          .table-header, .table-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            padding: 12px 16px;
          }

          .table-header {
            background: #f8fafc;
            font-size: 12px;
            font-weight: 600;
            color: #718096;
            text-transform: uppercase;
          }

          .table-row {
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #4a5568;
          }

          .table-row .metric-name {
            font-weight: 600;
            color: #1a202c;
          }

          .table-row .winner {
            font-weight: 600;
          }

          .table-row .winner.c1 {
            color: #667eea;
          }

          .table-row .winner.c2 {
            color: #22c55e;
          }

          .best-for-section h4 {
            font-size: 14px;
            color: #1a202c;
            margin: 0 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .best-for-cards {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .best-for-card {
            padding: 14px;
            background: #f8fafc;
            border-radius: 10px;
            text-align: center;
          }

          .best-for-card .creator-label {
            display: block;
            font-size: 12px;
            color: #718096;
            margin-bottom: 4px;
          }

          .best-for-card .use-case {
            font-size: 14px;
            font-weight: 600;
            color: #1a202c;
          }

          /* Audience Result */
          .audience-result {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .demographics-section h4, .quality-section h4 {
            font-size: 14px;
            color: #1a202c;
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .demo-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            margin-bottom: 16px;
          }

          .age-chart h5, .gender-chart h5, .locations h5, .interests h5 {
            font-size: 12px;
            color: #718096;
            margin: 0 0 10px 0;
            text-transform: uppercase;
          }

          .age-bar-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }

          .age-label {
            width: 50px;
            font-size: 12px;
            color: #4a5568;
          }

          .age-bar {
            flex: 1;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
          }

          .age-fill {
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
          }

          .age-pct {
            width: 40px;
            font-size: 12px;
            font-weight: 600;
            color: #1a202c;
            text-align: right;
          }

          .gender-bars {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .gender-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 8px;
          }

          .gender-label {
            font-size: 13px;
            color: #4a5568;
            text-transform: capitalize;
          }

          .gender-pct {
            font-size: 13px;
            font-weight: 600;
            color: #1a202c;
          }

          .locations-interests {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .locations ul {
            margin: 0;
            padding-left: 16px;
          }

          .locations li {
            font-size: 13px;
            color: #4a5568;
            margin-bottom: 4px;
          }

          .interest-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .interest-tag {
            padding: 6px 12px;
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
          }

          .quality-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .quality-metric {
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            text-align: center;
          }

          .quality-metric .metric-label {
            display: block;
            font-size: 11px;
            color: #718096;
            text-transform: capitalize;
            margin-bottom: 4px;
          }

          .quality-metric .metric-value {
            font-size: 20px;
            font-weight: 700;
            color: #22c55e;
          }

          @media (max-width: 640px) {
            .analysis-grid {
              grid-template-columns: 1fr;
            }
            
            .demo-grid {
              grid-template-columns: 1fr;
            }
            
            .locations-interests {
              grid-template-columns: 1fr;
            }
            
            .quality-metrics {
              grid-template-columns: 1fr;
            }
            
            .best-for-cards {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// Quick AI Action Card for dashboard and other pages
interface AIQuickActionProps {
  title: string;
  description: string;
  icon: string;
  type: 'analyze-bio' | 'outreach-email' | 'campaign-brief' | 'hashtag-analysis' | 'caption-ideas' | 'risk-assessment' | 'rate-negotiation' | 'find-similar' | 'find-creators' | 'compare-creators' | 'audience-analysis';
  defaultData?: Record<string, string | number>;
}

export function AIQuickAction({ title, description, icon, type, defaultData = {} }: AIQuickActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: defaultData }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setShowResult(true);
      }
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="ai-quick-action" onClick={handleClick}>
        <div className="action-icon">
          <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : icon}`}></i>
        </div>
        <div className="action-content">
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        <i className="fa-solid fa-arrow-right action-arrow"></i>

        <style jsx>{`
          .ai-quick-action {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px;
            background: white;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            cursor: pointer;
            transition: all 0.2s;
          }

          .ai-quick-action:hover {
            border-color: #667eea;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
            transform: translateY(-2px);
          }

          .action-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            flex-shrink: 0;
          }

          .action-content {
            flex: 1;
          }

          .action-content h4 {
            font-size: 14px;
            font-weight: 600;
            color: #1a202c;
            margin: 0 0 4px 0;
          }

          .action-content p {
            font-size: 12px;
            color: #718096;
            margin: 0;
          }

          .action-arrow {
            color: #667eea;
            transition: transform 0.2s;
          }

          .ai-quick-action:hover .action-arrow {
            transform: translateX(4px);
          }
        `}</style>
      </div>

      {showResult && (
        <AIResultModal 
          type={type} 
          result={result} 
          onClose={() => setShowResult(false)} 
        />
      )}
    </>
  );
}
