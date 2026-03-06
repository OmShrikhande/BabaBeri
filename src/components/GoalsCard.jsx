import React from 'react';

const GoalsCard = ({ title, metrics, icon: Icon }) => {
  return (
    <div className="bg-[#121212] rounded-xl border border-gray-800 p-6">
      {title && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]">
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-white text-lg font-semibold">{title}</h3>
            <p className="text-gray-400 text-sm">Current Progress</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const percent = metric.target > 0 ? Math.min((metric.current / metric.target) * 100, 100) : 0;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{metric.label}</span>
                <span className="text-white text-sm font-medium">
                  {metric.current} / {metric.target}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${metric.color || 'bg-gradient-to-r from-[#F72585] to-[#7209B7]'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{percent.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsCard;
