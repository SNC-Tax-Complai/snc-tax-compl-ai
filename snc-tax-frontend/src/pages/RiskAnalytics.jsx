import { useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAIInsightsStore } from '../stores/aiInsightsStore';
import './PageStyles.css';

const RISK_SUMMARY = [
  { label: 'High Risk', value: 2, color: '#e74c3c' },
  { label: 'Medium Risk', value: 3, color: '#f39c12' },
  { label: 'Low Risk', value: 5, color: '#2ecc71' },
];

const MODULE_RISKS = [
  { module: 'SARS', risk: 74, penalty: 'R45,000', status: 'high', detail: 'EMP201 overdue, VAT201 upcoming' },
  { module: 'OHS', risk: 62, penalty: 'R25,000', status: 'medium', detail: 'Inspection overdue, risk assessment needed' },
  { module: 'CIPC', risk: 48, penalty: 'R8,500', status: 'medium', detail: 'Annual return due in 30 days' },
  { module: 'Labour', risk: 40, penalty: 'R15,000', status: 'medium', detail: 'Employment equity report pending' },
  { module: 'B-BBEE', risk: 35, penalty: 'R0', status: 'low', detail: 'Affidavit valid until June 2026' },
  { module: 'POPIA', risk: 20, penalty: 'R10M max', status: 'low', detail: 'Substantially compliant' },
  { module: 'FICA', risk: 15, penalty: 'R0', status: 'low', detail: 'All KYC documents current' },
  { module: 'Municipal', risk: 22, penalty: 'R3,200', status: 'low', detail: 'Business license current' },
  { module: 'Industry', risk: 10, penalty: 'R0', status: 'low', detail: 'Sector permits up to date' },
];

const PENALTY_TREND = [
  { month: 'Nov', potential: 82000, avoided: 75000 },
  { month: 'Dec', potential: 65000, avoided: 60000 },
  { month: 'Jan', potential: 45000, avoided: 42000 },
  { month: 'Feb', potential: 38000, avoided: 35000 },
  { month: 'Mar', potential: 52000, avoided: 48000 },
  { month: 'Apr', potential: 93500, avoided: 45000 },
];

const RISK_COLORS = { high: '#e74c3c', medium: '#f39c12', low: '#2ecc71' };

export default function RiskAnalytics() {
  const totalPotential = PENALTY_TREND.reduce((s, m) => s + m.potential, 0);
  const totalAvoided = PENALTY_TREND.reduce((s, m) => s + m.avoided, 0);
  const { riskAnalysis, riskLoading, fetchRiskAnalysis } = useAIInsightsStore();

  useEffect(() => { fetchRiskAnalysis(); }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{'\u{1F4CA}'} Risk Analytics</h1>
        <p>Comprehensive risk assessment across all South African compliance modules</p>
      </div>

      {/* AI Risk Analysis Panel */}
      <div className="section-card" style={{ borderLeft: '4px solid #6366f1', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{'\u{1F9E0}'} Emma-i Risk Intelligence</h3>
          <button onClick={fetchRiskAnalysis} disabled={riskLoading} style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>
            {riskLoading ? 'Analyzing...' : 'Re-analyze'}
          </button>
        </div>
        {riskLoading && <div style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>Emma-i is analyzing your risk profile...</div>}
        {riskAnalysis && !riskLoading && (
          <div>
            {riskAnalysis.overallRisk && (
              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px',
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
      </div>

      <div className="metrics-row">
        <div className="metric-card risk-high">
          <h3>Overall Risk Score</h3>
          <div className="metric-value">38/100</div>
          <p className="metric-sub">Medium risk level</p>
        </div>
        <div className="metric-card">
          <h3>Potential Penalties</h3>
          <div className="metric-value">R{(totalPotential / 1000).toFixed(0)}K</div>
          <p className="metric-sub">Total exposure (6 months)</p>
        </div>
        <div className="metric-card accent-green">
          <h3>Penalties Avoided</h3>
          <div className="metric-value">R{(totalAvoided / 1000).toFixed(0)}K</div>
          <p className="metric-sub">Saved through compliance</p>
        </div>
        <div className="metric-card">
          <h3>Active Issues</h3>
          <div className="metric-value">5</div>
          <p className="metric-sub">Requiring attention</p>
        </div>
      </div>

      <div className="two-col-grid">
        <div className="section-card">
          <h3>Risk Distribution</h3>
          <div className="chart-container" style={{ height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={RISK_SUMMARY} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {RISK_SUMMARY.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <h3>Penalty Trend (6 Months)</h3>
          <div className="chart-container" style={{ height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={PENALTY_TREND}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `R${v / 1000}K`} />
                <Tooltip formatter={(v) => `R${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="potential" name="Potential" fill="#e74c3c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avoided" name="Avoided" fill="#2ecc71" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Risk by Compliance Module</h3>
        <div className="risk-table">
          <div className="risk-table-header">
            <span>Module</span><span>Risk Level</span><span>Potential Penalty</span><span>Details</span><span>Action</span>
          </div>
          {MODULE_RISKS.map((r, i) => (
            <div key={i} className="risk-table-row">
              <span className="risk-module">{r.module}</span>
              <span>
                <div className="risk-bar-bg">
                  <div className="risk-bar-fill" style={{ width: `${r.risk}%`, background: RISK_COLORS[r.status] }} />
                </div>
                <small>{r.risk}%</small>
              </span>
              <span className="risk-penalty">{r.penalty}</span>
              <span className="risk-detail">{r.detail}</span>
              <span>
                <button className={`action-btn ${r.status}`}>
                  {r.status === 'high' ? 'Resolve Now' : r.status === 'medium' ? 'Review' : 'Monitor'}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
