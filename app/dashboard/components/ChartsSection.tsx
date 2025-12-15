'use client';

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
      {/* Creator Verification Trends Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Creator Verification Trends</h3>
          <button className="text-slate-400 hover:text-slate-600">
            <span className="text-xl">⋮</span>
          </button>
        </div>
        <div className="h-64 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 rounded-xl flex items-center justify-center text-slate-400 font-semibold text-sm">
          📊 Chart visualization area
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Quick Stats</h3>
          <button className="text-slate-400 hover:text-slate-600">
            <span className="text-xl">⋮</span>
          </button>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-xl hover:bg-gradient-to-br hover:from-indigo-500/10 hover:to-purple-600/10 transition-all">
            <div className="text-xs font-bold text-indigo-600 mb-1">This Month</div>
            <div className="text-xl font-black text-slate-900">42</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl hover:bg-gradient-to-br hover:from-indigo-500/10 hover:to-purple-600/10 transition-all">
            <div className="text-xs font-bold text-indigo-600 mb-1">Risk Cases</div>
            <div className="text-xl font-black text-slate-900">3</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl hover:bg-gradient-to-br hover:from-indigo-500/10 hover:to-purple-600/10 transition-all">
            <div className="text-xs font-bold text-indigo-600 mb-1">High Score</div>
            <div className="text-xl font-black text-slate-900">98%</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl hover:bg-gradient-to-br hover:from-indigo-500/10 hover:to-purple-600/10 transition-all">
            <div className="text-xs font-bold text-indigo-600 mb-1">Low Score</div>
            <div className="text-xl font-black text-slate-900">42%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
