import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/api';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1A1A1A]">
        <div className="w-10 h-10 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const role = currentUser?.userType;
    let target = '/';
    if (role === 'super-admin') target = `/${APP_CONFIG.OWNER_SECRET_PATH}`;
    else if (role === 'admin') target = '/admin';
    else if (role === 'master-agency') target = '/master-agency';
    else if (role === 'agency') target = '/agency';
    
    return <Navigate to={target} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
