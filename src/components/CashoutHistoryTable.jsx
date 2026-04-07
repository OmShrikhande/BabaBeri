import React from 'react';

const CashoutHistoryTable = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Cashout History</h3>
        </div>
        <div className="p-6 text-center text-gray-400">
          No cashout history available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Cashout History</h3>
      </div>
      
      <div className="p-6">
        {/* Table Header */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-medium text-gray-300 pb-2 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">♦</span>
            </div>
            <span>Diamonds</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <span>Date & Time</span>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="space-y-3 max-h-64 overflow-y-auto coin-scroll">
          {history.map((record, index) => (
            <div 
              key={index} 
              className="grid grid-cols-2 gap-4 py-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/30 transition-colors duration-200 rounded-lg px-2"
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">♦</span>
                </div>
                <span className="text-white font-medium">{record.diamonds}</span>
              </div>
              <div className="text-gray-400 text-sm">{record.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashoutHistoryTable;