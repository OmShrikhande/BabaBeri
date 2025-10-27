import React from 'react';
import { PlusCircle, XCircle } from 'lucide-react';

const DiamondCreditModal = ({
  open,
  form,
  onFieldChange,
  onClose,
  onSubmit,
  statusOptions,
  paymentOptions,
  submitting,
  editing,
}) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
    <div
      className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    />
    <div
      className={`relative bg-[#1A1A1A] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-200 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {editing ? 'Edit Diamond Credit' : 'Add Diamond Credit'}
          </h3>
          <p className="text-xs text-gray-400">
            Capture complete transaction details for auditing and reporting
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto coin-scroll">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User Code</label>
            <input
              type="text"
              value={form.usercode}
              onChange={(e) => onFieldChange('usercode', e.target.value)}
              placeholder="Enter user code"
              className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Diamonds</label>
            <input
              type="number"
              min="0"
              value={form.diamonds}
              onChange={(e) => onFieldChange('diamonds', e.target.value)}
              placeholder="Enter diamond amount"
              className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cash Amount (₹)</label>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => onFieldChange('amount', e.target.value)}
              placeholder="Optional cash equivalent"
              className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Transaction ID</label>
            <input
              type="text"
              value={form.transactionId}
              onChange={(e) => onFieldChange('transactionId', e.target.value)}
              placeholder="Optional transaction reference"
              className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => onFieldChange('paymentMethod', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#F72585]"
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#121212] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => onFieldChange('status', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#F72585]"
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#121212] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
          <textarea
            rows="3"
            value={form.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            placeholder="Optional additional information or remarks"
            className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] resize-none"
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-sm font-semibold hover:glow-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {submitting ? 'Saving...' : editing ? 'Update Credit' : 'Add Credit'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default DiamondCreditModal;
