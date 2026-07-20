import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Globe, Lock, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast Streaming',
    description: 'Crystal-clear, low-latency streaming experience.',
    color: '#22D3EE',
    glow: 'rgba(34,211,238,0.25)',
    border: 'rgba(34,211,238,0.3)',
  },
  {
    icon: Globe,
    title: 'Connect Worldwide',
    description: 'Meet and interact with users across the globe.',
    color: '#A855F7',
    glow: 'rgba(168,85,247,0.25)',
    border: 'rgba(168,85,247,0.3)',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your data stays protected with modern security.',
    color: '#EC4899',
    glow: 'rgba(236,72,153,0.25)',
    border: 'rgba(236,72,153,0.3)',
  },
  {
    icon: Sparkles,
    title: 'Modern Experience',
    description: 'Beautiful cyberpunk-inspired interface with smooth performance.',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.25)',
    border: 'rgba(59,130,246,0.3)',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const Features = () => (
  <section id="features" className="relative py-28 overflow-hidden">
    {/* Subtle top divider glow */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)' }}
    />

    <div className="relative z-10 max-w-7xl mx-auto px-6">
      {/* Section header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">
          Core Features
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
          Why{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #A855F7, #22D3EE)' }}
          >
            Proxstream?
          </span>
        </h2>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {FEATURES.map(({ icon: Icon, title, description, color, glow, border }) => (
          <motion.div
            key={title}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative rounded-2xl p-[1px] cursor-default group transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${border}, transparent)` }}
          >
            {/* Animated glow on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"
              style={{ background: glow }}
            />

            {/* Card body */}
            <div
              className="relative rounded-2xl p-6 h-full"
              style={{
                background: 'linear-gradient(135deg, rgba(11,17,32,0.95) 0%, rgba(168,85,247,0.05) 100%)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>

              {/* Text */}
              <h3 className="text-white font-semibold text-lg mb-2 leading-snug">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Features;
