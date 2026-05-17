import './Card.css';

export default function DueThisMonthCard({ count, actionRequired }) {
  return (
    <div className={`metric-card due-this-month-card ${actionRequired ? 'warning' : ''}`}>
      <div className="card-header">
        <span className="card-icon">⏰</span>
        {actionRequired && <span className="warning-badge">⚠️ Action Required</span>}
      </div>

      <div className="card-content">
        <div className="metric-value">{count}</div>
        <div className="metric-label">Due This Month</div>
        <div className="metric-subtext">Compliance deadlines approaching</div>
      </div>

      <div className="card-footer">
        <a href="/compliance" className="card-link">
          View Schedule →
        </a>
      </div>
    </div>
  );
}
