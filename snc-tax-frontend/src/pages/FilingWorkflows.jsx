import { useState } from 'react';
import './PageStyles.css';

const WORKFLOWS = [
  {
    id: 'emp201', name: 'EMP201 Monthly Payroll', portal: 'SARS eFiling', category: 'SARS',
    frequency: 'Monthly (7th)', status: 'overdue', nextDue: '7 Apr 2026',
    steps: [
      { step: 'Calculate PAYE deductions', done: true },
      { step: 'Calculate SDL contributions (1%)', done: true },
      { step: 'Calculate UIF contributions (2%)', done: true },
      { step: 'Generate EMP201 return', done: false },
      { step: 'Submit via SARS eFiling', done: false },
      { step: 'Make payment to SARS', done: false },
      { step: 'Save confirmation in Vault', done: false },
    ],
  },
  {
    id: 'vat201', name: 'VAT201 Bi-Monthly Return', portal: 'SARS eFiling', category: 'SARS',
    frequency: 'Bi-Monthly (25th)', status: 'upcoming', nextDue: '25 Apr 2026',
    steps: [
      { step: 'Reconcile input VAT (purchases)', done: false },
      { step: 'Reconcile output VAT (sales)', done: false },
      { step: 'Review VAT-exempt transactions', done: false },
      { step: 'Generate VAT201 return', done: false },
      { step: 'Submit via SARS eFiling', done: false },
      { step: 'Pay net VAT / claim refund', done: false },
    ],
  },
  {
    id: 'cipc-ar', name: 'CIPC Annual Return', portal: 'CIPC e-Services', category: 'CIPC',
    frequency: 'Annually', status: 'upcoming', nextDue: '15 May 2026',
    steps: [
      { step: 'Verify company details on CIPC', done: true },
      { step: 'Confirm director information', done: true },
      { step: 'Declare annual turnover range', done: false },
      { step: 'Submit annual return online', done: false },
      { step: 'Pay filing fee (R100)', done: false },
      { step: 'Download compliance certificate', done: false },
    ],
  },
  {
    id: 'coida', name: 'COIDA Return of Earnings', portal: 'CompEasy', category: 'Labour',
    frequency: 'Annually', status: 'overdue', nextDue: '31 Mar 2026',
    steps: [
      { step: 'Calculate total earnings paid', done: true },
      { step: 'Classify employee categories', done: false },
      { step: 'Submit Return of Earnings', done: false },
      { step: 'Pay assessment fee', done: false },
      { step: 'Obtain Letter of Good Standing', done: false },
    ],
  },
  {
    id: 'itr14', name: 'Income Tax Return (ITR14)', portal: 'SARS eFiling', category: 'SARS',
    frequency: 'Annually', status: 'future', nextDue: '31 Aug 2026',
    steps: [
      { step: 'Prepare annual financial statements', done: false },
      { step: 'Calculate taxable income', done: false },
      { step: 'Apply deductions and allowances', done: false },
      { step: 'Complete ITR14 form', done: false },
      { step: 'Submit via SARS eFiling', done: false },
      { step: 'Pay provisional tax balance', done: false },
    ],
  },
  {
    id: 'bbee', name: 'B-BBEE Affidavit Renewal', portal: 'Commissioner of Oaths', category: 'B-BBEE',
    frequency: 'Annually', status: 'future', nextDue: '30 Jun 2026',
    steps: [
      { step: 'Confirm EME status (< R10M turnover)', done: false },
      { step: 'Determine ownership percentages', done: false },
      { step: 'Complete B-BBEE affidavit form', done: false },
      { step: 'Have affidavit commissioned', done: false },
      { step: 'Upload to document vault', done: false },
    ],
  },
];

const STATUS_COLORS = { overdue: '#e74c3c', upcoming: '#f39c12', future: '#3498db' };

export default function FilingWorkflows() {
  const [expandedId, setExpandedId] = useState('emp201');
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? WORKFLOWS : WORKFLOWS.filter(w => w.status === filter);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{'\u{1F4DD}'} Filing Workflows</h1>
        <p>Step-by-step guided workflows for all South African compliance filings</p>
      </div>

      <div className="workflow-stats">
        <div className="stat-chip overdue">{'\u{26A0}'} {WORKFLOWS.filter(w => w.status === 'overdue').length} Overdue</div>
        <div className="stat-chip upcoming">{'\u{23F0}'} {WORKFLOWS.filter(w => w.status === 'upcoming').length} Upcoming</div>
        <div className="stat-chip future">{'\u{1F4C5}'} {WORKFLOWS.filter(w => w.status === 'future').length} Future</div>
      </div>

      <div className="filter-bar">
        {['all', 'overdue', 'upcoming', 'future'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="workflows-list">
        {filtered.map((wf) => {
          const completedSteps = wf.steps.filter(s => s.done).length;
          const progress = Math.round((completedSteps / wf.steps.length) * 100);
          const isExpanded = expandedId === wf.id;

          return (
            <div key={wf.id} className={`workflow-card ${wf.status}`}>
              <div className="workflow-header" onClick={() => setExpandedId(isExpanded ? null : wf.id)}>
                <div className="workflow-title">
                  <span className="wf-status-dot" style={{ background: STATUS_COLORS[wf.status] }} />
                  <div>
                    <h3>{wf.name}</h3>
                    <p>{wf.portal} {'\u{2022}'} {wf.frequency}</p>
                  </div>
                </div>
                <div className="workflow-meta">
                  <span className={`due-badge ${wf.status}`}>{wf.nextDue}</span>
                  <div className="wf-progress">
                    <div className="wf-progress-bar">
                      <div className="wf-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <small>{completedSteps}/{wf.steps.length}</small>
                  </div>
                  <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="workflow-steps">
                  {wf.steps.map((step, i) => (
                    <div key={i} className={`wf-step ${step.done ? 'completed' : ''}`}>
                      <div className="step-number">{step.done ? '✅' : i + 1}</div>
                      <span className="step-label">{step.step}</span>
                      {!step.done && i === completedSteps && (
                        <button className="step-action-btn">Start</button>
                      )}
                    </div>
                  ))}
                  <div className="workflow-actions">
                    <button className="btn-primary">Open {wf.portal}</button>
                    <button className="btn-secondary">View Guide</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
