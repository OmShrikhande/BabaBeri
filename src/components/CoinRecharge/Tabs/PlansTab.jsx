import React, { useState, useEffect } from 'react';
import { Plus, Coins, Edit, Star } from 'lucide-react';
import authService from '../../../services/services';

const PlansTab = ({ onOpenModal, onEditPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const result = await authService.getAllPlans();
        if (result.success) {
          setPlans(result.data || []);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch plans');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-white">Loading plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold"></h2>
      <button
        onClick={onOpenModal}
        className="flex items-center space-x-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] px-4 py-2 rounded-lg hover:glow-pink transition-all duration-300"
      >
        <Plus size={18} />
        <span>Create Plan</span>
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700 hover:border-[#F72585] transition-colors relative"
        >
          {/* Special Offer Badge */}
          {plan.specialoffer === "true" && (
            <div className="absolute top-3 right-3 flex items-center space-x-1 bg-gradient-to-r from-[#F72585] to-[#7209B7] px-2 py-1 rounded-full text-xs font-semibold text-white">
              <Star size={12} />
              <span>Special</span>
            </div>
          )}

          {/* Plan Name */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-1">{plan.planename}</h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              plan.status === 'Active'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {plan.status}
            </div>
          </div>

          {/* Coins and Price */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="text-[#F72585]" size={20} />
                <span className="text-lg font-semibold text-white">
                  {plan.coins ? `${plan.coins} Coins` : 'No Coins'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#F72585] font-semibold text-lg">
                ${plan.planprice}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              {plan.discription}
            </p>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => onEditPlan && onEditPlan(plan)}
            className="w-full mt-4 py-2 bg-[#F72585] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit Plan</span>
          </button>
        </div>
      ))}
    </div>
  </div>
  );
};

export default PlansTab;