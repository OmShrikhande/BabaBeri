import React from 'react';
import { Minus } from 'lucide-react';

const OfferModal = ({
  isOpen,
  form,
  onClose,
  onChange,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-sm border border-gray-700 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <Minus size={24} />
        </button>
        <h3 className="text-xl font-semibold mb-4">Create New Offer</h3>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1">Coins</label>
              <input
                type="number"
                value={form.coins}
                onChange={(event) => onChange({ ...form, coins: event.target.value })}
                className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                placeholder="Enter coins amount"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Original Price</label>
              <input
                type="number"
                step="0.01"
                value={form.originalPrice}
                onChange={(event) => onChange({ ...form, originalPrice: event.target.value })}
                className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                placeholder="Enter original price"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Discounted Price</label>
              <input
                type="number"
                step="0.01"
                value={form.discountedPrice}
                onChange={(event) => onChange({ ...form, discountedPrice: event.target.value })}
                className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                placeholder="Enter discounted price"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => onChange({ ...form, description: event.target.value })}
                className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585] resize-none"
                rows="3"
                placeholder="Enter offer description"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg hover:glow-pink transition-all duration-300 font-medium mt-6"
          >
            Create Offer
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;