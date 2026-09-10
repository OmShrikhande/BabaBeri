import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLandingTheme } from '../../context/LandingThemeContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useLandingTheme();
  const isLegalPage =
    location.pathname === '/about' ||
    location.pathname === '/terms' ||
    location.pathname === '/privacy';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBg = isDark
    ? scrolled || isLegalPage
      ? 'rgba(12, 7, 20, 0.92)'
      : 'rgba(12, 7, 20, 0.78)'
    : scrolled || isLegalPage
      ? 'rgba(255, 255, 255, 0.95)'
      : 'rgba(255, 255, 255, 0.85)';

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const brandClass = isDark ? 'text-white' : 'text-gray-900';
  const linkClass = (active) =>
    `transition-colors ${active
      ? isDark
        ? 'text-white font-bold'
        : 'text-black font-bold'
      : isDark
        ? 'text-gray-400 hover:text-white'
        : 'text-gray-600 hover:text-black'
    }`;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navBg,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {/* Subtle Instagram gradient hairline */}
        <div
          className="absolute inset-x-0 bottom-0 h-px opacity-50 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
            opacity: 0.35,
          }}
        />

        <div className="w-full px-6 md:px-12 h-[65px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/Logos/Logo.png"
              alt="Proxstream"
              className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
            />
            <span className={`text-xl font-extrabold tracking-tight ${brandClass}`}>
              Proxstream
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link to="/" className={linkClass(location.pathname === '/')}>
              Home
            </Link>
            <Link to="/about" className={linkClass(location.pathname === '/about')}>
              About Us
            </Link>
            <Link to="/terms" className={linkClass(location.pathname === '/terms')}>
              Terms
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isDark
                ? 'border-white/15 text-amber-300 hover:bg-white/10'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* <Link
              to="/login"
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm ${isDark
                  ? 'text-white border-white/20 hover:bg-white/10'
                  : 'text-gray-900 border-gray-300 hover:border-black hover:bg-gray-50'
                }`}
            >
              Sign In
            </Link> */}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'text-amber-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-[65px] left-0 right-0 z-40 md:hidden px-6 py-4 backdrop-blur-xl border-b shadow-xl space-y-3 ${isDark
            ? 'bg-[#0c0c0f]/95 border-white/10'
            : 'bg-white/95 border-gray-200'
            }`}
        >
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`block w-full text-left px-4 py-2.5 rounded-lg font-semibold ${isDark ? 'text-gray-100 hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
              }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className={`block w-full text-left px-4 py-2.5 rounded-lg font-semibold ${isDark ? 'text-gray-100 hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
              }`}
          >
            About Us
          </Link>
          <Link
            to="/terms"
            onClick={() => setMobileOpen(false)}
            className={`block w-full text-left px-4 py-2.5 rounded-lg font-semibold ${isDark ? 'text-gray-100 hover:bg-white/10' : 'text-gray-800 hover:bg-gray-100'
              }`}
          >
            Terms
          </Link>
          {/* <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#833AB4]/90 via-[#FD1D1D]/85 to-[#FCB045]/90 hover:opacity-90 transition-all shadow"
          >
            Sign In
          </Link> */}
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
