import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const StageList = ({ stages = [], onEdit, onDelete }) => {
  return (
    <div className="space-y-3">
      {stages.length === 0 && (
        <div className="text-gray-400 text-sm">No stages yet. Add one below.</div>
      )}
      {stages.map((stage, idx) => (
        <div key={stage.id} className="bg-[#0A0A0A] rounded-lg border border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400">#{idx + 1}</div>
            <div>
              <div className="text-white font-semibold">{stage.name}</div>
              <div className="text-gray-400 text-sm">Value: <span className="text-gray-200 font-medium">{stage.value}</span></div>
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