import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, X, Users, Mic, Building, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const MasterAgencyLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/master-agency', label: 'Goals', icon: LayoutDashboard },
    { path: '/master-agency/create-agency', label: 'Create Agencies', icon: Building },
    { path: '/master-agency/agencies', label: 'Agencies', icon: Users },
    { path: '/master-agency/host-details', label: 'Host Details', icon: Mic },
    { path: '/master-agency/coin-recharge', label: 'Coin Recharge', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-[#1A1A1A] overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full w-72 bg-[#121212] transform transition-transform duration-300 z-50 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:relative lg:flex shadow-2xl lg:shadow-none border-r border-gray-800
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Master Agency</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto enhanced-scrollbar">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/master-agency'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg border-l-2 border-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="mb-4 p-3 bg-[#1A1A1A] rounded-lg border border-gray-700">
            <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
            <p className="text-xs text-gray-400 font-mono">Master Agency</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-red-900/20 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          currentUser={currentUser}
          onLogout={handleLogout}
          onProfileClick={() => navigate('/ownerarea/profile')} 
        />
        <div className="flex-1 overflow-y-auto bg-[#1A1A1A]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MasterAgencyLayout;
