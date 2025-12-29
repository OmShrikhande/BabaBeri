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
import Wallet from './components/DiamondsCashout/Wallet';
import Header from './components/Header';
import Profile from './components/Profile';
import Login from './components/Login';
import AuthTest from './components/AuthTest';
import MasterAgency from './components/MasterAgency';
import { default as HostDetails } from './components/HostDetails';
import RoleStagesPage from './components/RoleStages/RoleStagesPage';
import UserActivation from './components/UserActivation';
import AdminDashboard from './components/AdminDashboard';
import MasterAgencyDashboard from './components/MasterAgencyDashboard';
import MasterAgencyCreateAgency from './components/MasterAgencyCreateAgency';
import AgencyDashboard from './components/AgencyDashboard';
import authService from './services/authService';
import Createlayout from './components/Create/Createlayout';
import { canAccessRoute, getDefaultRouteForUser } from './utils/roleBasedAccess';

const getPathForUserType = (userType) => {
  if (!userType) {
    return '/';
  }
  if (userType === 'super-admin') {
    return '/';
  }
  if (userType === 'admin') {
    return '/admin';
  }
  if (userType === 'master-agency') {
    return '/master-agency';
  }
  if (userType === 'agency') {
    return '/agency';
  }
  return '/';
};

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // App state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [previousRoute, setPreviousRoute] = useState(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState(null);
  const [selectedSubAdminId, setSelectedSubAdminId] = useState(null); // legacy ID usage
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null); // { id, code, name, subUsers }
  const [selectedMasterAgencyId, setSelectedMasterAgencyId] = useState(null);
  const [selectedAgencyHostId, setSelectedAgencyHostId] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isAuthenticated) {
      if (window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/');
      }
      return;
    }

    const targetPath = getPathForUserType(currentUser?.userType);
    if (targetPath && window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }
  }, [isAuthenticated, activeRoute, currentUser]);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = authService.getToken();
    const userInfo = authService.getUserInfo();
    
    if (token && !authService.isTokenExpired(token)) {
      // User is already authenticated
      const type = authService.getUserType();
      const user = {
        username: userInfo?.username || userInfo?.email || 'User',
        userType: type, // already normalized in service
        loginTime: userInfo?.loginTime || new Date().toISOString(),
        token: token,
        isDemo: false
      };
      setCurrentUser(user);
      setIsAuthenticated(true);

      // Route to appropriate dashboard based on user type
      if (type === 'admin') {
        setActiveRoute('admin-dashboard');
      } else if (type === 'master-agency') {
        setActiveRoute('master-agency-dashboard');
      } else if (type === 'agency') {
        setActiveRoute('agency-dashboard');
      }
    } else if (token) {
      // Token exists but is expired
      authService.logout();
    }
  }, []);

  // Load agencies data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAgenciesData();
    }
  }, [isAuthenticated]);

  const loadAgenciesData = async () => {
    setAgenciesLoading(true);
    try {
      await authService.ensureUserProfileCached();

      const response = await authService.getActiveHosts();

      if (response.success) {
        // Transform API data: group hosts by owner (agency code)
        const hostsByAgency = {};

        if (Array.isArray(response.data)) {
          response.data.forEach(host => {
            const agencyCode = host.owner || 'Unknown';
            if (!hostsByAgency[agencyCode]) {
              hostsByAgency[agencyCode] = [];
            }
            hostsByAgency[agencyCode].push({
              id: `H${host.id}`,
              name: host.name,
              earnings: host.diamond || 0, // Assuming diamond as earnings
              redeemed: 0 // Not provided in API
            });
          });
        }

        // Create agency objects from grouped hosts
        const transformedAgencies = Object.keys(hostsByAgency).map((agencyCode, index) => {
          const hosts = hostsByAgency[agencyCode];
          const totalEarnings = hosts.reduce((sum, host) => sum + host.earnings, 0);

          // Use mock agency data structure, but with real host data
          return {
            id: agencyCode,
            name: `Agency ${agencyCode}`, // Default name since not provided
            totalAgencies: hosts.length,
            goals: {
              current: 1,
              total: 2,
              progress: 50,
              moneyEarned: totalEarnings,
              moneyTarget: 10000
            },
            earnings: {
              lastMonth: Math.floor(totalEarnings * 0.8),
              thisMonth: totalEarnings,
              redeemDiamonds: Math.floor(totalEarnings * 0.1)
            },
            tier: 'Royal Silver', // Default tier
            revenueShare: 10,
            hosts: hosts
          };
        });

        setAgencies(transformedAgencies);
      } else {
        console.error('Failed to fetch active hosts:', response.error);
        // Fallback to empty array or handle error
        setAgencies([]);
      }
    } catch (error) {
      console.error('Error loading agencies:', error);
      setAgencies([]);
    } finally {
      setAgenciesLoading(false);
    }
  };

  // Authentication handlers
  const handleLogin = (loginData) => {
    const userType = authService.getUserType();
    const userData = {
      username: loginData.username,
      userType: userType, // ensure normalized type from service
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

    // Route to appropriate dashboard based on user type
    if (userType === 'admin') {
      setActiveRoute('admin-dashboard');
    } else if (userType === 'master-agency') {
      setActiveRoute('master-agency-dashboard');
    } else if (userType === 'agency') {
      setActiveRoute('agency-dashboard');
    }
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

    setPreviousRoute(activeRoute);
    setActiveRoute(route);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
    // Reset selections when navigating away
    if (route !== 'agencies') {
      setSelectedAgencyId(null);
    }
    if (route !== 'sub-admins') {
      setSelectedSubAdminId(null);
      setSelectedSubAdmin(null);
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
  const handleNavigateToSubAdminDetail = (subAdmin) => {
    // subAdmin: { id, code, name, subUsers }
    setSelectedSubAdminId(subAdmin?.id);
    setSelectedSubAdmin(subAdmin);
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
    setSelectedSubAdmin(null);
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
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'master-agency-dashboard':
        return <MasterAgencyDashboard />;
      case 'create-agency':
        return (
          <div className="p-6">
            <MasterAgencyCreateAgency />
          </div>
        );
      case 'agency-dashboard':
        return <AgencyDashboard />;
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
        if (selectedSubAdmin) {
          return (
            <SubAdminDetail
              subAdminId={selectedSubAdmin?.id}
              adminCode={selectedSubAdmin?.code}
              subAdminName={selectedSubAdmin?.name}
              subUsers={selectedSubAdmin?.subUsers || []}
              onBack={handleBackToSubAdmins}
              onNavigateToMasterAgency={handleNavigateToMasterAgency}
              currentUser={currentUser}
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
        return <DiamondsCashout onNavigateToWallet={() => handleNavigation('wallet')} />;
      case 'wallet':
        return <Wallet onBack={() => handleNavigation('diamonds-wallet')} />;
      case 'role-stages':
        return <RoleStagesPage currentUser={currentUser} />;
      case 'block-user':
        return <BlockUsers />;
      case 'user-activation':
        return <UserActivation />;
      case 'users-details':
      case 'user-details':
        return <HostDetails />;
      case 'auth-test':
        return <AuthTest />;
    case 'create':
      return <Createlayout />;
      case 'profile':
        return <Profile currentUser={currentUser} onBack={() => handleNavigation(previousRoute || 'dashboard')} />;
      case 'dashboard':
      default:
        return <Dashboard currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigation} />;
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
          onProfileClick={() => handleNavigation('profile')}
        />

        {/* Dynamic Content */}
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
