
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import SubscribersList from "@/pages/SubscribersList";
import BenefitsManagement from "@/pages/BenefitsManagement";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/subscribers" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <SubscribersList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/benefits" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <BenefitsManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
