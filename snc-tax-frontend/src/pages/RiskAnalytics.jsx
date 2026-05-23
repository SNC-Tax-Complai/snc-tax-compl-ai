import { useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAIInsightsStore } from '../stores/aiInsightsStore';
import { useComplianceStore } from '../stores/complianceStore';
import './PageStyles.css';

// Statutory penalty descriptions per module — these are fixed SA regulations, not user-specific figures.
const MODULE_META = {
  sars:      { label: 'SARS',      penaltyDesc: 'Late interest + 10% admin penalty' },
  cipc:      { label: 'CIPC',      penaltyDesc: 'R250 – R2,000 per month late' },
  labour:    { label: 'Labour',    penaltyDesc: 'R10,000 – R50,000 (COIDA)' },
  bbbee:     { label: 'B-BBEE',    penaltyDesc: 'No direct fine (tender exclusion)' },
  popia:     { label: 'POPIA',     penaltyDesc: 'Up to R10M or 10 years imprisonment' },
  fica:      { label: 'FICA',      penaltyDesc: 'R10M or 15 years imprisonment' },
  municipal: { label: 'Municipal', penaltyDesc: 'Business closure / licence revocation' },
  ohs:       { label: 'OHS',       penaltyDesc: 'Up to R50,000 per contravention' },
  industry:  { label: 'Industry',  penaltyDesc: 'Permit suspension / revocation' },
};

const RISK_COLORS = { high: '#e74c3c', medium: '#f39c12', low: '#2ecc71' };

function riskStatus(riskPct) {
  if (riskPct >= 60) return 'high';
  if (riskPct >= 35) return 'medium';
  return 'low';
}

export default function RiskAnalytics() {
  const { dashboardData, fetchDashboardData } = useComplianceStore();
  const { riskAnalysis, riskLoading, fetchRiskAnalysis } = useAIInsightsStore();

  useEffect(() => {
    fetchRiskAnalysis();
    if (!dashboardData) fetchDashboardData();
  }, []);

  const moduleHealth = dashboardData?.moduleHealth || {};
  const overdueItems = dashboardData?.overdueItems || [];
  const scoreTrend   = dashboardData?.scoreTrend || [];
  const overallScore = dashboardData?.complianceScore ?? null;

  const overallRisk = overallScore != null ? 100 - overallScore : null;
  const totalPenalty = overdueItems.reduce((sum, i) => sum + (parseFloat(i.penalty_amount) || 0), 0);
  const activeIssues = overdueItems.length;

  // Build module risk rows from real module health scores
  const moduleRisks = Object.entries(moduleHealth)
    .filter(([, score]) => score != null)
    .map(([key, score]) => {
      const risk = Math.round(100 - score);
      const meta = MODULE_META[key] || { label: key.toUpperCase(), penaltyDesc: '—' };
      return { key, label: meta.label, risk, penaltyDesc: meta.penaltyDesc, status: riskStatus(risk) };
    })
    .sort((a, b) => b.risk - a.risk);

  const highCount   = moduleRisks.filter((m) => m.status === 'high').length;
  const mediumCount = moduleRisks.filter((m) => m.status === 'medium').length;
  const lowCount    = moduleRisks.filter((m) => m.status === 'low').length;

  const riskSummary = [
    { label: 'High Risk',   value: highCount,   color: '#e74c3c' },
    { label: 'Medium Risk', value: mediumCount,  color: '#f39c12' },
    { label: 'Low Risk',    value: lowCount,     color: '#2ecc71' },
  ].filter((r) => r.value > 0);

  // Score trend for chart (most recent 6 months)
  const trendData = scoreTrend.slice(-6).map((t) => ({
    month: t.month || t.period,
    score: t.score,
    risk: 100 - t.score,
  }));

  const noData = overallScore == null && moduleRisks.length === 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Risk Analytics</h1>
        <p>Compliance risk assessment derived from your real-time compliance data</p>
      </div>

      {/* AI Risk Analysis */}
      <div className="section-card" style={{ borderLeft: '4px solid #6366f1', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>🧠 Emma-i Risk Intelligence</h3>
          <button
            onClick={fetchRiskAnalysis}
            disabled={riskLoading}
            style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}
          >
            {riskLoading ? 'Analyzing…' : 'Re-analyze'}
          </button>
        </div>
        {riskLoading && <div style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>Emma-i is analyzing your risk profile…</div>}
        {riskAnalysis && !riskLoading && (
          <div>
            {riskAnalysis.overallRisk && (
              <div style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px',
                background: riskAnalysis.overallRisk === 'critical' ? '#fef2f2' : riskAnalysis.overallRisk === 'high' ? '#fff7ed' : riskAnalysis.overallRisk === 'medium' ? '#fefce8' : '#f0fdf4',
                color: riskAnalysis.overallRisk === 'critical' ? '#dc2626' : riskAnalysis.overallRisk === 'high' ? '#ea580c' : riskAnalysis.overallRisk === 'medium' ? '#ca8a04' : '#16a34a',
              }}>
                Overall: {riskAnalysis.overallRisk.toUpperCase()} RISK
              </div>
            )}
            {riskAnalysis.recommendation && <p style={{ fontSize: '0.9rem', color: '#334155', margin: '8px 0' }}>{riskAnalysis.recommendation}</p>}
            {riskAnalysis.topRisks?.map((risk, i) => (
              <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', marginTop: '8px', fontSize: '0.85rem' }}>
                <strong>{risk.title}</strong> <span style={{ color: '#64748b' }}>({risk.module})</span>
                <div style={{ color: '#475569', marginTop: '4px' }}>{risk.explanation}</div>
                {risk.mitigation && <div style={{ color: '#2563eb', marginTop: '4px' }}>Mitigation: {risk.mitigation}</div>}
              </div>
            ))}
          </div>
        )}
        {!riskLoading && !riskAnalysis && (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Click Re-analyze to get an AI-powered risk assessment.</p>
        )}
      </div>

      {noData ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
          <p style={{ fontSize: 16 }}>No compliance data available yet.</p>
          <p style={{ fontSize: 14 }}>Complete the compliance setup to see your risk profile.</p>
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="metrics-row">
            <div className={`metric-card ${overallRisk != null && overallRisk >= 60 ? 'risk-high' : overallRisk >= 35 ? '' : 'accent-green'}`}>
              <h3>Overall Risk Score</h3>
              <div className="metric-value">{overallRisk != null ? `${overallRisk}/100` : '—'}</div>
              <p className="metric-sub">
                {overallRisk != null
                  ? overallRisk >= 60 ? 'High risk — action required'
                  : overallRisk >= 35 ? 'Medium risk level'
                  : 'Low risk — keep it up'
                  : 'No score data'}
              </p>
            </div>
            <div className="metric-card">
              <h3>Active Overdue Items</h3>
              <div className="metric-value">{activeIssues}</div>
              <p className="metric-sub">Requiring immediate attention</p>
            </div>
            <div className="metric-card">
              <h3>Total Penalty Exposure</h3>
              <div className="metric-value">
                {totalPenalty > 0 ? `R${totalPenalty.toLocaleString()}` : 'R0'}
              </div>
              <p className="metric-sub">Across overdue items</p>
            </div>
            <div className="metric-card">
              <h3>Modules at Risk</h3>
              <div className="metric-value">{highCount + mediumCount}</div>
              <p className="metric-sub">{highCount} high · {mediumCount} medium</p>
            </div>
          </div>

          <div className="two-col-grid">
            {/* Risk Distribution Pie */}
            {riskSummary.length > 0 && (
              <div className="section-card">
                <h3>Risk Distribution by Module</h3>
                <div className="chart-container" style={{ height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={riskSummary} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                        {riskSummary.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Compliance Score Trend */}
            {trendData.length > 0 && (
              <div className="section-card">
                <h3>Compliance Score Trend (6 Months)</h3>
                <div className="chart-container" style={{ height: 250 }}>
                  <ResponsiveContainer>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Legend />
                      <Line type="monotone" dataKey="score" name="Compliance %" stroke="#2ecc71" strokeWidth={2} dot />
                      <Line type="monotone" dataKey="risk" name="Risk %" stroke="#e74c3c" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Module Risk Table */}
          {moduleRisks.length > 0 && (
            <div className="section-card">
              <h3>Risk by Compliance Module</h3>
              <div className="risk-table">
                <div className="risk-table-header">
                  <span>Module</span><span>Risk Level</span><span>Max Statutory Penalty</span><span>Action</span>
                </div>
                {moduleRisks.map((r) => (
                  <div key={r.key} className="risk-table-row">
                    <span className="risk-module">{r.label}</span>
                    <span>
                      <div className="risk-bar-bg">
                        <div className="risk-bar-fill" style={{ width: `${r.risk}%`, background: RISK_COLORS[r.status] }} />
                      </div>
                      <small>{r.risk}% risk</small>
                    </span>
                    <span className="risk-penalty" style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.penaltyDesc}</span>
                    <span>
                      <button className={`action-btn ${r.status}`}>
                        {r.status === 'high' ? 'Resolve Now' : r.status === 'medium' ? 'Review' : 'Monitor'}
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Items Detail */}
          {overdueItems.length > 0 && (
            <div className="section-card" style={{ marginTop: 24 }}>
              <h3>Overdue Items — Penalty Detail</h3>
              <div className="risk-table">
                <div className="risk-table-header">
                  <span>Regulation</span><span>Days Overdue</span><span>Penalty Amount</span>
                </div>
                {overdueItems.map((item, i) => (
                  <div key={i} className="risk-table-row">
                    <span className="risk-module">{item.regulation_name || item.regulation_code}</span>
                    <span style={{ color: '#e74c3c', fontWeight: 600 }}>{item.days_overdue} days</span>
                    <span className="risk-penalty">
                      {item.penalty_amount > 0 ? `R${parseFloat(item.penalty_amount).toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
