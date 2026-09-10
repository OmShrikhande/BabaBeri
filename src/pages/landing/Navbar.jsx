import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled || location.pathname === '/about'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[65px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/Logos/Logo.png"
              alt="Proxstream"
              className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Proxstream
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <Link 
              to="/" 
              className={`hover:text-black transition-colors ${location.pathname === '/' ? 'text-black font-bold' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`hover:text-black transition-colors ${location.pathname === '/about' ? 'text-black font-bold' : ''}`}
            >
              About Us
            </Link>
          </div>

          {/* Right Action: Sign In */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-900 border border-gray-300 hover:border-black transition-all hover:bg-gray-50 shadow-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu icon */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-[65px] left-0 right-0 z-40 md:hidden px-6 py-4 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl space-y-3"
        >
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-gray-800 font-semibold hover:bg-gray-100"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-gray-800 font-semibold hover:bg-gray-100"
          >
            About Us
          </Link>
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-black hover:bg-gray-800 transition-all shadow"
          >
            Sign In
          </Link>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
