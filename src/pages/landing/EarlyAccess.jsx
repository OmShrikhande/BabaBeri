import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

const EarlyAccess = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="early-access" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-700/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-700/8 rounded-full blur-[80px]" />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.4), transparent)' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Outer glow card */}
          <div
            className="relative rounded-3xl p-[1px]"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(34,211,238,0.3), rgba(236,72,153,0.3))',
            }}
          >
            <div
              className="rounded-3xl px-8 py-12 md:px-14 md:py-16 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(11,17,32,0.98) 0%, rgba(168,85,247,0.06) 100%)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Inner blobs */}
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                Limited Spots
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Join{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #EC4899, #A855F7)' }}
                >
                  Early Access
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-10">
                Be among the first users to experience Proxstream before the official launch.
              </p>

              {/* Form */}
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-5 py-4 rounded-2xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${focused ? 'rgba(168,85,247,0.7)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: focused ? '0 0 20px rgba(168,85,247,0.2)' : 'none',
                      }}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-sm whitespace-nowrap transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #EC4899, #A855F7)',
                      boxShadow: '0 0 20px rgba(236,72,153,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 40px rgba(236,72,153,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(236,72,153,0.3)';
                    }}
                  >
                    <Send className="w-4 h-4" />
                    Get Access
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(34,211,238,0.2))',
                      border: '1px solid rgba(168,85,247,0.4)',
                    }}
                  >
                    <CheckCircle className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-white font-semibold text-lg">Thanks for joining Early Access!</p>
                  <p className="text-gray-400 text-sm">We'll reach out to you soon with details.</p>
                </motion.div>
              )}

              {!submitted && (
                <p className="text-gray-600 text-xs mt-4">
                  No spam. Unsubscribe anytime.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EarlyAccess;
