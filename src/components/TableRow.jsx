import React from 'react';
import { Check, X, Minus } from 'lucide-react';
import StatusBadge from './StatusBadge';

const TableRow = ({ host, onStatusChange }) => {
  const handleApprove = () => {
    onStatusChange(host.id, 'accepted');
  };

  const handleReject = () => {
    onStatusChange(host.id, 'rejected');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderActionButtons = () => {
    if (host.status === 'pending') {
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={handleApprove}
            className="
              p-1.5 rounded-md bg-green-700 hover:bg-green-600 text-white 
              transition-all duration-200 hover:scale-105 hover:shadow-md 
              hover:shadow-green-500/25 focus:outline-none focus:ring-2 
              focus:ring-green-500 focus:ring-opacity-50
            "
            aria-label={`Approve ${host.name}`}
            title="Approve host"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReject}
            className="
              p-1.5 rounded-md bg-red-700 hover:bg-red-600 text-white 
              transition-all duration-200 hover:scale-105 hover:shadow-md 
              hover:shadow-red-500/25 focus:outline-none focus:ring-2 
              focus:ring-red-500 focus:ring-opacity-50
            "
            aria-label={`Reject ${host.name}`}
            title="Reject host"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <Minus className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
        <span className="sr-only">No action available</span>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 py-3 px-4 hover:bg-gray-800/30 transition-colors duration-200 compact-row">
        {/* Host Name with Avatar */}
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={host.avatar}
              alt={`${host.name}'s avatar`}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-700"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F72585] to-[#7209B7] items-center justify-center text-white font-semibold text-xs hidden">
              {host.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-200 font-medium text-sm force-truncate">{host.name}</p>
            <p className="text-gray-400 text-xs force-truncate">{host.email}</p>
          </div>
        </div>

        {/* Host ID */}
        <div className="col-span-2 flex items-center">
          <span className="text-gray-300 font-mono text-sm">#{host.hostId}</span>
        </div>

        {/* Status */}
        <div className="col-span-2 flex items-center">
          <StatusBadge status={host.status} />
        </div>

        {/* Join Date */}
        <div className="col-span-2 flex items-center">
          <span className="text-gray-400 text-sm">{formatDate(host.joinDate)}</span>
        </div>

        {/* Actions */}
        <div className="col-span-2 flex items-center">
          {renderActionButtons()}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden py-3 px-4 hover:bg-gray-800/30 transition-colors duration-200 compact-row">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={host.avatar}
              alt={`${host.name}'s avatar`}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-700"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F72585] to-[#7209B7] items-center justify-center text-white font-semibold text-sm hidden">
              {host.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="min-w-0 flex-1">
                <h4 className="text-gray-200 font-medium text-sm force-truncate">{host.name}</h4>
                <p className="text-gray-400 text-xs force-truncate">{host.email}</p>
              </div>
              <StatusBadge status={host.status} />
            </div>

            <div className="flex items-center justify-between text-xs mb-2">
              <div>
                <span className="text-gray-500">ID: </span>
                <span className="text-gray-300 font-mono">#{host.hostId}</span>
              </div>
              <div>
                <span className="text-gray-500">Joined: </span>
                <span className="text-gray-400">{formatDate(host.joinDate)}</span>
              </div>
            </div>

            {/* Actions for mobile */}
            <div className="flex justify-end">
              {renderActionButtons()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableRow;