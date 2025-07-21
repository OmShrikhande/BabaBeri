import React from 'react';
import { 
  Users, Building, UserCheck, Coins, Gem, Activity, Mic, DollarSign 
} from 'lucide-react';

const iconMap = {
  Users, Building, UserCheck, Coins, Gem, Activity, Mic, DollarSign
};

const MetricsCard = ({ title, value, icon, color = 'pink', className = '' }) => {
  const IconComponent = iconMap[icon];
  
  const colorClasses = {
    pink: 'from-[#F72585] to-[#ff4db8] glow-pink',
    purple: 'from-[#7209B7] to-[#9d4edd] glow-purple',
    blue: 'from-[#4361EE] to-[#7209B7] glow-blue',
    cyan: 'from-[#4CC9F0] to-[#4361EE] glow-cyan'
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
    }
    return val.toLocaleString();
  };

  return (
    <div 
      className={`
        bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 
        hover-glow transition-all duration-300 cursor-pointer
        ${className}
      `}
      role="article"
      aria-labelledby={`card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p 
            id={`card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-gray-400 text-sm font-medium mb-2"
          >
            {title}
          </p>
          <p className="text-white text-2xl font-bold mb-1" aria-live="polite">
            {formatValue(value)}
          </p>
        </div>
        
        {IconComponent && (
          <div className={`
            p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}
          `}>
            <IconComponent 
              className="w-6 h-6 text-white" 
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      
      {/* Optional trend indicator */}
      <div className="flex items-center mt-3 text-sm">
        <span className="text-green-400 font-medium">+12.5%</span>
        <span className="text-gray-500 ml-1">vs last period</span>
      </div>
    </div>
  );
};

export default MetricsCard;