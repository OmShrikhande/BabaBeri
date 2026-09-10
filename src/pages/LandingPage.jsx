import React from 'react';
import Navbar from './landing/Navbar';
import Hero from './landing/Hero';
import Footer from './landing/Footer';
import { useLandingTheme } from '../context/LandingThemeContext';

const LandingPage = () => {
  const { isDark } = useLandingTheme();

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isDark
          ? 'bg-[#0c0714] text-gray-100 selection:bg-fuchsia-500/40 selection:text-white'
          : 'bg-white text-gray-900 selection:bg-[#FCB045]/40 selection:text-black'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(ellipse 80% 50% at 15% -10%, rgba(131,58,180,0.2), transparent), radial-gradient(ellipse 60% 40% at 95% 10%, rgba(253,29,29,0.12), transparent), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(252,176,69,0.1), transparent)'
          : 'linear-gradient(135deg, rgba(131,58,180,0.03) 0%, rgba(253,29,29,0.02) 50%, rgba(252,176,69,0.03) 100%)',
      }}
    >
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
};

export default LandingPage;

