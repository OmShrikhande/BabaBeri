import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  Send, 
  Shield, 
  Zap, 
  Gift, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Megaphone,
  Radio,
  ExternalLink,
  Clock
} from 'lucide-react';

const LIVE_BACKEND_URLS = [
  import.meta.env.VITE_LIVE_BACKEND_URL,
  import.meta.env.VITE_API_BASE_URL,
  'https://proxstreamapi.in',
  'http://localhost:5000',
].filter(Boolean).map(u => u.replace(/\/+$/, ''));

const CHANNELS = [
  {
    key: 'admin_official',
    name: 'Admin Official',
    badge: '🛡️ Admin',
    desc: 'Official Support, Policy Updates & System Security Alerts',
    color: 'from-amber-500/20 to-amber-700/20 border-amber-500/40 text-amber-400',
    icon: Shield,
  },
  {
    key: 'proxstream_team',
    name: 'ProxStream Team',
    badge: '⚡ Official',
    desc: 'Creator Arena, Live Battles, Tournaments & Community',
    color: 'from-blue-500/20 to-indigo-700/20 border-blue-500/40 text-blue-400',
    icon: Zap,
  },
  {
    key: 'deals_rewards',
    name: 'New Deals & Rewards',
    badge: '🎁 Events',
    desc: 'Promotions, Coin Recharge Bonuses, Diamonds & Creator Perks',
    color: 'from-emerald-500/20 to-teal-700/20 border-emerald-500/40 text-emerald-400',
    icon: Gift,
  },
];

export default function SystemNoticesManager() {
  const [selectedChannel, setSelectedChannel] = useState('admin_official');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionType, setActionType] = useState('none');
  const [actionUrl, setActionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load history from backend
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    for (const url of LIVE_BACKEND_URLS) {
      try {
        const res = await axios.get(`${url}/api/admin/system-channels/messages`, { timeout: 4000 });
        if (res.data?.success && Array.isArray(res.data.messages)) {
          setHistory(res.data.messages);
          setIsLoadingHistory(false);
          return;
        }
      } catch {
        // try next
      }
    }
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setFeedback({ type: 'error', message: 'Please enter announcement message content.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    let sent = false;
    let lastError = null;

    for (const url of LIVE_BACKEND_URLS) {
      try {
        const res = await axios.post(`${url}/api/admin/system-channels/broadcast`, {
          channelKey: selectedChannel,
          title: title.trim(),
          message: message.trim(),
          actionType: actionType === 'none' ? null : actionType,
          actionUrl: actionUrl.trim() || null,
        }, { timeout: 6000 });

        if (res.data?.success) {
          sent = true;
          setFeedback({
            type: 'success',
            message: `Notice successfully broadcasted to ${selectedChannel === 'all' ? 'All Channels' : selectedChannel}! Users will receive real-time updates instantly.`,
          });
          setTitle('');
          setMessage('');
          setActionUrl('');
          fetchHistory();
          break;
        }
      } catch (err) {
        lastError = err?.response?.data?.message || err.message;
      }
    }

    if (!sent) {
      setFeedback({
        type: 'error',
        message: `Failed to broadcast: ${lastError || 'Server unreachable'}. Check backend connection.`,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F72585] to-[#7209B7] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                System Notices & Official Announcements
              </h1>
              <p className="text-sm text-gray-400">
                Broadcast live pinned updates, promotions, and notifications directly into users' inboxes.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={isLoadingHistory}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-700 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
          <span>Refresh Notices</span>
        </button>
      </div>

      {/* Target Channel Cards */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          1. Select Target Channel
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            const isSelected = selectedChannel === ch.key;
            return (
              <div
                key={ch.key}
                onClick={() => setSelectedChannel(ch.key)}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br ' + ch.color + ' ring-2 ring-purple-500 shadow-lg'
                    : 'bg-[#141414] border-gray-800 hover:border-gray-700 hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-900/60 border border-gray-700/50">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base">{ch.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-gray-300 border border-gray-700/50 inline-block mt-0.5 font-mono">
                        {ch.badge}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3 line-clamp-2">{ch.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Option to broadcast to all channels */}
        <div className="mt-3 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setSelectedChannel(selectedChannel === 'all' ? 'admin_official' : 'all')}
            className={`text-xs px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
              selectedChannel === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow'
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcast to ALL 3 Channels Simultaneously</span>
          </button>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="bg-[#141414] rounded-2xl border border-gray-800 p-5 sm:p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Send className="w-5 h-5 text-purple-400" />
          <span>2. Compose & Broadcast Notification</span>
        </h2>

        {feedback && (
          <div
            className={`p-4 rounded-xl mb-5 flex items-start space-x-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            )}
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Notice Title / Headline (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Platform Maintenance / Creator Tournament Kickoff"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Action Type / Deep Link (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="bg-[#1e1e1e] border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="none">No Action</option>
                  <option value="link">External URL</option>
                  <option value="recharge">Open Coin Recharge</option>
                  <option value="events">Open Live Arena</option>
                </select>
                <input
                  type="text"
                  placeholder="https://... or promo link"
                  value={actionUrl}
                  disabled={actionType === 'none'}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="bg-[#1e1e1e] border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Notice Body / Announcement Content *
              </label>
              <span className="text-xs text-gray-500 font-mono">{message.length} chars</span>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Type your official announcement here... (Will immediately appear in the user's pinned chat box with unread badge and Socket.IO notification)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm transition-colors resize-none"
            />
          </div>

          {/* Quick templates */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-gray-500 font-medium mr-1">Quick Templates:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedChannel('admin_official');
                setTitle('Platform Policy & Security Update');
                setMessage('System Notice: We have updated our community guidelines and streamer security policies. Please ensure your account profile is verified.');
              }}
              className="text-xs px-2.5 py-1 rounded bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition"
            >
              🛡️ Security Update
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedChannel('proxstream_team');
                setTitle('Weekend Streamer Tournament');
                setMessage('The Creator Arena is live! Go live this weekend to earn 2x leaderboard points and qualify for weekly diamond bonuses.');
              }}
              className="text-xs px-2.5 py-1 rounded bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition"
            >
              ⚡ Live Battle Tournament
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedChannel('deals_rewards');
                setTitle('Flash 20% Coin Bonus');
                setMessage('Exclusive Deal: Get 20% extra bonus coins on all manual recharges today! Check the coin shop to claim your reward.');
              }}
              className="text-xs px-2.5 py-1 rounded bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition"
            >
              🎁 Coin Promo Deal
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-semibold text-sm shadow-lg shadow-purple-600/30 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Broadcasting Notice...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-white text-base">Recent Broadcasts & Sent Notices</h3>
          </div>
          <span className="text-xs text-gray-400 bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-700">
            {history.length} notices sent
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1a1a1a] text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Channel</th>
                <th className="px-5 py-3.5 font-semibold">Title / Headline</th>
                <th className="px-5 py-3.5 font-semibold">Notice Message</th>
                <th className="px-5 py-3.5 font-semibold">Sent At</th>
                <th className="px-5 py-3.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No broadcasts found or server is connecting. Click "Refresh Notices" to sync.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-950/60 border border-purple-500/30 text-purple-300">
                          {row.channelTitle || row.channelKey}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-white max-w-xs truncate">
                      {row.title || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-300 max-w-md line-clamp-2">
                      {row.messageText}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {row.formattedTime || new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
                        ● Live Broadcast
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
