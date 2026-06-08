import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick, user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        ☰
      </button>

      <div className="header-spacer" />

      <div className="header-right">
        <button className="header-btn" onClick={() => navigate('/calendar')} title="Compliance Calendar">
          📅
        </button>
        <button className="header-btn" onClick={() => navigate('/emma-i')} title="Emma-i™ Chat">
          🤖
        </button>

        <div className="header-avatar" title={user?.email || 'User'}>
          {(user?.firstName || user?.email || 'U')[0].toUpperCase()}
        </div>

        <div className="header-user">
          <div className="header-user-name">
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.email || 'User')}
          </div>
          <div className="header-user-role">{user?.role === 'admin' ? '⭐ Admin' : 'Member'}</div>
        </div>

        <button className="header-logout-btn" onClick={onLogout}>Sign out</button>
      </div>
    </header>
  );
}
