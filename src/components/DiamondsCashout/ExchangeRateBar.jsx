import React from 'react';

const ExchangeRateBar = () => {
  return (
    <div className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-4 border border-gray-700">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-black text-xs font-bold">●</span>
          </div>
          <span className="text-white font-medium">1 Coins</span>
        </div>
        
        <div className="text-gray-400 text-xl font-bold">=</div>
        
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-black text-xs font-bold">♦</span>
          </div>
          <span className="text-white font-medium">1 Diamonds</span>
        </div>
      </div>

      <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center glow-pink">
        <span className="text-white text-lg">⚡</span>
      </div>
    </div>
  );
};

export default ExchangeRateBar;
