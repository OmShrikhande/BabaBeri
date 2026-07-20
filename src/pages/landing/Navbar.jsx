import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Early Access', href: '#early-access' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(5,8,22,0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(168,85,247,0.15)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #a10997ff, #63ddf5ff)',
                boxShadow: '0 0 16px rgba(169, 13, 160, 0.4)',
              }}
            >
              <img src="/Logos/Logo.png" alt="Logo" className="w-8 h-8" />
            </div>
            <span
              className="text-lg font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #A855F7, #22D3EE)' }}
            >
              Proxstream
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-400">
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => handleNavClick(href)}
                className="relative hover:text-white transition-colors duration-200 group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-purple-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            ))}
          </div>

          {/* Right: Login button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-purple-400 border transition-all duration-300 hover:text-white"
              style={{
                borderColor: 'rgba(168,85,247,0.4)',
                background: 'rgba(168,85,247,0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(168,85,247,0.3)';
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
              }}
            >
              Sign In
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-[70px] left-0 right-0 z-40 md:hidden px-6 pt-4 pb-6 space-y-2"
          style={{
            background: 'rgba(5,8,22,0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(168,85,247,0.15)',
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => handleNavClick(href)}
              className="block w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium"
            >
              {label}
            </button>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-purple-400 border border-purple-500/40 hover:bg-purple-500/10 transition-all duration-200 mt-2"
          >
            Sign In
          </Link>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
