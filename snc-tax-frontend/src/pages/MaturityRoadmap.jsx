import { useState, useEffect } from 'react';
import { useAIInsightsStore } from '../stores/aiInsightsStore';
import { useComplianceStore } from '../stores/complianceStore';
import './PageStyles.css';

// Standard SA compliance maturity framework — milestones are instructional; user ticks them off.
const MATURITY_FRAMEWORK = [
  {
    level: 1, name: 'Non-Compliant',
    description: 'No formal compliance processes in place',
    milestones: [
      'Register company with CIPC',
      'Register for income tax (SARS)',
      'Register for PAYE, UIF, and SDL',
    ],
  },
  {
    level: 2, name: 'Basic Compliance',
    description: 'Core registrations and basic filings in place',
    milestones: [
      'File first annual return (CIPC)',
      'Submit first EMP201 payroll return',
      'Obtain B-BBEE affidavit or verification',
      'Register for VAT (if turnover ≥ R1M)',
    ],
  },
  {
    level: 3, name: 'Operationally Compliant',
    description: 'Regular filings maintained on schedule',
    milestones: [
      'Monthly EMP201 submitted on time',
      'VAT201 bi-monthly submissions on time',
      'COIDA Letter of Good Standing obtained',
      'OHS Risk Assessment completed',
      'Employment contracts signed for all staff',
    ],
  },
  {
    level: 4, name: 'Substantially Compliant',
    description: 'Proactive compliance management and monitoring',
    milestones: [
      'POPIA Information Officer registered',
      'B-BBEE QSE Verification obtained',
      'Employment Equity Plan (EEA2/EEA4) submitted',
      'Skills Development Plan in place',
      'Workplace Health & Safety Committee established',
    ],
  },
  {
    level: 5, name: 'Advanced Compliance',
    description: 'Automated compliance with predictive analytics',
    milestones: [
      'Automated filing reminders configured',
      'Real-time compliance dashboard monitoring',
      'Risk prediction analytics active',
      'Document vault fully organised and up to date',
    ],
  },
  {
    level: 6, name: 'Fully Compliant & Optimised',
    description: 'Best-in-class compliance with continuous improvement',
    milestones: [
      'Annual external compliance audit passed',
      'Tax optimisation strategy implemented',
      'ISO 9001 Quality Management System adopted',
      'Continuous compliance monitoring fully automated',
    ],
  },
];

function loadMilestones() {
  try {
    const raw = localStorage.getItem('maturity_milestones');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMilestones(data) {
  try {
    localStorage.setItem('maturity_milestones', JSON.stringify(data));
  } catch {}
}

export default function MaturityRoadmap() {
  const { dashboardData, fetchDashboardData } = useComplianceStore();
  const { maturityAdvice, maturityLoading, fetchMaturityAdvice } = useAIInsightsStore();
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!dashboardData) fetchDashboardData();
    setProgress(loadMilestones());
  }, []);

  // Derive current maturity level from real compliance score
  const realMaturityLevel = dashboardData?.maturityLevel ?? null;

  // Determine level status based on real maturity level
  const getLevelStatus = (levelNum) => {
    if (realMaturityLevel == null) {
      // Fall back to milestone-based progress if no real data
      return 'future';
    }
    if (levelNum < realMaturityLevel) return 'completed';
    if (levelNum === realMaturityLevel) return 'current';
    return 'future';
  };

  const currentLevel = realMaturityLevel
    ? MATURITY_FRAMEWORK.find((l) => l.level === realMaturityLevel) || MATURITY_FRAMEWORK[0]
    : MATURITY_FRAMEWORK[0];

  useEffect(() => {
    if (currentLevel?.level) fetchMaturityAdvice(currentLevel.level);
  }, [currentLevel?.level]);

  const totalMilestones = MATURITY_FRAMEWORK.flatMap((l) => l.milestones).length;
  const completedMilestones = Object.values(progress).filter(Boolean).length;
  const progressPercent = Math.round((completedMilestones / totalMilestones) * 100);

  const toggleMilestone = (levelNum, idx) => {
    const key = `${levelNum}_${idx}`;
    const updated = { ...progress, [key]: !progress[key] };
    setProgress(updated);
    saveMilestones(updated);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎯 Compliance Maturity Roadmap</h1>
        <p>Track your journey from basic registration to full compliance optimisation</p>
      </div>

      {/* AI Maturity Guidance */}
      <div className="section-card" style={{ borderLeft: '4px solid #6366f1', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>🧠 Emma-i Maturity Guidance</h3>
          <button
            onClick={() => fetchMaturityAdvice(currentLevel?.level || 1)}
            disabled={maturityLoading}
            style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}
          >
            {maturityLoading ? 'Analyzing…' : 'Refresh'}
          </button>
        </div>
        {maturityLoading && <div style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>Emma-i is assessing your maturity level…</div>}
        {maturityAdvice && !maturityLoading && (
          <div>
            {maturityAdvice.currentAssessment && (
              <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '12px' }}>{maturityAdvice.currentAssessment}</p>
            )}
            {maturityAdvice.quickWins?.length > 0 && (
              <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', marginBottom: '10px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#166534' }}>Quick Wins:</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: '20px', fontSize: '0.85rem', color: '#166534' }}>
                  {maturityAdvice.quickWins.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            {maturityAdvice.nextLevel && (
              <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong>Next: Level {maturityAdvice.nextLevel.level} — {maturityAdvice.nextLevel.name}</strong>
                <p style={{ margin: '4px 0 0', color: '#475569' }}>{maturityAdvice.nextLevel.description}</p>
                {maturityAdvice.nextLevel.estimatedMonths && (
                  <p style={{ margin: '4px 0 0', color: '#2563eb' }}>Estimated: {maturityAdvice.nextLevel.estimatedMonths} months</p>
                )}
              </div>
            )}
          </div>
        )}
        {!maturityLoading && !maturityAdvice && (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Click Refresh to get personalised maturity guidance from Emma-i.</p>
        )}
      </div>

      <div className="maturity-summary">
        <div className="maturity-current">
          <div className="maturity-badge">Level {currentLevel.level}</div>
          <div>
            <h2>{currentLevel.name}</h2>
            <p>{currentLevel.description}</p>
            {realMaturityLevel == null && (
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                Set up your compliance profile to see your real level.
              </p>
            )}
          </div>
        </div>
        <div className="maturity-progress-bar">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span>{completedMilestones}/{totalMilestones} milestones ticked ({progressPercent}%)</span>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Click milestones to mark as complete. Progress is saved locally.</p>
        </div>
      </div>

      <div className="roadmap-timeline">
        {MATURITY_FRAMEWORK.map((level) => {
          const levelStatus = getLevelStatus(level.level);
          return (
            <div key={level.level} className={`roadmap-level ${levelStatus}`}>
              <div className="level-marker">
                <div className={`level-circle ${levelStatus}`}>
                  {levelStatus === 'completed' ? '✓' : level.level}
                </div>
                {level.level < 6 && <div className="level-connector" />}
              </div>
              <div className="level-content">
                <div className="level-header">
                  <h3>Level {level.level} — {level.name}</h3>
                  <span className={`level-status-badge ${levelStatus}`}>
                    {levelStatus === 'completed' ? 'Completed' : levelStatus === 'current' ? 'In Progress' : 'Upcoming'}
                  </span>
                </div>
                <p className="level-desc">{level.description}</p>
                <div className="milestones-list">
                  {level.milestones.map((task, i) => {
                    const key = `${level.level}_${i}`;
                    const done = !!progress[key];
                    return (
                      <div
                        key={i}
                        className={`milestone-item ${done ? 'done' : ''}`}
                        onClick={() => toggleMilestone(level.level, i)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="milestone-check">{done ? '✅' : '⬜'}</span>
                        <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#9ca3af' : undefined }}>
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
