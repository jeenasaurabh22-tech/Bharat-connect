import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore.js';
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};
export default PublicRoute;