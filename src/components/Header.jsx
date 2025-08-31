import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Search, User, LogOut, Crown, Shield } from 'lucide-react';

const Header = ({ toggleSidebar, currentUser, onLogout, onProfileClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
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
  return (
    <header 
      className="bg-[#1A1A1A] border-b border-gray-800 px-6 py-4 lg:hidden"
      role="banner"
    >
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <button
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button
            className="relative text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F72585] rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2"
              aria-label="User profile"
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${currentUser?.userType === 'super-admin' ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7]' :
                  currentUser?.userType === 'admin' ? 'bg-gradient-to-r from-[#7209B7] to-[#4361EE]' :
                  'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]'}
              `}>
                {currentUser?.userType === 'super-admin' ? <Crown className="w-4 h-4 text-white" /> :
                 currentUser?.userType === 'admin' ? <Shield className="w-4 h-4 text-white" /> :
                 <User className="w-4 h-4 text-white" />}
              </div>
              <span className="text-sm font-medium hidden sm:block">{currentUser?.username}</span>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl z-50">
                <div className="p-3 border-b border-gray-700">
                  <p className="text-sm font-semibold text-white">{currentUser?.username}</p>
                  <p className="text-xs text-gray-400 capitalize">{currentUser?.userType.replace('-', ' ')}</p>
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