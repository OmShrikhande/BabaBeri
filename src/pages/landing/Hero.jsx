import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Zap } from 'lucide-react';
import IOSNoticeModal from './IOSNoticeModal';
import { useLandingTheme } from '../../context/LandingThemeContext';

const showcases = [
  { id: 'solo-live', title: 'Go Live', src: '/Screens/solo_live_screen.jpeg' },
  { id: 'feed', title: 'Feed', src: '/Screens/feed_screen.jpeg' },
  { id: 'vs', title: 'Battle Mode', src: '/Screens/VS_screen.jpeg' },
  { id: 'play-live', title: 'Watch Live', src: '/Screens/play_Live_Screen.jpeg' },
  { id: 'profile', title: 'Profile', src: '/Screens/profile_screen.jpeg' },
  { id: 'banners', title: 'Banners', src: '/Screens/banners_screen.jpeg' },
  { id: 'notifications', title: 'Notifications', src: '/Screens/notification_screen.jpeg' },
];

const Hero = () => {
  const [iosModalOpen, setIosModalOpen] = useState(false);
  const { isDark } = useLandingTheme();

  // Tripled for flawless seamless infinite scrolling loop
  const marqueeItems = [...showcases, ...showcases, ...showcases];

  return (
    <section
      id="hero"
      className={`relative pt-24 pb-16 px-4 md:px-8 overflow-hidden transition-colors ${isDark ? 'bg-transparent text-gray-100' : 'bg-transparent text-gray-900'
        }`}
    >
      {/* Background ambient glow spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-purple-600/20 via-pink-600/15 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full px-4 md:px-12 flex flex-col items-center text-center relative z-10">

        {/* ── Top Animated Logo (Bigger, Heartbeat Effect Only) ── */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 cursor-pointer flex justify-center items-center"
        >
          <motion.img
            src="/Logos/Logo.png"
            alt="Proxstream"
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 object-contain filter drop-shadow-[0_0_25px_rgba(247,37,133,0.45)]"
            animate={{ scale: [1, 1.07, 1] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Floating Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-4 text-xs font-semibold"
        >
          <span className={`px-3 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-purple-300' : 'bg-purple-50 border-purple-100 text-purple-700'
            }`}>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
            24/7 Live Streaming
          </span>
          <span className={`px-3 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-rose-300' : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            1M+ Active Creators
          </span>
          <span className={`px-3 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Instant Rewards
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 max-w-4xl leading-tight ${isDark ? 'text-white' : 'text-gray-900'
            }`}
        >
          Go live, watch,{' '}
          <span className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-transparent">
            earn!
          </span>
        </motion.h1>

        {/* Download Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`font-semibold text-lg sm:text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Download now & join India&apos;s fastest growing stream community
        </motion.p>

        {/* Download Badges */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto px-4"
        >
          {/* App Store Button */}
          <button
            onClick={() => setIosModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-3.5 bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-900 transition-all shadow-xl hover:scale-105 border border-white/20 group"
          >
            <svg className="w-8 h-8 fill-current transition-transform group-hover:scale-110" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.9-14.38-6.08-3.66-3.08-7.61-7.96-11.84-14.64-7.23-11.45-12.83-23.77-16.78-36.95-3.95-13.18-5.93-25.5-5.93-36.95 0-14.54 3.73-26.6 11.19-36.19 7.46-9.59 16.89-14.46 28.29-14.62 4.69 0 9.87 1.15 15.54 3.46 5.66 2.31 9.69 3.46 12.08 3.46 2.07 0 6.13-1.18 12.18-3.53 6.05-2.35 11.02-3.4 14.92-3.17 11.08.76 20.08 5.04 27.02 12.84-9.83 5.93-14.64 14.34-14.42 25.21.22 8.49 3.49 15.75 9.8 21.78 6.31 6.04 13.91 9.4 22.8 10.08-2.61 7.74-6.04 15.42-10.3 23.05zM119.22 31.95c0-6.75 2.45-13.18 7.35-18.29 4.9-5.11 11.13-8.06 18.68-8.85.33 1.2.49 2.23.49 3.09 0 6.64-2.5 13.07-7.51 18.29-5.01 5.23-11.16 8.17-18.46 8.82-.11-.76-.55-1.78-.55-3.06z" />
            </svg>
            <div className="text-left leading-tight">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Download on the</div>
              <div className="text-base font-bold text-white">App Store</div>
            </div>
          </button>

          {/* Google Play Button */}
          <a
            href={import.meta.env.VITE_GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-3.5 bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-900 transition-all shadow-xl hover:scale-105 border border-white/20 group"
          >
            <svg className="w-8 h-8 transition-transform group-hover:scale-110" viewBox="0 0 512 512">
              <path fill="#410593" d="M74 38.6c-4.4 4.7-7 11.8-7 20.8v393.2c0 9 2.6 16.1 7 20.8l1.4 1.3L301.7 248.4v-4.8L75.4 37.3 74 38.6z" />
              <path fill="#04cae9" d="M377.3 324L301.7 248.4v-4.8L377.3 168l1.7 1 89.6 50.9c25.6 14.5 25.6 38.4 0 53L379 323l-1.7 1z" />
              <path fill="#fb8000" d="M379 323L301.7 248.4 74 473.7c8.4 8.9 22.3 10 37.7 1.3L379 323z" />
              <path fill="#fa0044" d="M379 169L111.7 17c-15.4-8.7-29.3-7.6-37.7 1.3l227.7 225.4L379 169z" />
            </svg>
            <div className="text-left leading-tight">
              <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">GET IT ON</div>
              <div className="text-base font-bold text-white">Google Play</div>
            </div>
          </a>
        </motion.div>

        {/* ─── INFINITE SCROLL MARQUEE SHOWCASE (No side gradient masks) ─── */}
        <div className="w-full relative overflow-hidden py-6 select-none">
          <motion.div
            className="flex items-start gap-6 w-max"
            animate={{ x: ['0%', '-33.333%'] }}
            transition={{
              ease: 'linear',
              duration: 36,
              repeat: Infinity,
            }}
          >
            {marqueeItems.map((item, idx) => (
              <PhoneShowcase
                key={`${item.id}-${idx}`}
                title={item.title}
                src={item.src}
                isDark={isDark}
              />
            ))}
          </motion.div>
        </div>

      </div>

      {/* iOS Modal */}
      <IOSNoticeModal isOpen={iosModalOpen} onClose={() => setIosModalOpen(false)} />
    </section>
  );
};

// ─── PHONE SHOWCASE CONTAINER ──────────────────────────────────────────────────
const PhoneShowcase = ({ title, src, isDark }) => (
  <div className="flex flex-col items-center group">
    <h3 className={`font-extrabold text-xs sm:text-sm md:text-base mb-3 tracking-tight transition-colors ${isDark ? 'text-gray-200 group-hover:text-white' : 'text-gray-800 group-hover:text-black'
      }`}>
      {title}
    </h3>
    <div className="w-[170px] h-[350px] sm:w-[200px] sm:h-[400px] md:w-[215px] md:h-[430px] rounded-[36px] bg-black p-2 border-[3px] border-gray-800 shadow-2xl relative flex flex-col overflow-hidden group-hover:border-purple-500/50 group-hover:shadow-purple-950/40 transition-all duration-300">
      {/* Dynamic Island / iPhone Notch */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-30 border border-gray-800 flex items-center justify-end px-1.5">
        <div className="w-1.5 h-1.5 bg-blue-900 rounded-full" />
      </div>

      {/* Screen Container */}
      <div className="w-full h-full rounded-[28px] overflow-hidden relative border border-white/10 bg-black">
        <img
          src={src}
          alt={title}
          className="w-full h-full object-cover object-top"
          draggable={false}
          loading="lazy"
        />
      </div>
    </div>
  </div>
);

export default Hero;

