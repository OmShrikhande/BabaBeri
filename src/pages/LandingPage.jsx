import React from 'react';
import Navbar from './landing/Navbar';
import Hero from './landing/Hero';
import Features from './landing/Features';
import About from './landing/About';
import EarlyAccess from './landing/EarlyAccess';
import Footer from './landing/Footer';

const LandingPage = () => {
  return (
    <div
      className="min-h-screen text-white font-sans overflow-x-hidden selection:bg-purple-500/30 selection:text-white"
      style={{ background: '#050816' }}
    >
      <Navbar />
      <Hero />
      <Features />
      <About />
      <EarlyAccess />
      <Footer />
    </div>
  );
};

export default LandingPage;
