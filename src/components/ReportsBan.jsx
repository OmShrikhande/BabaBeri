import React, { useState, useEffect } from 'react';
import { Search, Flag, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import services from '../services/services';
import authService from '../services/authService';
import ConfirmDialog from './RoleStages/ConfirmDialog';

const ITEMS_PER_PAGE = 20;

const ReportsBan = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await services.getAllUsers();

        if (ignore) return;

        if (response.success) {
          const usersList = Array.isArray(response.data) ? response.data : [];
          setUsers(usersList);
          setFilteredUsers(usersList);
        } else {
          throw new Error(response.error || 'Failed to fetch users');
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching users:', err);
          setError(err.message || 'Failed to load users');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.username?.toLowerCase().includes(term) ||
          user.code?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role?.toUpperCase() === roleFilter.toUpperCase());
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = (user, newStatus) => {
    setConfirmDialog({
      user,
      newStatus,
      title: 'Change Status',
      message: `Change status to ${newStatus} for ${user.name || user.username}?`
    });
  };

  const handleBanClick = (user) => {
    setConfirmDialog({
      user,
      newStatus: 'ban',
      title: 'Ban User',
      message: `Are you sure you want to ban ${user.name || user.username}? This action can be reversed later.`
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmDialog) return;

    const { user, newStatus } = confirmDialog;

    try {
      const response = await authService.makeAuthenticatedRequest(
        `https://proxstream.online/auth/api/updatestatus?usercode=${user.code}&status=${newStatus.toUpperCase()}`,
        { method: 'PUT' }
      );

      if (response.ok) {
        // Update local state optimistically
        setUsers((prev) =>
          prev.map((u) => (u.code === user.code ? { ...u, status: newStatus } : u))
        );
        showToast(`Status updated to ${newStatus} successfully`, 'success');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setConfirmDialog(null);
    }
  };

  const getRoleColor = (role) => {
    const r = role?.toUpperCase();
    if (r === 'HOST') return 'from-[#F72585] to-[#ff4db8]';
    if (r === 'AGENCY') return 'from-[#7209B7] to-[#9d4edd]';
    if (r === 'MASTER_AGENCY' || r === 'MASTER-AGENCY') return 'from-[#4361EE] to-[#7209B7]';
    return 'from-gray-600 to-gray-700';
  };

  const getRoleBadgeColor = (role) => {
    const r = role?.toUpperCase();
    if (r === 'HOST') return 'bg-pink-900/30 text-pink-400 border-pink-800/50';
    if (r === 'AGENCY') return 'bg-purple-900/30 text-purple-400 border-purple-800/50';
    if (r === 'MASTER_AGENCY' || r === 'MASTER-AGENCY') return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
    return 'bg-gray-900/30 text-gray-400 border-gray-800/50';
  };

  const getStatusBadgeColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'bg-green-900/30 text-green-400 border-green-800/50';
    if (s === 'pending') return 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50';
    if (s === 'deactivate') return 'bg-gray-900/30 text-gray-400 border-gray-800/50';
    if (s === 'ban') return 'bg-red-900/30 text-red-400 border-red-800/50';
    return 'bg-gray-900/30 text-gray-400 border-gray-800/50';
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || '?';
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="flex-1 overflow-y-auto bg-[#1A1A1A]">
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Reports / Ban Requests</h1>
          <p className="text-gray-400 text-sm mt-1">Manage user statuses and ban requests</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-red-400">⚠</div>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="text-red-400 hover:text-red-300 text-sm border border-red-800 px-3 py-1 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0A0A0A] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full"
              placeholder="Search by name or code..."
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
          >
            <option value="all">All Roles</option>
            <option value="HOST">HOST</option>
            <option value="AGENCY">AGENCY</option>
            <option value="MASTER_AGENCY">MASTER_AGENCY</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="deactivate">Deactivate</option>
            <option value="ban">Ban</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-[#1A1A1A] rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-700 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <Flag className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No users found</p>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">User</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Code</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Role</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.id || user.code} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRoleColor(user.role)} flex items-center justify-center text-white font-semibold`}>
                              {getInitial(user.name || user.username)}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name || user.username}</p>
                              <p className="text-gray-400 text-xs">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-800 text-gray-300">
                            {user.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                            {user.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.status)}`}>
                            {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={user.status || 'active'}
                              onChange={(e) => handleStatusChange(user, e.target.value)}
                              className="bg-[#0A0A0A] border border-gray-800 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
                            >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="deactivate">Deactivate</option>
                              <option value="ban">Ban</option>
                            </select>
                            {user.status?.toLowerCase() !== 'ban' && (
                              <button
                                onClick={() => handleBanClick(user)}
                                className="bg-red-900/20 text-red-400 border border-red-800 rounded-lg px-3 py-1 text-sm hover:bg-red-900/40 transition-colors"
                              >
                                Ban
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
                  <p className="text-gray-400 text-sm">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition-all border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <span className="text-white text-sm px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition-all border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmDialog(null)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm flex items-center gap-3 shadow-2xl">
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ReportsBan;
