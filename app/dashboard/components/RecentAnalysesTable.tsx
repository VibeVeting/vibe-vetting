'use client';

import { useEffect, useState } from 'react';

interface CreatorAnalysis {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  status: 'verified' | 'pending' | 'risk';
  alignmentScore: number;
  riskLevel: string;
}

function StatusBadge({ status }: { status: 'verified' | 'pending' | 'risk' }) {
  const classMap = {
    verified: 'badge-verified',
    pending: 'badge-pending',
    risk: 'badge-risk',
  };
  const labels = {
    verified: 'Verified',
    pending: 'Pending',
    risk: 'Risk',
  };
  return (
    <span className={`badge ${classMap[status]}`}>
      {labels[status]}
    </span>
  );
}

export function RecentAnalysesTable() {
  const [analyses, setAnalyses] = useState<CreatorAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          setAnalyses(data.analyses);
        }
      } catch (error) {
        console.error('Error fetching analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Creator Analyses</h3>
        <button className="card-menu">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
            <p>Loading analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
            <i className="fa-solid fa-search" style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }}></i>
            <p>No creator analyses yet</p>
            <p style={{ fontSize: '12px' }}>Start analyzing creators to see them here</p>
          </div>
        ) : (
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Creator Name</th>
                <th>Followers</th>
                <th>Status</th>
                <th>Alignment Score</th>
                <th>Brand Risk</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((creator) => (
                <tr key={creator.id}>
                  <td>
                    <div className="creator-name">
                      <img 
                        className="creator-avatar" 
                        src={creator.avatar} 
                        alt={creator.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=667eea&color=fff`;
                        }}
                      />
                      {creator.name}
                    </div>
                  </td>
                  <td>{creator.followers}</td>
                  <td>
                    <StatusBadge status={creator.status} />
                  </td>
                  <td>
                    <span className={`score ${
                      creator.alignmentScore >= 90 ? 'high' : creator.alignmentScore >= 70 ? 'medium' : 'low'
                    }`}>
                      {creator.alignmentScore}%
                    </span>
                  </td>
                  <td>{creator.riskLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
