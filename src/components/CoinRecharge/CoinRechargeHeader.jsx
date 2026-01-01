import React, { useState } from 'react';
import { Coins, Edit } from 'lucide-react';

const CoinRechargeHeader = () => {
  const [inrValue, setInrValue] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold mb-2">Coin Recharge Management</h1>
        <p className="text-gray-400">Manage all coin recharge related operations</p>
      </div>
      <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 text-yellow-500 font-semibold">
          <span>1 Coin</span>
          <Coins className="w-5 h-5" />
        </div>
        <span className="text-gray-400">=</span>
        {isEditing ? (
          <input
            type="number"
            value={inrValue}
            onChange={(e) => setInrValue(Number(e.target.value))}
            onKeyDown={handleSave}
            className="text-white font-bold text-lg bg-transparent border-none outline-none w-16"
            autoFocus
          />
        ) : (
          <span className="text-white font-bold text-lg">{inrValue} INR</span>
        )}
        <button onClick={handleEdit} className="text-gray-400 hover:text-white ml-2">
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CoinRechargeHeader;