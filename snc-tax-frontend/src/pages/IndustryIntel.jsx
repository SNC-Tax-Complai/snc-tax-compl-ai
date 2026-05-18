import './PageStyles.css';

const SECTOR_UPDATES = [
  {
    date: '12 May 2026', title: 'SARS Tax Threshold Update for SMMEs',
    sector: 'All Sectors', severity: 'important',
    summary: 'SARS has revised the small business corporation tax thresholds for the 2026/27 tax year. Companies with turnover under R20 million now qualify for reduced rates.',
    impact: 'Tax savings of up to R15,000 for qualifying SMMEs',
  },
  {
    date: '8 May 2026', title: 'New B-BBEE Sector Codes Published',
    sector: 'Professional Services', severity: 'moderate',
    summary: 'Updated sector codes for professional services firms including revised management control and skills development targets.',
    impact: 'May affect your B-BBEE scorecard calculation',
  },
  {
    date: '1 May 2026', title: 'Minimum Wage Increase Effective',
    sector: 'All Sectors', severity: 'critical',
    summary: 'The national minimum wage has increased to R28.79 per hour effective 1 March 2026. All employment contracts must reflect the new rate.',
    impact: 'Update payroll systems immediately to avoid Labour Act penalties',
  },
  {
    date: '25 Apr 2026', title: 'POPIA Enforcement Intensifies',
    sector: 'Technology', severity: 'important',
    summary: 'The Information Regulator has issued 15 new enforcement notices to companies failing to register Information Officers. Fines of up to R10 million.',
    impact: 'Register your Information Officer before inspection',
  },
  {
    date: '18 Apr 2026', title: 'Construction Industry OHS Requirements Updated',
    sector: 'Construction', severity: 'moderate',
    summary: 'New Construction Regulations gazetted requiring updated fall protection plans and mandatory COVID-19 protocols for sites.',
    impact: 'Review and update OHS documentation for all construction sites',
  },
  {
    date: '10 Apr 2026', title: 'CIPC Annual Return Fee Reduction',
    sector: 'All Sectors', severity: 'info',
    summary: 'CIPC has reduced annual return filing fees for small companies from R100 to R80, effective from April 2026.',
    impact: 'Saves R20 per annual return submission',
  },
];

const SECTOR_COMPLIANCE = [
  { sector: 'Retail & Hospitality', requirements: 6, met: 5, score: 83 },
  { sector: 'Professional Services', requirements: 8, met: 7, score: 88 },
  { sector: 'Construction', requirements: 12, met: 8, score: 67 },
  { sector: 'Manufacturing', requirements: 10, met: 7, score: 70 },
  { sector: 'Technology & IT', requirements: 7, met: 6, score: 86 },
  { sector: 'Healthcare', requirements: 14, met: 10, score: 71 },
];

const SEVERITY_MAP = {
  critical: { color: '#e74c3c', icon: '🔴' },
  important: { color: '#f39c12', icon: '🟠' },
  moderate: { color: '#3498db', icon: '🔵' },
  info: { color: '#2ecc71', icon: '🟢' },
};

export default function IndustryIntel() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{'\u{1F3ED}'} Industry Intelligence</h1>
        <p>Sector-specific regulatory updates and compliance insights for South African businesses</p>
      </div>

      <div className="intel-alerts">
        <h2>{'\u{1F4E2}'} Latest Regulatory Updates</h2>
        {SECTOR_UPDATES.map((update, i) => (
          <div key={i} className={`intel-card ${update.severity}`}>
            <div className="intel-card-header">
              <div className="intel-severity">
                <span>{SEVERITY_MAP[update.severity].icon}</span>
                <span className="intel-date">{update.date}</span>
              </div>
              <span className="intel-sector-badge">{update.sector}</span>
            </div>
            <h3>{update.title}</h3>
            <p className="intel-summary">{update.summary}</p>
            <div className="intel-impact">
              <strong>{'\u{1F4A1}'} Impact:</strong> {update.impact}
            </div>
          </div>
        ))}
      </div>

      <div className="section-card">
        <h2>{'\u{1F4CA}'} Sector Compliance Benchmarks</h2>
        <p>How your industry peers compare in compliance performance</p>
        <div className="sector-benchmarks">
          {SECTOR_COMPLIANCE.map((sector, i) => (
            <div key={i} className="benchmark-row">
              <div className="benchmark-info">
                <strong>{sector.sector}</strong>
                <small>{sector.met}/{sector.requirements} requirements met</small>
              </div>
              <div className="benchmark-bar-container">
                <div className="benchmark-bar">
                  <div
                    className="benchmark-fill"
                    style={{
                      width: `${sector.score}%`,
                      background: sector.score >= 80 ? '#2ecc71' : sector.score >= 60 ? '#f39c12' : '#e74c3c',
                    }}
                  />
                </div>
                <span className="benchmark-score">{sector.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <h2>{'\u{1F4DA}'} Compliance Resources</h2>
        <div className="resources-grid">
          {[
            { title: 'SARS SMME Guide', desc: 'Complete tax guide for small businesses', icon: '📋' },
            { title: 'Labour Law Handbook', desc: 'Employment regulations summary', icon: '📖' },
            { title: 'B-BBEE Calculator', desc: 'Calculate your B-BBEE level', icon: '🧮' },
            { title: 'POPIA Toolkit', desc: 'Data protection compliance checklist', icon: '🔐' },
            { title: 'OHS Templates', desc: 'Health & safety document templates', icon: '⛑️' },
            { title: 'CIPC Filing Guide', desc: 'Step-by-step annual return guide', icon: '🏢' },
          ].map((res, i) => (
            <button key={i} className="resource-card">
              <span className="resource-icon">{res.icon}</span>
              <h4>{res.title}</h4>
              <p>{res.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
