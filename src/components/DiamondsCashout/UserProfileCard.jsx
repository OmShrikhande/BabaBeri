import React from 'react';
import { Search } from 'lucide-react';

const UserProfileCard = ({ selectedUser, loadingUser }) => {
  if (loadingUser) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#F72585] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-400">Loading user...</span>
        </div>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full border-2 border-[#F72585] object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#1A1A1A]"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
              <p className="text-gray-400 text-sm">{selectedUser.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-12">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">●</span>
                </div>
                <span className="text-2xl font-bold text-white">{selectedUser.totalCashout}</span>
              </div>
              <p className="text-gray-400 text-sm">Total Cashout</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">♦</span>
                </div>
                <span className="text-2xl font-bold text-white">{selectedUser.totalDiamonds}</span>
              </div>
              <p className="text-gray-400 text-sm">Total Diamonds</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Search for a User</h3>
        <p className="text-gray-400">Enter a user ID above to view their cashout details and history</p>
      </div>
    </div>
  );
};

export default UserProfileCard;
