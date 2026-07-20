import React from 'react';
import { Radio } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Early Access', href: '#early-access' },
];

const Footer = () => (
  <footer className="relative border-t pt-14 pb-8 overflow-hidden">
    {/* Neon divider line */}
    <div
      className="absolute top-0 left-0 right-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, #A855F7, #22D3EE, #EC4899, transparent)' }}
    />

    {/* Background blur */}
    <div className="absolute inset-0 bg-[#050816] pointer-events-none" />

    <div className="relative z-10 max-w-7xl mx-auto px-6">
      {/* Top row */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #a10997ff, #63ddf5ff)',
              boxShadow: '0 0 16px rgba(169, 13, 160, 0.4)',
            }}
          >
            <img src="/Logos/Logo.png" alt="Logo" className="w-8 h-8" />
          </div>
          <span
            className="text-xl font-extrabold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #A855F7, #22D3EE)' }}
          >
            Proxstream
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              {label}
            </a>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <FaGithub className="w-4 h-4" />
            GitHub
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            Privacy
          </a>
        </nav>
      </div>

      {/* Bottom divider */}
      <div
        className="w-full h-px mb-6"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)' }}
      />

      {/* Copyright */}
      <div className="text-center text-gray-600 text-sm">
        © 2026 Proxstream. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
