import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './PageStyles.css';

const AUDIT_SECTIONS = [
  {
    module: 'SARS Tax Compliance', score: 75, status: 'attention',
    findings: [
      { finding: 'EMP201 submission delayed by 2 days', severity: 'high', recommendation: 'Set up automated reminders 5 days before due date' },
      { finding: 'VAT201 documentation incomplete', severity: 'medium', recommendation: 'Ensure all invoices are digitized and linked to entries' },
      { finding: 'Provisional tax payments on schedule', severity: 'ok', recommendation: 'Continue current process' },
    ],
  },
  {
    module: 'CIPC Compliance', score: 90, status: 'good',
    findings: [
      { finding: 'Annual return filed on time', severity: 'ok', recommendation: 'Maintain current filing schedule' },
      { finding: 'Director changes not updated within 28 days', severity: 'medium', recommendation: 'Update CM29 within 28 days of any changes' },
    ],
  },
  {
    module: 'Labour Law Compliance', score: 60, status: 'attention',
    findings: [
      { finding: 'COIDA Return of Earnings overdue', severity: 'high', recommendation: 'Submit immediately to avoid penalties' },
      { finding: 'Employment contracts in place for all staff', severity: 'ok', recommendation: 'Continue current practice' },
      { finding: 'Employment Equity Report not submitted', severity: 'high', recommendation: 'Submit EEA2/EEA4 to Dept of Labour' },
      { finding: 'Skills Development Levy returns current', severity: 'ok', recommendation: 'Maintain SDL submissions via EMP201' },
    ],
  },
  {
    module: 'OHS Compliance', score: 45, status: 'critical',
    findings: [
      { finding: 'No OHS risk assessment conducted', severity: 'high', recommendation: 'Engage certified OHS practitioner for assessment' },
      { finding: 'First aid box not inspected this quarter', severity: 'medium', recommendation: 'Schedule quarterly inspections' },
      { finding: 'Fire extinguishers not serviced annually', severity: 'high', recommendation: 'Service all extinguishers and keep certificates' },
    ],
  },
  {
    module: 'POPIA & PAIA', score: 80, status: 'good',
    findings: [
      { finding: 'Privacy policy published on website', severity: 'ok', recommendation: 'Review annually for updates' },
      { finding: 'Information Officer not registered', severity: 'medium', recommendation: 'Register with Information Regulator' },
      { finding: 'Data processing agreements signed', severity: 'ok', recommendation: 'Maintain register of agreements' },
    ],
  },
  {
    module: 'B-BBEE', score: 95, status: 'excellent',
    findings: [
      { finding: 'EME affidavit current and valid', severity: 'ok', recommendation: 'Renew before June 2026 expiry' },
      { finding: 'Black ownership above 51%', severity: 'ok', recommendation: 'Maintain for Level 2 status' },
    ],
  },
];

const SCORE_COLORS = { excellent: '#2ecc71', good: '#27ae60', attention: '#f39c12', critical: '#e74c3c' };
const SEVERITY_ICONS = { high: '🔴', medium: '🟡', ok: '🟢' };

const pieData = AUDIT_SECTIONS.map(s => ({ name: s.module.split(' ')[0], value: s.score }));
const PIE_COLORS = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#2ecc71'];

export default function AuditReport() {
  const overallScore = Math.round(AUDIT_SECTIONS.reduce((s, a) => s + a.score, 0) / AUDIT_SECTIONS.length);
  const totalFindings = AUDIT_SECTIONS.reduce((s, a) => s + a.findings.length, 0);
  const highFindings = AUDIT_SECTIONS.reduce((s, a) => s + a.findings.filter(f => f.severity === 'high').length, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{'\u{1F4CB}'} Compliance Audit Report</h1>
        <p>Comprehensive compliance audit for SA SMME {'\u{2014}'} Generated May 2026</p>
      </div>

      <div className="audit-summary">
        <div className="audit-score-card">
          <div className={`audit-score-circle ${overallScore >= 80 ? 'good' : overallScore >= 60 ? 'attention' : 'critical'}`}>
            <span>{overallScore}%</span>
          </div>
          <h3>Overall Compliance Score</h3>
        </div>
        <div className="audit-stats">
          <div className="audit-stat">
            <h4>{AUDIT_SECTIONS.length}</h4>
            <p>Modules Audited</p>
          </div>
          <div className="audit-stat">
            <h4>{totalFindings}</h4>
            <p>Total Findings</p>
          </div>
          <div className="audit-stat highlight-red">
            <h4>{highFindings}</h4>
            <p>Critical Issues</p>
          </div>
        </div>
        <div className="audit-chart" style={{ height: 200 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {AUDIT_SECTIONS.map((section, i) => (
        <div key={i} className="audit-section-card">
          <div className="audit-section-header">
            <div className="audit-module-info">
              <h3>{section.module}</h3>
              <span className={`audit-status-badge ${section.status}`}>{section.status}</span>
            </div>
            <div className="audit-module-score">
              <div className="score-bar-bg">
                <div className="score-bar-fill" style={{ width: `${section.score}%`, background: SCORE_COLORS[section.status] }} />
              </div>
              <strong>{section.score}%</strong>
            </div>
          </div>
          <div className="audit-findings">
            {section.findings.map((f, j) => (
              <div key={j} className={`audit-finding ${f.severity}`}>
                <span className="finding-icon">{SEVERITY_ICONS[f.severity]}</span>
                <div className="finding-content">
                  <p className="finding-text">{f.finding}</p>
                  <p className="finding-rec">{'\u{1F4A1}'} {f.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="audit-footer">
        <button className="btn-primary">{'\u{1F4E5}'} Export PDF Report</button>
        <button className="btn-secondary">{'\u{1F4E7}'} Email to Auditor</button>
        <button className="btn-secondary">{'\u{1F5A8}'} Print Report</button>
      </div>
    </div>
  );
}
