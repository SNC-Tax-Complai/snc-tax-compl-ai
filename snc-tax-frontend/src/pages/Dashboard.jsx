import { useEffect, useState } from 'react';
import { useComplianceStore } from '../stores/complianceStore';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import ComplianceScoreCard from '../components/Dashboard/ComplianceScoreCard';
import PendingFilingsCard from '../components/Dashboard/PendingFilingsCard';
import DueThisMonthCard from '../components/Dashboard/DueThisMonthCard';
import AllUpToDateCard from '../components/Dashboard/AllUpToDateCard';
import WelcomeBanner from '../components/Dashboard/WelcomeBanner';
import NotificationsPanel from '../components/Notifications/NotificationsPanel';
import './Dashboard.css';

export default function Dashboard() {
  const { fetchDashboardData, data, loading } = useComplianceStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <WelcomeBanner onNotificationsClick={() => setShowNotifications(true)} />

      <div className="dashboard-grid">
        <ComplianceScoreCard
          score={data?.complianceScore || 87}
          trend={data?.complianceTrend || 7}
          previousMonth={data?.previousScore || 80}
        />
        <PendingFilingsCard
          count={data?.pendingFilings || 3}
          trend={data?.pendingTrend || -15}
        />
        <DueThisMonthCard
          count={data?.dueThisMonth || 2}
          actionRequired={data?.actionRequired || true}
        />
        <AllUpToDateCard
          count={data?.allUpToDate || 14}
          trend={data?.upToDateTrend || 2}
        />
      </div>

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
