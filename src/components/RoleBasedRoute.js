import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { hasRole, user } = useAuth();

  if (!hasRole(allowedRoles)) {
    // Redirect based on user's actual role
    const userRoles = Array.isArray(user?.role) ? user.role : [user?.role];

    if (userRoles.includes('user')) {
      return <Navigate to="/user/dashboard" />;
    } else if (userRoles.includes('admin') || userRoles.includes('superadmin')) {
      return <Navigate to="/dashboard" />;
    }
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
