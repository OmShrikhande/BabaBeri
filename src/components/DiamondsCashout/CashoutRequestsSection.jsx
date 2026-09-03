import React from 'react';
import CashoutRequestCard, { formatDateTime, formatMoney, statusBadgeClass } from '../CashoutRequestCard';
import { MobileDataCard, MobileCardRow } from '../common/ResponsiveUI';

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
    <div className="w-full bg-black/90 rounded-xl border border-gray-800 shadow-md">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-3">
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

      <div className="w-full responsive-table-scroll">
        {loadingRequests ? (
          <div className="text-center py-10 text-gray-400">Loading cashout requests...</div>
        ) : cashoutRequests.length > 0 ? (
          <>
            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-700">
              {cashoutRequests.map((request) => {
                if (!request || typeof request !== 'object') return null;
                const status = String(request?.status || 'PENDING').toUpperCase();
                const isPending = status === 'PENDING';
                const loading = actionLoadingId === request.id;
                return (
                  <MobileDataCard key={request.id ?? request.transactionno}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="text-white font-medium">{request.usercode || '—'}</p>
                        <p className="text-gray-500 text-xs font-mono truncate">{request.transactionno || '—'}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border shrink-0 ${statusBadgeClass(status)}`}>
                        {status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <MobileCardRow label="Diamonds" value={formatMoney(request.diamonds)} />
                      <MobileCardRow label="Cash" value={formatMoney(request.cashAmount)} />
                      <MobileCardRow label="Role" value={request.role || '—'} />
                      <MobileCardRow label="Date" value={formatDateTime(request.redeemed_request_date)} />
                    </div>
                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => onApprove?.(request.id)}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-xs font-medium disabled:opacity-50"
                        >
                          {loading ? '…' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => onReject?.(request.id)}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </MobileDataCard>
                );
              })}
            </div>

            {/* Desktop table */}
            <table className="hidden lg:table w-full min-w-[1100px] border-collapse">
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
          </>
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
