import React, { useState, useEffect, useCallback } from 'react';
import authService from '../../services/authService';
import {
  ArrowRightLeft,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Gem,
  Calendar,
  User,
  FileText,
  Clock
} from 'lucide-react';
import { MobileDataCard, MobileCardRow } from '../common/ResponsiveUI';

const DiamondTransferHistorySection = ({ addToast }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDiamondsTransferred, setTotalDiamondsTransferred] = useState(0);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = useCallback(async (currentPage = page, currentSize = size) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getDiamondTransferHistory(currentPage, currentSize);
      if (res.success && res.data) {
        const payload = res.data;
        setHistoryData(Array.isArray(payload.data) ? payload.data : []);
        setPage(payload.page ?? currentPage);
        setSize(payload.size ?? currentSize);
        setTotalRecords(payload.totalRecords ?? 0);
        setTotalPages(payload.totalPages ?? 1);
        setTotalDiamondsTransferred(payload.totalDiamondsTransferred ?? 0);
      } else {
        const msg = res.error || 'Failed to fetch diamond transfer history.';
        setError(msg);
        addToast && addToast(msg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'An error occurred while fetching history.';
      setError(msg);
      addToast && addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, size, addToast]);

  useEffect(() => {
    fetchHistory(page, size);
  }, [page, size]);

  const handleRefresh = () => {
    fetchHistory(page, size);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setSize(newSize);
    setPage(0);
  };

  // Filter items by search query locally
  const filteredData = historyData.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      (item.transactionno && item.transactionno.toLowerCase().includes(query)) ||
      (item.senderCode && item.senderCode.toLowerCase().includes(query)) ||
      (item.receiverCode && item.receiverCode.toLowerCase().includes(query)) ||
      (item.senderName && item.senderName.toLowerCase().includes(query)) ||
      (item.receiverName && item.receiverName.toLowerCase().includes(query)) ||
      (item.type && item.type.toLowerCase().includes(query))
    );
  });

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-black/90 border border-gray-800 rounded-xl p-4 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-lg bg-[#F72585]/10 border border-[#F72585]/30 flex items-center justify-center text-[#F72585]">
            <Gem className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Diamonds Transferred</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {totalDiamondsTransferred.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-black/90 border border-gray-800 rounded-xl p-4 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-lg bg-[#7209B7]/10 border border-[#7209B7]/30 flex items-center justify-center text-[#7209B7]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Transfer Records</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {totalRecords.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-black/90 border border-gray-800 rounded-xl p-4 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Current Page / Total</p>
            <p className="text-xl font-bold text-white mt-0.5">
              Page {page + 1} of {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="w-full bg-black/90 rounded-xl border border-gray-800 overflow-hidden shadow-md">
        {/* Header & Controls */}
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#F72585] to-[#7209B7] flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Diamond Transfer History</h3>
              <p className="text-xs text-gray-400">All superadmin diamond transactions</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sender, receiver, Tx..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#7209B7]"
              />
            </div>

            {/* Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Rows:</span>
              <select
                value={size}
                onChange={handleSizeChange}
                className="bg-[#121212] border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#7209B7]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-[#121212] hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full responsive-table-scroll">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#F72585]" />
              <p className="text-sm">Loading transfer history...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              <p className="text-sm font-medium mb-2">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-900/40 border border-red-500/50 text-red-300 rounded-lg text-xs font-semibold hover:bg-red-900/70 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredData.length > 0 ? (
            <>
              {/* Mobile View */}
              <div className="lg:hidden divide-y divide-gray-800">
                {filteredData.map((item) => (
                  <MobileDataCard key={item.id || item.transactionno}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-semibold text-[#F72585] font-mono">
                          #{item.id}
                        </span>
                        <p className="text-gray-400 text-xs font-mono truncate max-w-[200px]">
                          {item.transactionno || '—'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7209B7]/20 text-[#7209B7] border border-[#7209B7]/30">
                        {item.type || 'TRANSFER'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2 text-xs">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Sender</span>
                        <span className="text-gray-200 font-medium truncate block">
                          {item.senderCode || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Receiver</span>
                        <span className="text-gray-200 font-medium truncate block">
                          {item.receiverCode || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                        <Gem className="w-3.5 h-3.5" />
                        <span>{item.diamonds?.toLocaleString()} Diamonds</span>
                      </div>
                      <span className="text-gray-400 text-[11px]">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </MobileDataCard>
                ))}
              </div>

              {/* Desktop View */}
              <table className="hidden lg:table w-full border-collapse">
                <thead>
                  <tr className="bg-[#121212] border-b border-gray-800 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3 text-center w-16">ID</th>
                    <th className="px-4 py-3 text-center">Transaction No</th>
                    <th className="px-4 py-3 text-center">Sender</th>
                    <th className="px-4 py-3 text-center">Receiver</th>
                    <th className="px-4 py-3 text-center">Diamonds</th>
                    <th className="px-4 py-3 text-center">Type</th>
                    <th className="px-4 py-3 text-center">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70 text-sm">
                  {filteredData.map((item) => (
                    <tr
                      key={item.id || item.transactionno}
                      className="hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-mono text-xs text-gray-400 font-semibold">
                        #{item.id}
                      </td>

                      <td className="px-4 py-3 text-center font-mono text-xs text-gray-300">
                        {item.transactionno ? (
                          <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-300">
                            {item.transactionno}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                            <User className="w-3 h-3" />
                          </div> */}
                          <div className="text-left">
                            <p className="text-white font-medium text-xs leading-tight">
                              {item.senderCode || '—'}
                            </p>
                            {item.senderRole && (
                              <span className="text-[10px] text-gray-500">{item.senderRole}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                            <User className="w-3 h-3" />
                          </div> */}
                          <div className="text-left">
                            <p className="text-white font-medium text-xs leading-tight">
                              {item.receiverCode || '—'}
                            </p>
                            {item.receiverRole && (
                              <span className="text-[10px] text-gray-500">{item.receiverRole}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center gap-1 font-bold text-cyan-400">
                          {/* <Gem className="w-3.5 h-3.5" /> */}
                          {item.diamonds?.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7209B7]/20 text-[#7209B7] border border-[#7209B7]/40">
                          {item.type || 'TRANSFER'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center text-xs text-gray-400 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm">No transfer history records found.</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Showing page <span className="font-semibold text-white">{page + 1}</span> of{' '}
              <span className="font-semibold text-white">{totalPages}</span> ({totalRecords} records)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0 || loading}
                className="px-3 py-1.5 rounded-lg bg-[#121212] border border-gray-700 text-xs text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pNum = i;
                  if (totalPages > 5) {
                    if (page > 2 && page < totalPages - 2) {
                      pNum = page - 2 + i;
                    } else if (page >= totalPages - 2) {
                      pNum = totalPages - 5 + i;
                    }
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      disabled={loading}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${page === pNum
                        ? 'bg-[#F72585] text-white'
                        : 'bg-[#121212] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                        }`}
                    >
                      {pNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1 || loading}
                className="px-3 py-1.5 rounded-lg bg-[#121212] border border-gray-700 text-xs text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiamondTransferHistorySection;
