import { useState, useEffect } from 'react';
import api from '../services/api';
import './PageStyles.css';

const GOV_PORTALS = [
  {
    id: 'sars-efiling', name: 'SARS eFiling', icon: '🇿🇦', category: 'Government',
    description: 'File EMP201, VAT201, ITR14, IRP6, and EMP501 returns via SARS eFiling.',
    filings: ['EMP201', 'VAT201', 'ITR14', 'IRP6', 'EMP501'],
    url: 'https://www.sarsefiling.co.za',
  },
  {
    id: 'cipc', name: 'CIPC e-Services', icon: '🏛️', category: 'Government',
    description: 'Submit company annual returns and registration forms via CIPC.',
    filings: ['Annual Return', 'CM29', 'CoR Forms'],
    url: 'https://eservices.cipc.co.za',
  },
  {
    id: 'compeasy', name: 'CompEasy (COIDA)', icon: '🛡️', category: 'Government',
    description: 'Submit COIDA return of earnings and compensation fund payments.',
    filings: ['Return of Earnings', 'Assessment'],
    url: 'https://www.labour.gov.za',
  },
  {
    id: 'uif', name: 'UIF u-Filing', icon: '👷', category: 'Government',
    description: 'Submit UI-19 declarations and monthly unemployment insurance filings.',
    filings: ['UI-19', 'Monthly declarations'],
    url: 'https://www.ufiling.co.za',
  },
];

const ACCOUNTING_TOOLS = [
  {
    id: 'xero', name: 'Xero Accounting', icon: '📊', category: 'Accounting',
    description: 'Cloud accounting integration for automated data sync. Coming soon.',
    filings: ['Invoices', 'Bank feeds', 'Reports'],
  },
  {
    id: 'sage', name: 'Sage Business Cloud', icon: '📈', category: 'Accounting',
    description: 'Sage payroll and accounting data integration. Coming soon.',
    filings: ['Payroll', 'GL', 'Tax packs'],
  },
  {
    id: 'quickbooks', name: 'QuickBooks', icon: '💼', category: 'Accounting',
    description: 'QuickBooks Online financial data integration. Coming soon.',
    filings: ['Invoices', 'Expenses', 'Reports'],
  },
];

export default function Integrations() {
  const [filter, setFilter] = useState('all');
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [waConfigured, setWaConfigured] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/status')
      .then(({ data }) => {
        setEmailConfigured(data.email?.configured || false);
        setWaConfigured(data.whatsapp?.configured || false);
      })
      .catch(() => {})
      .finally(() => setStatusLoading(false));
  }, []);

  const COMM_INTEGRATIONS = [
    {
      id: 'whatsapp', name: 'WhatsApp Business', icon: '💬', category: 'Communication',
      description: 'Receive compliance alerts and deadline reminders via WhatsApp.',
      filings: ['Deadline alerts', 'Overdue warnings', 'Score updates'],
      configured: waConfigured,
      settingsPath: '/whatsapp',
    },
    {
      id: 'email', name: 'Email Notifications', icon: '📧', category: 'Communication',
      description: 'Automated email alerts for deadlines, score changes, and regulatory updates.',
      filings: ['Deadline alerts', 'Weekly digest', 'Audit reports'],
      configured: emailConfigured,
      settingsPath: '/settings',
    },
  ];

  const ALL_INTEGRATIONS = [
    ...GOV_PORTALS.map((i) => ({ ...i, type: 'gov' })),
    ...ACCOUNTING_TOOLS.map((i) => ({ ...i, type: 'coming_soon' })),
    ...COMM_INTEGRATIONS.map((i) => ({ ...i, type: 'comm' })),
  ];

  const categories = ['all', 'Government', 'Accounting', 'Communication'];
  const filtered = filter === 'all' ? ALL_INTEGRATIONS : ALL_INTEGRATIONS.filter((i) => i.category === filter);

  const connectedCount = COMM_INTEGRATIONS.filter((i) => i.configured).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔌 Integrations</h1>
        <p>Connect Compl-Ai™ with government portals, accounting software, and communication services</p>
      </div>

      <div className="integration-stats">
        <div className="int-stat">✅ {statusLoading ? '…' : connectedCount} Connected</div>
        <div className="int-stat">🔗 {GOV_PORTALS.length} Government Portals</div>
        <div className="int-stat">⏳ {ACCOUNTING_TOOLS.length} Coming Soon</div>
      </div>

      <div className="filter-bar">
        {categories.map((c) => (
          <button
            key={c}
            className={`filter-btn ${filter === c ? 'active' : ''}`}
            onClick={() => setFilter(c)}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      <div className="integrations-grid">
        {filtered.map((intg) => {
          const isGov = intg.type === 'gov';
          const isComingSoon = intg.type === 'coming_soon';
          const isComm = intg.type === 'comm';
          const isConnected = isComm && intg.configured;

          return (
            <div key={intg.id} className={`integration-card ${isConnected ? 'connected' : isComingSoon ? 'coming_soon' : 'available'}`}>
              <div className="int-card-header">
                <span className="int-icon">{intg.icon}</span>
                <div>
                  <h3>{intg.name}</h3>
                  <span className="int-category">{intg.category}</span>
                </div>
                <span
                  className="int-status-dot"
                  style={{
                    background: isConnected ? '#2ecc71' : isComingSoon ? '#95a5a6' : '#3498db',
                  }}
                >
                  {isConnected ? 'Connected' : isComingSoon ? 'Coming Soon' : 'Available'}
                </span>
              </div>

              <p className="int-desc">{intg.description}</p>

              <div className="int-filings">
                {intg.filings.map((f, i) => (
                  <span key={i} className="filing-chip">{f}</span>
                ))}
              </div>

              <div className="int-actions">
                {isConnected ? (
                  <button className="btn-connected" onClick={() => window.location.hash = intg.settingsPath || ''}>
                    ✓ Connected — Settings
                  </button>
                ) : isComingSoon ? (
                  <button className="btn-disabled" disabled>Coming Soon</button>
                ) : isComm ? (
                  <button className="btn-primary" onClick={() => window.location.hash = intg.settingsPath || ''}>
                    Configure
                  </button>
                ) : (
                  /* Government portals: open the external portal */
                  <a href={intg.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    Open Portal ↗
                  </a>
                )}

                {isGov && intg.url && (
                  <a href={intg.url} target="_blank" rel="noopener noreferrer" className="btn-link">
                    Visit Portal ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
