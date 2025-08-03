import React, { useState } from 'react';
import { X, ArrowRight, Search, ChevronDown } from 'lucide-react';

const EntityMovementModal = ({ 
  isOpen, 
  onClose, 
  entityType, 
  entityData, 
  availableTargets, 
  onMove 
}) => {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const filteredTargets = availableTargets.filter(target =>
    target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    target.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMove = async () => {
    if (!selectedTarget) return;
    
    setIsLoading(true);
    try {
      await onMove(entityData.id, selectedTarget);
      onClose();
    } catch (error) {
      console.error('Error moving entity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityTypeLabel = () => {
    switch (entityType) {
      case 'masterAgency':
        return 'Master Agency';
      case 'agency':
        return 'Agency';
      case 'host':
        return 'Host';
      default:
        return 'Entity';
    }
  };

  const getTargetTypeLabel = () => {
    switch (entityType) {
      case 'masterAgency':
        return 'Sub Admin';
      case 'agency':
        return 'Master Agency';
      case 'host':
        return 'Agency';
      default:
        return 'Target';
    }
  };

  const selectedTargetData = availableTargets.find(t => t.id === selectedTarget);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Move {getEntityTypeLabel()}</h2>
            <p className="text-gray-400 text-sm mt-1">
              Move "{entityData.name}" to a different {getTargetTypeLabel().toLowerCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Assignment */}
          <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800">
            <h3 className="text-white font-semibold mb-2">Current Assignment</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {entityData.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-white font-medium">{entityData.name}</div>
                <div className="text-gray-400 text-sm">
                  ID: {entityData.id} • Currently under: {entityData.currentParent || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Target Selection */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Select New {getTargetTypeLabel()}</h3>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${getTargetTypeLabel().toLowerCase()}s...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
              />
            </div>

            {/* Target Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-left text-white flex items-center justify-between hover:border-gray-600 focus:outline-none focus:border-[#F72585] transition-colors"
              >
                <span>
                  {selectedTargetData ? selectedTargetData.name : `Select ${getTargetTypeLabel()}`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#2A2A2A] border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {filteredTargets.length === 0 ? (
                    <div className="px-4 py-3 text-gray-400 text-center">
                      No {getTargetTypeLabel().toLowerCase()}s found
                    </div>
                  ) : (
                    filteredTargets.map((target) => (
                      <button
                        key={target.id}
                        onClick={() => {
                          setSelectedTarget(target.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">
                            {target.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{target.name}</div>
                          <div className="text-gray-400 text-sm">
                            ID: {target.id}
                            {target.count && ` • ${target.count} ${entityType === 'masterAgency' ? 'master agencies' : entityType === 'agency' ? 'agencies' : 'hosts'}`}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Movement Preview */}
          {selectedTargetData && (
            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800">
              <h3 className="text-white font-semibold mb-3">Movement Preview</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {entityData.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-white text-sm">{entityData.name}</span>
                </div>
                
                <ArrowRight className="w-5 h-5 text-[#F72585]" />
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {selectedTargetData.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-white text-sm">{selectedTargetData.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={!selectedTarget || isLoading}
            className="px-6 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Moving...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Move {getEntityTypeLabel()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntityMovementModal;