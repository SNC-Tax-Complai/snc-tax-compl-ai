import { useState } from 'react';

const STYLES = {
  banner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: 'linear-gradient(90deg, #0052a3, #0066cc)',
    color: '#fff',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    fontSize: 14,
    fontWeight: 500,
    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
    animation: 'slideDown 0.3s ease',
  },
  refreshBtn: {
    background: '#fff',
    color: '#0066cc',
    border: 'none',
    borderRadius: 6,
    padding: '6px 16px',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  },
  dismissBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 6,
    padding: '5px 14px',
    fontSize: 13,
    cursor: 'pointer',
  },
};

export default function UpdateBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={STYLES.banner}>
      <style>{`@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }`}</style>
      <span>🔄 A new version of Compl-Ai™ is available.</span>
      <button style={STYLES.refreshBtn} onClick={() => window.location.reload()}>
        Refresh Now
      </button>
      <button style={STYLES.dismissBtn} onClick={() => setDismissed(true)}>
        Later
      </button>
    </div>
  );
}
