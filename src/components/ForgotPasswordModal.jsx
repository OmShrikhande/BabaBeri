import React, { useEffect, useState } from 'react';
import { X, Mail, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import authService from '../services/authService';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);
  const [tokenExpiresInMinutes, setTokenExpiresInMinutes] = useState(15);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setStep('email');
    setEmail('');
    setOtp('');
    setLoading(false);
    setError('');
    setMessage('');
    setExpiresInMinutes(10);
    setTokenExpiresInMinutes(15);
    setResendTimer(0);
  }, [isOpen]);

  useEffect(() => {
    if (resendTimer <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  if (!isOpen) {
    return null;
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your registered email.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const result = await authService.sendForgotPasswordOtp(trimmedEmail);
    setLoading(false);

    if (result.success) {
      setEmail(result.email || trimmedEmail);
      setExpiresInMinutes(result.expiresInMinutes ?? 10);
      setMessage(result.message || `OTP sent to ${result.email || trimmedEmail}`);
      setOtp('');
      setStep('otp');
      setResendTimer(60);
    } else {
      setError(result.error || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setError('Please enter the OTP from your email.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const result = await authService.verifyForgotPasswordOtp(email, trimmedOtp);
    setLoading(false);

    if (result.success) {
      setTokenExpiresInMinutes(result.tokenExpiresInMinutes ?? 15);
      setMessage(result.message || 'OTP verified. You can set a new password now.');
      setStep('success');
    } else {
      setError(result.error || 'OTP verification failed.');
    }
  };

  const handleBack = () => {
    setError('');
    setMessage('');
    if (step === 'otp') {
      setStep('email');
      setOtp('');
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close forgot password dialog"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#F72585] to-[#7209B7] px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Forgot Password</h2>
            <p className="text-white/80 text-xs mt-0.5">
              {step === 'email' && 'Enter your registered email'}
              {step === 'otp' && 'Verify the OTP sent to your email'}
              {step === 'success' && 'Verification complete'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {message && step !== 'success' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-300 text-sm">{message}</p>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Registered email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] text-sm"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm transition-all ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25'
                }`}
              >
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-[#121212] rounded-lg border border-gray-800 text-sm text-gray-400">
                OTP sent to <span className="text-gray-200">{email}</span>
                {expiresInMinutes ? (
                  <span> · valid for {expiresInMinutes} minutes</span>
                ) : null}
              </div>

              <div>
                <label htmlFor="forgot-otp" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] text-sm tracking-widest"
                    placeholder="6-digit code"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-gray-700 text-gray-300 text-sm hover:bg-[#121212] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.trim().length < 4}
                  className={`flex-[1.4] py-2.5 px-4 rounded-lg font-semibold text-white text-sm transition-all ${
                    loading || otp.trim().length < 4
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25'
                  }`}
                >
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
              </div>

              <button
                type="button"
                disabled={loading || resendTimer > 0}
                onClick={handleSendOtp}
                className={`w-full text-sm ${
                  resendTimer > 0
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-[#F72585] hover:text-[#ff4fa0]'
                }`}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">{message}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Your reset token is valid for {tokenExpiresInMinutes} minutes.
                  Use it with the password reset flow when available.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {step !== 'success' && (
            <button
              type="button"
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
