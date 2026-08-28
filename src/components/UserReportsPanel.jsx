import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Flag, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import authService from '../services/authService';

const ITEMS_PER_PAGE = 20;

const normalizeReport = (report) => {
  if (!report || typeof report !== 'object') return report;

  const reported = report.reportedUser || report.reported || report.targetUser || {};
  const reporter = report.reporterUser || report.reporter || report.reportedByUser || {};

  return {
    id: report.id ?? report.reportId,
    reportedCode:
      report.reportedUserCode ||
      report.reportedCode ||
      reported.code ||
      reported.usercode ||
      report.targetUserCode ||
      '—',
    reportedName:
      report.reportedUserName ||
      reported.name ||
      reported.username ||
      report.targetUserName ||
      '—',
    reporterCode:
      report.reporterUserCode ||
      report.reporterCode ||
      reporter.code ||
      reporter.usercode ||
      '—',
    reporterName:
      report.reporterUserName ||
      reporter.name ||
      reporter.username ||
      '—',
    reason: report.reason || report.reportReason || report.description || report.message || '—',
    status: report.status || report.reportStatus || 'PENDING',
    createdAt: report.createdAt || report.reportDate || report.date || report.timestamp || null,
    raw: report,
  };
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
};

const getStatusBadgeColor = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'PENDING') return 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50';
  if (s === 'RESOLVED' || s === 'APPROVED') return 'bg-green-900/30 text-green-400 border-green-800/50';
  if (s === 'REJECTED' || s === 'DISMISSED') return 'bg-gray-900/30 text-gray-400 border-gray-800/50';
  return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
};

const UserReportsPanel = ({ embedded = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pending: 0, statusFilter: 'ALL' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getUserReports(statusFilter);
      if (response.success) {
        const payload = response.data || {};
        const list = (payload.reports || []).map(normalizeReport);
        setReports(list);
        setMeta({
          total: payload.total ?? list.length,
          pending: payload.pending ?? 0,
          statusFilter: payload.statusFilter || statusFilter,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch user reports');
      }
    } catch (err) {
      console.error('Error fetching user reports:', err);
      setError(err.message || 'Failed to load user reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports;
    const term = searchTerm.toLowerCase();
    return reports.filter(
      (r) =>
        String(r.reportedCode).toLowerCase().includes(term) ||
        String(r.reportedName).toLowerCase().includes(term) ||
        String(r.reporterCode).toLowerCase().includes(term) ||
        String(r.reporterName).toLowerCase().includes(term) ||
        String(r.reason).toLowerCase().includes(term) ||
        String(r.status).toLowerCase().includes(term)
    );
  }, [reports, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className={embedded ? '' : 'flex-1 overflow-y-auto bg-black/70 w-full min-h-full'}>
      <div className={embedded ? '' : 'p-6'}>
        {!embedded && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">User Reports</h1>
            <p className="text-gray-400 text-sm mt-1">
              {meta.total} total, {meta.pending} pending
            </p>
          </div>
        )}

        {embedded && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">User Reports</h2>
              <p className="text-gray-400 text-sm mt-1">
                {meta.total} total · {meta.pending} pending
              </p>
            </div>
            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center justify-between mb-6">
            <span className="text-red-300 text-sm">{error}</span>
            <button
              type="button"
              onClick={fetchReports}
              className="text-red-400 hover:text-red-300 text-sm border border-red-800 px-3 py-1 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0A0A0A] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7] w-full"
              placeholder="Search reports..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          {!embedded && (
            <button
              type="button"
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#1A1A1A] rounded-xl p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : currentReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Flag className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No user reports found</p>
              <p className="text-gray-600 text-sm mt-1">Reports submitted by users will appear here</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Reported User</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Reporter</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Reason</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Date</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReports.map((report) => (
                      <React.Fragment key={report.id ?? `${report.reportedCode}-${report.reporterCode}`}>
                        <tr className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-white font-medium">{report.reportedName}</p>
                            <p className="text-gray-500 text-xs font-mono">{report.reportedCode}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white font-medium">{report.reporterName}</p>
                            <p className="text-gray-500 text-xs font-mono">{report.reporterCode}</p>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <p className="text-gray-300 text-sm truncate" title={report.reason}>{report.reason}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(report.status)}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(report.createdAt)}</td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                              className="text-[#4CC9F0] hover:text-white text-xs font-medium"
                            >
                              {expandedId === report.id ? 'Hide' : 'View JSON'}
                            </button>
                          </td>
                        </tr>
                        {expandedId === report.id && (
                          <tr className="border-b border-gray-800 bg-black/40">
                            <td colSpan={6} className="px-6 py-4">
                              <pre className="text-xs text-emerald-300/90 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(report.raw, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
                  <p className="text-gray-400 text-sm">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredReports.length)} of {filteredReports.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="text-gray-400 hover:text-white rounded-lg px-3 py-2 border border-gray-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <span className="text-white text-sm px-3">Page {currentPage} of {totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="text-gray-400 hover:text-white rounded-lg px-3 py-2 border border-gray-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReportsPanel;

export const fetchPendingUserReportsCount = async () => {
  const res = await authService.getUserReports('PENDING');
  if (!res.success) return 0;
  return res.data?.pending ?? res.data?.reports?.length ?? 0;
};
