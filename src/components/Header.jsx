import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Search, User, LogOut, Crown, Shield, ChevronRight } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SuperAdminWallet from './SuperAdminWallet';
import { APP_CONFIG } from '../config/api';
import authService from '../services/authService';

const Header = ({ toggleSidebar, currentUser, onLogout, onProfileClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingReports, setPendingReports] = useState(0);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const ownerBase = `/${APP_CONFIG.OWNER_SECRET_PATH}`;
  const isSuperAdmin = currentUser?.userType === 'super-admin';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let ignore = false;

    const loadPending = async () => {
      const res = await authService.getUserReports('PENDING');
      if (!ignore && res.success) {
        setPendingReports(res.data?.pending ?? res.data?.reports?.length ?? 0);
      }
    };

    loadPending();
    const interval = setInterval(loadPending, 60000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [isSuperAdmin, location.pathname]);

  const handleNotificationsClick = () => {
    if (!isSuperAdmin) return;
    navigate(`${ownerBase}/reports-ban?tab=reports`);
  };

  const pathSegments = location.pathname.split('/').filter(p => p);

  return (
    <header
      className="bg-black/60 border-b border-gray-800 px-3 sm:px-6 py-3 sm:py-4 shrink-0"
      role="banner"
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Left side - Menu button and breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors p-2 shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center space-x-2 text-sm min-w-0">
            <Link to="/" className="text-gray-400 hover:text-white font-medium capitalize truncate">
              {pathSegments[0] || 'Home'}
            </Link>
            {pathSegments.length > 1 && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                <span className="text-white font-semibold capitalize truncate">
                  {pathSegments[1].replace('-', ' ')}
                </span>
              </>
            )}
          </div>
          <h1 className="text-base sm:text-xl font-bold text-white md:hidden capitalize truncate min-w-0">
            {pathSegments[pathSegments.length - 1]?.replace('-', ' ') || 'Dashboard'}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Super Admin Wallet — hidden on very small screens */}
          <div className="hidden sm:block">
            <SuperAdminWallet currentUser={currentUser} />
          </div>

          {/* Search — tablet+ only */}
          <button
            className="hidden lg:flex text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications — user reports for super admin */}
          <button
            type="button"
            onClick={handleNotificationsClick}
            disabled={!isSuperAdmin}
            className={`relative transition-colors p-2 ${isSuperAdmin ? 'text-gray-400 hover:text-white cursor-pointer' : 'text-gray-600 cursor-default'}`}
            aria-label="User reports notifications"
            title={isSuperAdmin ? 'View user reports' : 'Notifications'}
          >
            <Bell className="w-5 h-5" />
            {isSuperAdmin && pendingReports > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#F72585] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {pendingReports > 99 ? '99+' : pendingReports}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-white transition-colors p-1.5 sm:p-2"
              aria-label="User profile"
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                ${currentUser?.userType === 'super-admin' ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7]' :
                  currentUser?.userType === 'admin' ? 'bg-gradient-to-r from-[#7209B7] to-[#4361EE]' :
                    'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]'}
              `}>
                {currentUser?.userType === 'super-admin' ? <Crown className="w-4 h-4 text-white" /> :
                  currentUser?.userType === 'admin' ? <Shield className="w-4 h-4 text-white" /> :
                    <User className="w-4 h-4 text-white" />}
              </div>
              <span className="text-sm font-medium hidden md:block max-w-[120px] truncate">{currentUser?.username}</span>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-gray-700">
                  <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
                  <p className="text-xs text-gray-400 capitalize">{currentUser?.userType?.replace('-', ' ')}</p>
                </div>
                {/* Wallet on mobile — shown inside profile menu */}
                <div className="sm:hidden p-3 border-b border-gray-700">
                  <SuperAdminWallet currentUser={currentUser} />
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onProfileClick && onProfileClick();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;