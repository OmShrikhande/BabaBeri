import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Coins } from 'lucide-react';
import useFinancialAnalytics from '../hooks/useFinancialAnalytics';

const periodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const EnhancedChartCard = () => {
  const {
    analytics,
    chartData,
    isLoading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    refetch,
  } = useFinancialAnalytics({ initialPeriod: 'monthly' });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121212] border border-[#F72585] rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{`${label}`}</p>
          <p className="text-[#F72585] font-bold">
            {`Amount: ₹${Number(payload[0].value || 0).toLocaleString()}`}
          </p>
          {payload[0]?.payload?.coins != null && (
            <p className="text-yellow-400 text-sm mt-1">
              {`Coins: ${Number(payload[0].payload.coins).toLocaleString()}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatYAxisValue = (value) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const safeChartData = Array.isArray(chartData) ? chartData : [];
  const totalAmount = analytics?.totalAmount
    ?? safeChartData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const highestAmount = analytics?.highestAmount
    ?? (safeChartData.length ? Math.max(...safeChartData.map((item) => Number(item.amount) || 0)) : 0);
  const lowestAmount = safeChartData.length
    ? Math.min(...safeChartData.map((item) => Number(item.amount) || 0))
    : 0;
  const averageAmount = safeChartData.length
    ? Math.round(totalAmount / safeChartData.length)
    : 0;

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-4 lg:mb-0">
          {analytics?.title || 'Financial Analytics'}
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div
            className="flex bg-[#121212] rounded-lg p-1 border border-gray-700"
            role="tablist"
            aria-label="Select time period"
          >
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedPeriod(option.value)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${selectedPeriod === option.value
                    ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
                role="tab"
                aria-selected={selectedPeriod === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Coins className="w-5 h-5 text-yellow-400" />
        <span className="text-gray-300 text-sm font-medium">
          Coins Recharge - {periodOptions.find((p) => p.value === selectedPeriod)?.label}
        </span>
        {analytics?.totalCoins != null && (
          <span className="ml-auto text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-500/30">
            Total: {Number(analytics.totalCoins).toLocaleString()} coins
          </span>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      <div className="h-80 w-full relative flex-1 min-h-[16rem]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F72585] mb-4" />
            <p className="text-gray-300 font-medium">Fetching financial analytics...</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxisValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#F59E0B">
              {safeChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCurrentPeriod ? '#F72585' : '#F59E0B'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 flex-shrink-0">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-white font-bold">₹{Number(totalAmount || 0).toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Average</p>
          <p className="text-white font-bold">₹{Number(averageAmount || 0).toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Highest</p>
          <p className="text-white font-bold">₹{Number(highestAmount || 0).toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm">Lowest</p>
          <p className="text-white font-bold">₹{Number(lowestAmount || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChartCard;
