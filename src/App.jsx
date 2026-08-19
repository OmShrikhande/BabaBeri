import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { APP_CONFIG } from './config/api';
import { AuthProvider } from './context/AuthContext';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import PublicRoute from './components/guards/PublicRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OwnerAreaPage from './pages/OwnerAreaPage';

// Layouts & Goals
import AdminLayout from './layouts/AdminLayout';
import AdminGoals from './pages/admin/AdminGoals';
import MasterAgencyLayout from './layouts/MasterAgencyLayout';
import MasterAgencyGoals from './pages/masteragency/MasterAgencyGoals';
import AgencyLayout from './layouts/AgencyLayout';
import AgencyGoals from './pages/agency/AgencyGoals';

// Existing Components
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
import Wallet from './components/CoinRecharge/Wallet';
import Profile from './components/Profile';
import AuthTest from './components/AuthTest';
import MasterAgency from './components/MasterAgency';
import HostDetails from './components/HostDetails';
import UserDetailsList from './components/UserDetailsList';
import RoleStagesPage from './components/RoleStages/RoleStagesPage';
import UserActivation from './components/UserActivation';
import AdminDashboard from './components/AdminDashboard';
import MasterAgencyDashboard from './components/MasterAgencyDashboard';
import MasterAgencyCreateAgency from './components/MasterAgencyCreateAgency';
import AgencyDashboard from './components/AgencyDashboard';
import VipLevels from './components/VipLevels';
import ReportsBan from './components/ReportsBan';
import RolePercentage from './components/RolePercentage';
import Createlayout from './components/Create/Createlayout';
import GiftsAndBannersLayout from './components/Gifts_and_Banner';
import AdminFinancialPage from './pages/admin/AdminFinancialPage';
import MasterAgencyFinancialPage from './pages/masteragency/MasterAgencyFinancialPage';
import AgencyFinancialPage from './pages/agency/AgencyFinancialPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Owner / Super Admin Routes */}
      <Route 
        path={`/${APP_CONFIG.OWNER_SECRET_PATH}`} 
        element={
          <ProtectedRoute allowedRoles={['super-admin']}>
            <OwnerAreaPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="move-create" element={<Createlayout />} />
        <Route path="sub-admins" element={<SubAdmins />} />
        <Route path="sub-admins/:adminCode" element={<SubAdminDetail />} />
        <Route path="sub-admins/:adminCode/:masterAgencyId" element={<MasterAgencyDetail />} />
        <Route path="sub-admins/:adminCode/:masterAgencyId/:agencyId" element={<AgencyHostDetail />} />
        <Route path="master-agency" element={<MasterAgency />} />
        <Route path="agencies" element={<Agencies />} />
        <Route path="agencies/:agencyId" element={<AgencyDetail />} />
        <Route path="host-verification" element={<HostVerification />} />
        <Route path="verified-hosts" element={<HostDetails />} />
        <Route path="live-monitoring" element={<LiveMonitoring />} />
        <Route path="coin-recharge" element={<CoinRecharge />} />
        <Route path="diamonds-wallet" element={<DiamondsCashout />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="role-stages" element={<RoleStagesPage />} />
        <Route path="user-details" element={<UserDetailsList />} />
        <Route path="vip-levels" element={<VipLevels />} />
        <Route path="gifts-banners" element={<GiftsAndBannersLayout />} />
        <Route path="block-users" element={<BlockUsers />} />
        <Route path="user-activation" element={<UserActivation />} />
        <Route path="reports-ban" element={<ReportsBan />} />
        <Route path="role-percentage" element={<RolePercentage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="auth-test" element={<AuthTest />} />
        <Route path="wallet" element={<Wallet />} />
      </Route>

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="financial" element={<AdminFinancialPage />} />
        <Route path="move-create" element={<Createlayout />} />
        <Route path="master-agency" element={<MasterAgency />} />
        <Route path="master-agency/:masterAgencyId" element={<MasterAgencyDetail />} />
        <Route path="agencies" element={<Agencies />} />
        <Route path="agencies/:agencyId" element={<AgencyDetail />} />
        <Route path="host-details" element={<HostDetails />} />
        <Route path="coin-recharge" element={<CoinRecharge />} />
        <Route path="block-users" element={<BlockUsers />} />
      </Route>

      {/* Master Agency Routes */}
      <Route 
        path="/master-agency" 
        element={
          <ProtectedRoute allowedRoles={['master-agency']}>
            <MasterAgencyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MasterAgencyDashboard />} />
        <Route path="financial" element={<MasterAgencyFinancialPage />} />
        <Route path="create-agency" element={<div className="p-6"><MasterAgencyCreateAgency /></div>} />
        <Route path="agencies" element={<Agencies />} />
        <Route path="agencies/:agencyId" element={<AgencyDetail />} />
        <Route path="host-details" element={<HostDetails />} />
        <Route path="coin-recharge" element={<CoinRecharge />} />
      </Route>

      {/* Agency Routes */}
      <Route 
        path="/agency" 
        element={
          <ProtectedRoute allowedRoles={['agency']}>
            <AgencyLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgencyDashboard />} />
        <Route path="financial" element={<AgencyFinancialPage />} />
        <Route path="host-details" element={<HostDetails />} />
        <Route path="coin-recharge" element={<CoinRecharge />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
