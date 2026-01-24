'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardMenu, MenuItem } from '@/components/common/CardMenu';

interface CreatorAnalysis {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  status: 'verified' | 'pending' | 'risk';
  alignmentScore: number;
  riskLevel: string;
}

// Default sample data to show when no real data exists
const defaultAnalyses: CreatorAnalysis[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=667eea&color=fff',
    followers: '2.4M',
    status: 'verified',
    alignmentScore: 94,
    riskLevel: 'Low',
  },
  {
    id: '2',
    name: 'Alex Chen',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Chen&background=22c55e&color=fff',
    followers: '1.8M',
    status: 'verified',
    alignmentScore: 91,
    riskLevel: 'Low',
  },
  {
    id: '3',
    name: 'Mike Rivera',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Rivera&background=f59e0b&color=fff',
    followers: '890K',
    status: 'pending',
    alignmentScore: 76,
    riskLevel: 'Medium',
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=ec4899&color=fff',
    followers: '3.2M',
    status: 'verified',
    alignmentScore: 88,
    riskLevel: 'Low',
  },
  {
    id: '5',
    name: 'James Taylor',
    avatar: 'https://ui-avatars.com/api/?name=James+Taylor&background=ef4444&color=fff',
    followers: '520K',
    status: 'risk',
    alignmentScore: 45,
    riskLevel: 'High',
  },
];

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
          if (data.analyses && data.analyses.length > 0) {
            setAnalyses(data.analyses);
            setIsUsingDefaults(false);
          }
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
        // Export functionality
        alert('Export feature coming soon!');
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
          {isUsingDefaults && <span style={{ fontSize: '11px', color: '#a0aec0', fontWeight: 400, marginLeft: '8px' }}>(Sample Data)</span>}
        </h3>
        <CardMenu items={menuItems} />
      </div>
      <div style={{ overflowX: 'auto' }}>
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
      </div>
    </div>
  );
}
