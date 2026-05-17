import { Link } from 'react-router-dom';
import './Sidebar.css';

const NAVIGATION_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  {
    label: 'Compliance',
    icon: '✓',
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
  { path: '/vault', label: 'Vault', icon: '🔒' },
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
