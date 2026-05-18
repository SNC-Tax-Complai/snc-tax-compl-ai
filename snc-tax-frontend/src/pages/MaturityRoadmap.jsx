import './PageStyles.css';

const MATURITY_LEVELS = [
  {
    level: 1, name: 'Non-Compliant', status: 'completed',
    description: 'No formal compliance processes in place',
    milestones: [
      { task: 'Register company with CIPC', done: true },
      { task: 'Register for income tax (SARS)', done: true },
      { task: 'Register for PAYE/UIF/SDL', done: true },
    ],
  },
  {
    level: 2, name: 'Basic Compliance', status: 'completed',
    description: 'Core registrations and basic filings done',
    milestones: [
      { task: 'File first annual return (CIPC)', done: true },
      { task: 'Submit first EMP201', done: true },
      { task: 'Obtain B-BBEE affidavit', done: true },
      { task: 'Register for VAT (if applicable)', done: true },
    ],
  },
  {
    level: 3, name: 'Operationally Compliant', status: 'current',
    description: 'Regular filings, most obligations met on time',
    milestones: [
      { task: 'Monthly EMP201 on schedule', done: true },
      { task: 'VAT201 bi-monthly submissions', done: true },
      { task: 'COIDA letter of good standing', done: false },
      { task: 'OHS Risk Assessment completed', done: false },
      { task: 'Employment contracts for all staff', done: true },
    ],
  },
  {
    level: 4, name: 'Substantially Compliant', status: 'future',
    description: 'Proactive compliance management with monitoring',
    milestones: [
      { task: 'POPIA Information Officer registered', done: false },
      { task: 'B-BBEE QSE Verification', done: false },
      { task: 'Employment Equity Plan submitted', done: false },
      { task: 'Skills Development Plan in place', done: false },
      { task: 'Workplace Health & Safety Committee', done: false },
    ],
  },
  {
    level: 5, name: 'Advanced Compliance', status: 'future',
    description: 'Automated compliance with predictive analytics',
    milestones: [
      { task: 'Automated filing integrations', done: false },
      { task: 'Real-time compliance monitoring', done: false },
      { task: 'Risk prediction engine active', done: false },
      { task: 'Document vault fully organized', done: false },
    ],
  },
  {
    level: 6, name: 'Fully Compliant & Optimized', status: 'future',
    description: 'Best-in-class compliance with continuous improvement',
    milestones: [
      { task: 'ISO 9001 Quality Management', done: false },
      { task: 'Annual compliance audit passed', done: false },
      { task: 'Tax optimization strategy active', done: false },
      { task: 'White-label compliance portal live', done: false },
    ],
  },
];

export default function MaturityRoadmap() {
  const currentLevel = MATURITY_LEVELS.find(l => l.status === 'current');
  const totalMilestones = MATURITY_LEVELS.flatMap(l => l.milestones).length;
  const completedMilestones = MATURITY_LEVELS.flatMap(l => l.milestones).filter(m => m.done).length;
  const progressPercent = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{'\u{1F3AF}'} Compliance Maturity Roadmap</h1>
        <p>Track your journey from basic registration to full compliance optimization</p>
      </div>

      <div className="maturity-summary">
        <div className="maturity-current">
          <div className="maturity-badge">Level {currentLevel.level}</div>
          <div>
            <h2>{currentLevel.name}</h2>
            <p>{currentLevel.description}</p>
          </div>
        </div>
        <div className="maturity-progress-bar">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span>{completedMilestones}/{totalMilestones} milestones ({progressPercent}%)</span>
        </div>
      </div>

      <div className="roadmap-timeline">
        {MATURITY_LEVELS.map((level) => (
          <div key={level.level} className={`roadmap-level ${level.status}`}>
            <div className="level-marker">
              <div className={`level-circle ${level.status}`}>
                {level.status === 'completed' ? '✓' : level.status === 'current' ? level.level : level.level}
              </div>
              {level.level < 6 && <div className="level-connector" />}
            </div>
            <div className="level-content">
              <div className="level-header">
                <h3>Level {level.level} {'\u{2014}'} {level.name}</h3>
                <span className={`level-status-badge ${level.status}`}>
                  {level.status === 'completed' ? 'Completed' : level.status === 'current' ? 'In Progress' : 'Upcoming'}
                </span>
              </div>
              <p className="level-desc">{level.description}</p>
              <div className="milestones-list">
                {level.milestones.map((m, i) => (
                  <div key={i} className={`milestone-item ${m.done ? 'done' : ''}`}>
                    <span className="milestone-check">{m.done ? '✅' : '⬜'}</span>
                    <span>{m.task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
