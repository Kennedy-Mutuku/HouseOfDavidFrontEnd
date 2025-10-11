import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Events from './pages/Events';
import Donations from './pages/Donations';
import Users from './pages/Users';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MyGiving from './pages/user/MyGiving';
import Attendance from './pages/user/Attendance';
import InGathering from './pages/user/InGathering';
import Announcements from './pages/user/Announcements';
import Feedback from './pages/user/Feedback';

// Components
import Layout from './components/Layout';
import UserLayout from './components/UserLayout';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === 'user' ? '/user/dashboard' : '/dashboard'} /> : <Login />}
      />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        {/* User Routes */}
        <Route element={<RoleBasedRoute allowedRoles={['user']} />}>
          <Route element={<UserLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/giving" element={<MyGiving />} />
            <Route path="/user/attendance" element={<Attendance />} />
            <Route path="/user/ingathering" element={<InGathering />} />
            <Route path="/user/announcements" element={<Announcements />} />
            <Route path="/user/feedback" element={<Feedback />} />
          </Route>
        </Route>

        {/* Admin and SuperAdmin Routes */}
        <Route element={<RoleBasedRoute allowedRoles={['admin', 'superadmin']} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/events" element={<Events />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      {/* Redirect root based on role */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'user' ? '/user/dashboard' : '/dashboard'} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
