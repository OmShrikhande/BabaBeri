import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLandingTheme } from '../../context/LandingThemeContext';
import SupportContactModal from '../../components/SupportContactModal';

const Footer = () => {
  const { isDark } = useLandingTheme();
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <SupportContactModal open={supportOpen} onClose={() => setSupportOpen(false)} />
      <footer
        className={`py-8 text-center text-xs font-medium select-none border-t transition-colors ${
          isDark
            ? 'bg-[#0c0714]/90 border-white/10 text-gray-400'
            : 'bg-white border-gray-100 text-gray-500'
        }`}
      >
        <div className="w-full px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Proxstream. All rights reserved.</div>

          <div
            className={`flex items-center gap-5 font-semibold ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <Link
              to="/about"
              className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
            >
              About Us
            </Link>
            <Link
              to="/terms"
              className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
            >
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="px-3 py-1 rounded-full text-xs font-bold text-white transition-all shadow-md hover:scale-105 cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #FD1D1D 55%, #FCB045 100%)',
              }}
            >
              Support
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
