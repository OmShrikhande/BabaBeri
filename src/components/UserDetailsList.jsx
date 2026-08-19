import React, { useState, useEffect } from 'react';
import { X, Search, Coins, Gem, Calendar, User, Eye, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import authService from '../services/authService';
import Pagination from './Pagination';

const UserDetailsList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL'); // 'ALL', 'AGENCY', 'MASTERAGENCY', 'SUBADMIN', 'HOST'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Details Modal State
  const [selectedUserCode, setSelectedUserCode] = useState(null);
  const [userDetailData, setUserDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'recharge', 'ledger', 'other'

  useEffect(() => {
    fetchUsersList();
  }, []);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.getAllUsers();
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch users.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred fetching users list.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and Search Logic
  useEffect(() => {
    let result = [...users];

    // Filter by Role
    if (selectedRole !== 'ALL') {
      result = result.filter(user => {
        const userRole = (user.role || '').toUpperCase();
        if (selectedRole === 'AGENCY') {
          return userRole === 'AGENCY';
        }
        if (selectedRole === 'MASTERAGENCY') {
          return userRole === 'MASTERAGENCY' || userRole === 'MASTER-AGENCY' || userRole === 'MASTER_AGENCY';
        }
        if (selectedRole === 'SUBADMIN') {
          return userRole === 'SUBADMIN' || userRole === 'SUB-ADMIN' || userRole === 'SUB_ADMIN' || userRole === 'ADMIN';
        }
        if (selectedRole === 'HOST') {
          return userRole === 'HOST' || userRole === 'LIVEHOST' || userRole === 'LIVE-HOST';
        }
        return false;
      });
    }

    // Search by Name or Code
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        (user.name || '').toLowerCase().includes(term) ||
        (user.code || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, selectedRole, searchTerm]);

  // Handle Full Details Click
  const handleUserClick = async (code) => {
    setSelectedUserCode(code);
    setDetailLoading(true);
    setDetailError(null);
    setUserDetailData(null);
    setActiveTab('profile');

    try {
      const result = await authService.getUserFullData(code);
      if (result.success && result.data?.status === 'success') {
        setUserDetailData(result.data.data);
      } else {
        setDetailError(result.error || result.data?.message || 'Failed to fetch detailed profile data.');
      }
    } catch (err) {
      setDetailError(err.message || 'An error occurred fetching user full data.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Pagination Math
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080808] text-gray-100 min-h-screen">
      {/* Top Banner/Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              User Details Management
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              View, search, filter and audit registered users and their ledgers.
            </p>
          </div>
          <button
            onClick={fetchUsersList}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters and Search controls */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Role Filter Toggles */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5 self-start">
            {['ALL', 'AGENCY', 'MASTERAGENCY', 'SUBADMIN', 'HOST'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${selectedRole === role
                    ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {role === 'MASTERAGENCY' ? 'MASTER AGENCY' : role === 'SUBADMIN' ? 'SUB ADMIN' : role}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, user code, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121212] border border-white/5 focus:border-[#F72585]/50 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F72585] mb-4"></div>
            <p className="text-gray-400 text-sm">Fetching users list...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <p className="font-semibold text-lg">Error Loading Users</p>
            <p className="text-sm text-red-400/80 mt-1">{error}</p>
            <button
              onClick={fetchUsersList}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-12 text-center">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No users found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Profile</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Code</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Coins</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Diamonds</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Joining Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleUserClick(user.code)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.profilepic ? (
                            <img
                              src={user.profilepic}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-[#F72585]/30 transition-all"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F72585]/20 to-[#7209B7]/20 border border-white/10 flex items-center justify-center text-white text-xs font-bold uppercase">
                              {user.name ? user.name.slice(0, 2) : 'US'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-[#F72585] transition-colors">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                        {user.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${user.role === 'SUPERADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            user.role === 'ADMIN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                              user.role === 'SUBADMIN' || user.role === 'SUB-ADMIN' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                user.role === 'MASTERAGENCY' || user.role === 'MASTER-AGENCY' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                  user.role === 'AGENCY' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                                    'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
                          <Coins className="w-3.5 h-3.5" />
                          {user.coins ? user.coins.toLocaleString() : 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-semibold text-violet-400">
                          <Gem className="w-3.5 h-3.5" />
                          {user.diamond ? user.diamond.toLocaleString() : 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <button className="px-3 py-1.5 bg-white/5 hover:bg-gradient-to-r hover:from-[#F72585] hover:to-[#7209B7] hover:text-white rounded-lg transition-all text-gray-400 font-semibold flex items-center gap-1 ml-auto">
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/5">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  onItemsPerPageChange={(limit) => {
                    setItemsPerPage(limit);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Overlay / Modal */}
      {selectedUserCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
          <div className="relative w-full max-w-5xl bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUserCode(null)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-lg font-bold text-white">Detailed Audit Profile</h3>
                  <p className="text-xs text-gray-400">User Code: {selectedUserCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserCode(null)}
                className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {detailLoading ? (
              <div className="flex-1 min-h-[350px] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F72585] mb-4"></div>
                <p className="text-gray-400">Loading comprehensive logs...</p>
              </div>
            ) : detailError ? (
              <div className="flex-1 min-h-[300px] p-6 flex flex-col items-center justify-center text-center">
                <p className="text-red-400 text-lg font-semibold mb-2">Error Loading Profile Details</p>
                <p className="text-gray-400 max-w-md text-sm">{detailError}</p>
                <button
                  onClick={() => handleUserClick(selectedUserCode)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-semibold text-sm rounded-xl"
                >
                  Retry Fetch
                </button>
              </div>
            ) : userDetailData ? (
              <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                {/* User Summary Panel */}
                <div className="p-6 bg-gradient-to-r from-[#111] to-black border-b border-white/5 flex flex-col md:flex-row items-start md:items-center gap-6">
                  {userDetailData.profile?.profilepic ? (
                    <img
                      src={userDetailData.profile.profilepic}
                      alt={userDetailData.profile.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F72585]/10 to-[#7209B7]/10 border border-white/5 flex items-center justify-center text-white text-2xl font-bold">
                      {userDetailData.profile?.name?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                  )}

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider">Name</span>
                      <span className="text-base font-bold text-white">{userDetailData.profile?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider">Role</span>
                      <span className="text-sm font-semibold text-white/95">{userDetailData.profile?.role || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider">Coins</span>
                      <span className="text-base font-bold text-yellow-400 flex items-center gap-1">
                        <Coins className="w-4 h-4" /> {userDetailData.profile?.coins?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block uppercase tracking-wider">Diamonds</span>
                      <span className="text-base font-bold text-violet-400 flex items-center gap-1">
                        <Gem className="w-4 h-4" /> {userDetailData.profile?.diamond?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-white/5 bg-white/[0.01]">
                  {[
                    { id: 'profile', label: 'Full Profile' },
                    { id: 'recharge', label: `Recharge History (${userDetailData.rechargeHistory?.length || 0})` },
                    { id: 'ledger', label: `Coin Ledger (${userDetailData.superadminCoinLedger?.length || 0})` },
                    { id: 'other', label: 'Other Details' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id
                          ? 'border-[#F72585] text-white bg-white/5'
                          : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Panels */}
                <div className="p-6 flex-1 min-h-[300px]">

                  {/* Profile Details Tab */}
                  {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { label: 'Username', value: userDetailData.profile?.username },
                        { label: 'Email Address', value: userDetailData.profile?.email },
                        { label: 'Mobile Number', value: userDetailData.profile?.mobile },
                        { label: 'Verification Status', value: userDetailData.profile?.status },
                        { label: 'Email Verified', value: userDetailData.profile?.emailVerified ? 'Yes' : 'No' },
                        { label: 'Google Login Enabled', value: userDetailData.profile?.registeredWithGoogle ? 'Yes' : 'No' },
                        { label: 'Level', value: userDetailData.profile?.level },
                        { label: 'Gender', value: userDetailData.profile?.gender },
                        { label: 'Date of Birth', value: userDetailData.profile?.dob },
                        { label: 'Country', value: userDetailData.profile?.country },
                        { label: 'State', value: userDetailData.profile?.state },
                        { label: 'City', value: userDetailData.profile?.city },
                        { label: 'Followers Count', value: userDetailData.profile?.myfollowers },
                        { label: 'Following Count', value: userDetailData.profile?.mefollowing },
                        { label: 'Biography', value: userDetailData.profile?.bio },
                        { label: 'First Login', value: userDetailData.profile?.firstLogin ? 'Yes' : 'No' },
                        { label: 'Live Host Enabled', value: userDetailData.profile?.livehost },
                        { label: 'Owner Code / ID', value: userDetailData.profile?.owner }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-[#121212] border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">{item.label}</span>
                          <span className="text-sm text-gray-200 font-medium break-all">{item.value !== null && item.value !== undefined && item.value !== '' ? String(item.value) : '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recharge History Tab */}
                  {activeTab === 'recharge' && (
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
                      {!userDetailData.rechargeHistory || userDetailData.rechargeHistory.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          No recharge records found for this user.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                                <th className="px-4 py-3">Transaction ID</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Coins</th>
                                <th className="px-4 py-3">Method</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Remarks</th>
                                <th className="px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                              {userDetailData.rechargeHistory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02]">
                                  <td className="px-4 py-3 font-mono text-gray-400">{item.transactionid}</td>
                                  <td className="px-4 py-3 text-white font-semibold">{item.amount ? `₹${item.amount}` : '—'}</td>
                                  <td className="px-4 py-3 text-yellow-400 font-bold">{item.coins ? item.coins.toLocaleString() : 0}</td>
                                  <td className="px-4 py-3 uppercase">{item.paymentmethod || 'N/A'}</td>
                                  <td className="px-4 py-3 text-gray-400">{item.rechargedate ? new Date(item.rechargedate).toLocaleString() : 'N/A'}</td>
                                  <td className="px-4 py-3 max-w-xs truncate text-gray-400" title={item.remarks}>{item.remarks || '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                      }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Superadmin Coin Ledger Tab */}
                  {activeTab === 'ledger' && (
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
                      {!userDetailData.superadminCoinLedger || userDetailData.superadminCoinLedger.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          No superadmin ledger actions logged.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-white/5 border-b border-white/5 text-gray-400">
                                <th className="px-4 py-3">Transaction No</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Ledger Coins</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300">
                              {userDetailData.superadminCoinLedger.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02]">
                                  <td className="px-4 py-3 font-mono text-gray-400">{item.transactionno}</td>
                                  <td className="px-4 py-3 text-gray-400">{item.date ? new Date(item.date).toLocaleString() : 'N/A'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'CREDIT' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                                      }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className={`px-4 py-3 text-right font-bold ${item.status === 'CREDIT' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {item.status === 'CREDIT' ? '+' : '-'}{item.mycoins ? item.mycoins.toLocaleString() : 0}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other Lists / Arrays Tab */}
                  {activeTab === 'other' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Profile Pictures Array', count: userDetailData.profilePic?.length || 0 },
                        { label: 'Live Stream Pics', count: userDetailData.liveStreamPics?.length || 0 },
                        { label: 'Followers List', count: userDetailData.followers?.length || 0 },
                        { label: 'Following List', count: userDetailData.following?.length || 0 },
                        { label: 'Posts Created', count: userDetailData.posts?.length || 0 },
                        { label: 'Linked Devices', count: userDetailData.devices?.length || 0 },
                        { label: 'Bank Accounts', count: userDetailData.bankAccounts?.length || 0 },
                        { label: 'Vip Plans Active', count: userDetailData.vipPlans?.length || 0 },
                        { label: 'Sub Users Registered', count: userDetailData.subUsers?.length || 0 },
                        { label: 'Wallet History Items', count: userDetailData.walletHistory?.length || 0 }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-[#121212] border border-white/5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-300">{item.label}</span>
                          </div>
                          <span className="px-2.5 py-1 bg-white/5 text-xs text-white font-bold rounded-lg">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="flex-1 p-8 text-center text-gray-500">No profile found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsList;
