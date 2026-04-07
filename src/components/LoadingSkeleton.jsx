import React from 'react';

const LoadingSkeleton = ({ rows = 5, showHeader = false }) => {
  return (
    <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl overflow-hidden">
      {showHeader && (
        <div className="p-6 border-b border-gray-800">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded-lg w-48 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded-lg w-64"></div>
          </div>
        </div>
      )}
      
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded-lg w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded-lg w-1/2"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded-lg w-16"></div>
                <div className="h-3 bg-gray-800 rounded-lg w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Card skeleton for metrics
export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded-lg w-24"></div>
              <div className="h-6 bg-gray-700 rounded-lg w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Table skeleton
export const TableSkeleton = ({ columns = 6, rows = 8, showHeader = true }) => {
  return (
    <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl overflow-hidden">
      {showHeader && (
        <>
          <div className="p-6 border-b border-gray-800">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded-lg w-48 mb-2"></div>
              <div className="h-4 bg-gray-800 rounded-lg w-64"></div>
            </div>
          </div>
          
          {/* Table Header */}
          <div className="bg-[#1A1A1A] px-6 py-4">
            <div className="flex space-x-6">
              {Array.from({ length: columns }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded-lg w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Table Body */}
      <div className="divide-y divide-gray-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex items-center space-x-6">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="animate-pulse">
                  {colIndex === 0 ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded-lg w-32"></div>
                        <div className="h-3 bg-gray-800 rounded-lg w-20"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-4 bg-gray-700 rounded-lg w-16"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;