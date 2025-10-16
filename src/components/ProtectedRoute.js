import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show nothing while loading to prevent flash
  if (loading) {
    return null;
  }

  // If not authenticated, allow access (for public user dashboard)
  if (!isAuthenticated) {
    return children;
  }

  // If authenticated, check role
  let userRole = user?.role;

  // Handle if role is an array (take the first role)
  if (Array.isArray(userRole)) {
    userRole = userRole[0];
  }

  // Convert to string if not already
  userRole = String(userRole || '');

  // Check if user's role is in the allowed roles list
  if (allowedRoles && allowedRoles.length > 0) {
    const roleAllowed = allowedRoles.some(role => {
      const roleStr = String(role || '').toLowerCase();
      const userRoleStr = userRole.toLowerCase();
      return userRoleStr === roleStr;
    });

    if (!roleAllowed) {
      // Redirect based on user's actual role
      const roleLower = userRole.toLowerCase();

      if (roleLower === 'superadmin') {
        return <Navigate to="/superadmin/dashboard" replace />;
      } else if (roleLower === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/user/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
