import React, { useState, useMemo } from 'react';
import { Search, Ban, UserX, AlertCircle } from 'lucide-react';
import { usersData } from '../data/usersData';
import BlockModal from './BlockModal';

const BlockUsers = () => {
  const [users, setUsers] = useState(usersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => 
    users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]
  );

  const handleBlockClick = (user) => {
    if (user.isBlocked) return;
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleBlock = async (userId, duration, reason) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user status to blocked
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                isBlocked: true, 
                blockDuration: duration, 
                blockReason: reason,
                blockedAt: new Date().toISOString()
              }
            : user
        )
      );
      
      console.log(`User ${userId} blocked for ${duration}: ${reason}`);
    } catch (error) {
      console.error('Failed to block user:', error);
      alert('Failed to block user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (loading) return; // Prevent closing while loading
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const blockedUsersCount = users.filter(user => user.isBlocked).length;
  const totalUsers = users.length;

  return (
    <div className="flex-1 bg-[#1A1A1A] text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-[#121212] border-b border-gray-800 p-6 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <UserX className="w-8 h-8 mr-3 text-[#F72585]" />
              Block Users
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-400">
                Total: <span className="text-white font-bold">{totalUsers}</span>
              </span>
              <span className="text-gray-400">
                Blocked: <span className="text-red-400 font-bold">{blockedUsersCount}</span>
              </span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-30 transition-all w-80 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto table-scroll-container">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-[#121212] border-b border-gray-800 sticky top-0 z-10">
            <div className="grid grid-cols-4 gap-6 px-8 py-5">
              <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">User Name</div>
              <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">User ID</div>
              <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Followers</div>
              <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Action</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-800">
            {filteredUsers.map((user, index) => (
              <div 
                key={user.id} 
                className="grid grid-cols-4 gap-6 px-8 py-5 hover:bg-[#222222] transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* User Name */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors"></div>
                    {user.isBlocked && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors">{user.username}</div>
                    {user.isBlocked && (
                      <div className="text-red-400 text-xs font-medium bg-red-500 bg-opacity-20 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Blocked
                      </div>
                    )}
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center">
                  <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{user.userId}</span>
                </div>

                {/* Followers */}
                <div className="flex items-center">
                  <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">{user.followers}</span>
                </div>

                {/* Block Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleBlockClick(user)}
                    disabled={user.isBlocked}
                    className={`
                      w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 transform
                      ${user.isBlocked 
                        ? 'border-gray-600 bg-gray-700 cursor-not-allowed opacity-50' 
                        : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:scale-110 hover:shadow-red-500/30'
                      }
                    `}
                    aria-label={user.isBlocked ? 'User already blocked' : 'Block user'}
                    title={user.isBlocked ? 'User already blocked' : 'Click to block user'}
                  >
                    <Ban className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No users found</h3>
              <p className="text-gray-400 max-w-md">
                {searchTerm 
                  ? "No users match your search criteria. Try different keywords." 
                  : "No users available to display."
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-6 py-2 bg-[#F72585] text-white rounded-lg font-medium hover:bg-opacity-90 transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Block Modal */}
      <BlockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onBlock={handleBlock}
        loading={loading}
      />
    </div>
  );
};

export default BlockUsers;