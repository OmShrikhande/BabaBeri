import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, Shield, ExternalLink } from 'lucide-react';

const IOSNoticeModal = ({ isOpen, onClose }) => {
  const handleJoinEarlyAccess = () => {
    onClose();
    const section = document.getElementById('early-access');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Card */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Glow border wrapper */}
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/60 via-pink-500/40 to-cyan-500/60">
              <div className="relative rounded-2xl bg-[#0B1120]/95 backdrop-blur-xl p-8 overflow-hidden">
                {/* Inner glow blobs */}
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-gray-400 hover:text-white transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-pink-600/20 border border-purple-500/30 mb-6">
                  <Apple className="w-7 h-7 text-purple-400" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-1">iOS Notice</h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 mb-5" />

                {/* Body */}
                <div className="space-y-4 mb-7">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The iOS version of Proxstream is distributed using an alternative installation
                    method and is <span className="text-purple-400 font-medium">not built through the standard App Store process</span>.
                  </p>
                  <div className="flex items-start gap-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                    <Shield className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Installation instructions will be provided after joining Early Access.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium transition-all duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleJoinEarlyAccess}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Join Early Access
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IOSNoticeModal;
