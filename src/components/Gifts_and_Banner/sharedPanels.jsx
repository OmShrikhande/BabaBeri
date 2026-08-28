import React, { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, Users } from 'lucide-react';
import authService from '../../services/services';

export const ApiResponsePanel = ({ title, data, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  if (data == null) return null;

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-[#1A1A1A] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <pre className="px-6 pb-6 text-xs text-emerald-300/90 overflow-x-auto max-h-96 whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export const CoinSellersPanel = ({ onLoaded }) => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');

  const fetchSellers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authService.getCoinSellers(status);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        setSellers(list);
        onLoaded?.(list);
      } else {
        throw new Error(res.error || 'Failed to load coin sellers');
      }
    } catch (err) {
      setError(err.message || 'Failed to load coin sellers');
      setSellers([]);
      onLoaded?.(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 sm:mt-8 rounded-2xl border border-white/10 bg-[#1A1A1A] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-[#4CC9F0]" />
          <div>
            <h2 className="text-lg font-black text-white">Coin Sellers</h2>
            <p className="text-gray-500 text-xs">GET /auth/user/coin-sellers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="all">all</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <button
            type="button"
            onClick={fetchSellers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4361EE] text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Load
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {sellers.length === 0 && !loading && !error && (
        <p className="text-gray-500 text-sm">Click Load to fetch coin sellers.</p>
      )}

      {sellers.length > 0 && (
        <div className="overflow-x-auto responsive-table-scroll">
          <p className="scroll-table-hint lg:hidden">Swipe to see more →</p>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-gray-500 text-center border-b border-white/5">
                <th className="py-3 px-4 font-medium whitespace-nowrap">User</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Code</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Coins Available</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Total Sold</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Sales</th>
                <th className="py-3 px-4 font-medium whitespace-nowrap">Active</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((row, i) => (
                <tr key={row.user?.usercode || i} className="border-b border-white/5 text-gray-300 text-center">
                  <td className="py-3 px-4">{row.user?.name || row.user?.username || '—'}</td>
                  <td className="py-3 px-4 font-mono text-[#F72585]">{row.user?.usercode || '—'}</td>
                  <td className="py-3 px-4">{Number(row.coinsAvailable || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">{Number(row.totalCoinsSold || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">{row.salesCount ?? '—'}</td>
                  <td className="py-3 px-4">{row.sellerActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
