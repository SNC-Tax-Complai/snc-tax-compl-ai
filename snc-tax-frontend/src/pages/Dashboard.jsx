import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplianceStore } from '../stores/complianceStore';
import { useAuthStore } from '../stores/authStore';
import { useAIInsightsStore } from '../stores/aiInsightsStore';
import api from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import NotificationsPanel from '../components/Notifications/NotificationsPanel';
import './Dashboard.css';

// ── Static config (colors/paths — not data) ──────────────────────────────────
const MODULE_CONFIG = {
  cipc:      { name: 'CIPC',    color: '#3b82f6', path: '/compliance/cipc' },
  sars:      { name: 'SARS',    color: '#22c55e', path: '/compliance/sars' },
  labour:    { name: 'Labour',  color: '#f59e0b', path: '/compliance/labour' },
  ohs:       { name: 'OHS',     color: '#ef4444', path: '/compliance/ohs' },
  popia:     { name: 'POPIA',   color: '#8b5cf6', path: '/compliance/popia' },
  bbbee:     { name: 'B-BBEE',  color: '#06b6d4', path: '/compliance/bbbee' },
  fica:      { name: 'FICA',    color: '#ec4899', path: '/compliance/fica' },
  municipal: { name: 'Municipal', color: '#84cc16', path: '/compliance/municipal' },
  industry:  { name: 'Industry',  color: '#f97316', path: '/compliance/industry' },
};

const MATURITY_LABELS = ['', 'Ad-hoc', 'Reactive', 'Operationally', 'Managed', 'Optimized', 'Leading'];

const FILING_PORTALS = [
  { icon: '\u{1F1FF}\u{1F1E6}', name: 'SARS eFiling',                color: '#0066cc', url: 'https://www.sarsefiling.co.za' },
  { icon: '\u{1F3E2}',          name: 'CIPC e-Services',              color: '#059669', url: 'https://eservices.cipc.co.za' },
  { icon: '\u{1F6E1}',          name: 'CompEasy (COIDA)',              color: '#7c3aed', url: 'https://www.compeasy.co.za' },
  { icon: '\u{1F477}',          name: 'UIF u-Filing',                 color: '#0891b2', url: 'https://www.ufiling.co.za' },
  { icon: '\u{2696}',           name: 'Dept. of Employment & Labour', color: '#d97706', url: 'https://www.labour.gov.za' },
  { icon: '\u{1F4CA}',          name: 'SANAS / B-BBEE Verification',  color: '#be185d', url: 'https://www.sanas.co.za' },
];

const QUICK_NAV = [
  { label: 'Risk Analytics',     path: '/risk',      icon: '\u{1F4C8}' },
  { label: 'Maturity Roadmap',   path: '/roadmap',   icon: '\u{1F5FA}' },
  { label: 'Compliance Calendar',path: '/calendar',  icon: '\u{1F4C5}' },
  { label: 'Document Vault',     path: '/vault',     icon: '\u{1F4C1}' },
  { label: 'Filing Workflows',   path: '/workflows', icon: '\u{1F4E4}' },
  { label: 'Emma-i™ Chat',       path: '/chat',      icon: '\u{1F4AC}' },
];

// ── Gauge chart ───────────────────────────────────────────────────────────────
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
        <path d={`M 5 ${size/2} A ${radius} ${radius} 0 0 1 ${size-5} ${size/2}`}
          fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
        <path d={`M 5 ${size/2} A ${radius} ${radius} 0 0 1 ${size-5} ${size/2}`}
          fill="none" stroke={getColor()} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`} />
        <text x={size/2} y={size/2-5} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1f2937">{value}%</text>
      </svg>
      {label && <div className="gauge-label">{label}</div>}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { fetchDashboardData, dashboardData: data, loading, error } = useComplianceStore();
  const user = useAuthStore((s) => s.user);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const { insights, insightsLoading, fetchInsights } = useAIInsightsStore();

  useEffect(() => { fetchDashboardData(); fetchInsights(); }, []);

  // ── Derived data from real API ──
  const score           = data?.complianceScore ?? 0;
  const scoreTrend      = data?.scoreTrend ?? [];
  const moduleHealth    = data?.moduleHealth ?? {};
  const upcomingDl      = data?.upcomingDeadlines ?? [];
  const overdueItems    = data?.overdueItems ?? [];
  const maturityLevel   = data?.maturityLevel ?? 1;

  const activeAlerts = overdueItems
    .filter(o => !dismissedAlerts.has(o.regulationCode || o.name))
    .slice(0, 5);

  const moduleGauges = Object.entries(MODULE_CONFIG)
    .map(([key, cfg]) => ({ ...cfg, score: moduleHealth[key] ?? 0 }))
    .filter(m => m.score > 0);

  // Predictive fine risks derived from real overdue items
  const fineRisks = overdueItems.slice(0, 4).map(o => {
    const days  = o.daysOverdue || 0;
    const pct   = Math.min(95, Math.round(50 + (days / 30) * 25));
    const color = pct >= 70 ? '#ef4444' : pct >= 50 ? '#f59e0b' : '#22c55e';
    const sev   = pct >= 70 ? 'HIGH RISK' : pct >= 50 ? 'MED RISK' : 'LOW RISK';
    return {
      label: `${o.module} ${o.regulationCode || 'Filing'}`,
      detail: `${days} day${days !== 1 ? 's' : ''} overdue`,
      pct, color, sev,
    };
  });

  // Mini-chat send
  const handleChatSend = useCallback(async (text) => {
    const content = (text || chatInput).trim();
    if (!content || chatLoading) return;
    setChatInput('');
    const userMsg = { role: 'user', content };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    try {
      const { data: res } = await api.post('/ai/chat', { messages: [...chatMessages, userMsg] });
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.message || 'No response.' }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Unable to connect to Emma-i. Please configure an AI provider in Settings.' }]);
    }
    setChatLoading(false);
  }, [chatInput, chatLoading, chatMessages]);

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;

  if (error && !data) {
    return (
      <div className="dashboard-loading" style={{ color: '#dc2626' }}>
        Failed to load dashboard: {error}. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* Overdue Alert Toasts — from real data */}
      {activeAlerts.length > 0 && (
        <div className="alert-toasts">
          {activeAlerts.map((o, i) => (
            <div key={i} className="alert-toast">
              <span className="alert-toast-icon">⚠</span>
              <div className="alert-toast-content">
                <div className="alert-toast-msg">Overdue: {o.regulationCode} — {o.name}</div>
                <div className="alert-toast-detail">{o.daysOverdue} day{o.daysOverdue !== 1 ? 's' : ''} overdue{o.penaltyAmount ? ` · R${Number(o.penaltyAmount).toLocaleString()} potential penalty` : ''}</div>
              </div>
              <button className="alert-toast-close"
                onClick={() => setDismissedAlerts(prev => new Set([...prev, o.regulationCode || o.name]))}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <div className="banner-badge">{'🇿🇦'} Proudly South African</div>
          <h2 className="banner-title">Welcome to Compl-Ai™ SA</h2>
          <p className="banner-subtitle">
            A product of <strong>SNC-TAX</strong> · Developed by SA-iLabs®™ · Emma-i™ AI Engine · Re-imagining Compliance Intelligence
          </p>
          <p className="banner-description">Your all-in-one South African SMME compliance command center. Powered by Emma-i™ AI.</p>
        </div>
        <div className="banner-actions">
          <button className="notification-btn" onClick={() => setShowNotifications(true)}>
            <span>{'\u{1F514}'}</span> Notifications
            {data?.overdue > 0 && <span className="badge">{data.overdue}</span>}
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="card-header">
            <span className="card-icon score-icon">{'\u{1F6E1}'}</span>
            <span className={`trend-badge ${(data?.complianceTrend ?? 0) >= 0 ? 'positive' : 'negative'}`}>
              {(data?.complianceTrend ?? 0) >= 0 ? '+' : ''}{data?.complianceTrend ?? 0}%
            </span>
          </div>
          <div className="metric-value">{score}%</div>
          <div className="metric-label">Compliance Score</div>
          <div className="metric-sub">{data?.previousScore > 0 ? `Up from ${data.previousScore}% last month` : 'First assessment'}</div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <span className="card-icon pending-icon">{'\u{1F4CB}'}</span>
            <span className={`trend-badge ${(data?.pendingTrend ?? 0) <= 0 ? 'positive' : 'negative'}`}>
              {(data?.pendingTrend ?? 0) > 0 ? '+' : ''}{data?.pendingTrend ?? 0}%
            </span>
          </div>
          <div className="metric-value">{data?.pendingFilings ?? 0}</div>
          <div className="metric-label">Pending Filings</div>
          <div className="metric-sub">Due this month: {data?.dueThisMonth ?? 0}</div>
        </div>

        <div className="metric-card urgent-card">
          <div className="card-header">
            <span className="card-icon urgent-icon">{'\u{23F0}'}</span>
            {(data?.overdue ?? 0) > 0
              ? <span className="trend-badge warning">Action Required</span>
              : <span className="trend-badge positive">On Track</span>}
          </div>
          <div className="metric-value">{data?.overdue ?? 0}</div>
          <div className="metric-label">Overdue Items</div>
          <div className="metric-sub">{(data?.overdue ?? 0) > 0 ? 'Immediate action needed' : 'All items current'}</div>
        </div>

        <div className="metric-card">
          <div className="card-header">
            <span className="card-icon vault-icon">✔</span>
            <span className={`trend-badge ${(data?.upToDateTrend ?? 0) >= 0 ? 'positive' : 'negative'}`}>
              {(data?.upToDateTrend ?? 0) >= 0 ? '+' : ''}{data?.upToDateTrend ?? 0}%
            </span>
          </div>
          <div className="metric-value">{data?.allUpToDate ?? 0}</div>
          <div className="metric-label">Completed Items</div>
          <div className="metric-sub">of {data?.total ?? 0} total requirements</div>
        </div>
      </div>

      {/* AI Smart Insights */}
      {insights.length > 0 && (
        <div className="section-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="section-header">
            <h3 className="section-title">{'\u{1F9E0}'} Emma-i Smart Insights</h3>
            <button className="link-btn" onClick={fetchInsights} disabled={insightsLoading}>
              {insightsLoading ? 'Analyzing...' : 'Refresh'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {insights.map((insight, i) => (
              <div key={i} style={{
                padding: '12px 16px', borderRadius: '8px', fontSize: '0.88rem',
                background: insight.type === 'warning' ? '#fef3c7' : insight.type === 'action' ? '#dbeafe' : insight.type === 'success' ? '#dcfce7' : '#f1f5f9',
                borderLeft: `3px solid ${insight.type === 'warning' ? '#f59e0b' : insight.type === 'action' ? '#2563eb' : insight.type === 'success' ? '#22c55e' : '#94a3b8'}`,
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {insight.type === 'warning' ? '⚠' : insight.type === 'action' ? '→' : insight.type === 'success' ? '✓' : 'ℹ'} {insight.title}
                  {insight.module && <span style={{ fontSize: '0.72rem', marginLeft: '8px', padding: '1px 6px', borderRadius: '8px', background: 'rgba(0,0,0,0.08)', textTransform: 'uppercase' }}>{insight.module}</span>}
                </div>
                <div style={{ color: '#475569' }}>{insight.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {insightsLoading && !insights.length && (
        <div className="section-card" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
          {'\u{1F9E0}'} Emma-i is analyzing your compliance data...
        </div>
      )}

      {/* Score Trend Chart */}
      <div className="section-card">
        <h3 className="section-title">Compliance Score Trend</h3>
        {scoreTrend.length > 0 ? (
          <>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreTrend}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(v) => [`${v}%`, 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#0066cc" strokeWidth={3} dot={{ r: 4, fill: '#0066cc' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="score-summary">
              <span>Current Compliance Score</span>
              <strong>{score}%</strong>
            </div>
          </>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
            Score history will appear here once compliance items have been assessed.
          </div>
        )}
      </div>

      {/* Upcoming Deadlines */}
      <div className="section-card">
        <h3 className="section-title">{'\u{23F3}'} Upcoming Deadlines</h3>
        {upcomingDl.length > 0 ? (
          <div className="deadlines-list">
            {upcomingDl.map((d, i) => (
              <div key={i} className={`deadline-item ${d.overdue ? 'overdue' : ''}`}>
                <div className="deadline-info">
                  <div className="deadline-name">{d.name}</div>
                  <div className="deadline-module">{d.module}</div>
                </div>
                <div className={`deadline-date ${d.overdue ? 'overdue-text' : ''}`}>{d.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', color: '#64748b', fontSize: '0.88rem' }}>
            No upcoming deadlines. All compliance items are either completed or not yet due.
          </div>
        )}
        <button className="link-btn" onClick={() => navigate('/compliance')}>View all →</button>
      </div>

      {/* Compliance Health by Module */}
      {moduleGauges.length > 0 && (
        <div className="section-card">
          <h3 className="section-title">Compliance Health — By Module</h3>
          <div className="health-subtitle">{score}% Overall</div>
          <div className="health-grid">
            {moduleGauges.map((m) => (
              <button key={m.name} className="health-gauge" onClick={() => navigate(m.path)}>
                <GaugeChart value={m.score} size={100} color={m.color} label={m.name} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Maturity Roadmap */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Compliance Maturity Roadmap</h3>
          <button className="link-btn" onClick={() => navigate('/roadmap')}>Full Roadmap</button>
        </div>
        <div className="maturity-track">
          {MATURITY_LABELS.slice(1).map((label, i) => {
            const lvl = i + 1;
            return (
              <div key={i} className={`maturity-step ${lvl <= maturityLevel ? 'completed' : ''} ${lvl === maturityLevel ? 'current' : ''}`}>
                <div className="maturity-dot">{lvl <= maturityLevel ? '✔' : (lvl === maturityLevel + 1 ? '→' : '')}</div>
                <div className="maturity-label">{label}</div>
              </div>
            );
          })}
        </div>
        <div className="maturity-info">
          <strong>Level {maturityLevel} — {MATURITY_LABELS[maturityLevel]}</strong>
          {maturityLevel < 6 && <span>Next milestone: Level {maturityLevel + 1} — {MATURITY_LABELS[maturityLevel + 1]}</span>}
        </div>
        <div className="maturity-progress">
          <div className="maturity-bar" style={{ width: `${((maturityLevel - 1) / 5) * 100}%` }} />
        </div>
        {upcomingDl.length > 0 && (
          <div className="maturity-items">
            {upcomingDl.slice(0, 3).map((d, i) => (
              <div key={i} className="maturity-item">
                <span>{d.name}</span>
                <span className="maturity-level-badge">{d.module}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Predictive Fine Probability — only shown when there are overdue items */}
      {fineRisks.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">⚠ Predictive Fine Probability</h3>
            <button className="link-btn" onClick={() => navigate('/risk')}>Full Analysis</button>
          </div>
          <div className="fines-grid">
            {fineRisks.map((r, i) => (
              <div key={i} className="fine-card">
                <GaugeChart value={r.pct} size={90} color={r.color} />
                <div className="fine-label">{r.label}</div>
                <div className="fine-detail">{r.detail}</div>
                <span className="fine-severity" style={{ color: r.color }}>{r.sev}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {fineRisks.length === 0 && data && (
        <div className="section-card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <strong>No Fine Risk Detected</strong>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>No overdue items currently. Keep up the good work!</div>
            </div>
          </div>
        </div>
      )}

      {/* Online Filing Portals */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Online Filing Portals</h3>
          <button className="link-btn" onClick={() => navigate('/integrations')}>All Integrations →</button>
        </div>
        <div className="filing-grid">
          {FILING_PORTALS.map((f, i) => (
            <div key={i} className="filing-card">
              <span className="filing-icon">{f.icon}</span>
              <div className="filing-name">{f.name}</div>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="filing-btn"
                style={{ borderColor: f.color, color: f.color, textDecoration: 'none', display: 'block', textAlign: 'center' }}
              >
                Open Portal ↗
              </a>
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

      {/* Emma-i Chat FAB */}
      <button className="emma-fab" onClick={() => setShowChat(!showChat)}>
        {showChat ? '✕' : '\u{1F4AC}'}
      </button>

      {/* Emma-i Mini Chat Panel */}
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
            {chatMessages.map((m, i) => (
              <div key={i} className={`emma-msg ${m.role === 'user' ? 'user' : 'bot'}`}>{m.content}</div>
            ))}
            {chatLoading && <div className="emma-msg bot">...</div>}
          </div>
          <div className="emma-quick-actions">
            <button onClick={() => handleChatSend('When is my next deadline?')}>When is my next...</button>
            <button onClick={() => handleChatSend('What documents do I need?')}>What documents do I...</button>
            <button onClick={() => handleChatSend('Am I compliant with POPIA?')}>Am I compliant?</button>
          </div>
          <div className="emma-chat-input">
            <input
              type="text"
              placeholder="Ask Emma-i™..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
            />
            <button className="emma-send" onClick={() => handleChatSend()} disabled={!chatInput.trim() || chatLoading}>
              {'\u{27A4}'}
            </button>
          </div>
        </div>
      )}

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
