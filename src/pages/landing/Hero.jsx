import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Apple } from 'lucide-react';
import IOSNoticeModal from './IOSNoticeModal';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const APK_DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID';

// ─── Animated Particle ────────────────────────────────────────────────────────
const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    animate={{
      y: [0, -30, 0],
      x: [0, Math.random() * 20 - 10, 0],
      opacity: [0.3, 0.8, 0.3],
    }}
    transition={{
      duration: 3 + Math.random() * 4,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: Math.random() * 3,
    }}
  />
);

// ─── Hero Section ─────────────────────────────────────────────────────────────
const Hero = () => {
  const [iosModalOpen, setIosModalOpen] = useState(false);

  // Generate particles once
  const particles = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      style: {
        width: `${2 + Math.random() * 4}px`,
        height: `${2 + Math.random() * 4}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: ['#A855F7', '#22D3EE', '#EC4899', '#3B82F6'][Math.floor(Math.random() * 4)],
        boxShadow: `0 0 6px currentColor`,
      },
    }))
  ).current;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      {/* ── Cyber Grid Background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Animated Gradient Blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-pink-600/15 rounded-full blur-[90px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* ── Floating Particles ── */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <Particle key={p.id} style={p.style} />
        ))}
      </div>

      {/* ── Glowing Circles (decorative) ── */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full border border-purple-500/20 pointer-events-none" />
      <div className="absolute top-32 right-24 w-48 h-48 rounded-full border border-cyan-500/10 pointer-events-none" />
      <div className="absolute bottom-32 left-10 w-24 h-24 rounded-full border border-pink-500/20 pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              Next-Generation Streaming Platform
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
            >
              <span className="text-white">Meet </span>
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #A855F7, #22D3EE, #EC4899)',
                }}
              >
                Proxstream
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 leading-relaxed mb-10 max-w-xl"
            >
              The next-generation live social streaming platform. Connect instantly, stream
              effortlessly, and discover people around the world with a futuristic experience.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* APK Download */}
              <a
                href={APK_DOWNLOAD_URL}
                download
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 text-[#050816] select-none"
                style={{
                  background: 'linear-gradient(135deg, #22D3EE, #0ea5e9)',
                  boxShadow: '0 0 20px rgba(34,211,238,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(34,211,238,0.6), 0 0 80px rgba(34,211,238,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.3)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <Download className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                Download APK
              </a>

              {/* iOS */}
              <button
                onClick={() => setIosModalOpen(true)}
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base text-purple-400 hover:text-white transition-all duration-300 bg-transparent border select-none"
                style={{
                  borderColor: 'rgba(168,85,247,0.5)',
                  boxShadow: '0 0 0px rgba(168,85,247,0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(168,85,247,0.4), inset 0 0 30px rgba(168,85,247,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.9)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0px rgba(168,85,247,0)';
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Apple className="w-5 h-5" />
                Download for iOS
              </button>
            </motion.div>
          </div>

          {/* Right: Floating Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>

      {/* iOS Modal */}
      <IOSNoticeModal isOpen={iosModalOpen} onClose={() => setIosModalOpen(false)} />
    </section>
  );
};

// ─── Hero Visual (floating phone mockup illustration) ─────────────────────────
const HeroVisual = () => (
  <motion.div
    animate={{ y: [0, -18, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    className="relative"
  >
    {/* Outer glow ring */}
    <motion.div
      className="absolute inset-0 rounded-[3rem] pointer-events-none"
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        boxShadow: '0 0 80px rgba(168,85,247,0.4), 0 0 160px rgba(34,211,238,0.15)',
      }}
    />

    {/* Card */}
    <div
      className="w-72 h-[420px] rounded-[3rem] border flex flex-col overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(11,17,32,0.9) 0%, rgba(168,85,247,0.08) 100%)',
        borderColor: 'rgba(168,85,247,0.3)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
        </div>
        <div className="text-xs text-gray-500 font-mono">LIVE</div>
      </div>

      {/* Screen content */}
      <div className="flex-1 flex flex-col px-5 pb-6 gap-4">
        {/* Profile row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Proxstream User</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
              Live Now
            </div>
          </div>
          <div className="ml-auto text-xs font-mono text-cyan-400">1.2k</div>
        </div>

        {/* Stream preview */}
        <div
          className="flex-1 rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a0533 0%, #0a1a2e 50%, #001a1a 100%)',
          }}
        >
          {/* Grid lines inside preview */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(168,85,247,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.06) 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
          {/* Glow dot */}
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-purple-500/30 blur-xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/50 to-cyan-600/50 border border-white/20 flex items-center justify-center">
              <span className="text-white text-xl">▶</span>
            </div>
          </div>
        </div>

        {/* Comment row */}
        <div className="space-y-2">
          {[
            { color: 'text-cyan-400', name: 'user_x42', msg: 'Amazing stream!' },
            { color: 'text-pink-400', name: 'neon_vibe', msg: '🔥🔥🔥' },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-2 text-xs">
              <span className={`font-semibold ${c.color}`}>{c.name}</span>
              <span className="text-gray-400">{c.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export default Hero;
