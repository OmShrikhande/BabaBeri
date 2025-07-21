import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
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
          <button
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="User profile"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;