import { useState, useEffect } from 'react';
import { useAIInsightsStore } from '../stores/aiInsightsStore';
import { useComplianceStore } from '../stores/complianceStore';
import './PageStyles.css';

const PORTAL_URLS = {
  'SARS eFiling': 'https://www.sarsefiling.co.za',
  'CIPC e-Services': 'https://eservices.cipc.co.za',
  'CompEasy': 'https://www.labour.gov.za',
  'UIF u-Filing': 'https://www.ufiling.co.za',
  'Commissioner of Oaths': null,
};

// Static workflow guides — SA filing processes are standard and do not change per user.
// Due dates and statuses are updated from the live compliance dashboard below.
const WORKFLOW_GUIDES = [
  {
    id: 'emp201', code: 'EMP201', name: 'EMP201 Monthly Payroll', portal: 'SARS eFiling', category: 'SARS',
    frequency: 'Monthly (7th)',
    steps: [
      'Calculate PAYE deductions',
      'Calculate SDL contributions (1%)',
      'Calculate UIF contributions (2%)',
      'Generate EMP201 return on SARS eFiling',
      'Submit via SARS eFiling',
      'Make payment to SARS',
      'Save confirmation in Vault',
    ],
  },
  {
    id: 'vat201', code: 'VAT201', name: 'VAT201 Bi-Monthly Return', portal: 'SARS eFiling', category: 'SARS',
    frequency: 'Bi-Monthly (25th)',
    steps: [
      'Reconcile input VAT (purchases)',
      'Reconcile output VAT (sales)',
      'Review VAT-exempt transactions',
      'Generate VAT201 return',
      'Submit via SARS eFiling',
      'Pay net VAT or claim refund',
    ],
  },
  {
    id: 'cipc-ar', code: 'CIPC', name: 'CIPC Annual Return', portal: 'CIPC e-Services', category: 'CIPC',
    frequency: 'Annually',
    steps: [
      'Verify company details on CIPC',
      'Confirm director information',
      'Declare annual turnover range',
      'Submit annual return online',
      'Pay filing fee (R100)',
      'Download compliance certificate',
    ],
  },
  {
    id: 'coida', code: 'COIDA', name: 'COIDA Return of Earnings', portal: 'CompEasy', category: 'Labour',
    frequency: 'Annually (31 March)',
    steps: [
      'Calculate total earnings paid to all employees',
      'Classify employee risk categories',
      'Submit Return of Earnings via CompEasy',
      'Pay compensation fund assessment fee',
      'Obtain Letter of Good Standing',
    ],
  },
  {
    id: 'itr14', code: 'ITR14', name: 'Income Tax Return (ITR14)', portal: 'SARS eFiling', category: 'SARS',
    frequency: 'Annually',
    steps: [
      'Prepare annual financial statements',
      'Calculate taxable income',
      'Apply deductions and allowances',
      'Complete ITR14 form on SARS eFiling',
      'Submit via SARS eFiling',
      'Pay provisional tax balance (if any)',
    ],
  },
  {
    id: 'bbee', code: 'BBEE', name: 'B-BBEE Affidavit Renewal', portal: 'Commissioner of Oaths', category: 'B-BBEE',
    frequency: 'Annually',
    steps: [
      'Confirm EME status (< R10M annual turnover)',
      'Determine ownership percentages',
      'Complete B-BBEE affidavit form',
      'Have affidavit commissioned by Commissioner of Oaths',
      'Upload signed affidavit to Document Vault',
    ],
  },
];

// Fuzzy-match a regulation code/name to a workflow guide
function matchWorkflow(item) {
  const code = (item.regulation_code || '').toUpperCase();
  const name = (item.regulation_name || '').toUpperCase();
  return WORKFLOW_GUIDES.find((w) => {
    const wc = w.code.toUpperCase();
    return code.includes(wc) || name.includes(wc) || code === w.id.toUpperCase();
  });
}

const STATUS_COLORS = { overdue: '#e74c3c', upcoming: '#f39c12', future: '#3498db', current: '#2ecc71' };

function loadProgress(workflowId) {
  try {
    const raw = localStorage.getItem(`wf_progress_${workflowId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(workflowId, stepIndex, done) {
  try {
    const current = loadProgress(workflowId);
    current[stepIndex] = done;
    localStorage.setItem(`wf_progress_${workflowId}`, JSON.stringify(current));
  } catch {}
}

export default function FilingWorkflows() {
  const [expandedId, setExpandedId] = useState('emp201');
  const [filter, setFilter] = useState('all');
  const [progress, setProgress] = useState({});
  const { filingGuidance, filingLoading, fetchFilingGuidance } = useAIInsightsStore();
  const [guidanceType, setGuidanceType] = useState(null);
  const { dashboardData, fetchDashboardData } = useComplianceStore();

  useEffect(() => {
    if (!dashboardData) fetchDashboardData();
    // Load all progress from localStorage
    const all = {};
    WORKFLOW_GUIDES.forEach((wf) => { all[wf.id] = loadProgress(wf.id); });
    setProgress(all);
  }, []);

  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
  const overdueItems      = dashboardData?.overdueItems || [];

  // Enrich each workflow guide with live deadline data
  const workflows = WORKFLOW_GUIDES.map((wf) => {
    const overdue  = overdueItems.find((o) => matchWorkflow(o)?.id === wf.id);
    const upcoming = upcomingDeadlines.find((d) => matchWorkflow(d)?.id === wf.id);

    let status = 'future';
    let nextDue = null;

    if (overdue) {
      status = 'overdue';
      nextDue = `Overdue by ${overdue.days_overdue} day${overdue.days_overdue !== 1 ? 's' : ''}`;
    } else if (upcoming) {
      const days = upcoming.days_until_due;
      status = days <= 7 ? 'upcoming' : 'current';
      nextDue = upcoming.formatted_due_date || upcoming.next_due_date;
    }

    return { ...wf, status, nextDue };
  });

  const filtered = filter === 'all' ? workflows : workflows.filter((w) => w.status === filter);

  const handleAskEmma = (filingType) => {
    setGuidanceType(filingType);
    fetchFilingGuidance(filingType);
  };

  const toggleStep = (workflowId, stepIndex) => {
    const current = progress[workflowId] || {};
    const done = !current[stepIndex];
    saveProgress(workflowId, stepIndex, done);
    setProgress((prev) => ({
      ...prev,
      [workflowId]: { ...current, [stepIndex]: done },
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📝 Filing Workflows</h1>
        <p>Step-by-step guided checklists for all South African compliance filings</p>
      </div>

      {/* AI Filing Guidance Panel */}
      {(filingGuidance || filingLoading) && (
        <div className="section-card" style={{ borderLeft: '4px solid #6366f1', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>🧠 Emma-i Filing Guide{guidanceType ? `: ${guidanceType}` : ''}</h3>
            <button onClick={() => setGuidanceType(null)} style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>Close</button>
          </div>
          {filingLoading && <div style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>Emma-i is preparing your filing guide…</div>}
          {filingGuidance && !filingLoading && (
            <div>
              {filingGuidance.deadline && <p style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '8px' }}>Deadline: {filingGuidance.deadline}</p>}
              {filingGuidance.steps?.map((step, i) => (
                <div key={i} style={{ padding: '10px 14px', background: i % 2 === 0 ? '#f8fafc' : '#fff', borderRadius: '6px', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <strong>Step {step.step}: {step.title}</strong>
                  <div style={{ color: '#475569', marginTop: '4px' }}>{step.description}</div>
                  {step.url && <a href={step.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.82rem' }}>{step.url}</a>}
                </div>
              ))}
              {filingGuidance.commonMistakes?.length > 0 && (
                <div style={{ background: '#fef3c7', padding: '10px 14px', borderRadius: '8px', marginTop: '10px', fontSize: '0.83rem' }}>
                  <strong>Common Mistakes:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
                    {filingGuidance.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="workflow-stats">
        <div className="stat-chip overdue">⚠ {workflows.filter((w) => w.status === 'overdue').length} Overdue</div>
        <div className="stat-chip upcoming">⏰ {workflows.filter((w) => w.status === 'upcoming').length} Due Soon</div>
        <div className="stat-chip future">📅 {workflows.filter((w) => w.status === 'current' || w.status === 'future').length} On Track / Future</div>
      </div>

      <div className="filter-bar">
        {['all', 'overdue', 'upcoming', 'current', 'future'].map((f) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'current' ? 'On Track' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="workflows-list">
        {filtered.map((wf) => {
          const wfProgress = progress[wf.id] || {};
          const completedSteps = wf.steps.filter((_, i) => wfProgress[i]).length;
          const pct = Math.round((completedSteps / wf.steps.length) * 100);
          const isExpanded = expandedId === wf.id;
          const portalUrl = PORTAL_URLS[wf.portal];

          return (
            <div key={wf.id} className={`workflow-card ${wf.status}`}>
              <div className="workflow-header" onClick={() => setExpandedId(isExpanded ? null : wf.id)}>
                <div className="workflow-title">
                  <span className="wf-status-dot" style={{ background: STATUS_COLORS[wf.status] || '#95a5a6' }} />
                  <div>
                    <h3>{wf.name}</h3>
                    <p>{wf.portal} · {wf.frequency}</p>
                  </div>
                </div>
                <div className="workflow-meta">
                  {wf.nextDue && (
                    <span className={`due-badge ${wf.status}`}>{wf.nextDue}</span>
                  )}
                  <div className="wf-progress">
                    <div className="wf-progress-bar">
                      <div className="wf-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <small>{completedSteps}/{wf.steps.length}</small>
                  </div>
                  <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="workflow-steps">
                  {wf.steps.map((step, i) => {
                    const done = !!wfProgress[i];
                    return (
                      <div key={i} className={`wf-step ${done ? 'completed' : ''}`} onClick={() => toggleStep(wf.id, i)} style={{ cursor: 'pointer' }}>
                        <div className="step-number">{done ? '✅' : i + 1}</div>
                        <span className="step-label" style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#9ca3af' : undefined }}>{step}</span>
                      </div>
                    );
                  })}
                  <div className="workflow-actions">
                    {portalUrl ? (
                      <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Open {wf.portal} ↗
                      </a>
                    ) : (
                      <span className="btn-secondary" style={{ opacity: 0.6 }}>{wf.portal}</span>
                    )}
                    <button
                      className="btn-secondary"
                      style={{ background: '#6366f1', color: '#fff', borderColor: '#6366f1' }}
                      onClick={() => handleAskEmma(wf.name)}
                    >
                      🧠 Ask Emma-i
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Click a step to mark as complete. Progress is saved locally.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
