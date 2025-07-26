import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Coins, Gem, AlertTriangle } from 'lucide-react';

const iconMap = {
  DollarSign,
  Coins,
  Gem,
  AlertTriangle,
  TrendingUp,
  TrendingDown
};

const FinancialMetricsCard = ({ title, value, formatted, change, trend, icon, color = 'blue', isLoading = false }) => {
  const IconComponent = iconMap[icon];
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  
  const colorClasses = {
    blue: {
      bg: 'bg-blue-600/20',
      icon: 'text-blue-400',
      border: 'border-blue-600/30',
      glow: 'glow-blue'
    },
    green: {
      bg: 'bg-green-600/20',
      icon: 'text-green-400',
      border: 'border-green-600/30',
      glow: 'glow-green'
    },
    red: {
      bg: 'bg-red-600/20',
      icon: 'text-red-400',
      border: 'border-red-600/30',
      glow: 'glow-red'
    },
    purple: {
      bg: 'bg-purple-600/20',
      icon: 'text-purple-400',
      border: 'border-purple-600/30',
      glow: 'glow-purple'
    },
    yellow: {
      bg: 'bg-yellow-600/20',
      icon: 'text-yellow-400',
      border: 'border-yellow-600/30',
      glow: 'glow-yellow'
    }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  if (isLoading) {
    return (
      <div className={`
        bg-[#121212] rounded-xl p-6 border ${currentColor.border} 
        animate-pulse
      `}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg ${currentColor.bg}`}></div>
              <div>
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      bg-[#121212] rounded-xl p-6 border ${currentColor.border} 
      hover:${currentColor.glow} hover:scale-105 
      transition-all duration-300 group cursor-pointer
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              w-12 h-12 rounded-lg ${currentColor.bg} 
              flex items-center justify-center group-hover:scale-110 transition-transform duration-300
            `}>
              {IconComponent && (
                <IconComponent className={`w-6 h-6 ${currentColor.icon}`} />
              )}
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
              <p className="text-white text-2xl font-bold">{formatted}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${trend === 'up' 
                ? 'bg-green-600/20 text-green-400' 
                : 'bg-red-600/20 text-red-400'
              }
            `}>
              <TrendIcon className="w-3 h-3" />
              {change}
            </div>
            <span className="text-gray-500 text-xs">vs last period</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMetricsCard;