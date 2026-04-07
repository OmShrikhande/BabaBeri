import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Search, ChevronDown } from 'lucide-react';
import { subAdminsData } from '../data/subAdminsData';
import { agenciesData } from '../data/agencyData';

const EntityMovementModal = ({ 
  isOpen, 
  onClose, 
  entityType, 
  entityData, 
  availableTargets, 
  onMove,
  currentUserType = 'admin' // Add current user type for role-based permissions
}) => {
  // Multi-level selection states for complex movements
  const [selectedSubAdmin, setSelectedSubAdmin] = useState('');
  const [selectedMasterAgency, setSelectedMasterAgency] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Available options for each level
  const [availableSubAdmins, setAvailableSubAdmins] = useState([]);
  const [availableMasterAgencies, setAvailableMasterAgencies] = useState([]);
  const [availableAgencies, setAvailableAgencies] = useState([]);

  if (!isOpen) return null;

  // Initialize available options based on entity type and user role
  useEffect(() => {
    if (isOpen) {
      initializeAvailableOptions();
    }
  }, [isOpen, entityType, currentUserType]);

  // Reset selections when entity type changes
  useEffect(() => {
    resetSelections();
  }, [entityType]);

  const resetSelections = () => {
    setSelectedSubAdmin('');
    setSelectedMasterAgency('');
    setSelectedAgency('');
    setSelectedTarget('');
    setSearchTerm('');
  };

  const initializeAvailableOptions = () => {
    // Get all sub admins
    setAvailableSubAdmins(subAdminsData.map(subAdmin => ({
      id: subAdmin.id,
      name: subAdmin.name,
      count: subAdmin.masterAgenciesCount || 0
    })));

    // Initialize other options based on entity type
    if (entityType === 'masterAgency') {
      // Master Agency can move to any Sub Admin - simple selection
      setAvailableMasterAgencies([]);
      setAvailableAgencies([]);
    }
  };

  // Update available master agencies when sub admin is selected
  useEffect(() => {
    if (selectedSubAdmin && (entityType === 'host' || entityType === 'agency')) {
      const subAdmin = subAdminsData.find(sa => sa.id === parseInt(selectedSubAdmin));
      if (subAdmin && subAdmin.masterAgencies) {
        setAvailableMasterAgencies(subAdmin.masterAgencies.map(ma => ({
          id: ma.id,
          name: ma.name,
          agencyId: ma.agencyId,
          count: ma.totalAgency || 0
        })));
      } else {
        setAvailableMasterAgencies([]);
      }
      setSelectedMasterAgency('');
      setSelectedAgency('');
    }
  }, [selectedSubAdmin, entityType]);

  // Update available agencies when master agency is selected (for host movement)
  useEffect(() => {
    if (selectedMasterAgency && entityType === 'host') {
      // Get agencies under the selected master agency
      // For now, using mock data - in real app, this would come from API
      const mockAgencies = agenciesData.map(agency => ({
        id: agency.id,
        name: agency.name,
        totalHosts: agency.hosts?.length || 0
      }));
      setAvailableAgencies(mockAgencies);
      setSelectedAgency('');
    }
  }, [selectedMasterAgency, entityType]);

  const getMovementType = () => {
    switch (entityType) {
      case 'masterAgency':
        return 'simple'; // Master Agency -> Sub Admin
      case 'agency':
        if (currentUserType === 'sub-admin') {
          return 'restricted'; // Sub Admin can only move to master agencies under them
        }
        return 'two-level'; // Agency -> Sub Admin -> Master Agency
      case 'host':
        return 'three-level'; // Host -> Sub Admin -> Master Agency -> Agency
      default:
        return 'simple';
    }
  };

  const canMoveEntity = () => {
    const movementType = getMovementType();
    
    switch (movementType) {
      case 'simple':
        return selectedTarget !== '';
      case 'two-level':
        return selectedSubAdmin !== '' && selectedMasterAgency !== '';
      case 'three-level':
        return selectedSubAdmin !== '' && selectedMasterAgency !== '' && selectedAgency !== '';
      case 'restricted':
        return selectedMasterAgency !== '';
      default:
        return false;
    }
  };

  const handleMove = async () => {
    if (!canMoveEntity()) return;
    
    setIsLoading(true);
    try {
      const movementType = getMovementType();
      let moveData = { entityId: entityData.id };

      switch (movementType) {
        case 'simple':
          moveData.targetId = selectedTarget;
          break;
        case 'two-level':
          moveData.subAdminId = selectedSubAdmin;
          moveData.masterAgencyId = selectedMasterAgency;
          break;
        case 'three-level':
          moveData.subAdminId = selectedSubAdmin;
          moveData.masterAgencyId = selectedMasterAgency;
          moveData.agencyId = selectedAgency;
          break;
        case 'restricted':
          moveData.masterAgencyId = selectedMasterAgency;
          break;
      }

      await onMove(moveData);
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
    const movementType = getMovementType();
    
    switch (movementType) {
      case 'simple':
        return entityType === 'masterAgency' ? 'Sub Admin' : 'Target';
      case 'two-level':
        return 'Master Agency';
      case 'three-level':
        return 'Agency';
      case 'restricted':
        return 'Master Agency';
      default:
        return 'Target';
    }
  };

  const getRestrictedMasterAgencies = () => {
    // For sub-admin, only show master agencies under their control
    if (currentUserType === 'sub-admin' && entityData.currentSubAdminId) {
      const subAdmin = subAdminsData.find(sa => sa.id === entityData.currentSubAdminId);
      return subAdmin?.masterAgencies || [];
    }
    return [];
  };

  const filteredTargets = availableTargets?.filter(target =>
    target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    target.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const renderSelectionDropdown = (
    label,
    value,
    options,
    onChange,
    placeholder,
    disabled = false
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name} {option.count !== undefined && `(${option.count})`}
          </option>
        ))}
      </select>
    </div>
  );

  const renderMovementPreview = () => {
    const movementType = getMovementType();
    const steps = [];

    // Add entity being moved
    steps.push({
      name: entityData.name,
      type: getEntityTypeLabel(),
      isSource: true
    });

    // Add target steps based on movement type
    switch (movementType) {
      case 'simple':
        if (selectedTarget) {
          const targetData = availableTargets?.find(t => t.id === selectedTarget) || 
                           availableSubAdmins.find(sa => sa.id === parseInt(selectedTarget));
          if (targetData) {
            steps.push({
              name: targetData.name,
              type: getTargetTypeLabel(),
              isTarget: true
            });
          }
        }
        break;
      case 'two-level':
        if (selectedSubAdmin) {
          const subAdminData = availableSubAdmins.find(sa => sa.id === parseInt(selectedSubAdmin));
          if (subAdminData) {
            steps.push({
              name: subAdminData.name,
              type: 'Sub Admin',
              isIntermediate: true
            });
          }
        }
        if (selectedMasterAgency) {
          const masterAgencyData = availableMasterAgencies.find(ma => ma.id === parseInt(selectedMasterAgency));
          if (masterAgencyData) {
            steps.push({
              name: masterAgencyData.name,
              type: 'Master Agency',
              isTarget: true
            });
          }
        }
        break;
      case 'three-level':
        if (selectedSubAdmin) {
          const subAdminData = availableSubAdmins.find(sa => sa.id === parseInt(selectedSubAdmin));
          if (subAdminData) {
            steps.push({
              name: subAdminData.name,
              type: 'Sub Admin',
              isIntermediate: true
            });
          }
        }
        if (selectedMasterAgency) {
          const masterAgencyData = availableMasterAgencies.find(ma => ma.id === parseInt(selectedMasterAgency));
          if (masterAgencyData) {
            steps.push({
              name: masterAgencyData.name,
              type: 'Master Agency',
              isIntermediate: true
            });
          }
        }
        if (selectedAgency) {
          const agencyData = availableAgencies.find(a => a.id === selectedAgency);
          if (agencyData) {
            steps.push({
              name: agencyData.name,
              type: 'Agency',
              isTarget: true
            });
          }
        }
        break;
      case 'restricted':
        if (selectedMasterAgency) {
          const masterAgencyData = getRestrictedMasterAgencies().find(ma => ma.id === parseInt(selectedMasterAgency));
          if (masterAgencyData) {
            steps.push({
              name: masterAgencyData.name,
              type: 'Master Agency',
              isTarget: true
            });
          }
        }
        break;
    }

    if (steps.length < 2) return null;

    return (
      <div className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800">
        <h3 className="text-white font-semibold mb-3">Movement Preview</h3>
        <div className="flex items-center space-x-2 overflow-x-auto">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  step.isSource 
                    ? 'bg-gradient-to-br from-gray-600 to-gray-700'
                    : step.isTarget
                    ? 'bg-gradient-to-br from-[#F72585] to-[#7209B7]'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  <span className="text-white font-bold text-xs">
                    {step.name.charAt(0)}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-white text-sm font-medium">{step.name}</div>
                  <div className="text-gray-400 text-xs">{step.type}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-[#F72585] flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] rounded-xl border border-gray-800 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Move {getEntityTypeLabel()}</h2>
            <p className="text-gray-400 text-sm mt-1">
              Move "{entityData.name}" to a different location
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
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
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

          {/* Selection Interface */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Select Destination</h3>
            
            {/* Movement Type Instructions */}
            <div className="bg-blue-900/20 border border-blue-800/50 text-blue-400 p-3 rounded-lg text-sm">
              {getMovementType() === 'simple' && (
                <span>Select the Sub Admin to move this Master Agency to.</span>
              )}
              {getMovementType() === 'two-level' && (
                <span>First select a Sub Admin, then select the Master Agency under it.</span>
              )}
              {getMovementType() === 'three-level' && (
                <span>First select a Sub Admin, then a Master Agency, then the specific Agency.</span>
              )}
              {getMovementType() === 'restricted' && (
                <span>You can only move this agency to Master Agencies under your control.</span>
              )}
            </div>

            {/* Multi-level Selection */}
            {getMovementType() === 'simple' && (
              renderSelectionDropdown(
                'Sub Admin',
                selectedTarget,
                availableSubAdmins,
                setSelectedTarget,
                'Select Sub Admin'
              )
            )}

            {(getMovementType() === 'two-level' || getMovementType() === 'three-level') && (
              <>
                {renderSelectionDropdown(
                  'Sub Admin',
                  selectedSubAdmin,
                  availableSubAdmins,
                  setSelectedSubAdmin,
                  'Select Sub Admin'
                )}

                {renderSelectionDropdown(
                  'Master Agency',
                  selectedMasterAgency,
                  availableMasterAgencies,
                  setSelectedMasterAgency,
                  'Select Master Agency',
                  !selectedSubAdmin
                )}
              </>
            )}

            {getMovementType() === 'three-level' && (
              renderSelectionDropdown(
                'Agency',
                selectedAgency,
                availableAgencies,
                setSelectedAgency,
                'Select Agency',
                !selectedMasterAgency
              )
            )}

            {getMovementType() === 'restricted' && (
              renderSelectionDropdown(
                'Master Agency',
                selectedMasterAgency,
                getRestrictedMasterAgencies(),
                setSelectedMasterAgency,
                'Select Master Agency'
              )
            )}
          </div>

          {/* Movement Preview */}
          {renderMovementPreview()}
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
            disabled={!canMoveEntity() || isLoading}
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