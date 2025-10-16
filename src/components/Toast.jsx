import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ id, message, type = 'success', duration = 3000, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  const closeToast = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onRemove(id), 300); // Wait for exit animation
  }, [id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(closeToast, duration);
    return () => clearTimeout(timer);
  }, [duration, closeToast]);

  const handleManualClose = () => {
    if (!isVisible) return;
    closeToast();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/30';
      case 'error':
        return 'bg-red-900/20 border-red-500/30';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30';
      default:
        return 'bg-green-900/20 border-green-500/30';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg border backdrop-blur-sm
        ${getBackgroundColor()}
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        max-w-sm shadow-lg
      `}
    >
      {getIcon()}
      <span className="text-white font-medium flex-1">{message}</span>
      <button
        onClick={handleManualClose}
        className="text-gray-400 hover:text-white transition-colors"
        type="button"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;