import React from 'react';

const RoleSelector = ({ roles = [], value, onChange, disabled = false }) => {
  return (
    <div className="space-y-2">
      <label className="text-gray-400 text-sm">Select Role</label>
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
      >
        {roles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelector;