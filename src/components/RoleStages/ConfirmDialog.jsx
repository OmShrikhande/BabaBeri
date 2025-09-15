import React from 'react';

const ConfirmDialog = ({ open, title = 'Confirm', message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-[#121212] border border-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/30">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;