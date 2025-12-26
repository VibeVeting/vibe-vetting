'use client';

export function ChartsSection() {
  return (
    <div className="charts-grid">
      {/* Creator Verification Trends Card */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Creator Verification Trends</h3>
          <button className="card-menu">
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
        <div className="chart-placeholder">
          <i className="fa-solid fa-chart-area" style={{ fontSize: '32px', marginBottom: '10px' }}></i>
          <br />
          Chart visualization area
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Stats</h3>
          <button className="card-menu">
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
        <div className="side-panel-card">
          <div className="panel-item">
            <div className="panel-item-title">This Month</div>
            <div className="panel-item-value">42</div>
          </div>
          <div className="panel-item">
            <div className="panel-item-title">Risk Cases</div>
            <div className="panel-item-value">3</div>
          </div>
          <div className="panel-item">
            <div className="panel-item-title">High Score</div>
            <div className="panel-item-value">98%</div>
          </div>
          <div className="panel-item">
            <div className="panel-item-title">Low Score</div>
            <div className="panel-item-value">42%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
