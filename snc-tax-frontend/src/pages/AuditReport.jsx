import { useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAIInsightsStore } from '../stores/aiInsightsStore';
import { useComplianceStore } from '../stores/complianceStore';
import './PageStyles.css';

// Module display metadata — labels and max statutory penalties (SA law, not user-specific)
const MODULE_META = {
  sars:      { label: 'SARS Tax Compliance' },
  cipc:      { label: 'CIPC Compliance' },
  labour:    { label: 'Labour Law (COIDA)' },
  ohs:       { label: 'OHS Compliance' },
  popia:     { label: 'POPIA & PAIA' },
  bbbee:     { label: 'B-BBEE' },
  fica:      { label: 'FICA' },
  municipal: { label: 'Municipal Licences' },
  industry:  { label: 'Industry Permits' },
};

const SCORE_STATUS = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'attention';
  return 'critical';
};

const SCORE_COLORS = { excellent: '#2ecc71', good: '#27ae60', attention: '#f39c12', critical: '#e74c3c' };
const SEVERITY_ICONS = { high: '🔴', medium: '🟡', ok: '🟢' };
const PIE_COLORS = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#2ecc71', '#f1c40f', '#e67e22', '#1abc9c'];

export default function AuditReport() {
  const { dashboardData, fetchDashboardData } = useComplianceStore();
  const { auditNarrative, auditLoading, fetchAuditNarrative } = useAIInsightsStore();

  useEffect(() => {
    fetchAuditNarrative();
    if (!dashboardData) fetchDashboardData();
  }, []);

  const moduleHealth = dashboardData?.moduleHealth || {};
  const overdueItems = dashboardData?.overdueItems || [];
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];

  // Build audit sections from real compliance data
  const auditSections = Object.entries(moduleHealth).map(([key, score]) => {
    const meta = MODULE_META[key] || { label: key.toUpperCase() };
    const status = SCORE_STATUS(score ?? 0);

    // Derive findings from real data
    const findings = [];
    const moduleOverdue = overdueItems.filter((o) =>
      (o.regulation_code || '').toLowerCase().includes(key) ||
      (o.regulation_name || '').toLowerCase().includes(key)
    );
    const moduleUpcoming = upcomingDeadlines.filter((d) =>
      (d.regulation_code || '').toLowerCase().includes(key) ||
      (d.regulation_name || '').toLowerCase().includes(key)
    );

    moduleOverdue.forEach((o) => {
      findings.push({
        finding: `${o.regulation_name || o.regulation_code} is overdue by ${o.days_overdue} day${o.days_overdue !== 1 ? 's' : ''}`,
        severity: 'high',
        recommendation: 'File immediately to stop penalty accrual.',
      });
    });

    moduleUpcoming.filter((d) => d.days_until_due <= 7).forEach((d) => {
      findings.push({
        finding: `${d.regulation_name || d.regulation_code} due in ${d.days_until_due} day${d.days_until_due !== 1 ? 's' : ''}`,
        severity: 'medium',
        recommendation: 'Prepare and submit before the due date.',
      });
    });

    if (findings.length === 0 && score >= 70) {
      findings.push({
        finding: 'No active issues detected for this module',
        severity: 'ok',
        recommendation: 'Maintain current compliance practices.',
      });
    }

    return { key, module: meta.label, score: score ?? 0, status, findings };
  });

  const noData = auditSections.length === 0;

  const overallScore = noData
    ? null
    : Math.round(auditSections.reduce((s, a) => s + a.score, 0) / auditSections.length);
  const totalFindings = auditSections.reduce((s, a) => s + a.findings.length, 0);
  const highFindings = auditSections.reduce((s, a) => s + a.findings.filter((f) => f.severity === 'high').length, 0);

  const pieData = auditSections.map((s) => ({ name: s.module.split(' ')[0], value: s.score }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📋 Compliance Audit Report</h1>
        <p>Automated audit derived from your real compliance data · Generated {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* AI Narrative */}
      <div className="section-card" style={{ borderLeft: '4px solid #6366f1', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>🧠 Emma-i Audit Narrative</h3>
          <button
            onClick={fetchAuditNarrative}
            disabled={auditLoading}
            style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}
          >
            {auditLoading ? 'Generating…' : 'Regenerate'}
          </button>
        </div>
        {auditLoading && <div style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>Emma-i is generating your audit narrative…</div>}
        {auditNarrative && !auditLoading && (
          <div>
            {auditNarrative.summary && <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '12px' }}>{auditNarrative.summary}</p>}
            {auditNarrative.strengths?.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#16a34a' }}>✅ Strengths:</strong>
                <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '0.85rem', color: '#374151' }}>
                  {auditNarrative.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {auditNarrative.risks?.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#dc2626' }}>⚠️ Key Risks:</strong>
                <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '0.85rem', color: '#374151' }}>
                  {auditNarrative.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {auditNarrative.recommendations?.length > 0 && (
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#2563eb' }}>💡 Recommendations:</strong>
                <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '0.85rem', color: '#374151' }}>
                  {auditNarrative.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
        {!auditLoading && !auditNarrative && (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Click Regenerate to get an AI-powered audit narrative of your compliance status.</p>
        )}
      </div>

      {noData ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
          <p style={{ fontSize: 16 }}>No compliance data available yet.</p>
          <p style={{ fontSize: 14 }}>Complete the compliance setup to generate your audit report.</p>
        </div>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="metrics-row" style={{ marginBottom: '24px' }}>
            <div className="metric-card">
              <h3>Overall Score</h3>
              <div className="metric-value" style={{ color: SCORE_COLORS[SCORE_STATUS(overallScore)] }}>
                {overallScore}%
              </div>
              <p className="metric-sub">{SCORE_STATUS(overallScore).charAt(0).toUpperCase() + SCORE_STATUS(overallScore).slice(1)}</p>
            </div>
            <div className="metric-card">
              <h3>Total Findings</h3>
              <div className="metric-value">{totalFindings}</div>
              <p className="metric-sub">Across all modules</p>
            </div>
            <div className="metric-card risk-high">
              <h3>High Severity</h3>
              <div className="metric-value">{highFindings}</div>
              <p className="metric-sub">Requiring immediate action</p>
            </div>
            <div className="metric-card accent-green">
              <h3>Modules Audited</h3>
              <div className="metric-value">{auditSections.length}</div>
              <p className="metric-sub">Compliance areas reviewed</p>
            </div>
          </div>

          <div className="two-col-grid" style={{ marginBottom: '24px' }}>
            <div className="section-card">
              <h3>Score by Module</h3>
              <div className="chart-container" style={{ height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={3}>
                      {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="section-card">
              <h3>Module Scores</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {auditSections.map((s) => (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 160, fontSize: 13, color: '#374151' }}>{s.module}</span>
                    <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.score}%`, background: SCORE_COLORS[s.status], borderRadius: 4 }} />
                    </div>
                    <span style={{ width: 40, textAlign: 'right', fontSize: 13, color: SCORE_COLORS[s.status], fontWeight: 600 }}>{s.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Findings per module */}
          {auditSections.map((section) => (
            <div key={section.key} className="audit-section-card">
              <div className="audit-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{section.module}</h3>
                  <span className="audit-status-badge" style={{ background: SCORE_COLORS[section.status] }}>
                    {section.status.charAt(0).toUpperCase() + section.status.slice(1)}
                  </span>
                </div>
                <div className="audit-score-circle" style={{ background: SCORE_COLORS[section.status] }}>
                  {section.score}%
                </div>
              </div>
              <div className="audit-findings">
                {section.findings.map((f, i) => (
                  <div key={i} className="audit-finding-row">
                    <span className="finding-icon">{SEVERITY_ICONS[f.severity]}</span>
                    <div className="finding-content">
                      <p className="finding-text">{f.finding}</p>
                      <p className="finding-rec">→ {f.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
