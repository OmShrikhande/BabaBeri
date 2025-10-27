import React from 'react';

const CashoutRequestsSection = ({
  cashoutRequests,
  loadingRequests,
  error,
  onApprove,
  onReject
}) => {
  return (
    <div className="bg-[#1A1A1A] rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">Cashout Requests</h3>
          <div className="w-6 h-6 bg-[#F72585] rounded-full flex items-center justify-center glow-pink">
            <span className="text-white text-xs font-bold">{cashoutRequests.filter(r => r.status === 'pending').length}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto coin-scroll">
        {loadingRequests ? (
          <div className="text-center py-4 text-gray-400">Loading cashout requests...</div>
        ) : cashoutRequests.length > 0 ? (
          cashoutRequests.map((request) => {
            if (!request || typeof request !== 'object') {
              return null;
            }
            
            const user = request.user || {};
            const avatar = user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
            const name = user.name || 'Unknown User';
            const time = user.time || 'Unknown time';
            const amount = request.amount || 0;
            const status = request.status || 'pending';
            
            return (
              <div key={request.id || Math.random()} className="space-y-3 p-3 bg-[#121212] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-300">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-10 h-10 rounded-full border border-gray-600 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-[#121212]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">{name}</h4>
                    <p className="text-gray-400 text-xs">{time}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">♦</span>
                    </div>
                    <span className="text-white font-bold text-sm">{amount.toLocaleString()}</span>
                  </div>
                </div>
                
                {status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onApprove(request.id)}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-xs font-medium hover:glow-pink transition-all duration-300 transform hover:scale-105"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(request.id)}
                      className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors transform hover:scale-105"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                {status === 'approved' && (
                  <div className="text-center py-2 px-3 bg-green-900/20 text-green-400 rounded-lg text-xs font-medium border border-green-500/30">
                    Approved
                  </div>
                )}
                
                {status === 'rejected' && (
                  <div className="text-center py-2 px-3 bg-red-900/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/30">
                    Rejected
                  </div>
                )}
              </div>
            );
          }).filter(Boolean)
        ) : (
          <div className="text-center py-4 text-gray-400">
            {error ? `Error: ${error}` : 'No pending cashout requests found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashoutRequestsSection;
