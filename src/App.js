import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// User Pages
import UserDashboard from './pages/user/UserDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMembers from './pages/admin/ManageMembers';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

// Components
import UserLayout from './components/UserLayout';

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route element={<UserLayout />}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/" element={<UserDashboard />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/manage-members" element={<ManageMembers />} />

      {/* Super Admin Routes */}
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />

      {/* Redirect all other routes to user dashboard */}
      <Route path="*" element={<Navigate to="/user/dashboard" />} />
    </Routes>
  );
}

export default App;
