import { useState, useEffect } from 'react';
import api from '../services/api';
import './PageStyles.css';

const PREF_DEFS = [
  { key: 'deadline_3d',       label: 'Deadline reminders (3 days before)',    category: 'Deadlines' },
  { key: 'deadline_7d',       label: 'Deadline reminders (7 days before)',     category: 'Deadlines' },
  { key: 'deadline_overdue',  label: 'Overdue filing alerts',                  category: 'Deadlines' },
  { key: 'score_change',      label: 'Compliance score changes',               category: 'Score' },
  { key: 'score_weekly',      label: 'Weekly compliance digest',               category: 'Score' },
  { key: 'penalty_risk',      label: 'Penalty risk warnings',                  category: 'Penalties' },
  { key: 'regulation_update', label: 'Regulation change alerts',               category: 'Regulatory' },
  { key: 'filing_confirm',    label: 'Filing submission confirmations',         category: 'Filings' },
  { key: 'audit_summary',     label: 'Monthly audit summary',                  category: 'Audit' },
];

const EXAMPLE_ALERTS = [
  { time: '09:15', type: 'alert',      text: '⚠️ REMINDER: EMP201 due in 3 days. PAYE: R12,450 | SDL: R1,245 | UIF: R2,490. File via SARS eFiling.' },
  { time: '14:30', type: 'score',      text: '📊 Compliance score updated: 84% → 87% (+3%). Great progress! CIPC annual return filed successfully.' },
  { time: '08:00', type: 'overdue',    text: '🔴 OVERDUE: COIDA Return of Earnings due 31 Mar. Penalty accruing at 10% p.a. File immediately.' },
  { time: '10:45', type: 'regulatory', text: '📋 REGULATION UPDATE: SARS announced new tax brackets for 2026/27 tax year.' },
];

const QUIET_HOUR_OPTS = ['18:00','19:00','20:00','21:00','22:00'];
const QUIET_TO_OPTS   = ['05:00','06:00','07:00','08:00','09:00'];

export default function WhatsAppAlerts() {
  const [prefs, setPrefs] = useState({});
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [quietFrom, setQuietFrom] = useState('20:00');
  const [quietTo, setQuietTo] = useState('07:00');
  const [waConfigured, setWaConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [prefRes, statusRes] = await Promise.all([
          api.get('/notifications/preferences'),
          api.get('/notifications/status'),
        ]);
        const p = prefRes.data.preferences || {};
        setPrefs(p);
        setPhone(prefRes.data.phoneNumber || '');
        setWhatsappNumber(prefRes.data.whatsappNumber || '');
        setQuietFrom(p.quiet_hours_from || '20:00');
        setQuietTo(p.quiet_hours_to || '07:00');
        setWaConfigured(statusRes.data.whatsapp?.configured || false);
      } catch (err) {
        setError('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showFeedback = (msg) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleSavePhone = async () => {
    if (!phone.trim() && !whatsappNumber.trim()) return;
    setSaving(true);
    try {
      await api.put('/notifications/phone', {
        phoneNumber: phone.trim() || undefined,
        whatsappNumber: whatsappNumber.trim() || undefined,
      });
      showFeedback('Phone number saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save phone number');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrefs = async () => {
    setSaving(true);
    try {
      const body = {
        whatsapp_enabled: prefs.whatsapp_enabled ?? false,
        email_enabled: prefs.email_enabled ?? true,
        in_app_enabled: prefs.in_app_enabled ?? true,
        quiet_hours_from: quietFrom,
        quiet_hours_to: quietTo,
      };
      PREF_DEFS.forEach(({ key }) => { body[key] = prefs[key] ?? false; });
      await api.put('/notifications/preferences', body);
      showFeedback('Preferences saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const categories = [...new Set(PREF_DEFS.map((p) => p.category))];

  if (loading) {
    return <div className="page-container"><p style={{ padding: 40, color: '#9ca3af' }}>Loading…</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📱 WhatsApp Compliance Alerts</h1>
        <p>
          Receive real-time compliance notifications directly on WhatsApp
          {waConfigured
            ? <span style={{ marginLeft: 12, color: '#2ecc71', fontWeight: 600 }}>● WhatsApp Service Active</span>
            : <span style={{ marginLeft: 12, color: '#e67e22', fontWeight: 600 }}>● WhatsApp not configured (set WHATSAPP_* env vars)</span>
          }
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error} <button onClick={() => setError(null)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {saveMsg && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          ✓ {saveMsg}
        </div>
      )}

      <div className="whatsapp-layout">
        <div className="whatsapp-settings">

          {/* Phone Number */}
          <div className="section-card">
            <h3>📞 Phone Number</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Mobile Number (for calls/SMS)</label>
              <div className="phone-input-group">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                  className="phone-input"
                />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>WhatsApp Number (if different)</label>
              <div className="phone-input-group">
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                  className="phone-input"
                />
              </div>
            </div>
            <button className="btn-primary" onClick={handleSavePhone} disabled={saving}>
              {saving ? 'Saving…' : 'Save Number'}
            </button>
            <p className="hint-text">South African mobile numbers accepted (+27)</p>
          </div>

          {/* Channel Toggles */}
          <div className="section-card">
            <h3>📡 Notification Channels</h3>
            {[
              { key: 'email_enabled',    label: 'Email Notifications' },
              { key: 'whatsapp_enabled', label: 'WhatsApp Alerts' },
              { key: 'in_app_enabled',   label: 'In-App Notifications' },
            ].map(({ key, label }) => (
              <label key={key} className="pref-toggle">
                <span>{label}</span>
                <div
                  className={`toggle-switch ${prefs[key] ? 'on' : 'off'}`}
                  onClick={() => togglePref(key)}
                >
                  <div className="toggle-knob" />
                </div>
              </label>
            ))}
          </div>

          {/* Alert Preferences */}
          <div className="section-card">
            <h3>⚙️ Alert Preferences</h3>
            {categories.map((cat) => (
              <div key={cat} className="pref-category">
                <h4>{cat}</h4>
                {PREF_DEFS.filter((p) => p.category === cat).map(({ key, label }) => (
                  <label key={key} className="pref-toggle">
                    <span>{label}</span>
                    <div
                      className={`toggle-switch ${prefs[key] ? 'on' : 'off'}`}
                      onClick={() => togglePref(key)}
                    >
                      <div className="toggle-knob" />
                    </div>
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* Quiet Hours */}
          <div className="section-card">
            <h3>⏰ Quiet Hours</h3>
            <div className="quiet-hours">
              <label>
                <span>From</span>
                <select value={quietFrom} onChange={(e) => setQuietFrom(e.target.value)}>
                  {QUIET_HOUR_OPTS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </label>
              <label>
                <span>To</span>
                <select value={quietTo} onChange={(e) => setQuietTo(e.target.value)}>
                  {QUIET_TO_OPTS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </label>
            </div>
            <p className="hint-text">No alerts will be sent during quiet hours</p>
          </div>

          <button className="btn-primary" onClick={handleSavePrefs} disabled={saving} style={{ width: '100%', marginTop: 8 }}>
            {saving ? 'Saving…' : 'Save All Preferences'}
          </button>
        </div>

        {/* WhatsApp Preview */}
        <div className="whatsapp-preview">
          <div className="wa-phone-frame">
            <div className="wa-header">
              <span className="wa-back">←</span>
              <div className="wa-contact">
                <div className="wa-avatar">🤖</div>
                <div>
                  <strong>Compl-Ai™ Alerts</strong>
                  <small>{waConfigured ? 'Active' : 'Not configured'}</small>
                </div>
              </div>
            </div>
            <div className="wa-messages">
              {EXAMPLE_ALERTS.map((msg, i) => (
                <div key={i} className={`wa-message ${msg.type}`}>
                  <p>{msg.text}</p>
                  <span className="wa-time">{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="wa-input-preview">
              <span>Type a message…</span>
            </div>
          </div>
          <p className="preview-label">Example alert previews</p>
        </div>
      </div>
    </div>
  );
}
