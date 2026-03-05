import React from 'react';
import { Link } from 'react-router-dom';
import { Diamond, Building2, ShieldCheck, Users, Activity, Play } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              ProxStream
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/5 backdrop-blur-sm"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-white mb-2">Stream. Manage.</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Grow.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12">
            The all-in-one live streaming management platform for agencies and hosts. 
            Track earnings, monitor performance, and scale your streaming business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.5)] transition-all hover:scale-105 w-full sm:w-auto"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold text-lg border border-white/10 transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              Explore Features
            </a>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0A0A0F] relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Powerful tools designed specifically for the live streaming ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#12121A] border border-gray-800/50 p-8 rounded-3xl hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Diamond className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Diamond Tracking</h3>
              <p className="text-gray-400 leading-relaxed">
                Real-time tracking of diamond earnings, cashouts, and financial metrics across all your agencies and hosts.
              </p>
            </div>

            <div className="bg-[#12121A] border border-gray-800/50 p-8 rounded-3xl hover:border-pink-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Agency Management</h3>
              <p className="text-gray-400 leading-relaxed">
                Multi-level hierarchy support. Easily manage Master Agencies, Sub-Agencies, and their respective hosts.
              </p>
            </div>

            <div className="bg-[#12121A] border border-gray-800/50 p-8 rounded-3xl hover:border-cyan-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Host Verification</h3>
              <p className="text-gray-400 leading-relaxed">
                Streamlined onboarding and verification processes for new hosts, ensuring quality and compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-[#0A0A0F]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center divide-x divide-gray-800/50">
            <div className="p-4">
              <div className="flex justify-center mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10k+</div>
              <div className="text-gray-400 font-medium">Active Hosts</div>
            </div>
            <div className="p-4">
              <div className="flex justify-center mb-4">
                <Building2 className="w-8 h-8 text-pink-400" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400 font-medium">Agencies</div>
            </div>
            <div className="p-4 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-800/50 mt-8 md:mt-0 pt-8 md:pt-4">
              <div className="flex justify-center mb-4">
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#050508] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-500 fill-current" />
            <span className="font-bold text-gray-200">ProxStream</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ProxStream. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/login" className="hover:text-purple-400 transition-colors">Portal Login</Link>
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
