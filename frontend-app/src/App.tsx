import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useEffect } from 'react';
import { defaultNotifications } from '@/data/mockNotifications';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import AuthLayout from '@/components/layouts/AuthLayout';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import CustomersPage from '@/pages/CustomersPage';
import CustomerDetailsPage from '@/pages/CustomerDetailsPage';
import SegmentsPage from '@/pages/SegmentsPage';
import DataManagementPage from '@/pages/DataManagementPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import PredictionStudioPage from '@/pages/PredictionStudioPage';
import ChurnAnalysisPage from '@/pages/ChurnAnalysisPage';
import LifetimeValuePage from '@/pages/LifetimeValuePage';
import SentimentAnalysisPage from '@/pages/SentimentAnalysisPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import ModelManagementPage from '@/pages/ModelManagementPage';
import ReportsPage from '@/pages/ReportsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const { notifications, setNotifications } = useNotificationStore();

  useEffect(() => {
    if (notifications.length === 0) {
      setNotifications(defaultNotifications);
    }
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected dashboard */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />
            <Route path="segments" element={<SegmentsPage />} />
            <Route path="data" element={<DataManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="prediction" element={<PredictionStudioPage />} />
            <Route path="churn" element={<ChurnAnalysisPage />} />
            <Route path="lifetime-value" element={<LifetimeValuePage />} />
            <Route path="sentiment" element={<SentimentAnalysisPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="models" element={<ModelManagementPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}

export default App;
