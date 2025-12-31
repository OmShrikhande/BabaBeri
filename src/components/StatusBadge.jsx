import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          text: 'Pending',
          bgColor: 'bg-yellow-700/20',
          textColor: 'text-yellow-400',
          borderColor: 'border-yellow-700/50',
          icon: Clock,
          glowClass: 'shadow-yellow-500/25'
        };
      case 'accepted':
        return {
          text: 'Accepted',
          bgColor: 'bg-green-700/20',
          textColor: 'text-green-400',
          borderColor: 'border-green-700/50',
          icon: CheckCircle,
          glowClass: 'shadow-green-500/25'
        };
      case 'rejected':
        return {
          text: 'Rejected',
          bgColor: 'bg-red-700/20',
          textColor: 'text-red-400',
          borderColor: 'border-red-700/50',
          icon: XCircle,
          glowClass: 'shadow-red-500/25'
        };
      default:
        return {
          text: 'Pending',
          bgColor: 'bg-gray-700/20',
          textColor: 'text-gray-400',
          borderColor: 'border-gray-700/50',
          icon: Clock,
          glowClass: 'shadow-gray-500/25'
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        transition-all duration-200 hover:shadow-lg ${config.glowClass}
      `}
      role="status"
      aria-label={`Status: ${config.text}`}
    >
      <IconComponent className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{config.text}</span>
    </div>
  );
};

export default StatusBadge;