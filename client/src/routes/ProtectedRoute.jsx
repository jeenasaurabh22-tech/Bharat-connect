import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore.js';
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Check roles authorization
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Role not authorized, redirect to general dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};
export default ProtectedRoute;