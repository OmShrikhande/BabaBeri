import React, { useState, useEffect, useMemo } from 'react';
import { Search, Ban, UserX, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import authService from '../services/authService';
import services from '../services/services';

const getRoleBadgeClass = (role) => {
  const r = (role || '').toLowerCase();
  if (r.includes('host')) return 'bg-pink-900/30 text-pink-400 border border-pink-800/50';
  if (r.includes('master')) return 'bg-blue-900/30 text-blue-400 border border-blue-800/50';
  if (r.includes('agency')) return 'bg-purple-900/30 text-purple-400 border border-purple-800/50';
  if (r.includes('admin')) return 'bg-gray-700/60 text-gray-300 border border-gray-600/50';
  return 'bg-gray-800 text-gray-400 border border-gray-700';
};

const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'bg-green-900/30 text-green-400 border border-green-800/50';
  if (s === 'pending') return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50';
  if (s === 'ban') return 'bg-red-900/40 text-red-400 border border-red-800/50';
  return 'bg-gray-800/60 text-gray-400 border border-gray-700';
};

const getRoleInitialColor = (role) => {
  const r = (role || '').toLowerCase();
  if (r.includes('host')) return 'from-[#F72585] to-[#7209B7]';
  if (r.includes('master')) return 'from-[#4361EE] to-[#4CC9F0]';
  if (r.includes('agency')) return 'from-[#7209B7] to-[#4361EE]';
  return 'from-gray-600 to-gray-500';
};

const ToastNotif = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm flex items-center gap-3 shadow-2xl">
      {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
      <span>{toast.message}</span>
    </div>
  );
};

const BlockUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusActionLoading, setStatusActionLoading] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await services.getAllUsers();
      if (res.success) {
        setUsers(Array.isArray(res.data) ? res.data : []);
      } else {
        throw new Error(res.error || 'Failed to load users');
      }
    } catch (e) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return users;
    return users.filter(u =>
      (u.username || '').toLowerCase().includes(term) ||
      (u.code || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleBlock = async (user) => {
    const code = user.code || user.userCode;
    if (!code) return;
    setStatusActionLoading(p => ({ ...p, [code]: true }));
    try {
      const res = await authService.updateUserStatus(code, 'Ban');
      if (res.success) {
        setUsers(prev => prev.map(u => (u.code === code || u.userCode === code) ? { ...u, status: 'Ban' } : u));
        showToast(`${user.username || code} has been banned.`);
      } else { showToast(res.error || 'Failed to ban user.', 'error'); }
    } catch { showToast('Failed to ban user.', 'error'); }
    finally { setStatusActionLoading(p => ({ ...p, [code]: false })); }
  };

  const handleUnblock = async (user) => {
    const code = user.code || user.userCode;
    if (!code) return;
    setStatusActionLoading(p => ({ ...p, [code]: true }));
    try {
      const res = await authService.updateUserStatus(code, 'Active');
      if (res.success) {
        setUsers(prev => prev.map(u => (u.code === code || u.userCode === code) ? { ...u, status: 'Active' } : u));
        showToast(`${user.username || code} has been unblocked.`);
      } else { showToast(res.error || 'Failed to unblock user.', 'error'); }
    } catch { showToast('Failed to unblock user.', 'error'); }
    finally { setStatusActionLoading(p => ({ ...p, [code]: false })); }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1A1A1A] p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Block Users</h1>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#121212] rounded-xl border border-gray-800 p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1A1A1A] p-6">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
          <button onClick={fetchUsers} className="text-red-400 hover:text-red-300 text-sm border border-red-800 px-3 py-1 rounded-lg flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1A1A1A]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Block Users</h1>
            <p className="text-gray-400 text-sm mt-1">{filteredUsers.length} users found</p>
          </div>
          <button onClick={fetchUsers} className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-2 transition-all border border-gray-700 flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="bg-[#0A0A0A] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full sm:w-80"
            placeholder="Search by name, code or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <UserX className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No users found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
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
                  {filteredUsers.map((user) => {
                    const code = user.code || user.userCode || user.id;
                    const isBanned = (user.status || '').toLowerCase() === 'ban';
                    const isLoading = statusActionLoading[code];
                    const initial = (user.username || user.name || '?')[0].toUpperCase();
                    return (
                      <tr key={code || user.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getRoleInitialColor(user.role || user.type)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                              {initial}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{user.username || user.name || '—'}</p>
                              <p className="text-gray-500 text-xs">{user.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{code || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role || user.type)}`}>
                            {(user.role || user.type || 'Unknown').replace('ROLE_', '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(user.status)}`}>
                            {user.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {isBanned ? (
                            <button onClick={() => handleUnblock(user)} disabled={isLoading}
                              className="text-green-400 hover:text-green-300 border border-green-800 bg-green-900/20 hover:bg-green-900/40 rounded-lg px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {isLoading ? 'Unblocking...' : 'Unblock'}
                            </button>
                          ) : (
                            <button onClick={() => handleBlock(user)} disabled={isLoading}
                              className="text-red-400 hover:text-red-300 border border-red-800 bg-red-900/20 hover:bg-red-900/40 rounded-lg px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50">
                              <Ban className="w-3.5 h-3.5" />
                              {isLoading ? 'Blocking...' : 'Block'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <ToastNotif toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default BlockUsers;
