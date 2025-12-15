'use client';

interface StatCardProps {
  label: string;
  icon: string;
  value: string;
  change: string;
  positive: boolean;
}

export function StatCard({ label, icon, value, change, positive }: StatCardProps) {
  return (
    <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-md hover:border-indigo-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</div>
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/15 to-purple-600/15 rounded-xl flex items-center justify-center text-lg">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-black text-slate-900 mb-2">{value}</div>
      <div className={`text-xs font-bold ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </div>
    </div>
  );
}
