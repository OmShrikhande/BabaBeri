import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building, Coins, Gem, Shield, UserCheck,
  Eye, Mic, Building2, Crown, Gift, Trophy, UserX,
  Flag, Percent, LogOut, X, UserRoundPlus
} from 'lucide-react';
import { navigationItems } from '../../data/dashboardData';
import { APP_CONFIG } from '../../config/api';
import { getDashboardAsideClasses } from '../../utils/dashboardSidebarClasses';
import { closeSidebarOnMobile } from '../../hooks/useDashboardSidebarOffset';

const iconMap = {
  LayoutDashboard, Users, Building, Coins, Gem, Shield, UserCheck,
  Eye, Mic, Building2, Crown, Gift, Trophy, UserX,
  Flag, Percent, UserRoundPlus
};

const OwnerSidebar = ({ isOpen, toggleSidebar, currentUser, onLogout }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      <aside className={getDashboardAsideClasses(isOpen)}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 min-w-72">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">Owner Portal</h1>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white p-1 shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto enhanced-scrollbar min-w-72">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              if (!item.path) return null;
              const IconComponent = iconMap[item.icon] || LayoutDashboard;
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    end={item.path === `/${APP_CONFIG.OWNER_SECRET_PATH}`}
                    onClick={() => closeSidebarOnMobile(toggleSidebar)}
                    className={({ isActive }) => `
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg border-l-2 border-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5 shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800 min-w-72">
          <div className="mb-4 p-3 bg-[#1A1A1A] rounded-lg border border-gray-700">
            <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
            <p className="text-xs text-gray-400 font-mono">Super Admin</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-red-900/20 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default OwnerSidebar;
