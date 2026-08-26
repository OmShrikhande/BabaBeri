import React, { useState, useEffect } from 'react';
import { Trophy, Info, Calendar, RefreshCw, Download } from 'lucide-react';
import SearchBar from './SearchBar';
import ToggleButtonGroup from './ToggleButtonGroup';
import RankingTable from './RankingTable';
import RankingTableSkeleton from './RankingTableSkeleton';
import authService from '../services/services';
import { rankingDurations, rankingTypes } from '../data/rankingData';

const MAX_ROWS = 100;

const mapHostRows = (list = []) =>
  list.slice(0, MAX_ROWS).map((item, index) => ({
    id: item.usercode || `host-${index}`,
    rank: index + 1,
    userId: item.usercode || '—',
    username: item.username || '—',
    fullName: item.name || 'Unknown',
    diamondsValue: Number(item.totalDiamond) || 0,
    diamonds: (Number(item.totalDiamond) || 0).toLocaleString(),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random`,
  }));

const mapSupporterRows = (list = []) =>
  list.slice(0, MAX_ROWS).map((item, index) => ({
    id: item.usercode || `supporter-${index}`,
    rank: index + 1,
    userId: item.usercode || '—',
    username: item.username || '—',
    fullName: item.name || 'Unknown',
    coinsValue: Number(item.totalRecharge) || 0,
    coins: (Number(item.totalRecharge) || 0).toLocaleString(),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random`,
  }));

const Ranking = () => {
  const [activeType, setActiveType] = useState('hosts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [hostsData, setHostsData] = useState([]);
  const [supportersData, setSupportersData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  });

  const fetchHostsRanking = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.getTopHostRanking(selectedDuration.toLowerCase(), selectedDate);
      if (response.success && Array.isArray(response.data)) {
        setHostsData(mapHostRows(response.data));
      } else {
        setHostsData([]);
        setError(response.error || 'Failed to load host rankings');
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setHostsData([]);
      setError(err?.message || 'Failed to load host rankings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupportersRanking = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.getTopRecharge(selectedDuration.toLowerCase(), selectedDate);
      if (response.success && Array.isArray(response.data)) {
        setSupportersData(mapSupporterRows(response.data));
      } else {
        setSupportersData([]);
        setError(response.error || 'Failed to load supporter rankings');
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setSupportersData([]);
      setError(err?.message || 'Failed to load supporter rankings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrent = () => {
    if (activeType === 'hosts') return fetchHostsRanking();
    return fetchSupportersRanking();
  };

  useEffect(() => {
    fetchCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, selectedDuration, selectedDate]);

  const handleRefresh = () => {
    fetchCurrent();
  };

  const getCurrentData = () => (activeType === 'hosts' ? hostsData : supportersData);

  const getFilteredCount = () => {
    const data = getCurrentData();
    const q = searchTerm.toLowerCase();
    return data.filter((item) =>
      String(item.fullName || '').toLowerCase().includes(q) ||
      String(item.username || '').toLowerCase().includes(q) ||
      String(item.userId || '').toLowerCase().includes(q)
    ).length;
  };

  const handleExport = () => {
    const data = getCurrentData();
    const csvContent = [
      ['Rank', 'Name', 'Username', 'Usercode', activeType === 'hosts' ? 'Total Diamonds' : 'Total Recharge'],
      ...data.map((item) => [
        item.rank,
        item.fullName,
        item.username,
        item.userId,
        activeType === 'hosts' ? item.diamondsValue : item.coinsValue,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeType}_ranking_${selectedDuration}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-black/60 p-6 flex flex-col overflow-hidden h-full">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center glow-pink">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Rankings</h1>
                <p className="text-gray-400">View top performers and supporters</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 bg-[#121212] hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 bg-[#121212] hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* <div className="bg-[#121212] border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#F72585] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[#F72585] font-medium text-sm mb-1">Note</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Hosts are ranked by diamonds (`top10ByDiamond`). Supporters are ranked by coins recharged (`topRecharge`).
                  Up to {MAX_ROWS} rows are shown with pagination.
                </p>
              </div>
            </div>
          </div> */}
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, username, or usercode..."
              className="flex-1"
              id="ranking-search"
            />

            <div className="flex items-center gap-2 min-w-[200px]">
              <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="duration-select" className="sr-only">
                Select ranking duration
              </label>
              <select
                id="duration-select"
                value={selectedDuration}
                onChange={(e) => {
                  const newDuration = e.target.value;
                  setSelectedDuration(newDuration);

                  const d = new Date(selectedDate);
                  if (newDuration === 'monthly') {
                    d.setDate(1);
                  } else if (newDuration === 'yearly') {
                    d.setMonth(0);
                    d.setDate(1);
                  }

                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const date = String(d.getDate()).padStart(2, '0');
                  setSelectedDate(`${year}-${month}-${date}`);
                }}
                className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-[#F72585] focus:outline-none focus:ring-2 focus:ring-[#F72585]/20 transition-all duration-200"
                aria-label="Select ranking duration"
              >
                {rankingDurations.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 min-w-[150px]">
              {selectedDuration === 'yearly' ? (
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={selectedDate.split('-')[0]}
                  onChange={(e) => {
                    const y = e.target.value;
                    if (y && y.length === 4) setSelectedDate(`${y}-01-01`);
                  }}
                  className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-[#F72585] focus:outline-none focus:ring-2 focus:ring-[#F72585]/20 transition-all duration-200"
                />
              ) : selectedDuration === 'monthly' ? (
                <input
                  type="month"
                  value={selectedDate.substring(0, 7)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setSelectedDate(`${val}-01`);
                  }}
                  className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-[#F72585] focus:outline-none focus:ring-2 focus:ring-[#F72585]/20 transition-all duration-200"
                />
              ) : (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setSelectedDate(val);
                  }}
                  className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-[#F72585] focus:outline-none focus:ring-2 focus:ring-[#F72585]/20 transition-all duration-200"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <ToggleButtonGroup
              options={rankingTypes}
              activeOption={activeType}
              onToggle={setActiveType}
              className="w-full sm:w-auto"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm text-gray-400 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <span>Total {activeType === 'hosts' ? 'Hosts' : 'Supporters'}:</span>
                <span className="text-white font-semibold">{getFilteredCount()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Last Updated:</span>
                <span className="text-white font-semibold">{lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        <div className="flex-1 bg-[#0D0D0D] rounded-lg border border-gray-700 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {activeType === 'hosts' ? 'Top Hosts' : 'Top Supporters'} -{' '}
                {selectedDuration.charAt(0).toUpperCase() + selectedDuration.slice(1)}
              </h2>
              <div className="text-sm text-gray-400">
                Showing {getFilteredCount()} results (max {MAX_ROWS})
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <RankingTableSkeleton />
            ) : (
              <RankingTable
                data={getCurrentData()}
                type={activeType}
                searchTerm={searchTerm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
