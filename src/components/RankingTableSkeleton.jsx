import React from 'react';

const RankingTableSkeleton = () => {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Rank</th>
              <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Full Name</th>
              <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Username</th>
              <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">User ID</th>
              <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Value</th>
            </tr>
          </thead>
        </table>
      </div>
      
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <table className="w-full">
          <tbody>
            {Array.from({ length: 10 }, (_, index) => (
              <tr key={index} className="border-b border-gray-800 animate-pulse">
                {/* Rank */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  </div>
                </td>

                {/* Full Name */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                    <div>
                      <div className="w-24 h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="w-16 h-3 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </td>

                {/* Username */}
                <td className="py-4 px-4">
                  <div className="w-20 h-4 bg-gray-700 rounded"></div>
                </td>

                {/* User ID */}
                <td className="py-4 px-4">
                  <div className="w-16 h-4 bg-gray-700 rounded"></div>
                </td>

                {/* Value */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-700 rounded"></div>
                    <div className="w-12 h-4 bg-gray-700 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTableSkeleton;