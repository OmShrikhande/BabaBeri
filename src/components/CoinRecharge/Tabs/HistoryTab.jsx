import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Human-readable column labels for every known API field
const COLUMN_CONFIG = [
  { key: 'usercode',       label: 'User Code' },
  { key: 'rechargeby',     label: 'Recharged By' },
  { key: 'coins',          label: 'Coins' },
  { key: 'paymentmethod',  label: 'Payment Method' },
  { key: 'transactionid',  label: 'Transaction ID' },
  { key: 'status',         label: 'Status' },
  { key: 'remarks',        label: 'Remarks' },
  { key: 'rechargedate',   label: 'Recharge Date' },
  { key: 'createdat',      label: 'Created At' },
];

const hasValue = (v) => v !== null && v !== undefined && v !== '' && v !== '—';

/** Returns only the columns that have at least one non-empty value across all rows */
const getActiveColumns = (records) =>
  COLUMN_CONFIG.filter((col) => records.some((r) => hasValue(r[col.key])));

const formatDate = (value) => {
  if (!hasValue(value)) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const statusStyle = (status) => {
  const s = String(status).toUpperCase();
  if (s === 'SUCCESS') return 'bg-green-500/20 text-green-400 border border-green-500/30';
  if (s === 'FAILED' || s === 'FAILURE') return 'bg-red-500/20 text-red-400 border border-red-500/30';
  if (s === 'PENDING') return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  return 'bg-gray-700 text-gray-300';
};

const formatCell = (key, value) => {
  if (!hasValue(value)) return <span className="text-gray-600">—</span>;
  if (key === 'rechargedate' || key === 'createdat' || key === 'updatedat') return formatDate(value);
  if (key === 'status') {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(value)}`}>
        {value}
      </span>
    );
  }
  if (key === 'coins') {
    return <span className="font-semibold text-yellow-400">{Number(value).toLocaleString()}</span>;
  }
  if (key === 'transactionid') {
    return <span className="text-xs font-mono text-gray-300 break-all">{value}</span>;
  }
  if (key === 'paymentmethod') {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-[#7209B7]/20 text-purple-300 border border-[#7209B7]/30">
        {value}
      </span>
    );
  }
  return value;
};

const HistoryTab = ({ history, loadHistory, isLoading }) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeUserCode, setActiveUserCode] = useState('');

  const activeColumns = getActiveColumns(history);
  const hasHistory = history.length > 0;

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = searchInput.trim();
      setActiveUserCode(trimmed);
    },
    [searchInput]
  );

  useEffect(() => {
    if (!activeUserCode) return undefined;
    let cleanup;
    (async () => {
      cleanup = await loadHistory({ userCode: activeUserCode });
    })();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [activeUserCode, loadHistory]);

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Recharge History</h2>
          <p className="text-sm text-gray-400">
            Enter a host&apos;s user code to view their recharge activity.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full md:w-auto max-w-lg md:max-w-md"
          role="search"
        >
          <label htmlFor="history-search" className="sr-only">
            Search history by user code
          </label>
          <input
            id="history-search"
            type="search"
            autoComplete="off"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter user code / host name / host ID"
            className="flex-1 rounded-l-lg bg-[#1A1A1A] border border-gray-700 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F72585]"
            aria-label="User code"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-gradient-to-r from-[#F72585] to-[#7209B7] px-4 py-2 text-sm font-semibold text-white hover:from-[#F72585]/90 hover:to-[#7209B7]/90 focus:outline-none focus:ring-2 focus:ring-[#F72585] transition-all"
          >
            Search
          </button>
        </form>
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-xl p-8 flex items-center justify-center gap-3 text-gray-400">
          <div className="w-4 h-4 border-2 border-[#F72585] border-t-transparent rounded-full animate-spin" />
          Loading history...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasHistory && (
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-xl p-8 text-sm text-center text-gray-500">
          {activeUserCode
            ? 'No recharge history found for the provided identifier.'
            : 'Enter a host identifier above to load recharge history.'}
        </div>
      )}

      {/* Table */}
      {!isLoading && hasHistory && (
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-xl overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {history.length} transaction{history.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-xs text-gray-500">Latest transactions appear first</p>
            </div>
            <span className="text-xs text-gray-600">
              {activeUserCode && `Code: ${activeUserCode}`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-sm">
              <thead>
                <tr className="bg-gray-900/60 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th scope="col" className="px-4 py-3 w-10 text-center">#</th>
                  {activeColumns.map((col) => (
                    <th key={col.key} scope="col" className="px-4 py-3 whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {history.map((record, index) => (
                  <tr
                    key={record.transactionid ?? record.id ?? index}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{index + 1}</td>
                    {activeColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                        {formatCell(col.key, record[col.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

HistoryTab.propTypes = {
  history: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadHistory: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

HistoryTab.defaultProps = {
  isLoading: false,
};

export default HistoryTab;