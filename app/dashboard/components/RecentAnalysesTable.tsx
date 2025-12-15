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
  const styles = {
    verified: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    risk: 'bg-red-100 text-red-700',
  };
  const labels = {
    verified: 'Verified',
    pending: 'Pending',
    risk: 'Risk',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function RecentAnalysesTable() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900">Recent Creator Analyses</h3>
        <button className="text-slate-400 hover:text-slate-600">
          <span className="text-xl">⋮</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Creator Name</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Followers</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Status</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Alignment Score</th>
              <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Brand Risk</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((creator) => (
              <tr key={creator.avatar} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      {creator.avatar}
                    </div>
                    <span className="font-bold text-slate-900">{creator.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-b border-slate-100 text-slate-600 text-sm font-medium">{creator.followers}</td>
                <td className="px-4 py-4 border-b border-slate-100">
                  <StatusBadge status={creator.status} />
                </td>
                <td className="px-4 py-4 border-b border-slate-100">
                  <span className={`font-extrabold text-base ${
                    creator.alignment >= 90 ? 'text-green-600' : creator.alignment >= 70 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {creator.alignment}%
                  </span>
                </td>
                <td className="px-4 py-4 border-b border-slate-100 text-slate-600 text-sm font-medium">{creator.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
