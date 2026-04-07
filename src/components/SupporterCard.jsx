import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

const iconMap = {
  TrendingUp, DollarSign
};

const SupporterCard = ({ title, value, icon, color = 'pink' }) => {
  const IconComponent = iconMap[icon];
  
  const colorClasses = {
    pink: 'from-[#F72585] to-[#ff4db8] glow-pink border-[#F72585]',
    purple: 'from-[#7209B7] to-[#9d4edd] glow-purple border-[#7209B7]',
    blue: 'from-[#4361EE] to-[#7209B7] glow-blue border-[#4361EE]',
    cyan: 'from-[#4CC9F0] to-[#4361EE] glow-cyan border-[#4CC9F0]'
  };

  return (
    <div 
      className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 hover-glow transition-all duration-300"
      role="article"
      aria-labelledby={`supporter-card-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Icon */}
      <div className={`
        inline-flex p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} mb-4
      `}>
        {IconComponent && (
          <IconComponent 
            className="w-6 h-6 text-white" 
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content */}
      <div>
        <h3 
          id={`supporter-card-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-gray-400 text-sm font-medium mb-2"
        >
          {title}
        </h3>
        <p className="text-white text-xl font-bold" aria-live="polite">
          {value}
        </p>
      </div>

      {/* Progress indicator or additional info */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="text-green-400 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
};

export default SupporterCard;