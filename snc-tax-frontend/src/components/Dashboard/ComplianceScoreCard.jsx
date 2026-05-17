import './Card.css';

export default function ComplianceScoreCard({ score, trend, previousMonth }) {
  const isPositive = trend >= 0;

  return (
    <div className="metric-card compliance-score-card">
      <div className="card-header">
        <span className="card-icon">🛡️</span>
        <span className={`trend-badge ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{trend}%
        </span>
      </div>

      <div className="card-content">
        <div className="metric-value">{score}%</div>
        <div className="metric-label">Compliance Score</div>
        <div className="metric-subtext">
          Up from {previousMonth}% last month
        </div>
      </div>

      <div className="card-footer">
        <a href="/compliance" className="card-link">
          View Details →
        </a>
      </div>
    </div>
  );
}
