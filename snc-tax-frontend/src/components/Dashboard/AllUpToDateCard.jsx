import './Card.css';

export default function AllUpToDateCard({ count, trend }) {
  const isPositive = trend >= 0;

  return (
    <div className="metric-card all-up-to-date-card">
      <div className="card-header">
        <span className="card-icon">✓</span>
        <span className={`trend-badge ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{trend}%
        </span>
      </div>

      <div className="card-content">
        <div className="metric-value">{count}</div>
        <div className="metric-label">All Up to Date</div>
        <div className="metric-subtext">Completed compliance items</div>
      </div>

      <div className="card-footer">
        <a href="/compliance" className="card-link">
          View Completed →
        </a>
      </div>
    </div>
  );
}
