import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#121212] overflow-hidden">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 text-lg">Welcome to your admin dashboard</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
