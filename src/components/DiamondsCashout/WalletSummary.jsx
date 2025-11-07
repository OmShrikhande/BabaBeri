import React, { useMemo } from 'react';
import { Wallet, PlusCircle, XCircle, PlusCircle as AddIcon } from 'lucide-react';

const WalletSummary = ({ walletSummary, loadingWallet, onAddCredit }) => {
  const walletCards = useMemo(() => {
    return [
      {
        id: 'current-balance',
        label: 'Current Balance',
        value: walletSummary.currentBalance,
        icon: Wallet,
        accent: 'from-[#F72585] to-[#7209B7]'
      },
      {
        id: 'total-credited',
        label: 'Total Credited',
        value: walletSummary.totalCredited,
        icon: PlusCircle,
        accent: 'from-[#4CC9F0] to-[#4361EE]'
      },
      {
        id: 'total-debited',
        label: 'Total Debited',
        value: walletSummary.totalDebited,
        icon: XCircle,
        accent: 'from-[#FF7E67] to-[#F36F6F]'
      }
    ];
  }, [walletSummary]);

  return (
    <div className="space-y-4">
      <div className="bg-[#1A1A1A] rounded-lg border border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Admin Wallet</h2>
            <p className="text-sm text-gray-400">Monitor and manage all diamond credits in real-time</p>
          </div>
          <button
            onClick={onAddCredit}
            className="hidden md:inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-sm font-semibold hover:glow-pink transition-all duration-300"
          >
            <AddIcon className="w-4 h-4 mr-2" />
            Add Credit
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {walletCards.map(card => (
            <div
              key={card.id}
              className="relative overflow-hidden bg-[#121212] rounded-xl border border-gray-700 p-5 shadow-lg hover:border-gray-600 transition-colors"
            >
              <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${card.accent}`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {loadingWallet ? (
                      <span className="text-sm text-gray-500">Loading...</span>
                    ) : (
                      card.value?.toLocaleString?.() ?? card.value ?? 0
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletSummary;
