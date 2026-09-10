import React from 'react';
import Navbar from './landing/Navbar';
import Hero from './landing/Hero';
import Footer from './landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-yellow-400 selection:text-black">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
};

export default LandingPage;
