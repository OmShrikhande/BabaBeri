import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { coinsRechargeData, diamondAnalyticsData } from '../data/dashboardData';
import { Coins, Gem, ChevronDown } from 'lucide-react';

const EnhancedChartCard = () => {
  const [selectedType, setSelectedType] = useState('coins');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const typeOptions = [
    { value: 'coins', label: 'Coins Recharge', icon: Coins, color: '#F59E0B' },
    { value: 'diamonds', label: 'Diamond Analytics', icon: Gem, color: '#3B82F6' }
  ];

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const getChartData = () => {
    if (selectedType === 'coins') {
      return coinsRechargeData[selectedPeriod];
    } else {
      return diamondAnalyticsData[selectedPeriod];
    }
  };

  const chartData = getChartData();
  const currentTypeOption = typeOptions.find(option => option.value === selectedType);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121212] border border-[#F72585] rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{`${label}`}</p>
          {selectedType === 'coins' ? (
            <p className="text-[#F72585] font-bold">
              {`Amount: ₹${payload[0].value.toLocaleString()}`}
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-blue-400 font-medium">
                {`Total: ${payload[0]?.value?.toLocaleString() || 0} diamonds`}
              </p>
              <p className="text-green-400 font-medium">
                {`Cashout: ${payload[1]?.value?.toLocaleString() || 0} diamonds`}
              </p>
              <p className="text-purple-400 font-medium">
                {`Profit: ${payload[2]?.value?.toLocaleString() || 0} diamonds`}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const formatYAxisValue = (value) => {
    if (value >= 1000000) {
      return selectedType === 'coins' 
        ? `₹${(value / 1000000).toFixed(1)}M`
        : `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return selectedType === 'coins' 
        ? `₹${(value / 1000).toFixed(0)}K`
        : `${(value / 1000).toFixed(0)}K`;
    }
    return selectedType === 'coins' ? `₹${value}` : value;
  };

  const renderChart = () => {
    if (selectedType === 'coins') {
      return (
        <BarChart data={chartData}>
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
          <Bar 
            dataKey="amount" 
            radius={[4, 4, 0, 0]}
            fill="#F59E0B"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isCurrentPeriod ? '#F72585' : '#F59E0B'} 
              />
            ))}
          </Bar>
        </BarChart>
      );
    } else {
      return (
        <AreaChart data={chartData}>
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
          <Area
            type="monotone"
            dataKey="amount"
            stackId="1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="cashout"
            stackId="2"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stackId="3"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.3}
          />
        </AreaChart>
      );
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-xl font-bold text-white mb-4 lg:mb-0">
          Financial Analytics
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-[#121212] border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white text-sm focus:border-[#F72585] focus:outline-none focus:ring-2 focus:ring-[#F72585]/20 transition-all duration-200"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Period Toggle */}
          <div 
            className="flex bg-[#121212] rounded-lg p-1 border border-gray-700"
            role="tablist"
            aria-label="Select time period"
          >
            {periodOptions.map((option) => (
              <button
                key={option.value}
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
        </div>
      </div>

      {/* Chart Type Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <currentTypeOption.icon className="w-5 h-5" style={{ color: currentTypeOption.color }} />
        <span className="text-gray-300 text-sm font-medium">
          {currentTypeOption.label} - {periodOptions.find(p => p.value === selectedPeriod)?.label}
        </span>
      </div>

      {/* Legend for Diamond Analytics */}
      {selectedType === 'diamonds' && (
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-[#121212] rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300 text-sm">Total Diamonds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-300 text-sm">Cashout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-300 text-sm">Profit</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {selectedType === 'coins' ? (
          <>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-white font-bold">
                ₹{chartData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Average</p>
              <p className="text-white font-bold">
                ₹{Math.round(chartData.reduce((sum, item) => sum + item.amount, 0) / chartData.length).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Highest</p>
              <p className="text-white font-bold">
                ₹{Math.max(...chartData.map(item => item.amount)).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Lowest</p>
              <p className="text-white font-bold">
                ₹{Math.min(...chartData.map(item => item.amount)).toLocaleString()}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Diamonds</p>
              <p className="text-blue-400 font-bold">
                {chartData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Cashout</p>
              <p className="text-green-400 font-bold">
                {chartData.reduce((sum, item) => sum + item.cashout, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Profit</p>
              <p className="text-purple-400 font-bold">
                {chartData.reduce((sum, item) => sum + item.profit, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Profit Margin</p>
              <p className="text-yellow-400 font-bold">
                {((chartData.reduce((sum, item) => sum + item.profit, 0) / chartData.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(1)}%
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedChartCard;