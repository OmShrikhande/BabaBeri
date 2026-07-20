import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Radio, Users2 } from 'lucide-react';

// ─── Glowing Illustration Placeholder ─────────────────────────────────────────
const GlowIllustration = () => (
  <motion.div
    className="relative flex items-center justify-center w-full max-w-sm mx-auto"
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
  >
    {/* Outer ring pulse */}
    <motion.div
      className="absolute w-72 h-72 rounded-full border pointer-events-none"
      style={{ borderColor: 'rgba(168,85,247,0.2)' }}
      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.div
      className="absolute w-56 h-56 rounded-full border pointer-events-none"
      style={{ borderColor: 'rgba(34,211,238,0.2)' }}
      animate={{ scale: [1.05, 1, 1.05], opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
    />

    {/* Center card */}
    <div
      className="relative w-48 h-48 rounded-3xl flex flex-col items-center justify-center gap-4 border"
      style={{
        background: 'linear-gradient(135deg, rgba(11,17,32,0.9), rgba(168,85,247,0.08))',
        borderColor: 'rgba(168,85,247,0.3)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(168,85,247,0.2), 0 0 120px rgba(34,211,238,0.1)',
      }}
    >
      {/* Animated logo */}
      <motion.div
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/80 to-cyan-500/60 flex items-center justify-center"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img src="/Logos/Logo.png" alt="Logo" className="w-18 h-18" />
      </motion.div>
      <div className="text-center">
        <div className="text-white font-bold text-sm">Proxstream</div>
        <div className="text-gray-500 text-xs mt-0.5">Future Ready</div>
      </div>
    </div>

    {/* Orbiting icons */}
    {[
      { Icon: Cpu, angle: 45, color: '#22D3EE', dist: 108 },
      { Icon: Users2, angle: 200, color: '#A855F7', dist: 108 },
    ].map(({ Icon, angle, color, dist }) => {
      const rad = (angle * Math.PI) / 180;
      return (
        <motion.div
          key={angle}
          className="absolute w-10 h-10 rounded-xl flex items-center justify-center border"
          style={{
            left: `calc(50% + ${Math.cos(rad) * dist}px - 20px)`,
            top: `calc(50% + ${Math.sin(rad) * dist}px - 20px)`,
            background: `${color}15`,
            borderColor: `${color}40`,
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3 + angle * 0.01, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </motion.div>
      );
    })}
  </motion.div>
);

// ─── About Section ────────────────────────────────────────────────────────────
const About = () => (
  <section id="about" className="relative py-28 overflow-hidden">
    {/* Background blob */}
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-purple-700/10 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute left-0 top-1/4 w-64 h-64 bg-cyan-700/10 rounded-full blur-[100px] pointer-events-none" />

    {/* Divider */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)' }}
    />

    <div className="relative z-10 max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Our Mission
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Built for the{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #22D3EE, #A855F7)' }}
            >
              Future
            </span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Proxstream is designed for creators, communities, and explorers who want a faster, more
            immersive way to stream and connect online. With a futuristic interface and optimized
            performance, Proxstream delivers an experience that feels ahead of its time.
          </p>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '4K', label: 'Quality', color: '#22D3EE' },
              { value: '<50ms', label: 'Latency', color: '#A855F7' },
              { value: '100+', label: 'Countries', color: '#EC4899' },
            ].map(({ value, label, color }) => (
              <div
                key={label}
                className="rounded-xl p-4 border text-center"
                style={{
                  background: 'rgba(11,17,32,0.6)',
                  borderColor: `${color}20`,
                }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color }}>
                  {value}
                </div>
                <div className="text-gray-500 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <GlowIllustration />
        </motion.div>
      </div>
    </div>
  </section>
);

export default About;
