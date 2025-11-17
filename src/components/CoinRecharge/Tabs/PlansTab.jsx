import React from 'react';
import { Plus, Coins } from 'lucide-react';

const PlansTab = ({ plans, onOpenModal }) => (
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
          className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700 hover:border-[#F72585] transition-colors"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Coins className="text-[#F72585]" size={24} />
            <span className="text-2xl font-bold">{plan.coins}</span>
          </div>
          <p className="text-[#F72585] font-semibold">
            Price: ${plan.price}
          </p>
          <button className="w-full mt-4 py-2 bg-[#F72585] text-white rounded-lg hover:bg-opacity-90 transition-colors">
            Buy Now
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default PlansTab;