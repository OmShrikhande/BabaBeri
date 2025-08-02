import React, { useState, useEffect } from 'react';
import UserCard from './UserCard';
import WarningModal from './WarningModal';
import { Eye, Users, Diamond, Play, Search, Filter, Clock, RefreshCw, Activity } from 'lucide-react';
import { mockLiveUsers, streamCategories, sortOptions } from '../data/liveMonitoringData';

const LiveMonitoring = () => {
  const [selectedUser, setSelectedUser] = useState(mockLiveUsers[0]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('viewers');
  const [filteredUsers, setFilteredUsers] = useState(mockLiveUsers);

  // Filter and sort users
  useEffect(() => {
    let filtered = mockLiveUsers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.streamTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || user.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'viewers':
          return parseFloat(b.viewerCount.replace('K', '')) - parseFloat(a.viewerCount.replace('K', ''));
        case 'diamonds':
          return parseFloat(b.diamondCount.replace('M', '')) - parseFloat(a.diamondCount.replace('M', ''));
        case 'duration':
          return b.duration.localeCompare(a.duration);
        case 'recent':
          return b.id - a.id; // Assuming higher ID means more recent
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, selectedCategory, sortBy]);

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleBlockUser = () => {
    // Handle block user logic
    console.log('Blocking user:', selectedUser.username);
    // You can add actual block logic here
  };

  const handleWarnUser = () => {
    setShowWarningModal(true);
  };

  const handleSendWarning = (warningType) => {
    // Handle warning logic
    console.log('Sending warning to:', selectedUser.username, 'Type:', warningType);
    setShowWarningModal(false);
    // You can add actual warning logic here
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-1 bg-[#1A1A1A] p-6 overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Live Monitoring</h1>
          <p className="text-gray-400">Monitor and manage live streaming users</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
          {/* Left Panel - Live Users Grid */}
          <div className="lg:col-span-1 bg-[#121212] rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F72585]" />
                Live Users ({filteredUsers.length})
              </h2>
            </div>

            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users or streams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-[#F72585] focus:outline-none transition-colors"
                />
              </div>

              {/* Filters Row */}
              <div className="flex gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#F72585] focus:outline-none"
                >
                  {streamCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Sort Filter */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#F72585] focus:outline-none"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users Grid */}
            <div className="flex-1 overflow-y-auto scroll-container">
              {currentUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                  {currentUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      isSelected={selectedUser?.id === user.id}
                      onClick={() => handleUserSelect(user)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No users found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-[#F72585] text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center Panel - Current Live User Screen */}
          <div className="lg:col-span-1 bg-[#121212] rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#F72585]" />
                Current Live User Screen
              </h2>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                LIVE
              </div>
            </div>

            {/* Live Stream Preview */}
            <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
              {selectedUser ? (
                <div className="h-full flex flex-col">
                  {/* Stream Preview Area */}
                  <div className="flex-1 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
                    <img
                      src={selectedUser.thumbnail}
                      alt={selectedUser.username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#F72585] glow-pink"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${selectedUser.username}&background=F72585&color=fff&size=128`;
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      LIVE
                    </div>
                  </div>

                  {/* User Info Overlay */}
                  <div className="bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">{selectedUser.username}</h3>
                    <p className="text-gray-300 text-sm mb-3">{selectedUser.streamTitle}</p>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-blue-400">
                          <Users className="w-4 h-4" />
                          {selectedUser.viewerCount}
                        </div>
                        <div className="flex items-center gap-1 text-purple-400">
                          <Diamond className="w-4 h-4" />
                          {selectedUser.diamondCount}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Clock className="w-4 h-4" />
                          {selectedUser.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#F72585] text-white px-2 py-1 rounded text-xs font-medium">
                          {selectedUser.category}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {selectedUser.country}
                        </span>
                      </div>
                      <div className="text-green-400 font-medium text-sm">
                        {selectedUser.status}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a user to view their live stream</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Action Buttons */}
          <div className="lg:col-span-1 bg-[#121212] rounded-lg p-4 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-4">User Actions</h2>
            
            {selectedUser ? (
              <div className="space-y-4">
                {/* Selected User Info */}
                <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-medium mb-2">Selected User</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.thumbnail}
                      alt={selectedUser.username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${selectedUser.username}&background=F72585&color=fff&size=48`;
                      }}
                    />
                    <div>
                      <p className="text-white font-medium">{selectedUser.username}</p>
                      <p className="text-gray-400 text-sm">{selectedUser.viewerCount} viewers</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleWarnUser}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    ⚠️ Warn User
                  </button>
                  
                  <button
                    onClick={handleBlockUser}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    🚫 Block User
                  </button>
                </div>

                {/* User Stats */}
                <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-700">
                  <h3 className="text-white font-medium mb-3">Live Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Viewers:</span>
                      <span className="text-white">{selectedUser.viewerCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Diamonds:</span>
                      <span className="text-purple-400">{selectedUser.diamondCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-yellow-400">{selectedUser.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-[#F72585]">{selectedUser.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Country:</span>
                      <span className="text-blue-400">{selectedUser.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400 capitalize">{selectedUser.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a user to view actions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <WarningModal
          user={selectedUser}
          onClose={() => setShowWarningModal(false)}
          onSendWarning={handleSendWarning}
        />
      )}
    </div>
  );
};

export default LiveMonitoring;