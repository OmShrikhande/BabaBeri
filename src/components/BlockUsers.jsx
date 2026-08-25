import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  UserX,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Smartphone,
  X,
} from 'lucide-react';
import authService from '../services/authService';

const BAN_DURATIONS = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: 'permanent', label: 'Permanent' },
];

const getRoleBadgeClass = (role) => {
  const r = (role || '').toLowerCase();
  if (r.includes('host')) return 'bg-pink-900/30 text-pink-400 border border-pink-800/50';
  if (r.includes('master')) return 'bg-blue-900/30 text-blue-400 border border-blue-800/50';
  if (r.includes('agency')) return 'bg-purple-900/30 text-purple-400 border border-purple-800/50';
  if (r.includes('admin')) return 'bg-gray-700/60 text-gray-300 border border-gray-600/50';
  return 'bg-gray-800 text-gray-400 border border-gray-700';
};

const getRoleInitialColor = (role) => {
  const r = (role || '').toLowerCase();
  if (r.includes('host')) return 'from-[#F72585] to-[#7209B7]';
  if (r.includes('master')) return 'from-[#4361EE] to-[#4CC9F0]';
  if (r.includes('agency')) return 'from-[#7209B7] to-[#4361EE]';
  return 'from-gray-600 to-gray-500';
};

const formatMinutesLeft = (minutes) => {
  if (minutes == null || Number.isNaN(Number(minutes))) return '—';
  const mins = Math.max(0, Number(minutes));
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) return rem ? `${hours}h ${rem}m left` : `${hours}h left`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours ? `${days}d ${remHours}h left` : `${days}d left`;
};

const ToastNotif = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm flex items-center gap-3 shadow-2xl">
      {toast.type === 'success' ? (
        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
      )}
      <span>{toast.message}</span>
    </div>
  );
};

const BanDeviceModal = ({ open, onClose, onSubmit, submitting }) => {
  const [deviceId, setDeviceId] = useState('');
  const [duration, setDuration] = useState('24h');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      setDeviceId('');
      setDuration('24h');
      setReason('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deviceId.trim() || !reason.trim()) return;
    onSubmit({
      deviceId: deviceId.trim(),
      duration,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-[#121212] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-900/30 border border-red-800/50 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold">Ban Device</h3>
              <p className="text-gray-500 text-xs">Block by device ID (super admin)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Device ID *
            </label>
            <input
              required
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="e.g. abc-123-xyz"
              disabled={submitting}
              className="bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full text-sm font-mono disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Duration *
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={submitting}
              className="bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full text-sm disabled:opacity-50"
            >
              {BAN_DURATIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-gray-600 text-xs mt-1.5">
              24h = 24 hours · 7d = 7 days · permanent = forever
            </p>
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Reason *
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. multi account"
              disabled={submitting}
              className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full h-24 resize-none text-sm disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !deviceId.trim() || !reason.trim()}
              className="px-4 py-2.5 rounded-lg bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Banning…' : 'Ban Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BlockUsers = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, permanent: 0, timed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [banDeviceOpen, setBanDeviceOpen] = useState(false);
  const [banDeviceSubmitting, setBanDeviceSubmitting] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getBlockedUsers();
      if (!res.success) {
        throw new Error(res.error || 'Failed to load blocked users');
      }

      setUsers(Array.isArray(res.data) ? res.data : []);
      setMeta({
        total: res.meta?.total ?? (Array.isArray(res.data) ? res.data.length : 0),
        permanent: res.meta?.permanent ?? 0,
        timed: res.meta?.timed ?? 0,
      });
    } catch (e) {
      setError(e.message || 'Failed to load blocked users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((u) =>
      (u.name || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term) ||
      (u.usercode || u.code || '').toLowerCase().includes(term) ||
      (u.deviceId || u.deviceid || '').toLowerCase().includes(term) ||
      (u.reason || '').toLowerCase().includes(term) ||
      (u.country || '').toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleUnban = async (user) => {
    const code = user.usercode || user.code || user.userCode;
    if (!code) {
      showToast('User code is missing. Cannot unban.', 'error');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [code]: true }));
    try {
      const res = await authService.unblockUser(code);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => (u.usercode || u.code) !== code));
        setMeta((prev) => ({
          ...prev,
          total: Math.max(0, (prev.total || 1) - 1),
          permanent: user.permanent
            ? Math.max(0, (prev.permanent || 1) - 1)
            : prev.permanent,
          timed: !user.permanent
            ? Math.max(0, (prev.timed || 1) - 1)
            : prev.timed,
        }));
        showToast(`${user.name || user.username || code} has been unbanned.`);
      } else {
        showToast(res.error || 'Failed to unban user.', 'error');
      }
    } catch {
      showToast('Failed to unban user.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [code]: false }));
    }
  };

  const handleBanDevice = async ({ deviceId, duration, reason }) => {
    setBanDeviceSubmitting(true);
    try {
      const res = await authService.blockDevice(deviceId, duration, reason);
      if (res.success) {
        showToast(`Device ${deviceId} banned (${duration}).`);
        setBanDeviceOpen(false);
        await fetchUsers();
      } else {
        showToast(res.error || 'Failed to ban device.', 'error');
      }
    } catch {
      showToast('Failed to ban device.', 'error');
    } finally {
      setBanDeviceSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-black/70 w-full min-h-full p-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">Banned Users</h1>
          <button
            onClick={() => setBanDeviceOpen(true)}
            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 rounded-lg px-4 py-2 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <Smartphone className="w-4 h-4" /> Ban Device
          </button>
        </div>
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
        <BanDeviceModal
          open={banDeviceOpen}
          onClose={() => !banDeviceSubmitting && setBanDeviceOpen(false)}
          onSubmit={handleBanDevice}
          submitting={banDeviceSubmitting}
        />
        <ToastNotif toast={toast} onDismiss={() => setToast(null)} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-black/70 w-full min-h-full p-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">Banned Users</h1>
          <button
            onClick={() => setBanDeviceOpen(true)}
            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 rounded-lg px-4 py-2 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <Smartphone className="w-4 h-4" /> Ban Device
          </button>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
          <button
            onClick={fetchUsers}
            className="text-red-400 hover:text-red-300 text-sm border border-red-800 px-3 py-1 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
        <BanDeviceModal
          open={banDeviceOpen}
          onClose={() => !banDeviceSubmitting && setBanDeviceOpen(false)}
          onSubmit={handleBanDevice}
          submitting={banDeviceSubmitting}
        />
        <ToastNotif toast={toast} onDismiss={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black/70 w-full min-h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Banned Users</h1>
            <p className="text-gray-400 text-sm mt-1">
              {meta.total} blocked · {meta.timed} timed · {meta.permanent} permanent
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBanDeviceOpen(true)}
              className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 rounded-lg px-4 py-2 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Smartphone className="w-4 h-4" /> Ban Device
            </button>
            <button
              onClick={fetchUsers}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-2 transition-all border border-gray-700 flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-[#121212] border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Total</p>
            <p className="text-white text-xl font-semibold mt-1">{meta.total}</p>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Timed</p>
            <p className="text-yellow-400 text-xl font-semibold mt-1">{meta.timed}</p>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-gray-500 text-xs uppercase tracking-wide">Permanent</p>
            <p className="text-red-400 text-xl font-semibold mt-1">{meta.permanent}</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="bg-[#0A0A0A] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full sm:w-80"
            placeholder="Search by name, code, device, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <UserX className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No banned users found</p>
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
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Duration</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Reason</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Blocked By</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const code = user.usercode || user.code || '';
                    const isBusy = !!actionLoading[code];
                    const initial = (user.name || user.username || '?').charAt(0).toUpperCase();
                    const durationLabel = user.permanent
                      ? 'Permanent'
                      : (user.durationText || formatMinutesLeft(user.minutesLeft));

                    return (
                      <tr
                        key={user.blockId || code || user.deviceId}
                        className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.profilepic ? (
                              <img
                                src={user.profilepic}
                                alt={user.name || code}
                                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div
                                className={`w-9 h-9 rounded-full bg-gradient-to-br ${getRoleInitialColor(user.role)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                              >
                                {initial}
                              </div>
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">{user.name || '—'}</p>
                              <p className="text-gray-500 text-xs">
                                @{user.username || '—'}
                                {user.country ? ` · ${user.country}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                            {code || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                            {(user.role || 'HOST').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                user.permanent
                                  ? 'bg-red-900/40 text-red-400 border-red-800/50'
                                  : 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50'
                              }`}
                            >
                              {durationLabel}
                            </span>
                            {!user.permanent && user.blockedUntilText && (
                              <p className="text-gray-500 text-xs mt-1">Until {user.blockedUntilText}</p>
                            )}
                            {!user.permanent && user.minutesLeft != null && (
                              <p className="text-gray-600 text-xs">{formatMinutesLeft(user.minutesLeft)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-300 text-sm max-w-[180px] truncate" title={user.reason || ''}>
                            {user.reason || '—'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-gray-400">{user.blockedBy || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUnban(user)}
                            disabled={isBusy || !code}
                            className="text-green-400 hover:text-green-300 border border-green-800 bg-green-900/20 hover:bg-green-900/40 rounded-lg px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {isBusy ? 'Unbanning...' : 'Unban'}
                          </button>
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

      <BanDeviceModal
        open={banDeviceOpen}
        onClose={() => !banDeviceSubmitting && setBanDeviceOpen(false)}
        onSubmit={handleBanDevice}
        submitting={banDeviceSubmitting}
      />

      <ToastNotif toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default BlockUsers;
