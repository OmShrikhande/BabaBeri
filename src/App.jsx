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
import Login from './components/Login';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // App state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [selectedAgencyId, setSelectedAgencyId] = useState(null);
  const [selectedSubAdminId, setSelectedSubAdminId] = useState(null);
  const [selectedMasterAgencyId, setSelectedMasterAgencyId] = useState(null);

  // Authentication handlers
  const handleLogin = (loginData) => {
    setCurrentUser({
      username: loginData.username,
      userType: loginData.userType,
      loginTime: new Date().toISOString()
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveRoute('dashboard');
    setSidebarOpen(false);
  };

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
        return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#1A1A1A] overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeRoute={activeRoute}
        onNavigation={handleNavigation}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden main-content-area">
        {/* Mobile Header */}
        <Header 
          toggleSidebar={toggleSidebar} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Content */}
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
