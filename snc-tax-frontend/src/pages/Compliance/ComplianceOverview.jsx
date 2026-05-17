import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useComplianceStore } from '../../stores/complianceStore';
import './Compliance.css';

export default function ComplianceOverview({ modules }) {
  const navigate = useNavigate();
  const { dashboardData, fetchDashboardData } = useComplianceStore();

  useEffect(() => {
    if (!dashboardData) {
      fetchDashboardData();
    }
  }, []);

  return (
    <div className="compliance-overview">
      <div className="compliance-header">
        <h1>Compliance Management</h1>
        <p>Monitor and manage all South African SMME compliance requirements</p>
      </div>

      <div className="compliance-score-banner">
        <div className="score-circle">
          <span className="score-value">{dashboardData?.complianceScore || 0}%</span>
        </div>
        <div className="score-info">
          <h2>Overall Compliance Score</h2>
          <p>
            {dashboardData?.complianceTrend > 0 ? '+' : ''}
            {dashboardData?.complianceTrend || 0}% from last month
          </p>
        </div>
      </div>

      <div className="modules-grid">
        {Object.entries(modules).map(([key, config]) => (
          <button
            key={key}
            className="module-card"
            onClick={() => navigate(`/compliance/${key}`)}
          >
            <div className="module-icon">{getModuleIcon(key)}</div>
            <div className="module-info">
              <h3>{config.name}</h3>
              <p>{config.description}</p>
            </div>
            <span className="module-arrow">&#8250;</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function getModuleIcon(moduleId) {
  const icons = {
    cipc: '\u{1F3E2}',
    sars: '\u{1F4B0}',
    labour: '\u{1F477}',
    ohs: '\u{26D1}',
    popia: '\u{1F512}',
    bbbee: '\u{1F91D}',
    fica: '\u{1F50D}',
    municipal: '\u{1F3D8}',
    industry: '\u{1F3ED}',
    tax_engine: '\u{1F9EE}',
  };
  return icons[moduleId] || '\u{1F4CB}';
}
