import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import authService from '../../services/authService';

const ExchangeRateBar = () => {
  const [diamondRate, setDiamondRate] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await authService.getRateList(1);
        if (response.success && response.data) {
          setDiamondRate(response.data.rate);
        }
      } catch (error) {
        console.error('Error fetching diamond rate:', error);
      }
    };
    fetchRate();
  }, []);

  const saveRate = async () => {
    try {
      const response = await authService.changeRate(1, diamondRate);
      if (response.success) {
        setIsEditing(false);
      } else {
        console.error('Failed to update rate:', response.error);
      }
    } catch (error) {
      console.error('Error updating diamond rate:', error);
    }
  };

  const handleSave = (e) => {
    if (e.key === 'Enter') {
      saveRate();
    }
  };

  return (
    <div className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-4 border border-gray-700">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-black text-xs font-bold">●</span>
          </div>
          <span className="text-white font-medium">1 Coin </span>
        </div>
        
        <div className="text-gray-400 text-xl font-bold">=</div>
        
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
            <span className="text-black text-xs font-bold">♦</span>
          </div>
          {isEditing ? (
             <div className="flex items-center">
               <input
                type="number"
                value={diamondRate}
                onChange={(e) => setDiamondRate(Number(e.target.value))}
                onKeyDown={handleSave}
                onBlur={saveRate}
                className="text-white font-medium bg-transparent border-none outline-none w-20"
                autoFocus
                step="0.1"
              />
               <span className="text-white font-medium ml-1">Diamonds</span>
             </div>
          ) : (
            <span className="text-white font-medium">{diamondRate} Diamonds</span>
          )}
           <button onClick={() => setIsEditing(!isEditing)} className="text-gray-400 hover:text-white ml-2">
             <Edit className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center glow-pink">
        <span className="text-white text-lg">⚡</span>
      </div>
    </div>
  );
};

export default ExchangeRateBar;
