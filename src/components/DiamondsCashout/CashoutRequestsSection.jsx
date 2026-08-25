import React from 'react';
import CashoutRequestCard from '../CashoutRequestCard';

const TABLE_HEADERS = [
  'ID',
  'User Code',
  'Diamonds',
  'Cash Amount',
  'Profit / Loss',
  'Remark',
  'Status',
  'Transaction No',
  'Role',
  'Request Date',
  'Approve / Reject Date',
  'Actions',
];

const CashoutRequestsSection = ({
  cashoutRequests,
  loadingRequests,
  error,
  onApprove,
  onReject,
  actionLoadingId = null,
}) => {
  const pendingCount = cashoutRequests.filter(
    (r) => String(r.status || '').toUpperCase() === 'PENDING',
  ).length;

  return (
    <div className="w-full bg-[#1A1A1A] rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">Cashout Requests</h3>
          <div className="w-6 h-6 bg-[#F72585] rounded-full flex items-center justify-center glow-pink">
            <span className="text-white text-xs font-bold">{pendingCount}</span>
          </div>
        </div>
        <p className="text-gray-500 text-xs hidden sm:block">
          Pending requests from hosts
        </p>
      </div>

      <div className="w-full overflow-x-auto coin-scroll">
        {loadingRequests ? (
          <div className="text-center py-10 text-gray-400">Loading cashout requests...</div>
        ) : cashoutRequests.length > 0 ? (
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-[#121212] border-b border-gray-700">
                {TABLE_HEADERS.map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cashoutRequests.map((request) => {
                if (!request || typeof request !== 'object') return null;
                return (
                  <CashoutRequestCard
                    key={request.id ?? request.transactionno}
                    request={request}
                    onApprove={onApprove}
                    onReject={onReject}
                    actionLoading={actionLoadingId === request.id}
                  />
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-400">
            {error ? `Error: ${error}` : 'No pending cashout requests found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashoutRequestsSection;
