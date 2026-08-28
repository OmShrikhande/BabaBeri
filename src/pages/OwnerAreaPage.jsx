import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import OwnerSidebar from './owner/OwnerSidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useDashboardSidebarOffset } from '../hooks/useDashboardSidebarOffset';

const OwnerAreaPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useDashboardSidebarOffset(sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#1A1A1A] overflow-hidden dashboard-shell">
      <OwnerSidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden main-content-area">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          currentUser={currentUser}
          onLogout={handleLogout}
          onProfileClick={() => navigate('/ownerarea/profile')}
        />
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#1A1A1A] mobile-scroll-fix">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OwnerAreaPage;
