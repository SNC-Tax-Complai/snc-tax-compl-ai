// Build version embedded at compile time by vite.config.js define
const MY_BUILD_VERSION = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : null;

let _intervalId = null;
let _onUpdateAvailable = null;
let _notified = false;

async function checkVersion() {
  if (_notified) return;
  try {
    const res = await fetch('/api/version', { cache: 'no-store' });
    if (!res.ok) return;
    const { version } = await res.json();
    if (version && MY_BUILD_VERSION && version !== MY_BUILD_VERSION) {
      _notified = true;
      _onUpdateAvailable?.({ version });
    }
  } catch {
    // Network error — ignore, will retry next interval
  }
}

export function startUpdateCheck(onUpdateAvailable, intervalMs = 60_000) {
  if (!MY_BUILD_VERSION) return () => {}; // dev mode — skip
  _onUpdateAvailable = onUpdateAvailable;
  _notified = false;

  // First check after 30s (give server time to finish booting after deploy)
  const firstCheck = setTimeout(checkVersion, 30_000);
  _intervalId = setInterval(checkVersion, intervalMs);

  return () => {
    clearTimeout(firstCheck);
    clearInterval(_intervalId);
    _intervalId = null;
  };
}

export function stopUpdateCheck() {
  clearInterval(_intervalId);
  _intervalId = null;
}
