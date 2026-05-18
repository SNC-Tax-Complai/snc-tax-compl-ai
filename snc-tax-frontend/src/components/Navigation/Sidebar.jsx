import { Link } from 'react-router-dom';
import './Sidebar.css';

const NAVIGATION_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '\u{1F4CA}' },
  {
    label: 'Compliance',
    icon: '\u{2713}',
    submenu: [
      { path: '/compliance/cipc', label: 'CIPC' },
      { path: '/compliance/sars', label: 'SARS Tax' },
      { path: '/compliance/labour', label: 'Labour Law' },
      { path: '/compliance/ohs', label: 'OHS' },
      { path: '/compliance/popia', label: 'POPIA & PAIA' },
      { path: '/compliance/bbee', label: 'B-BBEE' },
      { path: '/compliance/fica', label: 'FICA' },
      { path: '/compliance/municipal', label: 'Municipal' },
      { path: '/compliance/industry', label: 'Industry & Sector' },
      { path: '/compliance/tax-engine', label: 'Tax Engine' },
    ],
  },
  { path: '/calendar', label: 'Calendar', icon: '\u{1F4C5}' },
  { path: '/filing-workflows', label: 'Filing Workflows', icon: '\u{1F4DD}' },
  { path: '/risk-analytics', label: 'Risk Analytics', icon: '\u{1F4C8}' },
  { path: '/maturity-roadmap', label: 'Maturity Roadmap', icon: '\u{1F3AF}' },
  { path: '/audit', label: 'Audit Report', icon: '\u{1F4CB}' },
  { path: '/industry-intel', label: 'Industry Intel', icon: '\u{1F3ED}' },
  { path: '/vault', label: 'Vault', icon: '\u{1F512}' },
  { path: '/integrations', label: 'Integrations', icon: '\u{1F50C}' },
  { path: '/whatsapp-alerts', label: 'WhatsApp Alerts', icon: '\u{1F4F1}' },
  { path: '/emma-i', label: 'Emma-i\u{2122} Chat', icon: '\u{1F916}' },
  { path: '/settings', label: 'Settings', icon: '\u{2699}' },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">Compl-Ai™ SA</span>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
          ✕
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAVIGATION_ITEMS.map((item) => (
          <div key={item.label} className="nav-item-group">
            {item.submenu ? (
              <>
                <div className="nav-label">{item.icon} {item.label}</div>
                <div className="submenu">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className="nav-link submenu-link"
                      onClick={() => onClose()}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                to={item.path}
                className="nav-link"
                onClick={() => onClose()}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Powered by Emma-i™ AI</p>
        <p className="version">v0.1.0</p>
      </div>
    </aside>
  );
}
