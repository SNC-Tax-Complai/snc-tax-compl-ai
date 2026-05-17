import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplianceStore } from '../stores/complianceStore';
import { useAuthStore } from '../stores/authStore';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import NotificationsPanel from '../components/Notifications/NotificationsPanel';
import './Dashboard.css';

// --- Data constants matching the Base44 original ---
const SCORE_TREND = [
  { month: 'Nov', score: 68 },
  { month: 'Dec', score: 72 },
  { month: 'Jan', score: 75 },
  { month: 'Feb', score: 78 },
  { month: 'Mar', score: 80 },
  { month: 'Apr', score: 87 },
];

const MODULE_HEALTH = [
  { name: 'CIPC', score: 90, color: '#3b82f6', path: '/compliance/cipc' },
  { name: 'SARS', score: 75, color: '#22c55e', path: '/compliance/sars' },
  { name: 'Labour', score: 60, color: '#f59e0b', path: '/compliance/labour' },
  { name: 'OHS', score: 45, color: '#ef4444', path: '/compliance/ohs' },
  { name: 'POPIA', score: 80, color: '#8b5cf6', path: '/compliance/popia' },
  { name: 'B-BBEE', score: 95, color: '#06b6d4', path: '/compliance/bbee' },
];

const UPCOMING_DEADLINES = [
  { name: 'EMP201 Monthly Payroll', module: 'SARS', date: '7 Apr 2026', overdue: true },
  { name: 'CIPC Annual Return', module: 'CIPC', date: '15 May 2026', overdue: false },
  { name: 'VAT201 Bi-Monthly', module: 'SARS', date: '25 Apr 2026', overdue: false },
  { name: 'B-BBEE Affidavit Renewal', module: 'B-BBEE', date: '30 Jun 2026', overdue: false },
  { name: 'OHS Inspection Due', module: 'OHS', date: '1 Apr 2026', overdue: true },
];

const MATURITY_LEVELS = [
  { label: 'Non-Compliant', level: 1 },
  { label: 'Basic', level: 2 },
  { label: 'Operationally', level: 3 },
  { label: 'Substantially', level: 4 },
  { label: 'Advanced', level: 5 },
  { label: 'Fully', level: 6 },
];
const CURRENT_MATURITY = 3;

const MATURITY_ITEMS = [
  { icon: '\u{1F6E1}', name: 'OHS Risk Assessment', level: 'L3' },
  { icon: '\u{1F4CA}', name: 'B-BBEE QSE Verification', level: 'L4' },
  { icon: '\u{2696}', name: 'Employment Equity Report', level: 'L5' },
];

const FINE_RISKS = [
  { label: 'SARS Penalty Risk', detail: 'EMP201 overdue', pct: 74, severity: 'HIGH RISK', color: '#ef4444' },
  { label: 'CIPC Fine Risk', detail: 'Annual return due', pct: 48, severity: 'MED RISK', color: '#f59e0b' },
  { label: 'OHS Non-Compliance', detail: 'Inspection overdue', pct: 62, severity: 'MED RISK', color: '#f59e0b' },
  { label: 'B-BBEE Risk', detail: 'Affidavit expiring', pct: 35, severity: 'LOW RISK', color: '#22c55e' },
];

const FILING_INTEGRATIONS = [
  { icon: '\u{1F1FF}\u{1F1E6}', name: 'SARS eFiling', color: '#0066cc' },
  { icon: '\u{1F3E2}', name: 'CIPC e-Services', color: '#059669' },
  { icon: '\u{1F6E1}', name: 'Compensation Fund (CF)', color: '#7c3aed' },
  { icon: '\u{1F477}', name: 'UIF / u-Filing', color: '#0891b2' },
  { icon: '\u{2696}', name: 'Dept. of Employment & Labour', color: '#d97706' },
  { icon: '\u{1F4CA}', name: 'SANAS / B-BBEE Verification', color: '#be185d' },
];

const QUICK_NAV = [
  { label: 'Risk Analytics', path: '/compliance', icon: '\u{1F4C8}' },
  { label: 'Maturity Roadmap', path: '/compliance', icon: '\u{1F5FA}' },
  { label: 'Compliance Calendar', path: '/compliance', icon: '\u{1F4C5}' },
  { label: 'Document Vault', path: '/vault', icon: '\u{1F4C1}' },
  { label: 'Filing Workflows', path: '/compliance', icon: '\u{1F4E4}' },
  { label: 'Emma-i™ Chat', path: '/', icon: '\u{1F4AC}' },
];

const OVERDUE_ALERTS = [
  { message: 'Overdue: EMP201 — PAYE/SDL/UIF', detail: '2 days overdue' },
  { message: 'Overdue: COIDA Return of Earnings', detail: '9 days overdue' },
  { message: 'Expired: Certificate of Acceptability', detail: 'Expired 4 days ago' },
];

// --- Gauge component ---
function GaugeChart({ value, size = 100, color, label }) {
  const radius = (size - 10) / 2;
  const circumference = Math.PI * radius;
  const filled = (value / 100) * circumference;
  const getColor = () => {
    if (color) return color;
    if (value >= 80) return '#22c55e';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="gauge-chart" style={{ width: size, height: size / 2 + 24 }}>
      <svg width={size} height={size / 2 + 5} viewBox={`0 0 ${size} ${size / 2 + 5}`}>
        <path
          d={`M 5 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 5} ${size / 2}`}
          fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round"
        />
        <path
          d={`M 5 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 5} ${size / 2}`}
          fill="none" stroke={getColor()} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
        <text x={size / 2} y={size / 2 - 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1f2937">
          {value}%
        </text>
      </svg>
      {label && <div className="gauge-label">{label}</div>}
    </div>
  );
}

// --- Main Dashboard ---
export default function Dashboard() {
  const navigate = useNavigate();
  const { fetchDashboardData, dashboardData: data, loading } = useComplianceStore();
  const user = useAuthStore((s) => s.user);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState(OVERDUE_ALERTS);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => { fetchDashboardData(); }, []);

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;

  const score = data?.complianceScore || 87;

  return (
    <div className="dashboard-container">
      {/* Overdue Alert Toasts */}
      <div className="alert-toasts">
        {alerts.map((a, i) => (
          <div key={i} className="alert-toast">
            <span className="alert-toast-icon">⚠</span>
            <div className="alert-toast-content">
              <div className="alert-toast-msg">{a.message}</div>
              <div className="alert-toast-detail">{a.detail}</div>
            </div>
            <button className="alert-toast-close" onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
          </div>
        ))}
      </div>

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <div className="banner-badge">{'🇿🇦'} Proudly South African</div>
          <h2 className="banner-title">Welcome to Compl-Ai™ SA</h2>
          <p className="banner-subtitle">
            A product of <strong>SNC-TAX</strong> · Developed by SA-iLabs®™ · Emma-i™ AI Engine · Re-imagining Compliance Intelligence
          </p>
          <p className="banner-description">
            Your all-in-one South African SMME compliance command center. Powered by Emma-i™ AI.
          </p>
        </div>
        <div className="banner-actions">
          <button className="notification-btn" onClick={() => setShowNotifications(true)}>
            <span>{'\u{1F514}'}</span> Notifications
            <span className="badge">{alerts.length || 1}</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="card-header">
            <span className="card-icon score-icon">{'\u{1F6E1}'}</span>
            <span className="trend-badge positive">+{data?.complianceTrend || 7}%</span>
          </div>
          <div className="metric-value">{score}%</div>
          <div className="metric-label">Compliance Score</div>
          <div className="metric-sub">Up from {data?.previousScore || 80}% last month</div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <span className="card-icon pending-icon">{'\u{1F4CB}'}</span>
            <span className="trend-badge negative">{data?.pendingTrend || -15}%</span>
          </div>
          <div className="metric-value">{data?.pendingFilings || 3}</div>
          <div className="metric-label">Pending Filings</div>
          <div className="metric-sub">Due this month</div>
        </div>

        <div className="metric-card urgent-card">
          <div className="card-header">
            <span className="card-icon urgent-icon">{'\u{23F0}'}</span>
            <span className="trend-badge warning">Action Required</span>
          </div>
          <div className="metric-value">{data?.dueThisMonth || 2}</div>
          <div className="metric-label">Urgent Alerts</div>
          <div className="metric-sub">Action required</div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <span className="card-icon vault-icon">✔</span>
            <span className="trend-badge positive">+{data?.upToDateTrend || 2}%</span>
          </div>
          <div className="metric-value">{data?.allUpToDate || 14}</div>
          <div className="metric-label">Vault Documents</div>
          <div className="metric-sub">All up to date</div>
        </div>
      </div>

      {/* Score Trend Chart */}
      <div className="section-card">
        <h3 className="section-title">Score Trend (6 mo)</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={SCORE_TREND}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis hide domain={[50, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(v) => [`${v}%`, 'Score']}
              />
              <Line type="monotone" dataKey="score" stroke="#0066cc" strokeWidth={3} dot={{ r: 4, fill: '#0066cc' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="score-summary">
          <span>Overall Compliance Score</span>
          <strong>{score}%</strong>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="section-card">
        <h3 className="section-title">{'\u{23F3}'} Upcoming Deadlines</h3>
        <div className="deadlines-list">
          {UPCOMING_DEADLINES.map((d, i) => (
            <div key={i} className={`deadline-item ${d.overdue ? 'overdue' : ''}`}>
              <div className="deadline-info">
                <div className="deadline-name">{d.name}</div>
                <div className="deadline-module">{d.module}</div>
              </div>
              <div className={`deadline-date ${d.overdue ? 'overdue-text' : ''}`}>{d.date}</div>
            </div>
          ))}
        </div>
        <button className="link-btn" onClick={() => navigate('/compliance')}>View all →</button>
      </div>

      {/* Compliance Health by Module */}
      <div className="section-card">
        <h3 className="section-title">Compliance Health — By Module</h3>
        <div className="health-subtitle">{score}% Overall</div>
        <div className="health-grid">
          {MODULE_HEALTH.map((m) => (
            <button key={m.name} className="health-gauge" onClick={() => navigate(m.path)}>
              <GaugeChart value={m.score} size={100} color={m.color} label={m.name} />
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Maturity Roadmap */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Compliance Maturity Roadmap</h3>
          <button className="link-btn" onClick={() => navigate('/compliance')}>Full Roadmap</button>
        </div>
        <div className="maturity-track">
          {MATURITY_LEVELS.map((lvl, i) => (
            <div key={i} className={`maturity-step ${i + 1 <= CURRENT_MATURITY ? 'completed' : ''} ${i + 1 === CURRENT_MATURITY ? 'current' : ''}`}>
              <div className="maturity-dot">{i + 1 <= CURRENT_MATURITY ? '✔' : (i + 1 === CURRENT_MATURITY + 1 ? '→' : '')}</div>
              <div className="maturity-label">{lvl.label}</div>
            </div>
          ))}
        </div>
        <div className="maturity-info">
          <strong>Level {CURRENT_MATURITY} — Operationally Compliant</strong>
          <span>Next milestone: {'\u{1F6E1}'} OHS Risk Assessment</span>
        </div>
        <div className="maturity-progress">
          <div className="maturity-bar" style={{ width: '33%' }} />
        </div>
        <div className="maturity-items">
          {MATURITY_ITEMS.map((item, i) => (
            <div key={i} className="maturity-item">
              <span>{item.icon} {item.name}</span>
              <span className="maturity-level-badge">{item.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Fine Probability */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">⚠ Predictive Fine Probability</h3>
          <button className="link-btn" onClick={() => navigate('/compliance')}>Full Analysis</button>
        </div>
        <div className="fines-grid">
          {FINE_RISKS.map((r, i) => (
            <div key={i} className="fine-card">
              <GaugeChart value={r.pct} size={90} color={r.color} />
              <div className="fine-label">{r.label}</div>
              <div className="fine-detail">{r.detail}</div>
              <span className="fine-severity" style={{ color: r.color }}>{r.severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Online Filing Integrations */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Online Filing Integrations</h3>
          <button className="link-btn" onClick={() => navigate('/compliance')}>Full Filing Module →</button>
        </div>
        <div className="filing-grid">
          {FILING_INTEGRATIONS.map((f, i) => (
            <div key={i} className="filing-card">
              <span className="filing-icon">{f.icon}</span>
              <div className="filing-name">{f.name}</div>
              <button className="filing-btn" style={{ borderColor: f.color, color: f.color }}>
                ✨ Connect & File
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="section-card">
        <h3 className="section-title">Quick Navigation</h3>
        <div className="quick-nav-grid">
          {QUICK_NAV.map((n, i) => (
            <button key={i} className="quick-nav-btn" onClick={() => navigate(n.path)}>
              <span className="quick-nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emma-i Chat Floating Button */}
      <button className="emma-fab" onClick={() => setShowChat(!showChat)}>
        {showChat ? '✕' : '\u{1F4AC}'}
      </button>

      {/* Emma-i Chat Panel */}
      {showChat && (
        <div className="emma-chat-panel">
          <div className="emma-chat-header">
            <strong>Emma-i™ AI Assistant</strong>
            <button onClick={() => setShowChat(false)}>✕</button>
          </div>
          <div className="emma-chat-body">
            <div className="emma-msg bot">
              Hi! I'm Emma-i™, your compliance AI. Ask me anything about your South African SMME obligations.
            </div>
          </div>
          <div className="emma-quick-actions">
            <button onClick={() => setChatInput('When is my next deadline?')}>When is my next...</button>
            <button onClick={() => setChatInput('What documents do I need?')}>What documents do I...</button>
            <button onClick={() => setChatInput('Am I compliant?')}>Am I compliant?</button>
          </div>
          <div className="emma-chat-input">
            <input
              type="text"
              placeholder="Ask Emma-i™..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button className="emma-send">{'\u{27A4}'}</button>
          </div>
        </div>
      )}

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
