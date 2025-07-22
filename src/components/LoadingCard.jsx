import React from 'react';

const LoadingCard = ({ className = '' }) => {
  return (
    <div 
      className={`
        bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 animate-pulse
        ${className}
      `}
      role="status"
      aria-label="Loading content"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
          <div className="h-8 bg-gray-700 rounded mb-1 w-1/2"></div>
        </div>
        
        <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
      </div>
      
      <div className="flex items-center mt-3">
        <div className="h-4 bg-gray-700 rounded w-16"></div>
        <div className="h-4 bg-gray-700 rounded ml-2 w-20"></div>
      </div>
    </div>
  );
};

export default LoadingCard;