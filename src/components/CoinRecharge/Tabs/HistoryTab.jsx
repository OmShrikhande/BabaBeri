import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const FIELD_LABELS = {
  host: 'Host',
  coins: 'Coins',
  status: 'Status',
  createdAt: 'Date'
};

const normalizeHistoryRecord = (record) => ({
  host: record.hostName || record.hostId || record.host || record.target || 'N/A',
  coins: record.coins ?? record.amount ?? record.amt ?? record.totalCoins ?? 'N/A',
  status: record.status || record.result || '—',
  createdAt: record.createdAt || record.date || record.timestamp || record.updatedAt || '—',
  reference: record.reference || record.txnId || record.transactionId || '—'
});

const formatDate = (value) => {
  if (!value || value === '—') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const HistoryTab = ({ history, loadHistory, isLoading }) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeUserCode, setActiveUserCode] = useState('');

  const normalizedHistory = useMemo(
    () => history.map((record) => normalizeHistoryRecord(record)).slice(0, 5),
    [history]
  );

  const hasHistory = normalizedHistory.length > 0;

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmedInput = searchInput.trim();
      if (!trimmedInput) {
        setActiveUserCode('');
        return;
      }
      setActiveUserCode(trimmedInput);
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
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [activeUserCode, loadHistory]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Recharge History</h2>
          <p className="text-sm text-gray-400">
            Enter a host&apos;s user code to view their most recent recharge activity.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full md:w-auto max-w-lg md:max-w-md"
          role="search"
        >
          <label htmlFor="history-search" className="sr-only">
            Search history by user code, name, or ID
          </label>
          <input
            id="history-search"
            type="search"
            autoComplete="off"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Enter user code / host name / host ID"
            className="flex-1 rounded-l-lg bg-[#1A1A1A] border border-gray-700 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F72585]"
            aria-label="User code, name, or ID"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-gradient-to-r from-[#F72585] to-[#7209B7] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:from-[#F72585]/90 hover:to-[#7209B7]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] focus:ring-[#F72585]"
          >
            Search
          </button>
        </form>
      </header>

      {isLoading && (
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-6 text-sm text-gray-400">
          Loading history...
        </div>
      )}

      {!isLoading && !hasHistory && (
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-6 text-sm text-gray-400">
          {activeUserCode
            ? 'No recharge history found for the provided identifier.'
            : 'Enter a host identifier above to load recharge history.'}
        </div>
      )}

      {hasHistory && (
        <div className="bg-[#1A1A1A] border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              Showing {normalizedHistory.length} most recent recharges
            </h3>
            <p className="text-xs text-gray-500">Latest transactions appear first</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr className="bg-gray-900/50 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  <th scope="col" className="px-6 py-3">
                    {FIELD_LABELS.host}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {FIELD_LABELS.coins}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {FIELD_LABELS.status}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    {FIELD_LABELS.createdAt}
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
                {normalizedHistory.map((record, index) => (
                  <tr key={`${record.reference}-${index}`} className="hover:bg-gray-900/60 transition-colors">
                    <td className="px-6 py-3 text-white font-medium">
                      {record.host}
                    </td>
                    <td className="px-6 py-3">
                      {record.coins}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center rounded-full bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-200"
                        aria-label={`Status ${record.status}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-400 break-words">
                      {record.reference}
                    </td>
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
  isLoading: PropTypes.bool
};

HistoryTab.defaultProps = {
  isLoading: false
};

export default HistoryTab;