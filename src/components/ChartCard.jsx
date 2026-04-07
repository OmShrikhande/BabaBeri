import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { coinsRechargeData } from '../data/dashboardData';

const ChartCard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const chartData = coinsRechargeData[selectedPeriod];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121212] border border-[#F72585] rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`${label}`}</p>
          <p className="text-[#F72585] font-bold">
            {`Amount: ₹${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisValue = (value) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold text-white mb-4 sm:mb-0">
          Analysis - Coins Recharge
        </h2>
        
        {/* Period Toggle */}
        <div 
          className="flex bg-[#121212] rounded-lg p-1 border border-gray-700"
          role="tablist"
          aria-label="Chart period selection"
        >
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                ${selectedPeriod === option.value
                  ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white glow-pink'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
                focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50
              `}
              role="tab"
              aria-selected={selectedPeriod === option.value}
              tabIndex={selectedPeriod === option.value ? 0 : -1}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div 
        className="h-80"
        role="img"
        aria-label={`Coins recharge chart for ${selectedPeriod} period`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              strokeOpacity={0.3}
            />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={formatYAxisValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              radius={[4, 4, 0, 0]}
              fill="#7209B7"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.isCurrentPeriod ? '#F72585' : '#7209B7'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-[#7209B7] rounded"></div>
          <span className="text-gray-400 text-sm">Previous Periods</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-[#F72585] rounded"></div>
          <span className="text-gray-400 text-sm">Current Period</span>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;