import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import MainLayout from './components/Navigation/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import CompliancePage from './pages/Compliance';
import VaultPage from './pages/Vault';
import LoginPage from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/Admin';
import Calendar from './pages/Calendar';
import EmmaChat from './pages/EmmaChat';
import RiskAnalytics from './pages/RiskAnalytics';
import MaturityRoadmap from './pages/MaturityRoadmap';
import FilingWorkflows from './pages/FilingWorkflows';
import AuditReport from './pages/AuditReport';
import Integrations from './pages/Integrations';
import WhatsAppAlerts from './pages/WhatsAppAlerts';
import IndustryIntel from './pages/IndustryIntel';
import { useAuthStore } from './stores/authStore';
import './App.css';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  // Recover session on app load
  useEffect(() => {
    if (localStorage.getItem('token') && !isAuthenticated) {
      fetchUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/compliance/*" element={<CompliancePage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/emma-i" element={<EmmaChat />} />
          <Route path="/risk-analytics" element={<RiskAnalytics />} />
          <Route path="/maturity-roadmap" element={<MaturityRoadmap />} />
          <Route path="/filing-workflows" element={<FilingWorkflows />} />
          <Route path="/audit" element={<AuditReport />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/whatsapp-alerts" element={<WhatsAppAlerts />} />
          <Route path="/industry-intel" element={<IndustryIntel />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Route>

        {/* Catch all - redirect to dashboard if authenticated, login otherwise */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
