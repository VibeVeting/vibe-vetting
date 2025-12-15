'use client';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  actionButton?: {
    label: string;
    icon?: string;
    onClick: () => void;
  };
}

export function TopBar({ title, subtitle, showSearch = true, actionButton }: TopBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-5 md:p-6 rounded-2xl shadow-md">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 font-semibold">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
        {showSearch && (
          <input
            type="text"
            className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl w-full md:w-64 text-sm text-slate-600 transition-all focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
            placeholder="Search creators, campaigns..."
          />
        )}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
          >
            {actionButton.icon && <span>+</span>}
            {actionButton.label}
          </button>
        )}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            JD
          </div>
        </div>
      </div>
    </div>
  );
}
