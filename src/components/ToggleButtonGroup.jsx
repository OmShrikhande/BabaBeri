import React from 'react';
import { Users, Heart } from 'lucide-react';

const iconMap = {
  Users,
  Heart
};

const ToggleButtonGroup = ({ options, activeOption, onToggle, className = "" }) => {
  return (
    <div className={`flex bg-[#1A1A1A] rounded-lg p-1 border border-gray-700 ${className}`}>
      {options.map((option) => {
        const IconComponent = iconMap[option.icon];
        const isActive = activeOption === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 flex-1 justify-center
              ${isActive 
                ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg glow-pink' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
            `}
          >
            {IconComponent && (
              <IconComponent className="w-4 h-4" />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ToggleButtonGroup;