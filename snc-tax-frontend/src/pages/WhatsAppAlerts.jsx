import { useState } from 'react';
import './PageStyles.css';

const ALERT_PREFERENCES = [
  { id: 'deadline-3d', label: 'Deadline reminders (3 days before)', enabled: true, category: 'Deadlines' },
  { id: 'deadline-7d', label: 'Deadline reminders (7 days before)', enabled: true, category: 'Deadlines' },
  { id: 'deadline-overdue', label: 'Overdue filing alerts', enabled: true, category: 'Deadlines' },
  { id: 'score-change', label: 'Compliance score changes', enabled: true, category: 'Score' },
  { id: 'score-weekly', label: 'Weekly compliance digest', enabled: false, category: 'Score' },
  { id: 'penalty-risk', label: 'Penalty risk warnings', enabled: true, category: 'Penalties' },
  { id: 'regulation-update', label: 'Regulation change alerts', enabled: true, category: 'Regulatory' },
  { id: 'filing-confirm', label: 'Filing submission confirmations', enabled: true, category: 'Filings' },
  { id: 'audit-summary', label: 'Monthly audit summary', enabled: false, category: 'Audit' },
];

const SAMPLE_MESSAGES = [
  {
    time: '09:15', type: 'alert',
    text: '⚠️ REMINDER: EMP201 due in 3 days (7 Apr 2026). PAYE: R12,450 | SDL: R1,245 | UIF: R2,490. File via SARS eFiling.',
  },
  {
    time: '14:30', type: 'score',
    text: '📊 Your compliance score changed: 84% → 87% (+3%). Great progress! CIPC annual return filed successfully.',
  },
  {
    time: '08:00', type: 'overdue',
    text: '🔴 OVERDUE: COIDA Return of Earnings was due 31 Mar 2026. Penalty accruing at 10% p.a. File immediately via CompEasy.',
  },
  {
    time: '10:45', type: 'regulatory',
    text: '📋 REGULATION UPDATE: SARS announced new tax brackets for 2026/27 tax year. Small business corporation rate remains 0% on first R95,750.',
  },
  {
    time: '16:00', type: 'digest',
    text: '📱 WEEKLY DIGEST: 2 filings due this week | Score: 87% | 1 overdue item | 0 new regulatory changes. View full report in Compl-Ai™.',
  },
];

export default function WhatsAppAlerts() {
  const [prefs, setPrefs] = useState(ALERT_PREFERENCES);
  const [phone, setPhone] = useState('+27 ');

  const togglePref = (id) => {
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const categories = [...new Set(prefs.map(p => p.category))];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{'\u{1F4F1}'} WhatsApp Compliance Alerts</h1>
        <p>Receive real-time compliance notifications directly on WhatsApp</p>
      </div>

      <div className="whatsapp-layout">
        <div className="whatsapp-settings">
          <div className="section-card">
            <h3>{'\u{1F4DE}'} Phone Number</h3>
            <div className="phone-input-group">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27 XX XXX XXXX"
                className="phone-input"
              />
              <button className="btn-primary">Verify Number</button>
            </div>
            <p className="hint-text">Enter your South African mobile number to receive alerts</p>
          </div>

          <div className="section-card">
            <h3>{'\u{2699}'} Alert Preferences</h3>
            {categories.map(cat => (
              <div key={cat} className="pref-category">
                <h4>{cat}</h4>
                {prefs.filter(p => p.category === cat).map(pref => (
                  <label key={pref.id} className="pref-toggle">
                    <span>{pref.label}</span>
                    <div className={`toggle-switch ${pref.enabled ? 'on' : 'off'}`} onClick={() => togglePref(pref.id)}>
                      <div className="toggle-knob" />
                    </div>
                  </label>
                ))}
              </div>
            ))}
          </div>

          <div className="section-card">
            <h3>{'\u{23F0}'} Quiet Hours</h3>
            <div className="quiet-hours">
              <label>
                <span>From</span>
                <select defaultValue="20:00"><option>18:00</option><option>19:00</option><option>20:00</option><option>21:00</option><option>22:00</option></select>
              </label>
              <label>
                <span>To</span>
                <select defaultValue="07:00"><option>05:00</option><option>06:00</option><option>07:00</option><option>08:00</option><option>09:00</option></select>
              </label>
            </div>
            <p className="hint-text">No alerts will be sent during quiet hours</p>
          </div>
        </div>

        <div className="whatsapp-preview">
          <div className="wa-phone-frame">
            <div className="wa-header">
              <span className="wa-back">{'←'}</span>
              <div className="wa-contact">
                <div className="wa-avatar">{'\u{1F916}'}</div>
                <div>
                  <strong>Compl-Ai{'™'} Alerts</strong>
                  <small>Online</small>
                </div>
              </div>
            </div>
            <div className="wa-messages">
              {SAMPLE_MESSAGES.map((msg, i) => (
                <div key={i} className={`wa-message ${msg.type}`}>
                  <p>{msg.text}</p>
                  <span className="wa-time">{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="wa-input-preview">
              <span>Type a message...</span>
            </div>
          </div>
          <p className="preview-label">Preview of WhatsApp alerts</p>
        </div>
      </div>
    </div>
  );
}
