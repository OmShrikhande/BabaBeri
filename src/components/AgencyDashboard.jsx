import React from 'react';
import { Building } from 'lucide-react';

const AgencyDashboard = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#121212] overflow-hidden">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-[#7209B7] to-[#F72585] rounded-2xl flex items-center justify-center">
            <Building className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Agency Dashboard</h1>
        <p className="text-gray-400 text-lg">Welcome to your agency dashboard</p>
      </div>
    </div>
  );
};

export default AgencyDashboard;
