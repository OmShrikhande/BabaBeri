import React, { useState } from 'react';
import { Plus, Coins, Edit, Star, Trash2 } from 'lucide-react';

const PlansTab = ({ plans = [], loading, error, onOpenModal, onEditPlan, onDeletePlan }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.planename}"? This cannot be undone.`)) return;
    setDeletingId(plan.id);
    try {
      await onDeletePlan?.(plan.id);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700 animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-3/4 mb-3" />
            <div className="h-3 bg-gray-800 rounded w-1/4 mb-6" />
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-6" />
            <div className="h-9 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-400 font-medium mb-1">Failed to load plans</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400 text-sm">{plans.length} plan{plans.length !== 1 ? 's' : ''} available</p>
        <button
          onClick={onOpenModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 text-sm font-semibold"
        >
          <Plus size={16} />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Empty state */}
      {plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Coins className="text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 font-medium mb-1">No plans yet</p>
          <p className="text-gray-600 text-sm">Click "Create Plan" to add your first recharge plan.</p>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-700 hover:border-[#F72585]/60 transition-colors relative flex flex-col"
          >
            {/* Special Offer Badge */}
            {plan.specialoffer === 'true' && (
              <div className="absolute top-3 right-3 flex items-center space-x-1 bg-gradient-to-r from-[#F72585] to-[#7209B7] px-2 py-1 rounded-full text-xs font-semibold text-white">
                <Star size={10} />
                <span>Special</span>
              </div>
            )}

            {/* Plan Name & Status */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-2 pr-16">{plan.planename}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                plan.status === 'Active'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {plan.status}
              </span>
            </div>

            {/* Coins & Price */}
            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-center space-x-2">
                <Coins className="text-[#F72585] flex-shrink-0" size={18} />
                <span className="text-white font-semibold">
                  {plan.coins ? `${plan.coins.toLocaleString()} Coins` : 'No Coins'}
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#F72585]">₹{plan.planprice}</span>
              </div>
              {plan.discription && (
                <p className="text-gray-400 text-sm leading-relaxed">{plan.discription}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onEditPlan?.(plan)}
                className="flex-1 py-2 bg-[#F72585]/10 border border-[#F72585]/40 text-[#F72585] rounded-lg hover:bg-[#F72585]/20 transition-colors flex items-center justify-center space-x-1.5 text-sm font-medium"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(plan)}
                disabled={deletingId === plan.id}
                className="flex-1 py-2 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center space-x-1.5 text-sm font-medium disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>{deletingId === plan.id ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansTab;