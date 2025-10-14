import React, { useEffect, useMemo, useState, useDeferredValue } from 'react';
import { Search, Filter, RefreshCw, Users, Shield, Crown, Sparkles, Calendar, ChevronLeft, ChevronRight, X, BadgeCheck, MapPin, Mail, Phone } from 'lucide-react';
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
  const [selected, setSelected] = useState(null);

  // Counts state
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [blocked, setBlocked] = useState(0);

  const deferredSearch = useDeferredValue(search);

  const loadCounts = async () => {
    try {
      const allRes = await authService.getAllHosts();
      if (allRes.success) {
        const raw = Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data || []);
        const mapped = (raw || []).map((h, idx) => {
          const id = h?.id ?? h?._id ?? h?.usercode ?? h?.code ?? `host-${idx}`;
          const username = h?.username || h?.name || h?.usercode || `Host ${idx + 1}`;
          const avatar = h?.avatar || h?.path || h?.dp || h?.profilePic || h?.photo || '';
          const status = (h?.status || h?.accountStatus || 'active').toString().toLowerCase();
          const createdAt = h?.createdAt || h?.joinDate || h?.joinedOn || null;
          const agency = h?.agency || h?.agencyName || h?.masterAgency || h?.parent || '—';
          const email = h?.email || h?.mail || '';
          const phone = h?.phone || h?.mobile || h?.contact || '';
          const region = h?.region || h?.country || h?.location || '';
          return { id: String(id), username: String(username), avatar, status, createdAt, agency, email, phone, region, _raw: h };
        });
        setTotal(mapped.length);
      }

      const activeRes = await authService.getActiveHosts();
      setActive(activeRes.success ? (Array.isArray(activeRes.data) ? activeRes.data.length : (activeRes.data?.data?.length || 0)) : 0);

      const inactiveRes = await authService.getInactiveHosts();
      setInactive(inactiveRes.success ? (Array.isArray(inactiveRes.data) ? inactiveRes.data.length : (inactiveRes.data?.data?.length || 0)) : 0);

      const blockedRes = await authService.getBlockedHosts();
      setBlocked(blockedRes.success ? (Array.isArray(blockedRes.data) ? blockedRes.data.length : (blockedRes.data?.data?.length || 0)) : 0);
    } catch (e) {
      console.error('Failed to load counts:', e);
    }
  };

  const loadDisplay = async (status) => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (status === 'all') res = await authService.getAllHosts();
      else if (status === 'active') res = await authService.getActiveHosts();
      else if (status === 'inactive') res = await authService.getInactiveHosts();
      else if (status === 'blocked') res = await authService.getBlockedHosts();

      if (!res?.success) throw new Error(res?.error || 'Failed to load hosts');

      const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      // Map unknown API shape into UI-friendly structure
      const mapped = (raw || []).map((h, idx) => {
        const id = h?.id ?? h?._id ?? h?.usercode ?? h?.code ?? `host-${idx}`;
        const username = h?.username || h?.name || h?.usercode || `Host ${idx + 1}`;
        const avatar = h?.avatar || h?.path || h?.dp || h?.profilePic || h?.photo || '';
        const status = (h?.status || h?.accountStatus || 'active').toString().toLowerCase();
        const createdAt = h?.createdAt || h?.joinDate || h?.joinedOn || null;
        const agency = h?.agency || h?.agencyName || h?.masterAgency || h?.parent || '—';
        const email = h?.email || h?.mail || '';
        const phone = h?.phone || h?.mobile || h?.contact || '';
        const region = h?.region || h?.country || h?.location || '';
        return { id: String(id), username: String(username), avatar, status, createdAt, agency, email, phone, region, _raw: h };
      });
      setHosts(mapped);
    } catch (e) {
      setError(e?.message || 'Failed to load hosts');
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCounts(); loadDisplay('all'); }, []);

  // Filtering & search
  const filtered = useMemo(() => {
    const q = (deferredSearch || '').toString().toLowerCase();
    return hosts.filter(h => {
      const matchesQuery = !q || h.username.toLowerCase().includes(q) || h.id.toLowerCase().includes(q) || (h.agency || '').toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [hosts, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  useEffect(() => {
    // Reset to page 1 on filters/search change
    setPage(1);
  }, [deferredSearch, statusFilter, pageSize]);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800 bg-[#121212]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text">Host Details</h1>
            <p className="text-gray-400 text-sm">Explore and manage all hosts with rich animations and smooth interactions</p>
          </div>
          <button onClick={() => { loadCounts(); loadDisplay(statusFilter); }} className="px-3 py-2 rounded-lg bg-[#0f0f0f] border border-gray-800 text-gray-200 hover:bg-white/5 button-hover"
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
                onChange={(e) => {
                  const value = e.target.value;
                  setStatusFilter(value);
                  loadDisplay(value);
                }}
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
            <div className="text-2xl font-extrabold mt-1">{total.toLocaleString()}</div>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 glow-purple hover-glow card-hover">
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Shield className="w-4 h-4 text-[#4361EE]" /> Active</div>
            <div className="text-2xl font-extrabold mt-1">{active.toLocaleString()}</div>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 glow-blue hover-glow card-hover">
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Crown className="w-4 h-4 text-[#F72585]" /> Inactive</div>
            <div className="text-2xl font-extrabold mt-1">{inactive.toLocaleString()}</div>
          </div>
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-4 glow-cyan hover-glow card-hover">
            <div className="flex items-center gap-2 text-gray-300 text-sm"><Sparkles className="w-4 h-4 text-[#9d4edd]" /> Blocked</div>
            <div className="text-2xl font-extrabold mt-1">{blocked.toLocaleString()}</div>
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
              <button
                key={h.id}
                className="text-left bg-[#121212] border border-gray-800 rounded-xl p-4 card-hover request-card-enter request-card-enter-active w-full"
                style={{ animationDelay: `${idx * 40}ms` }}
                onClick={() => setSelected(h)}
                aria-label={`Open details for ${h.username}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={h.avatar || '/image.png'}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/image.png'; e.currentTarget.classList.add('grayscale'); }}
                    alt={h.username}
                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                  />
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
              </button>
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

      {/* Slide-over detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-[#121212] border-l border-gray-800 shadow-2xl transform transition-transform duration-300 translate-x-0 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-[#9d4edd]" /> Host Profile
                </h2>
                <p className="text-gray-400 text-xs">Structured details for {selected.username}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white" aria-label="Close details" onClick={() => setSelected(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={selected.avatar || '/image.png'}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/image.png'; e.currentTarget.classList.add('grayscale'); }}
                  alt={selected.username}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-[#7209B7]"
                />
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-white truncate">{selected.username}</div>
                  <div className="text-xs text-gray-400 truncate">ID: {selected.id}</div>
                  <div className="mt-2 text-xs">
                    <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] ${selected.status === 'blocked' ? 'border-red-700 text-red-300 bg-red-900/10' : selected.status === 'inactive' ? 'border-yellow-700 text-yellow-300 bg-yellow-900/10' : 'border-green-700 text-green-300 bg-green-900/10'}`}>{selected.status || 'active'}</span>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 py-2">
                  <div className="text-[11px] text-gray-400">Agency</div>
                  <div className="text-sm text-white truncate">{selected.agency || '—'}</div>
                </div>
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 py-2">
                  <div className="text-[11px] text-gray-400">Joined</div>
                  <div className="text-sm text-white truncate">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}</div>
                </div>
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-400">Email</div>
                    <div className="text-sm text-white truncate">{selected.email || '—'}</div>
                  </div>
                </div>
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-400">Phone</div>
                    <div className="text-sm text-white truncate">{selected.phone || '—'}</div>
                  </div>
                </div>
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 py-2 flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-gray-400">Region</div>
                    <div className="text-sm text-white truncate">{selected.region || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Additional structured info sections (extend as needed) */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3">
                  <div className="text-[11px] text-gray-400 mb-1">About</div>
                  <div className="text-sm text-gray-300">This host is managed under {selected.agency || '—'} and joined on {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'}.</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default HostDetails;