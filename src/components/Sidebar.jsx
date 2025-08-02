import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Building, Coins, Gem, Shield, UserCheck, 
  Eye, Mic, Building2, Sword, Crown, Gift, Trophy, Music, UserX, 
  AlertTriangle, Video, Flag, BarChart, UserCog, Settings, Menu, X, LogOut, User
} from 'lucide-react';
import { navigationItems } from '../data/dashboardData';

const iconMap = {
  LayoutDashboard, Users, Building, Coins, Gem, Shield, UserCheck,
  Eye, Mic, Building2, Sword, Crown, Gift, Trophy, Music, UserX,
  AlertTriangle, Video, Flag, BarChart, UserCog, Settings
};

const Sidebar = ({ isOpen, toggleSidebar, activeRoute = 'dashboard', onNavigation, currentUser, onLogout }) => {
  const handleItemClick = (itemId) => {
    if (onNavigation) {
      onNavigation(itemId);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleSidebar()}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-72 sm:w-80 bg-[#121212] transform transition-transform duration-300 z-50 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:relative lg:w-80 lg:block shadow-2xl lg:shadow-none
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center glow-pink">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <a href='https://www.figma.com/design/B7zOoGV9399WrfyyAp3oxt/StarArena?node-id=1-2'>
            <h1 className="text-xl font-bold text-white">PRO X STREAM</h1>
            </a>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 sidebar-scroll">
          <ul className="space-y-2" role="menubar">
            {navigationItems.map((item) => {
              const IconComponent = iconMap[item.icon];
              const isActive = activeRoute === item.id;
              
              return (
                <li key={item.id} role="none">
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white glow-pink shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:glow-pink'
                      }
                      focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50
                    `}
                    role="menuitem"
                    tabIndex={0}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {IconComponent && (
                      <IconComponent 
                        className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} 
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        {currentUser && (
          <div className="p-4 border-t border-gray-800">
            {/* User Info */}
            <div className="mb-4 p-3 bg-[#1A1A1A] rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${currentUser.userType === 'super-admin' ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7]' :
                    currentUser.userType === 'admin' ? 'bg-gradient-to-r from-[#7209B7] to-[#4361EE]' :
                    'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]'}
                `}>
                  {currentUser.userType === 'super-admin' ? <Crown className="w-5 h-5 text-white" /> :
                   currentUser.userType === 'admin' ? <Shield className="w-5 h-5 text-white" /> :
                   <User className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{currentUser.username}</p>
                  <p className="text-xs text-gray-400 capitalize">{currentUser.userType.replace('-', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 text-gray-300 hover:bg-red-900/20 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;