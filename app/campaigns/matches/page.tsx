"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useRouter } from 'next/navigation';

export default function MatchesPage() {
  const router = useRouter();

  // Mock data for demonstration
  const mockMatches = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://via.placeholder.com/60',
      platform: 'Instagram',
      followers: '125K',
      engagement: '4.5%',
      alignmentScore: 94,
      riskLevel: 'low',
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://via.placeholder.com/60',
      platform: 'YouTube',
      followers: '250K',
      engagement: '6.2%',
      alignmentScore: 89,
      riskLevel: 'low',
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar: 'https://via.placeholder.com/60',
      platform: 'TikTok',
      followers: '500K',
      engagement: '8.1%',
      alignmentScore: 87,
      riskLevel: 'medium',
    },
  ];

  const handleViewProfile = (id: string) => {
    router.push(`/creators/${id}`);
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Creator Matches"
            subtitle={`Found ${mockMatches.length} creators matching your criteria`}
          />

          <div className="matches-container">
            <div className="matches-filters">
              <button className="filter-btn active">All Matches</button>
              <button className="filter-btn">Top Rated</button>
              <button className="filter-btn">Low Risk</button>
            </div>

            <div className="matches-grid">
              {mockMatches.map((match) => (
                <div key={match.id} className="match-card">
                  <div className="match-header">
                    <img src={match.avatar} alt={match.name} className="match-avatar" />
                    <div className="match-info">
                      <h3>{match.name}</h3>
                      <span className="platform-badge">{match.platform}</span>
                    </div>
                  </div>

                  <div className="match-stats">
                    <div className="stat">
                      <span className="stat-label">Followers</span>
                      <span className="stat-value">{match.followers}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Engagement</span>
                      <span className="stat-value">{match.engagement}</span>
                    </div>
                  </div>

                  <div className="match-score">
                    <div className="score-circle">
                      <span className="score-value">{match.alignmentScore}</span>
                      <span className="score-label">Match Score</span>
                    </div>
                  </div>

                  <div className="match-risk">
                    <span className={`risk-badge risk-${match.riskLevel}`}>
                      {match.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>

                  <div className="match-actions">
                    <button
                      onClick={() => handleViewProfile(match.id)}
                      className="btn-primary btn-sm"
                    >
                      View Full Report
                    </button>
                    <button className="btn-secondary btn-sm">
                      Add to Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
