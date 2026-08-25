import React, { useState } from 'react';

const BAN_DURATIONS = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: 'permanent', label: 'Permanent' },
];

const BanDialog = ({ open, user, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('24h');

  if (!open || !user) return null;

  const userCode = user.code || user.usercode || user.userCode || user.UserCode || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onConfirm({ reason: reason.trim(), duration });
    setReason('');
    setDuration('24h');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#121212] border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-white text-xl font-bold mb-2">Ban User</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to ban{' '}
          <span className="text-white font-semibold">{user.name || user.username}</span>
          {userCode ? ` (${userCode})` : ''}?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Reason for Ban
            </label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a clear reason..."
              className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full h-24 resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Ban Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full text-sm"
            >
              {BAN_DURATIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800/60">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-4 py-2.5 rounded-lg bg-red-900/20 text-red-400 border border-red-800 hover:bg-red-900/40 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ban User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BanDialog;
