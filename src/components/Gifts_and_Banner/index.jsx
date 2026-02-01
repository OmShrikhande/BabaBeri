import React, { useState } from 'react';
import GiftsPage from './gifts';

const GiftsAndBannersLayout = () => {
  const [activeView, setActiveView] = useState('gifts');

  const handleBack = () => {
    window.history.back();
  };

  const handleNavigateToBanners = () => {
    setActiveView('banners');
  };

  const handleNavigateToGifts = () => {
    setActiveView('gifts');
  };

  if (activeView === 'banners') {
    return (
      <div className="min-h-screen bg-[#121212] p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center py-20">
            <h1 className="text-3xl font-black text-white mb-4">Banners</h1>
            <p className="text-gray-400 mb-8">Banner management coming soon...</p>
            <button
              onClick={handleNavigateToGifts}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-bold text-sm hover:opacity-90 transition-all"
            >
              Back to Gifts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GiftsPage 
      onBack={handleBack}
      onNavigateToBanners={handleNavigateToBanners}
    />
  );
};

export default GiftsAndBannersLayout;
