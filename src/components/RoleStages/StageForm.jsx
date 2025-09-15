import React, { useState, useEffect } from 'react';

const StageForm = ({ initial = null, onSubmit, onCancel, disableName = false }) => {
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setPercentage(initial.percentage ?? initial.value ?? 0);
      setDescription(initial.description || '');
    } else {
      setName('');
      setPercentage(0);
      setDescription('');
    }
  }, [initial]);

  const [logoChoice, setLogoChoice] = useState('auto');

  const logoToPath = (choice, stageName) => {
    const key = String(choice || stageName || '').toLowerCase();
    if (key.includes('silver') || choice === 'silver') return '/Logos/silver .png';
    if (key.includes('gold') || choice === 'gold') return '/Logos/gold.png';
    if (key.includes('platinum') || choice === 'platinum') return '/Logos/platinum.png';
    return undefined; // let service infer
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pct = Math.max(0, Math.min(100, Number(percentage)));
    const image = logoToPath(logoChoice, name);
    onSubmit && onSubmit({ name, percentage: pct, description, ...(image ? { image } : {}) });
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
        <label className="text-gray-400 text-sm mb-1 block">Stage Percentage (%)</label>
        <input
          type="number"
          value={percentage}
          min={0}
          max={100}
          onChange={(e) => setPercentage(e.target.value)}
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