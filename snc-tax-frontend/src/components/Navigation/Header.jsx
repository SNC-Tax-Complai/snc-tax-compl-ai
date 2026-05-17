import { useState } from 'react';
import './Header.css';

export default function Header({ onMenuClick, user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <h1 className="header-title">Compl-Ai™ SA</h1>
      </div>

      <div className="header-right">
        <div className="notification-bell">
          <span className="bell-icon">🔔</span>
          <span className="badge">1</span>
        </div>

        <div className="user-menu-container">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.email || 'User'}</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <a href="#profile" className="dropdown-item">Profile</a>
              <a href="#settings" className="dropdown-item">Settings</a>
              <hr />
              <button
                className="dropdown-item logout-btn"
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
