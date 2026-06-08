import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import './Sidebar.css';

const COMPLIANCE_MODULES = [
  { path: '/compliance/cipc',       label: 'CIPC',            dot: '#3B82F6' },
  { path: '/compliance/sars',       label: 'SARS Tax',        dot: '#22C55E' },
  { path: '/compliance/labour',     label: 'Labour Law',      dot: '#F59E0B' },
  { path: '/compliance/ohs',        label: 'OHS',             dot: '#EF4444' },
  { path: '/compliance/popia',      label: 'POPIA & PAIA',    dot: '#8B5CF6' },
  { path: '/compliance/bbee',       label: 'B-BBEE',          dot: '#06B6D4' },
  { path: '/compliance/fica',       label: 'FICA',            dot: '#EC4899' },
  { path: '/compliance/municipal',  label: 'Municipal',       dot: '#84CC16' },
  { path: '/compliance/industry',   label: 'Industry',        dot: '#F97316' },
  { path: '/compliance/tax-engine', label: 'Tax Engine',      dot: '#FFB547' },
];

const NAV_SECTIONS = [
  {
    section: 'Overview',
    items: [
      { path: '/',                   label: 'Dashboard',         icon: '⬛' },
      { path: '/risk-analytics',     label: 'Risk Analytics',    icon: '📈' },
      { path: '/maturity-roadmap',   label: 'Maturity Roadmap',  icon: '🎯' },
      { path: '/calendar',           label: 'Compliance Calendar', icon: '📅' },
    ],
  },
  {
    section: 'Tools',
    items: [
      { path: '/vault',              label: 'Document Vault',    icon: '🔐' },
      { path: '/filing-workflows',   label: 'Filing Workflows',  icon: '📤' },
      { path: '/audit',              label: 'Audit Report',      icon: '📋' },
      { path: '/industry-intel',     label: 'Industry Intel',    icon: '🏭' },
      { path: '/integrations',       label: 'Integrations',      icon: '🔌' },
      { path: '/whatsapp-alerts',    label: 'WhatsApp Alerts',   icon: '💬' },
    ],
  },
  {
    section: 'AI & Settings',
    items: [
      { path: '/emma-i',             label: 'Emma-i™ Chat',      icon: '🤖' },
      { path: '/settings',           label: 'Settings',          icon: '⚙️' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const [complianceOpen, setComplianceOpen] = useState(
    location.pathname.startsWith('/compliance')
  );

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sb-overlay" onClick={onClose} />}

      <aside className={`sb-root ${isOpen ? 'sb-open' : 'sb-closed'}`}>
        {/* ── Logo ── */}
        <div className="sb-logo-wrap">
          <div className="sb-logo">
            <div className="sb-logo-icon">
              <svg viewBox="0 0 36 36" fill="none">
                <path d="M18 2L33 10.5V25.5L18 34L3 25.5V10.5L18 2Z" fill="url(#sbg)"/>
                <path d="M12 18L16.5 22.5L24 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="sbg" x1="3" y1="2" x2="33" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00C4B4"/><stop offset="1" stopColor="#0066FF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="sb-logo-text">
              <span className="sb-logo-name">Compl-Ai™</span>
              <span className="sb-logo-ver">v2.1 · SA Edition</span>
            </div>
          </div>
          <button className="sb-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Nav ── */}
        <nav className="sb-nav">
          {NAV_SECTIONS.map(({ section, items }) => (
            <div key={section} className="sb-section">
              <div className="sb-section-title">{section}</div>
              {items.map(({ path, label, icon }) => (
                <NavLink
                  key={path} to={path}
                  className={`sb-link ${isActive(path) ? 'sb-link-active' : ''}`}
                  onClick={onClose}
                  end={path === '/'}
                >
                  <span className="sb-link-icon">{icon}</span>
                  <span className="sb-link-label">{label}</span>
                  {isActive(path) && <span className="sb-active-dot" />}
                </NavLink>
              ))}

              {/* Compliance submenu after Overview section */}
              {section === 'Overview' && (
                <div className="sb-section">
                  <div className="sb-section-title">Compliance Modules</div>
                  <button
                    className={`sb-link sb-collapsible ${complianceOpen ? 'sb-collapsible-open' : ''}`}
                    onClick={() => setComplianceOpen(!complianceOpen)}
                  >
                    <span className="sb-link-icon">✅</span>
                    <span className="sb-link-label">All Modules</span>
                    <span className="sb-chevron">{complianceOpen ? '▾' : '▸'}</span>
                  </button>
                  {complianceOpen && (
                    <div className="sb-submenu">
                      {COMPLIANCE_MODULES.map(({ path, label, dot }) => (
                        <NavLink
                          key={path} to={path}
                          className={`sb-sub-link ${isActive(path) ? 'sb-sub-link-active' : ''}`}
                          onClick={onClose}
                        >
                          <span className="sb-dot" style={{ background: dot }} />
                          {label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── User footer ── */}
        <div className="sb-user">
          <div className="sb-user-avatar">
            {(user?.firstName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.firstName || 'User'} {user?.lastName || ''}</div>
            <div className="sb-user-role">{user?.role === 'admin' ? '⭐ Admin' : 'Member'}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
