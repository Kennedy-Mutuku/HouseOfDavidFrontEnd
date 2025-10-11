import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { hasRole, user } = useAuth();

  if (!hasRole(allowedRoles)) {
    // Redirect based on user's actual role
    if (user?.role === 'user') {
      return <Navigate to="/user/dashboard" />;
    } else if (user?.role === 'admin' || user?.role === 'superadmin') {
      return <Navigate to="/dashboard" />;
    }
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
