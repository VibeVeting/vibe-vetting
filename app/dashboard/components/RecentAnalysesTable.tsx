'use client';

const creators = [
  {
    name: 'Jessica Davis',
    avatar: 'JD',
    followers: '245.3K',
    status: 'verified' as const,
    alignment: 96,
    risk: 'Low',
  },
  {
    name: 'Michael Johnson',
    avatar: 'MJ',
    followers: '892.1K',
    status: 'verified' as const,
    alignment: 92,
    risk: 'Low',
  },
  {
    name: 'Sarah Kumar',
    avatar: 'SK',
    followers: '567.8K',
    status: 'pending' as const,
    alignment: 78,
    risk: 'Medium',
  },
  {
    name: 'Chris Martinez',
    avatar: 'CM',
    followers: '123.4K',
    status: 'risk' as const,
    alignment: 45,
    risk: 'High',
  },
  {
    name: 'Emma Wilson',
    avatar: 'EW',
    followers: '734.2K',
    status: 'verified' as const,
    alignment: 89,
    risk: 'Low',
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
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Creator Analyses</h3>
        <button className="card-menu">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
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
            {creators.map((creator) => (
              <tr key={creator.avatar}>
                <td>
                  <div className="creator-name">
                    <div className="creator-avatar">{creator.avatar}</div>
                    {creator.name}
                  </div>
                </td>
                <td>{creator.followers}</td>
                <td>
                  <StatusBadge status={creator.status} />
                </td>
                <td>
                  <span className={`score ${
                    creator.alignment >= 90 ? 'high' : creator.alignment >= 70 ? 'medium' : 'low'
                  }`}>
                    {creator.alignment}%
                  </span>
                </td>
                <td>{creator.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
