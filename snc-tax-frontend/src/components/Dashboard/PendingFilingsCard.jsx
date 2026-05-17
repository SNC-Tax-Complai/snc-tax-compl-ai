import './Card.css';

export default function PendingFilingsCard({ count, trend }) {
  const isPositive = trend >= 0;

  return (
    <div className="metric-card pending-filings-card">
      <div className="card-header">
        <span className="card-icon">📄</span>
        <span className={`trend-badge ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{trend}%
        </span>
      </div>

      <div className="card-content">
        <div className="metric-value">{count}</div>
        <div className="metric-label">Pending Filings</div>
        <div className="metric-subtext">Action items waiting for submission</div>
      </div>

      <div className="card-footer">
        <a href="/compliance" className="card-link">
          Review Filings →
        </a>
      </div>
    </div>
  );
}
