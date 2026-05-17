import { useState } from 'react';
import './Admin.css';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users, settings, and system configuration</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`admin-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Log
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>User Management</h2>
              <button className="add-btn">+ Add User</button>
            </div>
            <div className="placeholder-content">
              <p>User management will be available once the database is connected.</p>
              <p>Features: Add/remove users, assign roles, manage company access.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>System Settings</h2>
            </div>
            <div className="settings-grid">
              <div className="setting-card">
                <h3>AI Provider</h3>
                <p>Configure the default AI engine for compliance analysis</p>
                <select disabled>
                  <option>Emma-i™ (Primary)</option>
                  <option>OpenAI GPT-4</option>
                  <option>Anthropic Claude</option>
                  <option>Google Gemini</option>
                </select>
              </div>
              <div className="setting-card">
                <h3>Notification Preferences</h3>
                <p>Configure how and when notifications are sent</p>
                <div className="setting-options">
                  <label><input type="checkbox" defaultChecked /> Email Alerts</label>
                  <label><input type="checkbox" /> WhatsApp Alerts</label>
                  <label><input type="checkbox" defaultChecked /> In-App Notifications</label>
                </div>
              </div>
              <div className="setting-card">
                <h3>Company Profile</h3>
                <p>Manage company details and compliance profile</p>
                <button className="setting-btn" disabled>Edit Profile</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Audit Log</h2>
            </div>
            <div className="placeholder-content">
              <p>Audit trail of all compliance actions and data changes.</p>
              <p>Available after database connection is established.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
