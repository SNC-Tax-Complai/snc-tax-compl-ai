import './WelcomeBanner.css';

export default function WelcomeBanner({ onNotificationsClick }) {
  return (
    <div className="welcome-banner">
      <div className="banner-content">
        <div className="banner-badge">ZA Proudly South African</div>
        <h2 className="banner-title">Welcome to Compl-Ai™ SA</h2>
        <p className="banner-subtitle">
          A product of SNC-TAX · Developed by SA-iLabs™ · Emma-i™ AI Engine ·
          Re-imagining Compliance Intelligence
        </p>
        <p className="banner-description">
          Your all-in-one South African SMME compliance command center. Powered by Emma-i™ AI.
        </p>
      </div>

      <div className="banner-actions">
        <button
          className="notification-btn"
          onClick={onNotificationsClick}
        >
          <span className="notification-icon">🔔</span>
          <span>Notifications</span>
          <span className="badge">1</span>
        </button>
        <button className="customize-btn">
          <span className="customize-icon">🎛️</span>
          <span>Customize Dashboard</span>
        </button>
      </div>
    </div>
  );
}
