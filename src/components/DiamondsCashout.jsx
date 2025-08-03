import React, { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { ToastContainer, useToast } from './Toast';
import CustomDropdown from './CustomDropdown';
import DiamondUserCard from './DiamondUserCard';
import CashoutHistoryTable from './CashoutHistoryTable';
import CashoutRequestCard from './CashoutRequestCard';
import { 
  demoUsers, 
  demoCashoutRequests, 
  filterOptions, 
  getUserById, 
  getPendingRequestsCount 
} from '../data/diamondsDemoData';

const DiamondsCashout = () => {
  // Toast hook
  const { toasts, addToast, removeToast } = useToast();

  // State management
  const [searchUserId, setSearchUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Monthly');
  const [cashoutRequests, setCashoutRequests] = useState(demoCashoutRequests);

  // Handle user search
  const handleUserSearch = () => {
    const user = getUserById(searchUserId);
    if (user) {
      setSelectedUser(user);
      addToast(`User ${user.name} loaded successfully`, 'success');
    } else {
      setSelectedUser(null);
      addToast('User not found. Try: manohar021, priyanka123, or rajesh456', 'error');
    }
  };

  // Handle cashout request approval
  const handleApprove = (requestId) => {
    setCashoutRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'approved' }
          : request
      )
    );
    addToast('Request approved successfully', 'success');
  };

  // Handle cashout request rejection
  const handleReject = (requestId) => {
    setCashoutRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' }
          : request
      )
    );
    addToast('Request rejected', 'error');
  };

  // Handle filter selection
  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    addToast(`Filter changed to ${filter}`, 'success');
  };

  // Handle keyboard events for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUserSearch();
    }
  };

  // Auto-load demo user on component mount
  useEffect(() => {
    // Simulate loading the demo user automatically to match screenshot
    setSelectedUser(demoUsers['manohar021']);
    setSearchUserId('manohar021');
  }, []);

  return (
    <div className="p-6 space-y-6 main-content-scroll">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Diamonds Wallet (Cashout)</h1>
      </div>

      {/* Exchange Rate Bar */}
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

      {/* Search and Filter Section */}
      <div className="flex items-end justify-between space-x-4">
        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-gray-300 mb-2">Search User</label>
          <div className="relative">
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter user Id"
              className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] transition-colors"
            />
            <button
              onClick={handleUserSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center hover:glow-pink transition-all duration-300"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Bell className="w-6 h-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
          
          {/* Filter Dropdown */}
          <CustomDropdown
            options={filterOptions}
            value={selectedFilter}
            onChange={handleFilterSelect}
            className="w-32"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Section - User Details and History (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* User Profile Card */}
          {selectedUser && (
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
          )}

          {/* Cashout History */}
          {selectedUser && (
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
                <div className="space-y-3 max-h-80 overflow-y-auto coin-scroll">
                  {selectedUser.cashoutHistory.map((record, index) => (
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
          )}
        </div>

        {/* Right Section - Cashout Requests (1/4 width) */}
        <div className="lg:col-span-1">
          <div className="bg-[#1A1A1A] rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-white">Cashout Requests</h3>
                <div className="w-6 h-6 bg-[#F72585] rounded-full flex items-center justify-center glow-pink">
                  <span className="text-white text-xs font-bold">{cashoutRequests.filter(r => r.status === 'pending').length}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto coin-scroll">
              {cashoutRequests.map((request) => (
                <div key={request.id} className="space-y-3 p-3 bg-[#121212] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={request.user.avatar}
                        alt={request.user.name}
                        className="w-10 h-10 rounded-full border border-gray-600 object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-[#121212]"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{request.user.name}</h4>
                      <p className="text-gray-400 text-xs">{request.user.time}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">♦</span>
                      </div>
                      <span className="text-white font-bold text-sm">{request.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-xs font-medium hover:glow-pink transition-all duration-300 transform hover:scale-105"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors transform hover:scale-105"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {request.status === 'approved' && (
                    <div className="text-center py-2 px-3 bg-green-900/20 text-green-400 rounded-lg text-xs font-medium border border-green-500/30">
                      Approved
                    </div>
                  )}
                  
                  {request.status === 'rejected' && (
                    <div className="text-center py-2 px-3 bg-red-900/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/30">
                      Rejected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DiamondsCashout;