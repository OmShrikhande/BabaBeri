import React, { useState, useEffect } from 'react';
import { Trophy, Info, Calendar, RefreshCw, Download, TrendingUp, Users, Award } from 'lucide-react';
import SearchBar from './SearchBar';
import ToggleButtonGroup from './ToggleButtonGroup';
import RankingTable from './RankingTable';
import RankingTableSkeleton from './RankingTableSkeleton';
import { 
  mockHostsRanking, 
  mockSupportersRanking, 
  rankingDurations, 
  rankingTypes 
} from '../data/rankingData';

const Ranking = () => {
  const [activeType, setActiveType] = useState('hosts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate data refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  // Export data functionality
  const handleExport = () => {
    const data = getCurrentData();
    const csvContent = [
      ['Rank', 'Full Name', 'Username', 'User ID', activeType === 'hosts' ? 'Diamonds' : 'Coins'],
      ...data.map(item => [
        item.rank,
        item.fullName,
        item.username,
        item.userId,
        activeType === 'hosts' ? item.diamonds : item.coins
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeType}_ranking_${selectedDuration}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get statistics
  const getStats = () => {
    const data = getCurrentData();
    const totalValue = data.reduce((sum, item) => 
      sum + (activeType === 'hosts' ? item.diamondsValue : item.coinsValue), 0
    );
    const averageValue = totalValue / data.length;
    
    return {
      total: data.length,
      totalValue: totalValue.toLocaleString(),
      averageValue: Math.round(averageValue).toLocaleString(),
      topPerformer: data[0]?.fullName || 'N/A'
    };
  };

  // Get current data based on active type
  const getCurrentData = () => {
    return activeType === 'hosts' ? mockHostsRanking : mockSupportersRanking;
  };

  // Get total count for current type
  const getTotalCount = () => {
    const data = getCurrentData();
    const filteredData = data.filter(item => 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filteredData.length;
  };

  return (
    <div className="flex-1 bg-[#1A1A1A] p-6 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
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
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-[#121212] hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 bg-[#121212] hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="bg-[#121212] border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#F72585] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[#F72585] font-medium text-sm mb-1">Note</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Rankings are updated in real-time based on user activity. Hosts are ranked by diamonds earned, 
                  while supporters are ranked by coins spent. The ranking period can be adjusted using the duration filter.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search and Duration Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name, username, or user ID..."
              className="flex-1"
            />
            
            {/* Duration Dropdown */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-[#F72585] focus:outline-none focus:ring-2 focus:ring-[#F72585]/20 transition-all duration-200"
              >
                {rankingDurations.map(duration => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Buttons and Stats Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <ToggleButtonGroup
              options={rankingTypes}
              activeOption={activeType}
              onToggle={setActiveType}
              className="w-full sm:w-auto"
            />
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span>Total {activeType === 'hosts' ? 'Hosts' : 'Supporters'}:</span>
                <span className="text-white font-semibold">{getTotalCount()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Last Updated:</span>
                <span className="text-white font-semibold">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {(() => {
            const stats = getStats();
            return (
              <>
                <div className="bg-[#121212] rounded-lg border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total {activeType === 'hosts' ? 'Hosts' : 'Supporters'}</p>
                      <p className="text-white text-xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#121212] rounded-lg border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total {activeType === 'hosts' ? 'Diamonds' : 'Coins'}</p>
                      <p className="text-white text-xl font-bold">{stats.totalValue}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#121212] rounded-lg border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Average Value</p>
                      <p className="text-white text-xl font-bold">{stats.averageValue}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#121212] rounded-lg border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Top Performer</p>
                      <p className="text-white text-lg font-bold truncate">{stats.topPerformer}</p>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-[#121212] rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {activeType === 'hosts' ? 'Top Hosts' : 'Top Supporters'} - {selectedDuration.charAt(0).toUpperCase() + selectedDuration.slice(1)}
              </h2>
              <div className="text-sm text-gray-400">
                Showing {getTotalCount()} results
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <RankingTableSkeleton />
          ) : (
            /* Table */
            <RankingTable
              data={getCurrentData()}
              type={activeType}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Ranking;