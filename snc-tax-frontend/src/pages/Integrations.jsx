import { useState } from 'react';
import './PageStyles.css';

const INTEGRATIONS = [
  {
    id: 'sars-efiling', name: 'SARS eFiling', icon: '🇿🇦', category: 'Government',
    description: 'Direct integration with SARS eFiling for tax submissions',
    status: 'available', filings: ['EMP201', 'VAT201', 'ITR14', 'IRP6', 'EMP501'],
    url: 'https://www.sarsefiling.co.za',
  },
  {
    id: 'cipc', name: 'CIPC e-Services', icon: '🏛️', category: 'Government',
    description: 'Company registration and annual return submissions',
    status: 'available', filings: ['Annual Return', 'CM29', 'CoR Forms'],
    url: 'https://eservices.cipc.co.za',
  },
  {
    id: 'compeasy', name: 'CompEasy (COIDA)', icon: '🛡️', category: 'Government',
    description: 'Compensation Fund return of earnings and payments',
    status: 'available', filings: ['Return of Earnings', 'Assessment'],
    url: 'https://www.labour.gov.za',
  },
  {
    id: 'uif', name: 'UIF u-Filing', icon: '👷', category: 'Government',
    description: 'Unemployment Insurance Fund declarations',
    status: 'available', filings: ['UI-19', 'Monthly declarations'],
    url: 'https://www.ufiling.co.za',
  },
  {
    id: 'xero', name: 'Xero Accounting', icon: '📊', category: 'Accounting',
    description: 'Cloud accounting integration for automated data sync',
    status: 'coming_soon', filings: ['Invoices', 'Bank feeds', 'Reports'],
  },
  {
    id: 'sage', name: 'Sage Business Cloud', icon: '📈', category: 'Accounting',
    description: 'Sage payroll and accounting data integration',
    status: 'coming_soon', filings: ['Payroll', 'GL', 'Tax packs'],
  },
  {
    id: 'quickbooks', name: 'QuickBooks', icon: '💼', category: 'Accounting',
    description: 'QuickBooks Online integration for financial data',
    status: 'coming_soon', filings: ['Invoices', 'Expenses', 'Reports'],
  },
  {
    id: 'whatsapp', name: 'WhatsApp Business', icon: '💬', category: 'Communication',
    description: 'Receive compliance alerts and reminders via WhatsApp',
    status: 'connected', filings: ['Alerts', 'Reminders', 'Reports'],
  },
  {
    id: 'email', name: 'Email Notifications', icon: '📧', category: 'Communication',
    description: 'Automated email alerts for deadlines and updates',
    status: 'connected', filings: ['Deadline alerts', 'Weekly digest', 'Audit reports'],
  },
  {
    id: 'google-drive', name: 'Google Drive', icon: '☁️', category: 'Storage',
    description: 'Sync compliance documents to Google Drive',
    status: 'available', filings: ['Document backup', 'Shared access'],
  },
];

const STATUS_MAP = {
  connected: { label: 'Connected', color: '#2ecc71' },
  available: { label: 'Available', color: '#3498db' },
  coming_soon: { label: 'Coming Soon', color: '#95a5a6' },
};

export default function Integrations() {
  const [filter, setFilter] = useState('all');
  const categories = ['all', ...new Set(INTEGRATIONS.map(i => i.category))];
  const filtered = filter === 'all' ? INTEGRATIONS : INTEGRATIONS.filter(i => i.category === filter);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{'\u{1F50C}'} Integrations</h1>
        <p>Connect Compl-Ai{'™'} with government portals, accounting software, and communication tools</p>
      </div>

      <div className="integration-stats">
        <div className="int-stat">{'\u{2705}'} {INTEGRATIONS.filter(i => i.status === 'connected').length} Connected</div>
        <div className="int-stat">{'\u{1F517}'} {INTEGRATIONS.filter(i => i.status === 'available').length} Available</div>
        <div className="int-stat">{'\u{23F3}'} {INTEGRATIONS.filter(i => i.status === 'coming_soon').length} Coming Soon</div>
      </div>

      <div className="filter-bar">
        {categories.map(c => (
          <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      <div className="integrations-grid">
        {filtered.map(intg => (
          <div key={intg.id} className={`integration-card ${intg.status}`}>
            <div className="int-card-header">
              <span className="int-icon">{intg.icon}</span>
              <div>
                <h3>{intg.name}</h3>
                <span className="int-category">{intg.category}</span>
              </div>
              <span className="int-status-dot" style={{ background: STATUS_MAP[intg.status].color }}>
                {STATUS_MAP[intg.status].label}
              </span>
            </div>
            <p className="int-desc">{intg.description}</p>
            <div className="int-filings">
              {intg.filings.map((f, i) => <span key={i} className="filing-chip">{f}</span>)}
            </div>
            <div className="int-actions">
              {intg.status === 'connected' ? (
                <button className="btn-connected">{'✓'} Connected</button>
              ) : intg.status === 'available' ? (
                <button className="btn-primary">Connect</button>
              ) : (
                <button className="btn-disabled" disabled>Coming Soon</button>
              )}
              {intg.url && <a href={intg.url} target="_blank" rel="noopener noreferrer" className="btn-link">Visit Portal {'↗'}</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
