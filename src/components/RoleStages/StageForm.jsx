import React, { useState, useEffect } from 'react';

const StageForm = ({ initial = null, onSubmit, onCancel, disableName = false }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setValue(initial.value ?? 0);
      setDescription(initial.description || '');
    } else {
      setName('');
      setValue(0);
      setDescription('');
    }
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ name, value: Number(value), description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-gray-400 text-sm mb-1 block">Stage Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disableName}
          placeholder="e.g., Bronze, Silver, Gold"
          className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
          required
        />
      </div>
      <div>
        <label className="text-gray-400 text-sm mb-1 block">Stage Value</label>
        <input
          type="number"
          value={value}
          min={0}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
          required
        />
      </div>
      <div>
        <label className="text-gray-400 text-sm mb-1 block">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
          placeholder="Short description about this stage"
        />
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default StageForm;