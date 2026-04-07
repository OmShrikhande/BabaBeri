import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import authService from '../../services/authService.js';
import { normalizeUserType } from '../../utils/roleBasedAccess.js';

const StageList = ({ onEdit, onDelete, selectedRole }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter stages based on selected role
  const filteredStages = selectedRole ? stages.filter(stage => stage.name === selectedRole) : stages;

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const userType = authService.getUserType();
        if (!normalizeUserType(userType) || normalizeUserType(userType) !== 'super-admin') {
          setError('Super admin access required');
          setLoading(false);
          return;
        }

        const response = await fetch('https://proxstream.online/auth/superadmin/getallpercentage', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stages: ${response.status}`);
        }

        const data = await response.json();

        // Map API response to component expected format and sort by percent ascending
        const mappedStages = data
          .map(item => ({
            id: item.id,
            name: item.percentfor,
            percentage: item.percent,
            value: item.percent, // for backward compatibility
            image: null,
            description: null
          }))
          .sort((a, b) => a.percentage - b.percentage);

        setStages(mappedStages);
      } catch (err) {
        console.error('Error fetching stages:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading stages...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm">Error: {error}</div>;
  }
  return (
    <div className="space-y-3">
      {filteredStages.length === 0 && (
        <div className="text-gray-400 text-sm">No stages yet. Add one below.</div>
      )}
      {filteredStages.map((stage, idx) => (
        <div key={stage.id} className="bg-[#0A0A0A] rounded-lg border border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400">#{idx + 1}</div>
            {stage.image && (
              <img
                src={stage.image}
                alt={`${stage.name} logo`}
                className="w-10 h-10 object-contain"
              />
            )}
            <div>
              <div className="text-white font-semibold">{stage.name}</div>
              <div className="text-gray-400 text-sm">
                Percentage: <span className="text-gray-200 font-medium">{Number(stage.percentage ?? stage.value ?? 0)}%</span>
              </div>
              {stage.description && <div className="text-gray-500 text-xs mt-1">{stage.description}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit && onEdit(stage)}
              className="px-2 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
              aria-label={`Edit ${stage.name}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete && onDelete(stage)}
              className="px-2 py-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30"
              aria-label={`Delete ${stage.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StageList;