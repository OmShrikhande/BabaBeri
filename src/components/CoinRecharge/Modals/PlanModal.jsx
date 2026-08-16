import React from 'react';
import { X } from 'lucide-react';

const PlanModal = ({
  isOpen,
  form,
  editingPlan,
  onClose,
  onChange,
  onSubmit,
  isLoading
}) => {
  if (!isOpen) return null;

  const isEditing = !!editingPlan;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-[#1A1A1A] rounded-xl p-6 w-full max-w-sm border border-gray-700 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-semibold mb-1">
          {isEditing ? 'Edit Plan' : 'Create New Plan'}
        </h3>
        {isEditing && (
          <p className="text-gray-500 text-sm mb-4">
            Editing: <span className="text-gray-300">{editingPlan.planename}</span>
          </p>
        )}
        {!isEditing && <div className="mb-4" />}

        <form onSubmit={onSubmit}>
          <div className="space-y-4">

            {/* Plan Name — read-only when editing */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">Plan Name</label>
              <input
                type="text"
                value={form.planename || ''}
                onChange={(event) => onChange({ ...form, planename: event.target.value })}
                className={`w-full border rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585] ${
                  isEditing
                    ? 'bg-[#111] border-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[#2A2A2A] border-gray-700'
                }`}
                placeholder="Enter plan name"
                disabled={isEditing}
                required={!isEditing}
              />
            </div>

            {/* Coins — read-only when editing */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">Coins</label>
              <input
                type="number"
                value={form.coins}
                onChange={(event) => onChange({ ...form, coins: event.target.value })}
                className={`w-full border rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585] ${
                  isEditing
                    ? 'bg-[#111] border-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[#2A2A2A] border-gray-700'
                }`}
                placeholder="Enter coins amount"
                disabled={isEditing}
              />
            </div>

            {/* Price — always editable */}
            <div>
              <label className="block text-gray-400 text-sm mb-1">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(event) => onChange({ ...form, price: event.target.value })}
                className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                placeholder="Enter price"
                required
              />
            </div>

            {/* Status — only shown when editing */}
            {isEditing && (
              <div>
                <label className="block text-gray-400 text-sm mb-1">Status</label>
                <select
                  value={form.status || 'Active'}
                  onChange={(event) => onChange({ ...form, status: event.target.value })}
                  className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                >
                  <option value="Active">Active</option>
                  <option value="deActive">deActive</option>
                </select>
              </div>
            )}

            {/* Description — only shown when creating */}
            {!isEditing && (
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => onChange({ ...form, description: event.target.value })}
                  className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585] resize-none"
                  rows="3"
                  placeholder="Enter description"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg hover:opacity-90 transition-all duration-300 font-medium mt-4 disabled:opacity-50"
          >
            {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Plan' : 'Create Plan')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;