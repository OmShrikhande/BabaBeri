import React from 'react';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatMoney = (value) => {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString('en-IN');
};

const statusBadgeClass = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'APPROVED':
      return 'bg-green-900/20 text-green-400 border-green-500/30';
    case 'REJECTED':
      return 'bg-red-900/20 text-red-400 border-red-500/30';
    default:
      return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30';
  }
};

/**
 * Table row for a single cashout request (API fields).
 */
const CashoutRequestCard = ({
  request,
  onApprove,
  onReject,
  actionLoading = false,
}) => {
  const status = String(request?.status || 'PENDING').toUpperCase();
  const isPending = status === 'PENDING';

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{request?.id ?? '—'}</td>
      <td className="px-4 py-3 text-white text-sm font-medium whitespace-nowrap">
        {request?.usercode || '—'}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 text-white font-medium">
          <span className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center text-black text-[10px] font-bold">
            ♦
          </span>
          {formatMoney(request?.diamonds)}
        </span>
      </td>
      <td className="px-4 py-3 text-white text-sm whitespace-nowrap">
        {formatMoney(request?.cashAmount)}
      </td>
      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
        {request?.profitOrLoss != null && request.profitOrLoss !== ''
          ? formatMoney(request.profitOrLoss)
          : '—'}
      </td>
      <td className="px-4 py-3 text-gray-300 text-sm max-w-[180px] truncate" title={request?.remark || ''}>
        {request?.remark || '—'}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <span
          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadgeClass(status)}`}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-300 text-sm font-mono text-xs max-w-[200px] truncate" title={request?.transactionno || ''}>
        {request?.transactionno || '—'}
      </td>
      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{request?.role || '—'}</td>
      <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">
        {formatDateTime(request?.redeemed_request_date)}
      </td>
      <td className="px-4 py-3 text-gray-400 text-sm whitespace-nowrap">
        {formatDateTime(request?.redeemed_approve_reject_date)}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onApprove?.(request.id)}
              className="px-3 py-1.5 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {actionLoading ? '…' : 'Approve'}
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onReject?.(request.id)}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-500 disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadgeClass(status)}`}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        )}
      </td>
    </tr>
  );
};

export default CashoutRequestCard;
export { formatDateTime, formatMoney, statusBadgeClass };
