import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HostVerification from './components/HostVerification';
import Agencies from './components/Agencies';
import AgencyDetail from './components/AgencyDetail';
import Header from './components/Header';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [selectedAgencyId, setSelectedAgencyId] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (route) => {
    setActiveRoute(route);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
    // Reset agency selection when navigating away from agencies
    if (route !== 'agencies') {
      setSelectedAgencyId(null);
    }
  };

  const handleNavigateToAgencyDetail = (agencyId) => {
    setSelectedAgencyId(agencyId);
  };

  const handleBackToAgencies = () => {
    setSelectedAgencyId(null);
  };

  const renderMainContent = () => {
    switch (activeRoute) {
      case 'host-verification':
        return <HostVerification />;
      case 'agencies':
        if (selectedAgencyId) {
          return (
            <AgencyDetail 
              agencyId={selectedAgencyId} 
              onBack={handleBackToAgencies} 
            />
          );
        }
        return <Agencies onNavigateToDetail={handleNavigateToAgencyDetail} />;
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
