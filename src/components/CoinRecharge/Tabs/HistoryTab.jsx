import React from 'react';

const HistoryTab = ({ history }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Recharge History</h2>
    </div>
    <div className="space-y-4">
      {history.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-lg border border-gray-700 p-4">
          <p className="text-gray-400 text-sm">No history records found</p>
        </div>
      ) : (
        history.map((item, idx) => (
          <div key={idx} className="bg-[#1A1A1A] rounded-lg border border-gray-700 p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Host: <span className="text-white">{item.hostName || item.hostId || item.host || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Coins: <span className="text-white">{item.coins || item.amount || item.amt || 'N/A'}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  Status: <span className="text-white">{item.status || '—'}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Date: <span className="text-white">{item.createdAt || item.date || item.timestamp || '—'}</span>
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default HistoryTab;