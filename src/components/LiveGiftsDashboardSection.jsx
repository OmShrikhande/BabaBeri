import React, { useEffect, useState } from 'react';
import { Activity, Gift, Eye, RefreshCw, Users, Diamond } from 'lucide-react';
import liveService from '../services/services';

const parseList = (data, keys = ['sessions', 'data', 'transactions', 'items']) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
};

const formatCell = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
};

const LiveGiftsDashboardSection = () => {
  const [liveSessions, setLiveSessions] = useState([]);
  const [giftTransactions, setGiftTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, transactionsRes] = await Promise.all([
        liveService.getAdminLiveSessions({ status: 'active' }),
        liveService.getAdminGiftTransactions({ page: 1, limit: 10 }),
      ]);

      if (sessionsRes.success) {
        setLiveSessions(parseList(sessionsRes.data, ['sessions', 'data']));
      } else {
        setLiveSessions([]);
      }

      if (transactionsRes.success) {
        setGiftTransactions(parseList(transactionsRes.data, ['transactions', 'data', 'items']));
      } else {
        setGiftTransactions([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load live and gift data');
      setLiveSessions([]);
      setGiftTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="mb-8" aria-labelledby="live-gifts-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 id="live-gifts-heading" className="text-2xl font-bold text-white">Live & Gifts Activity</h2>
          <p className="text-gray-400 mt-1">Active sessions and recent gift transactions from live APIs</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#F72585] hover:bg-[#d91a6f] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Live Sessions */}
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800">
            <Activity className="w-5 h-5 text-[#F72585]" />
            <h3 className="text-white font-semibold">Active Live Sessions</h3>
            <span className="ml-auto text-xs text-gray-400">{liveSessions.length} active</span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading sessions...</div>
            ) : liveSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Eye className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No active live sessions</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-800">
                    <th className="px-5 py-3">Host</th>
                    <th className="px-5 py-3">Room</th>
                    <th className="px-5 py-3">Viewers</th>
                    <th className="px-5 py-3">Diamonds</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {liveSessions.slice(0, 8).map((session, i) => (
                    <tr key={session.session_id || session.sessionId || session.id || i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-5 py-3 text-white font-medium">
                        {formatCell(session.host_name || session.hostName || session.host_id || session.username)}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {formatCell(session.room_name || session.roomName || session.stream_title)}
                      </td>
                      <td className="px-5 py-3 text-blue-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatCell(session.viewer_count ?? session.viewerCount ?? session.viewers)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-purple-400">
                        <span className="flex items-center gap-1">
                          <Diamond className="w-3 h-3" />
                          {formatCell(session.diamond_count ?? session.diamondCount ?? session.diamonds)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-900/30 text-green-400 border border-green-800/50">
                          {formatCell(session.status || 'active')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Gift Transactions */}
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800">
            <Gift className="w-5 h-5 text-[#7209B7]" />
            <h3 className="text-white font-semibold">Recent Gift Transactions</h3>
            <span className="ml-auto text-xs text-gray-400">{giftTransactions.length} shown</span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading transactions...</div>
            ) : giftTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Gift className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No gift transactions found</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-800">
                    <th className="px-5 py-3">Sender</th>
                    <th className="px-5 py-3">Receiver</th>
                    <th className="px-5 py-3">Gift</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {giftTransactions.slice(0, 8).map((tx, i) => (
                    <tr key={tx.id || tx.transaction_id || i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-5 py-3 text-white">
                        {formatCell(tx.sender_id || tx.senderId || tx.sender_name)}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {formatCell(tx.receiver_id || tx.receiverId || tx.receiver_name)}
                      </td>
                      <td className="px-5 py-3 text-[#F72585]">
                        {formatCell(tx.gift_name || tx.giftName || tx.gift_id || tx.giftId)}
                      </td>
                      <td className="px-5 py-3 text-gray-300">
                        {formatCell(tx.quantity ?? tx.qty)}
                      </td>
                      <td className="px-5 py-3 text-yellow-400">
                        {formatCell(tx.total_value ?? tx.totalValue ?? tx.coins ?? tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveGiftsDashboardSection;
