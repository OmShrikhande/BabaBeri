import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-8 text-center text-xs text-gray-500 font-medium select-none">
    <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Copyright */}
      <div>
        © {new Date().getFullYear()} Proxstream. All rights reserved.
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 font-semibold text-gray-600">
        <Link to="/about" className="hover:text-black transition-colors">
          About Us
        </Link>
        <a href="#terms" onClick={(e) => { e.preventDefault(); alert("ProxStream Terms of Service: By using Proxstream, you agree to comply with our Community Guidelines and terms."); }} className="hover:text-black transition-colors">
          Terms of Service
        </a>
        <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("ProxStream Privacy Policy: We respect and protect your personal data privacy."); }} className="hover:text-black transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
