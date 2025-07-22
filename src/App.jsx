import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HostVerification from './components/HostVerification';
import Header from './components/Header';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (route) => {
    setActiveRoute(route);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const renderMainContent = () => {
    switch (activeRoute) {
      case 'host-verification':
        return <HostVerification />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex layout-container bg-[#1A1A1A]">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeRoute={activeRoute}
        onNavigation={handleNavigation}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Dynamic Content */}
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
