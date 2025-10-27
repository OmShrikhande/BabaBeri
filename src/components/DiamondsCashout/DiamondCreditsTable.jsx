import React, { useMemo } from 'react';
import { CircleDollarSign, Clock, PlusCircle, Edit2, Trash2, ClipboardList } from 'lucide-react';

const DiamondCreditsTable = ({
  diamondCredits,
  loadingCredits,
  deletingCreditId,
  formattedLastUpdated,
  onAddClick,
  onEditClick,
  onDeleteClick
}) => {
  const creditStatusBadgeClass = (status = '') => {
    const normalized = status.toUpperCase();
    switch (normalized) {
      case 'CREDIT':
        return 'bg-green-900/20 text-green-400 border border-green-500/30';
      case 'DEBIT':
        return 'bg-red-900/20 text-red-400 border border-red-500/30';
      case 'PENDING':
        return 'bg-yellow-900/20 text-yellow-300 border border-yellow-500/30';
      default:
        return 'bg-gray-800 text-gray-300 border border-gray-600/40';
    }
  };

  const CRUDTableEmptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <ClipboardList className="w-10 h-10 mb-3" />
      <p className="text-sm font-medium">No credit records yet</p>
      <p className="text-xs">Use the "Add Credit" button to create a new entry</p>
    </div>
  ), []);

  return (
    <div className="bg-[#121212] rounded-lg border border-gray-700">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <CircleDollarSign className="w-5 h-5 text-[#F72585]" />
            <span>Diamond Credits</span>
          </h3>
          <p className="text-xs text-gray-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last updated: {formattedLastUpdated}</span>
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-sm font-semibold hover:glow-pink transition-all duration-300"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Credit
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#1A1A1A] text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-medium">User Code</th>
              <th className="px-6 py-3 text-left font-medium">Diamonds</th>
              <th className="px-6 py-3 text-left font-medium">Amount (₹)</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">Transaction ID</th>
              <th className="px-6 py-3 text-left font-medium">Payment Method</th>
              <th className="px-6 py-3 text-left font-medium">Created At</th>
              <th className="px-6 py-3 text-left font-medium">Notes</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-300">
            {loadingCredits ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                  Loading diamond credits...
                </td>
              </tr>
            ) : diamondCredits.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-10">
                  {CRUDTableEmptyState}
                </td>
              </tr>
            ) : (
              diamondCredits.map((credit) => {
                const createdAt = credit.createdAt ? new Date(credit.createdAt).toLocaleString() : 'N/A';
                return (
                  <tr key={credit.id} className="hover:bg-[#1D1D1D] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{credit.usercode || 'N/A'}</td>
                    <td className="px-6 py-4 text-white">{credit.diamonds?.toLocaleString?.() ?? credit.diamonds ?? 0}</td>
                    <td className="px-6 py-4">
                      {credit.amount ? `₹${Number(credit.amount).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${creditStatusBadgeClass(credit.status)}`}>
                        {credit.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {credit.transactionId || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 uppercase">
                      {credit.paymentMethod || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {createdAt}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {credit.notes || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => onEditClick(credit)}
                          className="p-2 rounded-full bg-[#1F1F1F] text-gray-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(credit.id)}
                          className="p-2 rounded-full bg-[#1F1F1F] text-gray-400 hover:text-red-400"
                          disabled={deletingCreditId === credit.id}
                          title="Delete"
                        >
                          {deletingCreditId === credit.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiamondCreditsTable;
