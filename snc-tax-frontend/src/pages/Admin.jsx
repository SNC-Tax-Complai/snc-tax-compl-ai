import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './Admin.css';

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/admin/users', form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, props) => (
    <div className="form-group">
      <label>{label}</label>
      <input {...props} />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Add New User</h3>
        <form onSubmit={handleSubmit}>
          {field('Full Name', { required: true, value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), placeholder: 'Jane Smith' })}
          {field('Email', { required: true, type: 'email', value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }), placeholder: 'jane@company.co.za' })}
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          {field('Temporary Password (leave blank to auto-generate)', { type: 'password', value: form.password, onChange: (e) => setForm({ ...form, password: e.target.value }), placeholder: 'Auto-generated if blank' })}
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="add-btn" disabled={saving}>{saving ? 'Creating…' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: LIMIT, offset: page * LIMIT });
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const changeRole = async (user, role) => {
    try {
      await api.put(`/admin/users/${user.id}`, { role });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <>
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onCreated={load} />}
      <div className="admin-section">
        <div className="section-header">
          <h2>User Management {total > 0 && <span className="count-badge">{total}</span>}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="search-input"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search users…"
            />
            <button className="add-btn" onClick={() => setShowAdd(true)}>+ Add User</button>
          </div>
        </div>

        {loading && <p className="loading-text">Loading users…</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && users.length === 0 && (
          <p className="loading-text">No users found{search ? ` matching "${search}"` : ''}.</p>
        )}

        {users.length > 0 && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.is_active ? '' : 'row-inactive'}>
                    <td>{u.name || u.full_name || '—'}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className="role-select"
                      >
                        <option value="admin">Admin</option>
                        <option value="compliance_officer">Compliance Officer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-pill ${u.is_active ? 'pill-active' : 'pill-inactive'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-ZA') : '—'}</td>
                    <td>
                      <button
                        className={`action-btn ${u.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={() => toggleActive(u)}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > LIMIT && (
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span>Page {page + 1} of {Math.ceil(total / LIMIT)}</span>
            <button disabled={(page + 1) * LIMIT >= total} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </>
  );
}

function AuditTab() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const LIMIT = 25;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/admin/audit-log?limit=${LIMIT}&offset=${page * LIMIT}`);
        setEntries(data.entries || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load audit log');
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const ACTION_COLOR = {
    create: '#2ecc71', update: '#3498db', delete: '#e74c3c',
    login: '#9b59b6', logout: '#95a5a6',
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Audit Log {total > 0 && <span className="count-badge">{total}</span>}</h2>
      </div>

      {loading && <p className="loading-text">Loading audit log…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && entries.length === 0 && <p className="loading-text">No audit entries recorded yet.</p>}

      {entries.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Resource</th><th>Detail</th></tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td className="mono">{new Date(e.created_at).toLocaleString('en-ZA')}</td>
                  <td>{e.user_name || e.user_id || '—'}</td>
                  <td>
                    <span className="action-tag" style={{ background: ACTION_COLOR[e.action] || '#95a5a6' }}>
                      {e.action}
                    </span>
                  </td>
                  <td>{e.resource_type}{e.resource_id ? ` #${e.resource_id}` : ''}</td>
                  <td className="detail-cell">
                    {e.details ? JSON.stringify(e.details).slice(0, 100) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > LIMIT && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span>Page {page + 1} of {Math.ceil(total / LIMIT)}</span>
          <button disabled={(page + 1) * LIMIT >= total} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const STAT_ITEMS = stats
    ? [
        { label: 'Active Users', value: stats.activeUsers ?? 0, icon: '👥' },
        { label: 'Audit Entries', value: stats.auditEntries ?? 0, icon: '📋' },
        { label: 'Documents', value: stats.documents ?? 0, icon: '📁' },
      ]
    : [];

  return (
    <div className="admin-section">
      <div className="section-header"><h2>System Overview</h2></div>
      {loading && <p className="loading-text">Loading…</p>}
      {error && <p className="error-text">{error}</p>}
      {stats && (
        <div className="stats-grid">
          {STAT_ITEMS.map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{s.value.toLocaleString()}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');

  const TABS = [
    { id: 'users', label: 'Users' },
    { id: 'audit', label: 'Audit Log' },
    { id: 'overview', label: 'Overview' },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users, audit activity, and system overview</p>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'audit' && <AuditTab />}
        {activeTab === 'overview' && <OverviewTab />}
      </div>
    </div>
  );
}
