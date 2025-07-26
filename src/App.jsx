import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HostVerification from './components/HostVerification';
import Agencies from './components/Agencies';
import AgencyDetail from './components/AgencyDetail';
import BlockUsers from './components/BlockUsers';
import SubAdmins from './components/SubAdmins';
import SubAdminDetail from './components/SubAdminDetail';
import MasterAgencyDetail from './components/MasterAgencyDetail';
import LiveMonitoring from './components/LiveMonitoring';
import Ranking from './components/Ranking';
import Header from './components/Header';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [selectedAgencyId, setSelectedAgencyId] = useState(null);
  const [selectedSubAdminId, setSelectedSubAdminId] = useState(null);
  const [selectedMasterAgencyId, setSelectedMasterAgencyId] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (route) => {
    setActiveRoute(route);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
    // Reset selections when navigating away
    if (route !== 'agencies') {
      setSelectedAgencyId(null);
    }
    if (route !== 'sub-admins') {
      setSelectedSubAdminId(null);
      setSelectedMasterAgencyId(null);
    }
  };

  const handleNavigateToAgencyDetail = (agencyId) => {
    setSelectedAgencyId(agencyId);
  };

  const handleBackToAgencies = () => {
    setSelectedAgencyId(null);
  };

  // Sub-admin navigation handlers
  const handleNavigateToSubAdminDetail = (subAdminId) => {
    setSelectedSubAdminId(subAdminId);
    setSelectedMasterAgencyId(null); // Reset master agency when selecting sub admin
  };

  const handleNavigateToMasterAgency = (subAdminId, masterAgencyId) => {
    setSelectedSubAdminId(subAdminId);
    setSelectedMasterAgencyId(masterAgencyId);
  };

  const handleBackToSubAdmins = () => {
    setSelectedSubAdminId(null);
    setSelectedMasterAgencyId(null);
  };

  const handleBackToSubAdminDetail = () => {
    setSelectedMasterAgencyId(null);
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
      case 'sub-admins':
        if (selectedMasterAgencyId && selectedSubAdminId) {
          return (
            <MasterAgencyDetail
              subAdminId={selectedSubAdminId}
              masterAgencyId={selectedMasterAgencyId}
              onBack={handleBackToSubAdminDetail}
            />
          );
        }
        if (selectedSubAdminId) {
          return (
            <SubAdminDetail
              subAdminId={selectedSubAdminId}
              onBack={handleBackToSubAdmins}
              onNavigateToMasterAgency={handleNavigateToMasterAgency}
            />
          );
        }
        return <SubAdmins onNavigateToDetail={handleNavigateToSubAdminDetail} />;
      case 'live-monitoring':
        return <LiveMonitoring />;
      case 'ranking':
        return <Ranking />;
      case 'block-user':
        return <BlockUsers />;
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
