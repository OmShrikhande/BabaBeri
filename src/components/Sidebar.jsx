import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Building, Coins, Gem, Shield, UserCheck, 
  Eye, Mic, Building2, Sword, Crown, Gift, Trophy, Music, UserX, 
  AlertTriangle, Video, Flag, BarChart, UserCog, Settings, Menu, X 
} from 'lucide-react';
import { navigationItems } from '../data/dashboardData';

const iconMap = {
  LayoutDashboard, Users, Building, Coins, Gem, Shield, UserCheck,
  Eye, Mic, Building2, Sword, Crown, Gift, Trophy, Music, UserX,
  AlertTriangle, Video, Flag, BarChart, UserCog, Settings
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
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
          fixed left-0 top-0 h-full w-80 bg-[#121212] transform transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:relative lg:w-80 lg:block
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
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
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
        <nav className="p-4 h-[calc(100%-88px)] overflow-y-auto">
          <ul className="space-y-2" role="menubar">
            {navigationItems.map((item) => {
              const IconComponent = iconMap[item.icon];
              const isActive = activeItem === item.id;
              
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
      </aside>
    </>
  );
};

export default Sidebar;