import React from 'react';

const DiamondUserCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full border-2 border-[#F72585] object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#1A1A1A]"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-gray-400 text-sm">{user.username}</p>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">●</span>
              </div>
              <span className="text-2xl font-bold text-white">{user.totalCashout}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Cashout</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">♦</span>
              </div>
              <span className="text-2xl font-bold text-white">{user.totalDiamonds}</span>
            </div>
            <p className="text-gray-400 text-sm">Total Diamonds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiamondUserCard;