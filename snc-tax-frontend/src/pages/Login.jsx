import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import './Login.css';

const MODULES = ['CIPC','SARS','Labour','OHS','POPIA','B-BBEE','FICA','Municipal','Industry','Tax Engine'];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const login = useAuthStore(s => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      <div className="lp-grid-bg" />
      <div className="lp-glow lp-glow-tl" />
      <div className="lp-glow lp-glow-br" />

      <div className="lp-split">
        {/* ── Left: Brand panel ── */}
        <div className="lp-brand">
          <div className="lp-brand-content">
            <div className="lp-logo">
              <div className="lp-logo-hex">
                <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 3L40 13.5V30.5L22 41L4 30.5V13.5L22 3Z" fill="url(#lg1)"/>
                  <path d="M15 22L19.5 26.5L29 17" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="lg1" x1="4" y1="3" x2="40" y2="41" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00C4B4"/>
                      <stop offset="1" stopColor="#0066FF"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <div className="lp-logo-name">Compl-Ai™ SA</div>
                <div className="lp-logo-sub">Compliance Intelligence Platform</div>
              </div>
            </div>

            <h1 className="lp-headline">
              Your SMME's<br/>
              <span className="lp-headline-accent">compliance command</span><br/>
              centre
            </h1>
            <p className="lp-sub">67 SA regulatory requirements. 10 modules. One AI-powered platform.</p>

            <div className="lp-stats-grid">
              <div className="lp-stat">
                <span className="lp-stat-n">67</span>
                <span className="lp-stat-l">Requirements tracked</span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-n">10</span>
                <span className="lp-stat-l">Regulatory modules</span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-n">AI</span>
                <span className="lp-stat-l">Emma-i™ powered</span>
              </div>
            </div>

            <div className="lp-chips">
              {MODULES.map(m => <span key={m} className="lp-chip">{m}</span>)}
            </div>

            <div className="lp-trust">
              <span className="lp-trust-item">🔐 POPIA Compliant</span>
              <span className="lp-trust-item">🇿🇦 SA Hosted</span>
              <span className="lp-trust-item">⚡ Emma-i™ AI</span>
            </div>
          </div>
        </div>

        {/* ── Right: Form panel ── */}
        <div className="lp-form-panel">
          <div className="lp-card">
            <div className="lp-card-top">
              <div className="lp-mobile-logo">
                <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
                  <path d="M16 2L30 9.5V22.5L16 30L2 22.5V9.5L16 2Z" fill="url(#mlg)"/>
                  <path d="M11 16L14.5 19.5L21 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs><linearGradient id="mlg" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#00C4B4"/><stop offset="1" stopColor="#0066FF"/></linearGradient></defs>
                </svg>
                <span>Compl-Ai™ SA</span>
              </div>
              <h2 className="lp-form-title">Sign in</h2>
              <p className="lp-form-sub">Access your compliance dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="lp-form">
              <div className="lp-field">
                <label className="lp-label">Email Address</label>
                <div className="lp-input-wrap">
                  <svg className="lp-input-icon" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 6l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@company.co.za"
                    required disabled={loading}
                    className="lp-input"
                  />
                </div>
              </div>

              <div className="lp-field">
                <label className="lp-label">Password</label>
                <div className="lp-input-wrap">
                  <svg className="lp-input-icon" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="9" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="10" cy="14" r="1.2" fill="currentColor"/>
                  </svg>
                  <input
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required disabled={loading}
                    className="lp-input"
                  />
                  <button type="button" className="lp-pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" className={`lp-btn${loading ? ' lp-btn-loading' : ''}`} disabled={loading}>
                {loading ? <><span className="lp-spinner" /> Authenticating…</> : 'Sign in →'}
              </button>
            </form>

            <div className="lp-footer">
              <p>New to Compl-Ai™? <Link to="/register">Create an account</Link></p>
              <div className="lp-divider" />
              <p className="lp-copy">Powered by Emma-i™ AI · SNC-TAX × SA-iLabs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
