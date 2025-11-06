import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// User Pages
import UserDashboard from './pages/user/UserDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMembers from './pages/admin/ManageMembers';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import FinancialManagement from './pages/admin/FinancialManagement';

// Components
import UserLayout from './components/UserLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* User Routes - Only for regular users or unauthenticated */}
      <Route element={<UserLayout />}>
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user', 'member']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['user', 'member']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Routes - Only for admins and superadmins */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-members"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
            <ManageMembers />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Routes - Only for superadmins */}
      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['superAdmin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/analytics"
        element={
          <ProtectedRoute allowedRoles={['superAdmin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/financial-management"
        element={
          <ProtectedRoute allowedRoles={['superAdmin']}>
            <FinancialManagement />
          </ProtectedRoute>
        }
      />

      {/* Redirect all other routes to user dashboard */}
      <Route path="*" element={<Navigate to="/user/dashboard" />} />
    </Routes>
  );
}

export default App;
