'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardMenu, MenuItem } from '@/components/common/CardMenu';
import { exportAsCSV } from '@/lib/export-utils';

interface CreatorAnalysis {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  status: 'verified' | 'pending' | 'risk';
  alignmentScore: number;
  riskLevel: string;
}

// Empty default state - no sample data
const defaultAnalyses: CreatorAnalysis[] = [];

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
  const [analyses, setAnalyses] = useState<CreatorAnalysis[]>(defaultAnalyses);
  const [isUsingDefaults, setIsUsingDefaults] = useState(true);
  const router = useRouter();

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
          setAnalyses(data.analyses || []);
          setIsUsingDefaults(false);
        }
      } catch (error) {
        console.error('Error fetching analyses:', error);
      }
    };

    fetchAnalyses();
  }, []);

  const menuItems: MenuItem[] = [
    {
      label: 'View All Analyses',
      icon: 'fa-list',
      onClick: () => router.push('/creators'),
    },
    {
      label: 'Export to CSV',
      icon: 'fa-file-csv',
      onClick: () => {
        if (analyses.length === 0) {
          alert('No data to export');
          return;
        }
        const exportData = analyses.map(a => ({
          'Creator Name': a.name,
          'Followers': a.followers,
          'Status': a.status,
          'Alignment Score': `${a.alignmentScore}%`,
          'Risk Level': a.riskLevel
        }));
        exportAsCSV(exportData, `creator-analyses-${new Date().toISOString().split('T')[0]}`);
      },
    },
    {
      label: 'Refresh Data',
      icon: 'fa-refresh',
      onClick: () => {
        window.location.reload();
      },
    },
  ];

  const displayData = analyses;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          Recent Creator Analyses
        </h3>
        <CardMenu items={menuItems} />
      </div>
      <div style={{ overflowX: 'auto' }}>
        {analyses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
            <i className="fa-solid fa-users" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}></i>
            <p>No creators analyzed yet</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Start analyzing creators to see them here</p>
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
            {displayData.map((creator) => (
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
