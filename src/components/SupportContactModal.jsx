import React, { useEffect, useRef, useState } from 'react';
import { X, Paperclip, Send, Mail, Phone, MessageSquare } from 'lucide-react';
import { useLandingTheme } from '../context/LandingThemeContext';

const SupportContactModal = ({ open, onClose }) => {
  const { isDark } = useLandingTheme();
  const fileRef = useRef(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPhone('');
      setMessage('');
      setFile(null);
      setError('');
      setSent(false);
    }
  }, [open]);

  if (!open) return null;

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm border outline-none transition focus:ring-2 focus:ring-[#FD1D1D]/30 ${
    isDark
      ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
  }`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please enter a message (at least 10 characters).');
      return;
    }

    const body = [
      `Email: ${email.trim()}`,
      `Phone: ${phone.trim()}`,
      '',
      'Message:',
      message.trim(),
      file ? `\nAttachment selected: ${file.name} (${Math.round(file.size / 1024)} KB)` : '',
      '',
      '— Sent from Proxstream Support form',
    ]
      .filter(Boolean)
      .join('\n');

    const mailto = `mailto:complaints@proxstream.com?subject=${encodeURIComponent(
      'Proxstream Support Request'
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close support form"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#141418] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
          }}
        />

        <div className="flex items-start justify-between gap-3 p-5 pb-3">
          <div>
            <h2 id="support-modal-title" className="text-lg font-extrabold tracking-tight">
              Contact Support
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tell us what you need help with. We usually reply within 24–48 hours.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition ${
              isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-500'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <div className="p-6 pt-2 space-y-4">
            <div
              className={`rounded-xl p-4 text-sm ${
                isDark ? 'bg-white/5 text-gray-200' : 'bg-gray-50 text-gray-700'
              }`}
            >
              Your email app should open with the support request. If it didn&apos;t, write to{' '}
              <a
                href="mailto:complaints@proxstream.com"
                className="font-semibold bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] bg-clip-text text-transparent"
              >
                complaints@proxstream.com
              </a>
              .
              {file && (
                <p className="mt-2 text-xs opacity-80">
                  Please attach <strong>{file.name}</strong> manually in your email client.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #FD1D1D 55%, #FCB045 100%)',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 pt-2 space-y-3.5">
            <label className="block space-y-1.5">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputClass}
              />
            </label>

            <label className="block space-y-1.5">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Phone className="w-3.5 h-3.5" /> Phone number
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </label>

            <label className="block space-y-1.5">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or request..."
                className={`${inputClass} resize-none`}
              />
            </label>

            <div className="space-y-1.5">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Paperclip className="w-3.5 h-3.5" /> Attachment (optional)
              </span>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`w-full rounded-xl px-4 py-3 text-sm border border-dashed text-left transition ${
                  isDark
                    ? 'border-white/20 hover:bg-white/5 text-gray-300'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
              >
                {file ? (
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="text-xs opacity-70 shrink-0">{Math.round(file.size / 1024)} KB</span>
                  </span>
                ) : (
                  'Choose screenshot, video, or document'
                )}
              </button>
              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="text-xs text-[#FD1D1D] hover:underline"
                >
                  Remove file
                </button>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-400 font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #FD1D1D 55%, #FCB045 100%)',
              }}
            >
              <Send className="w-4 h-4" />
              Send request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupportContactModal;
