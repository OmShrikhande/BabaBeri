import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Flame, Heart, Gift, MessageCircle, Mic, Video, 
  ChevronRight, Sparkles, UserPlus, Play, Award, Zap, Star
} from 'lucide-react';
import IOSNoticeModal from './IOSNoticeModal';

// ─── HERO SECTION (Matching Image 1) ───────────────────────────────────────────
const Hero = () => {
  const [iosModalOpen, setIosModalOpen] = useState(false);

  return (
    <section id="hero" className="bg-white text-gray-900 pt-24 pb-16 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Top Logo Badge */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FFDD00] flex items-center justify-center shadow-lg shadow-yellow-400/30 border border-yellow-300">
            <div className="flex items-center font-black text-3xl tracking-tighter text-black select-none">
              <span className="text-3xl">c</span>
              <span className="text-4xl text-black -ml-0.5">2</span>
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4"
        >
          Go live, watch, earn!
        </motion.h1>

        {/* Download Subtitle */}
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-500 font-medium text-lg mb-6"
        >
          Download now
        </motion.p>

        {/* Download Badges */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          {/* App Store Button */}
          <button
            onClick={() => setIosModalOpen(true)}
            className="flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-md hover:scale-105"
          >
            <svg className="w-7 h-7 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.9-14.38-6.08-3.66-3.08-7.61-7.96-11.84-14.64-7.23-11.45-12.83-23.77-16.78-36.95-3.95-13.18-5.93-25.5-5.93-36.95 0-14.54 3.73-26.6 11.19-36.19 7.46-9.59 16.89-14.46 28.29-14.62 4.69 0 9.87 1.15 15.54 3.46 5.66 2.31 9.69 3.46 12.08 3.46 2.07 0 6.13-1.18 12.18-3.53 6.05-2.35 11.02-3.4 14.92-3.17 11.08.76 20.08 5.04 27.02 12.84-9.83 5.93-14.64 14.34-14.42 25.21.22 8.49 3.49 15.75 9.8 21.78 6.31 6.04 13.91 9.4 22.8 10.08-2.61 7.74-6.04 15.42-10.3 23.05zM119.22 31.95c0-6.75 2.45-13.18 7.35-18.29 4.9-5.11 11.13-8.06 18.68-8.85.33 1.2.49 2.23.49 3.09 0 6.64-2.5 13.07-7.51 18.29-5.01 5.23-11.16 8.17-18.46 8.82-.11-.76-.55-1.78-.55-3.06z"/>
            </svg>
            <div className="text-left leading-tight">
              <div className="text-[10px] uppercase tracking-wider font-medium text-gray-300">Download on the</div>
              <div className="text-base font-semibold text-white">App Store</div>
            </div>
          </button>

          {/* Google Play Button */}
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-md hover:scale-105"
          >
            <svg className="w-7 h-7" viewBox="0 0 512 512">
              <path fill="#410593" d="M74 38.6c-4.4 4.7-7 11.8-7 20.8v393.2c0 9 2.6 16.1 7 20.8l1.4 1.3L301.7 248.4v-4.8L75.4 37.3 74 38.6z"/>
              <path fill="#04cae9" d="M377.3 324L301.7 248.4v-4.8L377.3 168l1.7 1 89.6 50.9c25.6 14.5 25.6 38.4 0 53L379 323l-1.7 1z"/>
              <path fill="#fb8000" d="M379 323L301.7 248.4 74 473.7c8.4 8.9 22.3 10 37.7 1.3L379 323z"/>
              <path fill="#fa0044" d="M379 169L111.7 17c-15.4-8.7-29.3-7.6-37.7 1.3l227.7 225.4L379 169z"/>
            </svg>
            <div className="text-left leading-tight">
              <div className="text-[10px] uppercase tracking-wider font-medium text-gray-300">GET IT ON</div>
              <div className="text-base font-semibold text-white">Google Play</div>
            </div>
          </a>
        </motion.div>

        {/* ── 6 FEATURE PHONE MOCKUPS (Matching Image 1) ────────────────────── */}
        <div className="w-full overflow-x-auto pb-10 pt-4 scrollbar-thin scrollbar-thumb-gray-300">
          <div className="flex items-start justify-start lg:justify-center gap-5 min-w-max px-4">
            
            {/* 1. GO LIVE */}
            <PhoneShowcase title="Go Live">
              <div className="relative w-full h-full bg-gradient-to-b from-blue-900 via-indigo-900 to-black text-white flex flex-col justify-between p-3 select-none">
                {/* Host background image visual */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
                    alt="Streamer" 
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                  
                  {/* Underwater / Spotlight Jellyfish Graphic Effect */}
                  <div className="absolute bottom-16 right-2 w-24 h-24 rounded-full bg-cyan-400/30 blur-md animate-pulse" />
                  <div className="absolute bottom-20 right-4 text-3xl">🪼</div>
                </div>

                {/* Top Bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-[10px] font-semibold">Shelly</span>
                    <span className="bg-yellow-500 text-[8px] text-black px-1 rounded font-bold">Lv.42</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] bg-black/40 px-2 py-1 rounded-full text-yellow-400 font-bold">
                    <span>💎 230,067</span>
                  </div>
                </div>

                {/* Bottom Comments */}
                <div className="relative z-10 space-y-1.5 text-left text-[9px] mb-2">
                  <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 flex items-center gap-1">
                    <span className="text-cyan-300 font-bold">Gabriella:</span>
                    <span>Gave Shelly a Jellyfish 🪼</span>
                  </div>
                  <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 flex items-center gap-1">
                    <span className="text-yellow-300 font-bold">Zafiro:</span>
                    <span>Activated a Spotlight 🌟</span>
                  </div>
                  <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-lg border border-white/10 flex items-center gap-1">
                    <span className="text-pink-300 font-bold">Isabella:</span>
                    <span>Hi Shelly!</span>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                  <span className="text-[10px] text-gray-400">Chat...</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span>💬</span>
                    <span>❤️</span>
                    <span>🎁</span>
                  </div>
                </div>
              </div>
            </PhoneShowcase>

            {/* 2. BUILD AN AUDIENCE */}
            <PhoneShowcase title="Build an Audience">
              <div className="relative w-full h-full bg-slate-900 text-white flex flex-col justify-between p-3 select-none">
                {/* Profile Header */}
                <div className="relative z-10 flex flex-col items-center text-center pt-2">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover" />
                    <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[7px] font-black px-1 rounded-full">ELITE</span>
                  </div>
                  <h4 className="font-bold text-xs mt-1">DJ_Quinn</h4>
                  
                  {/* Stats Row */}
                  <div className="flex items-center gap-2 text-[9px] text-gray-300 my-1 font-semibold">
                    <span>💎 37.1M</span>
                    <span>•</span>
                    <span>❤️ 48.5M</span>
                    <span>•</span>
                    <span>🏆 1,245 wins</span>
                  </div>

                  <button className="bg-yellow-400 text-black font-extrabold text-[9px] px-4 py-1 rounded-full uppercase tracking-wider shadow">
                    + FOLLOW
                  </button>
                  <p className="text-[8px] text-gray-400 mt-1 max-w-[140px] line-clamp-2">
                    Barista by day, DJ by night! Watch me stream live from the club every night at 9. Top 3 gifters get VIP access on Fridays! 🎉✨
                  </p>
                </div>

                {/* Stream Preview Card */}
                <div className="relative z-10 rounded-xl overflow-hidden border border-white/20 h-28 my-auto shadow-lg">
                  <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 left-1.5 bg-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    LIVE
                  </div>
                </div>
              </div>
            </PhoneShowcase>

            {/* 3. CO-HOST */}
            <PhoneShowcase title="Co-Host">
              <div className="relative w-full h-full bg-gray-950 text-white flex flex-col justify-between p-2 select-none">
                {/* 4-Way Video Grid */}
                <div className="grid grid-cols-2 gap-1 flex-1 relative z-10">
                  <div className="relative rounded-lg overflow-hidden border border-purple-500/40">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5 text-[7px] rounded">Keshia</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-blue-500/40">
                    <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5 text-[7px] rounded">That_Jenny</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-cyan-500/40">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5 text-[7px] rounded">Tracy</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-pink-500/40">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/60 px-1 py-0.5 text-[7px] rounded">Sara</span>
                  </div>

                  {/* Center Robot / Sci-Fi Overlay Graphic */}
                  <div className="absolute inset-0 m-auto w-16 h-16 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-xl animate-bounce">
                      <span className="text-xs">🤖</span>
                    </div>
                    <span className="bg-red-600 text-[6px] font-black text-white px-1 rounded mt-0.5">A.I. APOCALYPSE</span>
                  </div>
                </div>

                {/* Control Bar */}
                <div className="relative z-10 flex items-center justify-around bg-gray-900/90 rounded-xl py-1 mt-1 border border-white/10 text-xs text-gray-300">
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  <Video className="w-3.5 h-3.5 text-pink-400" />
                  <span className="bg-red-600 text-[8px] px-1.5 py-0.5 rounded font-bold text-white">END</span>
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <Gift className="w-3.5 h-3.5 text-purple-400" />
                </div>
              </div>
            </PhoneShowcase>

            {/* 4. WATCH LIVE */}
            <PhoneShowcase title="Watch Live">
              <div className="relative w-full h-full bg-slate-900 text-white flex flex-col justify-between p-2 select-none">
                {/* Header */}
                <div className="flex items-center justify-between text-[10px] font-bold pb-1 border-b border-white/10">
                  <span className="text-yellow-400">Live Trending</span>
                  <span className="text-white font-extrabold text-xs">c2</span>
                  <span className="text-gray-400">⚙️</span>
                </div>

                {/* Banner */}
                <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-purple-800 to-indigo-900 p-2 my-1 border border-purple-400/30">
                  <div className="text-[10px] font-black text-yellow-300 uppercase">c2 Got Talent</div>
                  <div className="text-[7px] text-gray-200">With @LAYDEEMOODZ</div>
                </div>

                {/* Streamers Grid */}
                <div className="grid grid-cols-2 gap-1.5 flex-1">
                  <div className="relative rounded-lg overflow-hidden bg-gray-800">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-red-600 text-[6px] font-bold px-1 rounded text-white">LIVE</span>
                    <span className="absolute bottom-1 left-1 text-[7px] font-bold">DJ_Quinn</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden bg-gray-800">
                    <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-red-600 text-[6px] font-bold px-1 rounded text-white">LIVE</span>
                    <span className="absolute bottom-1 left-1 text-[7px] font-bold">GamerLena</span>
                  </div>
                </div>

                {/* Go Live Yellow Button */}
                <div className="relative z-10 flex justify-center mt-1">
                  <button className="bg-yellow-400 text-black font-extrabold text-[9px] px-3 py-1 rounded-full shadow-lg border border-yellow-300 flex items-center gap-1">
                    <span>▶</span> GO LIVE
                  </button>
                </div>
              </div>
            </PhoneShowcase>

            {/* 5. COMPETE */}
            <PhoneShowcase title="Compete">
              <div className="relative w-full h-full bg-slate-900 text-white flex flex-col justify-between p-2 select-none">
                {/* Header */}
                <div className="flex items-center justify-between text-[10px] font-bold pb-1">
                  <span>Top 100</span>
                  <span className="text-yellow-400 font-black">c2</span>
                </div>

                {/* Leaderboard Rankings List */}
                <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5">
                  {[
                    { rank: 1, name: 'Quinn', points: '37,123,965', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80', badge: '🥇' },
                    { rank: 2, name: 'Chloe', points: '25,781,013', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', badge: '🥈' },
                    { rank: 3, name: 'Hart', points: '21,369,559', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', badge: '🥉' },
                    { rank: 4, name: 'Derek', points: '20,632,386', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', badge: '' },
                    { rank: 5, name: 'LivHayes', points: '22,476,901', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', badge: '' },
                  ].map((user) => (
                    <div key={user.rank} className="flex items-center justify-between bg-slate-800/80 p-1 rounded border border-white/5 text-[8px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-400 w-3">{user.rank}</span>
                        <img src={user.img} className="w-5 h-5 rounded-full object-cover" />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            {user.name} <span className="text-[6px] bg-yellow-500 text-black px-0.5 rounded font-black">ELITE</span>
                          </div>
                          <div className="text-yellow-400 text-[7px]">💎 {user.points}</div>
                        </div>
                      </div>
                      <span className="text-xs">{user.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PhoneShowcase>

            {/* 6. GET PAID */}
            <PhoneShowcase title="Get Paid">
              <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black text-white flex flex-col justify-between p-2 select-none overflow-hidden">
                {/* Streamer Background */}
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                {/* Rocket Animation Overlay */}
                <div className="relative z-10 flex flex-col items-center pt-4">
                  <motion.div 
                    animate={{ y: [-5, 5, -5] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-center"
                  >
                    <div className="text-yellow-400 font-extrabold text-sm shadow-md animate-pulse">
                      +50,000
                    </div>
                    <div className="text-[8px] bg-black/60 px-2 py-0.5 rounded-full text-gray-200 mt-0.5 border border-yellow-400/50">
                      Hannah gave you a Rocket! 🚀
                    </div>
                  </motion.div>
                </div>

                {/* Flying Rocket 🚀 */}
                <div className="absolute right-3 bottom-20 z-10 text-5xl transform -rotate-45 animate-bounce">
                  🚀
                </div>

                {/* Gift Shop Grid Overlay */}
                <div className="relative z-10 bg-black/90 backdrop-blur-md rounded-xl p-1.5 border border-white/10 text-[7px]">
                  <div className="flex items-center justify-between text-gray-400 font-bold mb-1 border-b border-white/10 pb-0.5">
                    <span>GIFTS</span>
                    <span className="text-yellow-400">BUY COINS</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="bg-white/5 p-1 rounded border border-white/5">
                      <div>🐼</div>
                      <div className="text-yellow-400 font-bold">300</div>
                    </div>
                    <div className="bg-white/5 p-1 rounded border border-white/5">
                      <div>🛸</div>
                      <div className="text-yellow-400 font-bold">50,000</div>
                    </div>
                    <div className="bg-white/5 p-1 rounded border border-white/5">
                      <div>🚤</div>
                      <div className="text-yellow-400 font-bold">4,500</div>
                    </div>
                    <div className="bg-yellow-500/20 p-1 rounded border border-yellow-400">
                      <div>🚀</div>
                      <div className="text-yellow-400 font-black">50,000</div>
                    </div>
                  </div>
                </div>
              </div>
            </PhoneShowcase>

          </div>
        </div>

      </div>

      {/* iOS Modal */}
      <IOSNoticeModal isOpen={iosModalOpen} onClose={() => setIosModalOpen(false)} />
    </section>
  );
};

// ─── PHONE SHOWCASE CONTAINER (Matching Image 1 Phone Frame Aesthetic) ─────────
const PhoneShowcase = ({ title, children }) => (
  <div className="flex flex-col items-center">
    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 mb-3 tracking-tight">
      {title}
    </h3>
    <div className="w-[195px] h-[395px] sm:w-[210px] sm:h-[425px] rounded-[38px] bg-black p-2 border-4 border-gray-800 shadow-2xl shadow-black/30 relative flex flex-col overflow-hidden">
      {/* Dynamic Island / iPhone Notch */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-30 border border-gray-800 flex items-center justify-end px-1.5">
        <div className="w-1.5 h-1.5 bg-blue-900 rounded-full" />
      </div>
      
      {/* Screen Container */}
      <div className="w-full h-full rounded-[30px] overflow-hidden relative border border-white/10">
        {children}
      </div>
    </div>
  </div>
);

export default Hero;
