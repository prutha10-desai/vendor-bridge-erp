import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import VendorsPage from './pages/VendorsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import RfqsPage from './pages/RfqsPage';
import RfqDetailPage from './pages/RfqDetailPage';
import RfqComparePage from './pages/RfqComparePage';
import VendorQuotePage from './pages/VendorQuotePage';
import ApprovalsPage from './pages/ApprovalsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import InvoicesPage from './pages/InvoicesPage';
import ProtectedRoute, { PublicRoute } from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';
import AppLayout from './components/layout/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/vendors"
              element={
                <RoleGuard allowedRoles={['admin', 'procurement_officer', 'manager']}>
                  <VendorsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminUsersPage />
                </RoleGuard>
              }
            />
            <Route path="/rfqs" element={<RfqsPage />} />
            <Route path="/rfqs/:id" element={<RfqDetailPage />} />
            <Route
              path="/rfqs/:id/compare"
              element={
                <RoleGuard allowedRoles={['procurement_officer', 'manager']}>
                  <RfqComparePage />
                </RoleGuard>
              }
            />
            <Route
              path="/rfqs/:id/quote"
              element={
                <RoleGuard allowedRoles={['vendor']}>
                  <VendorQuotePage />
                </RoleGuard>
              }
            />
            <Route
              path="/approvals"
              element={
                <RoleGuard allowedRoles={['manager']}>
                  <ApprovalsPage />
                </RoleGuard>
              }
            />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
