import React from 'react';
import { TrendingUp, DollarSign, Gem } from 'lucide-react';

const iconMap = {
  TrendingUp, DollarSign, Gem
};

const SupporterCard = ({ title, value, icon, color = 'pink', className = '' }) => {
  const IconComponent = iconMap[icon];

  const colorClasses = {
    pink: 'from-[#F72585] to-[#ff4db8] glow-pink border-[#F72585]',
    purple: 'from-[#7209B7] to-[#9d4edd] glow-purple border-[#7209B7]',
    blue: 'from-[#4361EE] to-[#7209B7] glow-blue border-[#4361EE]',
    cyan: 'from-[#4CC9F0] to-[#4361EE] glow-cyan border-[#4CC9F0]'
  };

  return (
    <div
      className={`bg-[#1A1A1A] rounded-xl p-4 sm:p-5 border border-gray-800 hover-glow transition-all duration-300 flex flex-col justify-between ${className}`}
      role="article"
      aria-labelledby={`supporter-card-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div>
        <div className={`
          inline-flex p-2.5 rounded-lg bg-gradient-to-r ${colorClasses[color] || colorClasses.pink} mb-3
        `}>
          {IconComponent && (
            <IconComponent
              className="w-5 h-5 text-white"
              aria-hidden="true"
            />
          )}
        </div>

        <h3
          id={`supporter-card-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-gray-400 text-sm font-medium mb-1"
        >
          {title}
        </h3>
        <p className="text-white text-lg sm:text-xl font-bold leading-tight break-words" aria-live="polite">
          {value}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span className="text-green-400 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
};

export default SupporterCard;
