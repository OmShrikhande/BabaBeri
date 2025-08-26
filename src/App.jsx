import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HostVerification from './components/HostVerification';
import Agencies from './components/Agencies';
import AgencyDetail from './components/AgencyDetail';
import BlockUsers from './components/BlockUsers';
import SubAdmins from './components/SubAdmins';
import SubAdminDetail from './components/SubAdminDetail';
import MasterAgencyDetail from './components/MasterAgencyDetail';
import AgencyHostDetail from './components/AgencyHostDetail';
import LiveMonitoring from './components/LiveMonitoring';
import Ranking from './components/Ranking';
import CoinRecharge from './components/CoinRecharge';
import DiamondsCashout from './components/DiamondsCashout';
import Header from './components/Header';
import Login from './components/Login';
import AuthTest from './components/AuthTest';
import MasterAgency from './components/MasterAgency';
import authService from './services/authService';
import { canAccessRoute, getDefaultRouteForUser } from './utils/roleBasedAccess';

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
  const [selectedAgencyHostId, setSelectedAgencyHostId] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = authService.getToken();
    const userInfo = authService.getUserInfo();
    
    if (token && !authService.isTokenExpired(token)) {
      // User is already authenticated
      setCurrentUser({
        username: userInfo?.username || userInfo?.email || 'User',
        userType: authService.getUserType(),
        loginTime: userInfo?.loginTime || new Date().toISOString(),
        token: token,
        isDemo: false
      });
      setIsAuthenticated(true);
    } else if (token) {
      // Token exists but is expired
      authService.logout();
    }
  }, []);

  // Authentication handlers
  const handleLogin = (loginData) => {
    const userData = {
      username: loginData.username,
      userType: loginData.userType,
      loginTime: new Date().toISOString(),
      token: loginData.token,
      isDemo: loginData.isDemo || false,
      apiData: loginData.apiData
    };

    // Store additional user info for non-demo logins (avoid overwriting server profile if it exists)
    if (!loginData.isDemo && loginData.apiData) {
      const existingProfile = authService.getUserInfo() || {};
      const merged = {
        ...existingProfile,
        username: existingProfile.username || loginData.username,
        email: existingProfile.email || loginData.username,
        loginTime: existingProfile.loginTime || userData.loginTime,
        ...loginData.apiData
      };
      localStorage.setItem('userInfo', JSON.stringify(merged));
    }

    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear authentication data
    authService.logout();
    
    // Reset app state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveRoute('dashboard');
    setSidebarOpen(false);
    
    // Reset navigation state
    setSelectedAgencyId(null);
    setSelectedSubAdminId(null);
    setSelectedMasterAgencyId(null);
    setSelectedAgencyHostId(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (route) => {
    // Check if user can access this route
    if (!canAccessRoute(route, currentUser?.userType)) {
      console.warn(`Access denied to route: ${route} for user type: ${currentUser?.userType}`);
      return;
    }

    setActiveRoute(route);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
    // Reset selections when navigating away
    if (route !== 'agencies') {
      setSelectedAgencyId(null);
    }
    if (route !== 'sub-admins') {
      setSelectedSubAdminId(null);
      setSelectedMasterAgencyId(null);
      setSelectedAgencyHostId(null);
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
    setSelectedAgencyHostId(null); // Reset agency host when selecting master agency
  };

  const handleNavigateToAgencyHost = (subAdminId, masterAgencyId, agencyId) => {
    setSelectedSubAdminId(subAdminId);
    setSelectedMasterAgencyId(masterAgencyId);
    setSelectedAgencyHostId(agencyId);
  };

  const handleBackToSubAdmins = () => {
    setSelectedSubAdminId(null);
    setSelectedMasterAgencyId(null);
    setSelectedAgencyHostId(null);
  };

  const handleBackToSubAdminDetail = () => {
    setSelectedMasterAgencyId(null);
    setSelectedAgencyHostId(null);
  };

  const handleBackToMasterAgency = () => {
    setSelectedAgencyHostId(null);
  };

  const renderMainContent = () => {
    // Check if user can access the current route
    if (!canAccessRoute(activeRoute, currentUser?.userType)) {
      // Redirect to default route for user type
      const defaultRoute = getDefaultRouteForUser(currentUser?.userType);
      if (activeRoute !== defaultRoute) {
        setActiveRoute(defaultRoute);
        return null; // Will re-render with correct route
      }
    }

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
        if (selectedAgencyHostId && selectedMasterAgencyId && selectedSubAdminId) {
          return (
            <AgencyHostDetail
              subAdminId={selectedSubAdminId}
              masterAgencyId={selectedMasterAgencyId}
              agencyId={selectedAgencyHostId}
              onBack={handleBackToMasterAgency}
            />
          );
        }
        if (selectedMasterAgencyId && selectedSubAdminId) {
          return (
            <MasterAgencyDetail
              subAdminId={selectedSubAdminId}
              masterAgencyId={selectedMasterAgencyId}
              onBack={handleBackToSubAdminDetail}
              onNavigateToAgencyHost={handleNavigateToAgencyHost}
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
      case 'master-agency':
        return <MasterAgency onNavigateToDetail={handleNavigateToMasterAgency} currentUser={currentUser} />;
      case 'live-monitoring':
        return <LiveMonitoring />;
      case 'ranking':
        return <Ranking />;
      case 'coin-recharge':
        return <CoinRecharge />;
      case 'diamonds-wallet':
        return <DiamondsCashout />;
      case 'block-user':
        return <BlockUsers />;
      case 'auth-test':
        return <AuthTest />;
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
