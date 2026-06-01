'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CreatorAnalysis {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  status: 'verified' | 'pending' | 'risk';
  alignmentScore: number;
  riskLevel: string;
  platform?: string;
}

export function RecentAnalysesTable() {
  const [analyses, setAnalyses] = useState<CreatorAnalysis[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
    const fetchAnalyses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user/analyses?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAnalyses(data.analyses || []);
        }
      } catch (error) {
        console.error('Error fetching analyses:', error);
      }
    };

    fetchAnalyses();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: 'fa-check-circle', label: 'Verified' };
      case 'pending':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: 'fa-clock', label: 'Pending' };
      case 'risk':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: 'fa-exclamation-triangle', label: 'Risk' };
      default:
        return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', icon: 'fa-question', label: 'Unknown' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#00f5ff';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={`yc-table-section ${isVisible ? 'visible' : ''}`}>
      <div className="yc-table-header">
        <div className="yc-table-title">
          <div className="yc-table-icon">
            <i className="fa-solid fa-users-viewfinder"></i>
          </div>
          <div>
            <h2>Recent Creator Analyses</h2>
            <p>Latest AI-powered vetting results</p>
          </div>
        </div>
        <div className="yc-table-actions">
          <Link href="/creators" className="yc-table-btn">
            <span>View All</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>

      <div className="yc-table-container">
        {analyses.length === 0 ? (
          <div className="yc-empty-state">
            <div className="yc-empty-icon">
              <i className="fa-solid fa-user-astronaut"></i>
            </div>
            <h3>No Creators Analyzed Yet</h3>
            <p>Start discovering and vetting creators to see them here</p>
            <Link href="/creators/discover" className="yc-empty-action">
              <i className="fa-solid fa-rocket"></i>
              <span>Discover Creators</span>
            </Link>
          </div>
        ) : (
          <table className="yc-table">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Platform</th>
                <th>Followers</th>
                <th>Status</th>
                <th>AI Score</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((creator, index) => {
                const statusConfig = getStatusConfig(creator.status);
                const scoreColor = getScoreColor(creator.alignmentScore);
                return (
                  <tr
                    key={creator.id}
                    className={hoveredRow === creator.id ? 'hovered' : ''}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onMouseEnter={() => setHoveredRow(creator.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => router.push(`/creators/${creator.id}`)}
                  >
                    <td>
                      <div className="yc-creator-cell">
                        <div className="yc-creator-avatar">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=667eea&color=fff`;
                            }}
                          />
                          <span className="yc-avatar-ring" style={{ borderColor: statusConfig.color }}></span>
                        </div>
                        <span className="yc-creator-name">{creator.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="yc-platform-badge">
                        <i className={`fa-brands fa-${creator.platform?.toLowerCase() || 'instagram'}`}></i>
                        <span>{creator.platform || 'Instagram'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="yc-followers">{creator.followers}</span>
                    </td>
                    <td>
                      <div className="yc-status-badge" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                        <i className={`fa-solid ${statusConfig.icon}`}></i>
                        <span>{statusConfig.label}</span>
                      </div>
                    </td>
                    <td>
                      <div className="yc-score-cell">
                        <div className="yc-score-bar">
                          <div
                            className="yc-score-fill"
                            style={{
                              width: `${creator.alignmentScore}%`,
                              background: `linear-gradient(90deg, ${scoreColor}aa, ${scoreColor})`,
                            }}
                          ></div>
                        </div>
                        <span className="yc-score-value" style={{ color: scoreColor }}>
                          {creator.alignmentScore}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`yc-risk-badge ${creator.riskLevel?.toLowerCase().replace(' ', '-') || 'low'}`}>
                        {creator.riskLevel || 'Low'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
