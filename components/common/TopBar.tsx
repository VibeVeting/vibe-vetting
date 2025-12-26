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
    <div className="top-bar">
      <div className="top-bar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="top-bar-right">
        {showSearch && (
          <input
            type="text"
            className="search-box"
            placeholder="Search creators, campaigns..."
          />
        )}
        {actionButton && (
          <button onClick={actionButton.onClick} className="btn btn-primary">
            {actionButton.icon && <i className={`fa-solid ${actionButton.icon}`}></i>}
            {actionButton.label}
          </button>
        )}
        <div className="user-profile">
          <div className="user-avatar">JD</div>
        </div>
      </div>
    </div>
  );
}
