import React, { useEffect, useMemo, useState, useDeferredValue } from 'react';
import { Search, Filter, RefreshCw, Users, Shield, Crown, Sparkles, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import authService from '../services/authService';

// Advanced Host Details page with animated, theme-matching UI
const HostDetails = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const deferredSearch = useDeferredValue(search);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getAllHosts();
      if (!res?.success) throw new Error(res?.error || 'Failed to load hosts');

      const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      // Map unknown API shape into UI-friendly structure
      const mapped = (raw || []).map((h, idx) => {
        const id = h?.id ?? h?._id ?? h?.usercode ?? h?.code ?? `host-${idx}`;
        const username = h?.username || h?.name || h?.usercode || `Host ${idx + 1}`;
        const avatar = h?.avatar || h?.dp || h?.profilePic || h?.photo || '/image.png';
        const status = (h?.status || h?.accountStatus || 'active').toString().toLowerCase();
        const createdAt = h?.createdAt || h?.joinDate || h?.joinedOn || null;
        const agency = h?.agency || h?.agencyName || h?.masterAgency || h?.parent || '—';
        return { id: String(id), username: String(username), avatar, status, createdAt, agency, _raw: h };
      });
      setHosts(mapped);
    } catch (e) {
      setError(e?.message || 'Failed to load hosts');
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtering & search
  const filtered = useMemo(() => {
    const q = (deferredSearch || '').toString().toLowerCase();
    return hosts.filter(h => {
      const matchesQuery = !q || h.username.toLowerCase().includes(q) || h.id.toLowerCase().includes(q) || (h.agency || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (h.status || 'active') === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [hosts, deferredSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  useEffect(() => {
    // Reset to page 1 on filters/search change
    setPage(1);
  }, [deferredSearch, statusFilter, pageSize]);

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800 bg-[#121212]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text">Host Details</h1>
            <p className="text-gray-400 text-sm">Explore and manage all hosts with rich animations and smooth interactions</p>
          </div>
          <button onClick={load} className="px-3 py-2 rounded-lg bg-[#0f0f0f] border border-gray-800 text-gray-200 hover:bg-white/5 button-hover"
            aria-label="Reload">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800 bg-[#121212]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]/40 focus:border-[#7209B7]/60"
              placeholder="Search by username, ID, or agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                className="bg-[#0f0f0f] border border-gray-800 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-200 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Status filter"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <select
              className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Items per page"
            >
              {[12, 24, 48, 96].map((n) => (
                <option key={n} value={n}>{n}/page</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>{filtered.length.toLocaleString()} hosts</span>
          <span>Page {safePage} of {totalPages}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 scroll-container enhanced-scrollbar">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 glow-pink hover-glow card-hover">
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Users className="w-4 h-4 text-[#4CC9F0]" /> Total Hosts</div>
            <div className="text-2xl font-extrabold mt-1">{hosts.length.toLocaleString()}</div>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 glow-purple hover-glow card-hover">
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Shield className="w-4 h-4 text-[#4361EE]" /> Active</div>
            <div className="text-2xl font-extrabold mt-1">{hosts.filter(h => (h.status||'').includes('active')).length.toLocaleString()}</div>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 glow-blue hover-glow card-hover">
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Crown className="w-4 h-4 text-[#F72585]" /> Inactive</div>
            <div className="text-2xl font-extrabold mt-1">{hosts.filter(h => (h.status||'') === 'inactive').length.toLocaleString()}</div>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 glow-cyan hover-glow card-hover">
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Sparkles className="w-4 h-4 text-[#9d4edd]" /> Blocked</div>
            <div className="text-2xl font-extrabold mt-1">{hosts.filter(h => (h.status||'') === 'blocked').length.toLocaleString()}</div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#121212] border border-gray-800 rounded-xl p-4 shimmer" style={{ height: 160 }} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 rounded-lg p-4 mb-4">
            {error}
          </div>
        )}

        {/* Grid of host cards */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {visible.map((h, idx) => (
              <div
                key={h.id}
                className="bg-[#121212] border border-gray-800 rounded-xl p-4 card-hover request-card-enter request-card-enter-active"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <img src={h.avatar} alt={h.username} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate text-white">{h.username}</div>
                    <div className="text-[11px] text-gray-400 truncate">ID: {h.id}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-2 py-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-2 py-1 flex items-center gap-2">
                    <Shield className="w-3 h-3 text-gray-400" />
                    <span className={`truncate ${h.status === 'blocked' ? 'text-red-400' : h.status === 'inactive' ? 'text-yellow-300' : 'text-green-400'}`}>{h.status || 'active'}</span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-gray-400 truncate">Agency: {h.agency || '—'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && visible.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            No hosts found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-[#121212] flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Showing {Math.min(filtered.length, start + 1)} - {Math.min(filtered.length, start + visible.length)} of {filtered.length.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-lg text-sm bg-[#0f0f0f] border border-gray-800 text-gray-300 disabled:opacity-40 hover:bg-white/5"
            disabled={safePage <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="px-3 py-1.5 rounded-lg text-sm bg-[#0f0f0f] border border-gray-800 text-gray-300 disabled:opacity-40 hover:bg-white/5"
            disabled={safePage >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostDetails;