import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { blockDurations } from '../data/usersData';

const BlockModal = ({ isOpen, onClose, user, onBlock, loading = false }) => {
  const [selectedDuration, setSelectedDuration] = useState('24h');
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBlock = () => {
    if (!description.trim()) {
      alert('Please provide a reason for blocking the user.');
      return;
    }
    
    if (onBlock) {
      onBlock(user.id, selectedDuration, description);
    }
    handleDiscard();
  };

  const handleDiscard = () => {
    setDescription('');
    setSelectedDuration('24h');
    setIsDropdownOpen(false);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const selectedDurationLabel = blockDurations.find(d => d.value === selectedDuration)?.label || 'For 24 Hours';

  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-modal-title"
    >
      {/* Modal Container */}
      <div 
        className="bg-[#2A2A2A] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 
            id="block-modal-title"
            className="text-xl font-medium text-gray-300"
          >
            Block User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-8">
            
            {/* Left Column - User Info & Instructions */}
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-500 rounded-lg flex-shrink-0"></div>
                <div className="text-white">
                  <h3 className="font-medium text-xl mb-1">{user.username}</h3>
                  <p className="text-gray-400 text-base">{user.userId}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-white font-medium text-lg">{user.friends || '12k'}</div>
                  <div className="text-gray-400 text-sm">Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium text-lg">{user.following || '1k'}</div>
                  <div className="text-gray-400 text-sm">Followings</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium text-lg">{user.followers || '12.3L'}</div>
                  <div className="text-gray-400 text-sm">Followers</div>
                </div>
              </div>

              {/* Important Instructions */}
              <div className="space-y-4">
                <h4 className="text-white text-base font-medium">Important Instructions</h4>
                <ul className="space-y-3 text-gray-300 text-sm leading-relaxed">
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-3 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                    <span>Once you ban the user, then only admin can unban the user.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-3 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                    <span>Banning this user for selected period cannot able to login into the system or can access the account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-3 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                    <span>If the user gets frequently banned then it can lead to permanent account ban.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="space-y-6">
              {/* Block Duration Dropdown */}
              <div className="space-y-3">
                <label className="text-white text-base font-medium block">Block user for</label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-transparent border border-gray-500 rounded-full px-6 py-3 text-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                  >
                    <span className="text-base">{selectedDurationLabel}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#2A2A2A] border border-gray-500 rounded-2xl shadow-2xl z-20 overflow-hidden">
                      {blockDurations.map((duration) => (
                        <button
                          key={duration.value}
                          onClick={() => {
                            setSelectedDuration(duration.value);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-6 py-3 text-left text-white hover:bg-gray-700 transition-colors border-b border-gray-600 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          {duration.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-white text-base font-medium block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the valid reason for banning the user ..."
                  className="w-full bg-transparent border border-gray-500 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-all resize-none text-sm"
                  rows={6}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleBlock}
                  disabled={loading || !description.trim()}
                  className="flex-1 bg-gradient-to-r from-[#F72585] to-[#B83493] text-white py-3 px-6 rounded-full font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Blocking...
                    </div>
                  ) : (
                    'Block User'
                  )}
                </button>
                <button
                  onClick={handleDiscard}
                  disabled={loading}
                  className="flex-1 border border-[#F72585] text-[#F72585] py-3 px-6 rounded-full font-medium hover:bg-[#F72585] hover:bg-opacity-10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockModal;