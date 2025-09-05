import React, { useEffect, useMemo, useState, useDeferredValue } from 'react';
import { X, Search, CheckCircle2, XCircle, User2, MapPin, BadgeCheck } from 'lucide-react';
import authService from '../services/authService.js';

/**
 * DpVerificationModal
 * - High-performance modal to review and take actions on DP verification requests
 * - Handles 5k+ items smoothly using search + pagination and memoization
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - requests: Array<{ id: string | number, username: string, dp: string, request?: string, region?: string }>
 * - initialSelectedId?: string | number
 * - onApprove?: (usercode: string) => void
 * - onReject?: (usercode: string) => void
 */
const DpVerificationModal = ({
  isOpen,
  onClose,
  requests = [],
  initialSelectedId = null,
  onApprove,
  onReject,
  fullPage = false, // new prop
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // tuned for responsiveness
  const [selectedId, setSelectedId] = useState(initialSelectedId);

  // Fetched pending requests from API (when requests prop not provided)
  const [fetchedRequests, setFetchedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deferredSearch = useDeferredValue(search);

  // Load pending requests when modal opens if parent didn't supply data
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const res = await authService.getAllPendingProfilePics();
        if (!active) return;
        if (res?.success) {
          const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          // Map API payload -> UI structure
          const mapped = (items || []).map((item) => {
            const usercode = item?.usercode ?? '';
            const fallbackId = item?.id != null ? String(item.id) : Math.random().toString(36).slice(2);
            const id = usercode && String(usercode).trim() ? String(usercode) : `pending-${fallbackId}`;
            return {
              id, // used by UI selection and keys
              username: usercode && String(usercode).trim() ? String(usercode) : `User ${item?.id ?? ''}`.trim(),
              dp: item?.path || '',
              region: 'Unknown',
              request: 'DP Confirmation',
              _raw: item,
            };
          });
          setFetchedRequests(mapped);
          // Reset selection when opening
          setSelectedId(initialSelectedId ?? (mapped[0]?.id ?? null));
          setPage(1);
          setSearch('');
        } else {
          setError(res?.error || 'Failed to load pending profile pics.');
          setFetchedRequests([]);
        }
      } catch (e) {
        setError(e?.message || 'Failed to load pending profile pics.');
        setFetchedRequests([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    // Only fetch if parent didn't provide requests
    if (isOpen && (!requests || requests.length === 0)) {
      load();
    } else if (isOpen) {
      // When using parent-supplied requests, still reset controls
      setSelectedId(initialSelectedId ?? (requests[0]?.id ?? null));
      setPage(1);
      setSearch('');
    }

    return () => { active = false; };
  }, [isOpen, initialSelectedId, requests]);

  // Use parent-provided requests if available; otherwise use fetched
  const data = useMemo(() => (requests && requests.length ? requests : fetchedRequests), [requests, fetchedRequests]);

  const filtered = useMemo(() => {
    if (!deferredSearch) return data;
    const q = String(deferredSearch).toLowerCase();
    return data.filter((r) =>
      `${r.username}`.toLowerCase().includes(q) ||
      `${r.region ?? ''}`.toLowerCase().includes(q) ||
      `${r.id}`.toLowerCase().includes(q)
    );
  }, [data, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  useEffect(() => {
    if (!visible.length) return;
    if (selectedId == null) {
      setSelectedId(visible[0].id);
      return;
    }
    // If current selected no longer in filtered, select first visible
    if (!filtered.some((r) => r.id === selectedId)) {
      setSelectedId(visible[0].id);
    }
  }, [filtered, visible, selectedId]);

  const selected = useMemo(() => filtered.find((r) => r.id === selectedId) ?? null, [filtered, selectedId]);

  // Resolve usercode for approve/reject
  const getUsercodeFromSelected = (sel) => {
    if (!sel) return null;
    const raw = sel._raw || {};
    // Prefer usercode from API; fallback to id if our mapping used it
    return raw.usercode || (sel.id?.startsWith('pending-') ? null : sel.id) || null;
  };

  const actOnProfile = async (status) => {
    const usercode = getUsercodeFromSelected(selected);
    if (!usercode) {
      alert('User code not available for this request.');
      return;
    }
    try {
      const res = await authService.updateProfilePicStatus(usercode, status);
      if (!res?.success) {
        throw new Error(res?.error || 'Request failed.');
      }
      // Optimistically remove from local list if we own it
      if (!requests || requests.length === 0) {
        setFetchedRequests((prev) => prev.filter((r) => r !== selected));
      }
      if (status === 'APPROVED') onApprove?.(usercode);
      if (status === 'REJECT') onReject?.(usercode);
      onClose?.();
    } catch (e) {
      console.error('Profile pic action error:', e);
      alert(e?.message || 'Failed to update status.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={
        fullPage
          ? "fixed inset-0 z-50 bg-[#121212] flex flex-col"
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      }
      role="dialog"
      aria-modal="true"
      style={fullPage ? { minHeight: '100vh', height: '100vh', overflow: 'auto' } : {}}
    >
      <div
        className={
          fullPage
            ? "w-full h-full flex flex-col"
            : "relative bg-[#121212] w-full max-w-6xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
        }
        style={fullPage ? { borderRadius: 0, border: 'none', boxShadow: 'none', height: '100vh', maxWidth: '100vw', overflow: 'auto' } : {}}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-800 ${fullPage ? "bg-[#121212]" : "bg-gradient-to-r from-[#1A1A1A] to-[#181818]"}`}>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">DP Verification</h2>
            <p className="text-gray-400 text-sm">Review and action profile photo verification requests</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-xs text-gray-400">Loading...</span>}
            {error && <span className="text-xs text-red-400" title={error}>Failed to load</span>}
            <button
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
              aria-label="Close"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 ${fullPage ? "flex-1 overflow-auto" : ""}`} style={fullPage ? { minHeight: '0' } : { height: '80vh' }}>
          {/* Left: List */}
          <div className="lg:col-span-5 xl:col-span-4 border-r border-gray-800 flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]/40 focus:border-[#7209B7]/60"
                    placeholder="Search by username, region, or ID..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <select
                  className="bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  aria-label="Items per page"
                >
                  {[25, 50, 100, 200].map((n) => (
                    <option key={n} value={n}>{n}/page</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{filtered.length.toLocaleString()} requests</span>
                <span>Page {safePage} of {totalPages}</span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-800">
                {visible.length === 0 ? (
                  <li className="p-8 text-center text-gray-400">No matching requests</li>
                ) : (
                  visible.map((r) => {
                    const active = r.id === selectedId;
                    return (
                      <li key={r.id}>
                        <button
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 ${active ? 'bg-white/5' : ''}`}
                          onClick={() => setSelectedId(r.id)}
                        >
                          {/* Thumbnail */}
                          <img src={r.dp} alt={r.username} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                              <span>{r.username}</span>
                              {(r.request || 'DP Confirmation') && (
                                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-[#22223b] text-gray-300 border border-gray-700">
                                  <BadgeCheck className="w-3 h-3 mr-1 text-[#9d4edd]" /> {r.request || 'DP Confirmation'}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.region || 'Unknown'}</p>
                          </div>
                          <span className="text-[10px] text-gray-500">ID: {r.id}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-800 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Showing {Math.min(filtered.length, start + 1)} - {Math.min(filtered.length, start + visible.length)} of {filtered.length.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#0f0f0f] border border-gray-800 text-gray-300 disabled:opacity-40 hover:bg-white/5"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-sm bg-[#0f0f0f] border border-gray-800 text-gray-300 disabled:opacity-40 hover:bg-white/5"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Right: Detail */}
          <div className="lg:col-span-7 xl:col-span-8 p-6 flex flex-col">
            {selected ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-start gap-5 flex-wrap">
                  <img
                    src={selected.dp}
                    alt={selected.username}
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-[#7209B7] shadow-lg"
                  />
                  <div className="min-w-[240px]">
                    <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <User2 className="w-5 h-5 text-gray-300" /> {selected.username}
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 max-w-md">
                      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2">
                        <p className="text-[11px] text-gray-400">User Code</p>
                        <p className="text-sm font-semibold text-white">{selected.id}</p>
                      </div>
                      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2">
                        <p className="text-[11px] text-gray-400">Region</p>
                        <p className="text-sm font-semibold text-white">{selected.region || 'Unknown'}</p>
                      </div>
                      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 col-span-2">
                        <p className="text-[11px] text-gray-400">Request Type</p>
                        <p className="text-sm font-semibold text-white">{selected.request || 'DP Confirmation'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview area */}
                <div className="mt-6 flex-1">
                  <div className="rounded-xl border border-gray-800 bg-[#0f0f0f] p-4">
                    <p className="text-gray-400 text-sm">Profile photo preview</p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <img
                        src={selected.dp}
                        alt={`${selected.username} preview 1`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-800"
                      />
                      <img
                        src={selected.dp}
                        alt={`${selected.username} preview 2`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:opacity-90 hover:scale-[1.01] transition"
                    onClick={() => actOnProfile('APPROVED')}
                    disabled={loading}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:opacity-90 hover:scale-[1.01] transition"
                    onClick={() => actOnProfile('REJECT')}
                    disabled={loading}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    className="ml-auto px-4 py-2 rounded-lg text-sm bg_WHITE/5 text-gray-300 hover:bg-white/10 border border-gray-800"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 grid place-items-center">
                <p className="text-gray-400">Select a request from the list</p>
              </div>
            )}
          </div>
        </div>

        {/* Tiny animations */}
        {!fullPage && (
          <style>{`
            @keyframes modalPop { from { opacity: 0; transform: translateY(6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .animate-modal { animation: modalPop .25s ease-out; }
          `}</style>
        )}
      </div>
    </div>
  );
};

export default DpVerificationModal;