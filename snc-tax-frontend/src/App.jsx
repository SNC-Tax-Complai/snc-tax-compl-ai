import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/Navigation/MainLayout';
import Dashboard from './pages/Dashboard';
import CompliancePage from './pages/Compliance';
import VaultPage from './pages/Vault';
import LoginPage from './pages/Login';
import AdminPanel from './pages/Admin';
import { useAuthStore } from './stores/authStore';
import './App.css';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {isAuthenticated ? (
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compliance/*" element={<CompliancePage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/admin/*" element={<AdminPanel />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
