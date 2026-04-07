import React from 'react';

const CashoutRequestCard = ({ request, onApprove, onReject }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-900/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-3 p-4 bg-[#121212] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={request.user.avatar}
            alt={request.user.name}
            className="w-10 h-10 rounded-full border border-gray-600 object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-[#121212]"></div>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm">{request.user.name}</h4>
          <p className="text-gray-400 text-xs">{request.user.time}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-black text-xs font-bold">♦</span>
          </div>
          <span className="text-white font-bold">{request.amount.toLocaleString()}</span>
        </div>
      </div>
      
      {request.status === 'pending' && (
        <div className="flex space-x-2">
          <button
            onClick={() => onApprove(request.id)}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-sm font-medium hover:glow-pink transition-all duration-300 transform hover:scale-105"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors transform hover:scale-105"
          >
            Reject
          </button>
        </div>
      )}
      
      {request.status !== 'pending' && (
        <div className={`text-center py-2 px-3 rounded-lg text-sm font-medium border ${getStatusColor(request.status)}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </div>
      )}
    </div>
  );
};

export default CashoutRequestCard;