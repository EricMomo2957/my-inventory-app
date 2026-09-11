import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const isAuthenticated = !!localStorage.getItem('userToken');
  const userRole = (localStorage.getItem('userRole') || 'clerk').toLowerCase().trim();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, verify user's role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.some(r => {
      const roleStr = r.toLowerCase().trim();
      return roleStr === userRole || 
        (userRole === 'administrator' && roleStr === 'admin') ||
        (userRole === 'admin' && roleStr === 'administrator');
    });

    if (!isAuthorized) {
      // If unauthorized clerk tries to access admin-only pages, redirect to Clerk Desk
      if (userRole === 'clerk' || userRole === 'staff') {
        return <Navigate to="/clerk/ClerkDashboard" replace />;
      }
      // If unauthorized role, redirect to main dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;