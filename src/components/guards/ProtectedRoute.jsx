import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRouteForUser } from '../../utils/roleBasedAccess';

const ProtectedRoute = ({ allowedRoles, redirectTo = '/login', children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1A1A1A]">
        <div className="w-10 h-10 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.userType)) {
    const defaultRoute = getDefaultRouteForUser(currentUser?.userType);
    // Simple fallback mapping if defaultRoute returns raw state-based routes
    if (defaultRoute === 'dashboard') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={`/${defaultRoute}`} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
