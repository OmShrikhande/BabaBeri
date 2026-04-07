import React, { useState } from 'react';
import GiftsPage from './gifts';
import BannersPage from './banners';

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
      <BannersPage 
        onBack={handleNavigateToGifts}
      />
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
