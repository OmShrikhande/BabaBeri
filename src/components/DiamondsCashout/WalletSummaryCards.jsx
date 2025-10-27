import React from 'react';

const WalletSummaryCards = ({ cards, loading }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {cards.map((card) => (
      <div
        key={card.id}
        className="relative overflow-hidden bg-[#121212] rounded-xl border border-gray-700 p-5 shadow-lg hover:border-gray-600 transition-colors"
      >
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${card.accent}`} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-white">
              {loading ? (
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
);

export default WalletSummaryCards;
