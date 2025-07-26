import React from 'react';
import { Users, Heart } from 'lucide-react';

const iconMap = {
  Users,
  Heart
};

const ToggleButtonGroup = ({ options, activeOption, onToggle, className = "" }) => {
  const handleKeyDown = (event, optionId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(optionId);
    }
  };

  return (
    <div 
      className={`flex bg-[#1A1A1A] rounded-lg p-1 border border-gray-700 ${className}`}
      role="tablist"
      aria-label="Ranking type selection"
    >
      {options.map((option) => {
        const IconComponent = iconMap[option.icon];
        const isActive = activeOption === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            onKeyDown={(e) => handleKeyDown(e, option.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${option.id}-panel`}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 flex-1 justify-center focus:outline-none focus:ring-2 focus:ring-[#F72585]/50
              ${isActive 
                ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg glow-pink' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
            `}
          >
            {IconComponent && (
              <IconComponent className="w-4 h-4" aria-hidden="true" />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ToggleButtonGroup;