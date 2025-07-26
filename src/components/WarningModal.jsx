import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { violationTypes } from '../data/liveMonitoringData';

const WarningModal = ({ user, onClose, onSendWarning }) => {
  const [selectedViolation, setSelectedViolation] = useState('');

  const handleSendWarning = () => {
    if (selectedViolation) {
      onSendWarning(selectedViolation);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#121212] rounded-lg border border-gray-700 w-full max-w-md modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Send Warning</h2>
              <p className="text-gray-400 text-sm">Select violation type</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={user.thumbnail}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=F72585&color=fff&size=48`;
                }}
              />
              <div>
                <h3 className="text-white font-semibold">{user.username}</h3>
                <p className="text-gray-400 text-sm">{user.viewerCount} viewers • {user.diamondCount} diamonds</p>
              </div>
            </div>
          </div>

          {/* Violation Types */}
          <div className="space-y-3 mb-6">
            <h3 className="text-white font-medium mb-3">Select Violation Type:</h3>
            {violationTypes.map((violation) => (
              <label
                key={violation.id}
                className={`
                  flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${selectedViolation === violation.id
                    ? 'border-[#F72585] bg-gradient-to-r from-[#F72585]/10 to-[#7209B7]/10 glow-pink'
                    : 'border-gray-700 hover:border-gray-600 hover:bg-[#1A1A1A]'
                  }
                `}
              >
                <input
                  type="radio"
                  name="violation"
                  value={violation.id}
                  checked={selectedViolation === violation.id}
                  onChange={(e) => setSelectedViolation(e.target.value)}
                  className="mt-1 w-4 h-4 text-[#F72585] bg-gray-700 border-gray-600 focus:ring-[#F72585] focus:ring-2"
                />
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 ${
                    selectedViolation === violation.id ? 'text-[#F72585]' : 'text-white'
                  }`}>
                    {violation.label}
                  </h4>
                  <p className="text-gray-400 text-sm">{violation.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Warning Message Preview */}
          {selectedViolation && (
            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4 mb-6">
              <h4 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warning Preview
              </h4>
              <p className="text-gray-300 text-sm">
                "You have been warned for {violationTypes.find(v => v.id === selectedViolation)?.label.toLowerCase()}. 
                Please follow community guidelines to avoid further action."
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendWarning}
            disabled={!selectedViolation}
            className={`
              px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2
              ${selectedViolation
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white hover:glow-pink'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-4 h-4" />
            Send Warning
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;