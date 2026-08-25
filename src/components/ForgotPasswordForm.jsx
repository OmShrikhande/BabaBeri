import React, { useEffect, useRef, useState } from 'react';
import {
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import authService from '../services/authService';

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

/**
 * Inline forgot-password form:
 * email → OTP → set new password (reset) → success
 */
const ForgotPasswordForm = ({ onBack, dense = false }) => {
  const [step, setStep] = useState('email'); // email | otp | reset | success
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);
  const [tokenExpiresInMinutes, setTokenExpiresInMinutes] = useState(15);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const otp = otpDigits.join('');
  const inputPad = dense ? 'py-2.5 text-sm' : 'py-3';
  const labelCls = 'text-sm mb-2';

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
      setOtpDigits(['', '', '', '', '', '']);
      setResetToken('');
      setStep('otp');
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } else {
      setError(result.error || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the OTP from your email.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const result = await authService.verifyForgotPasswordOtp(email, otp);
    setLoading(false);

    if (result.success) {
      if (!result.resetToken) {
        setError('OTP verified but no reset token was returned. Please try again.');
        return;
      }
      setResetToken(result.resetToken);
      setTokenExpiresInMinutes(result.tokenExpiresInMinutes ?? 15);
      setMessage(result.message || 'OTP verified. Set your new password.');
      setNewPassword('');
      setConfirmPassword('');
      setStep('reset');
    } else {
      setError(result.error || 'OTP verification failed.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!resetToken) {
      setError('Reset token missing. Please verify OTP again.');
      setStep('otp');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const result = await authService.resetForgotPassword({
      email,
      resetToken,
      newPassword,
      confirmPassword,
    });
    setLoading(false);

    if (result.success) {
      setMessage(result.message || 'Password reset successfully. You can sign in now.');
      setStep('success');
    } else {
      setError(result.error || 'Failed to reset password.');
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) {
      return;
    }
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleStepBack = () => {
    setError('');
    setMessage('');
    if (step === 'otp') {
      setStep('email');
      setOtpDigits(['', '', '', '', '', '']);
      return;
    }
    if (step === 'reset') {
      setStep('otp');
      setNewPassword('');
      setConfirmPassword('');
      return;
    }
    onBack?.();
  };

  const stepSubtitle = {
    email: 'Enter your registered email to receive an OTP',
    otp: 'Enter the 6-digit code we sent you',
    reset: `Choose a new password (token valid ~${tokenExpiresInMinutes} min)`,
    success: 'Password updated successfully',
  }[step];

  return (
    <div className="w-full">
      <div className={dense ? 'mb-4' : 'mb-6'}>
        <button
          type="button"
          onClick={handleStepBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'email' || step === 'success' ? 'Back to Sign In' : 'Back'}
        </button>
        <h2 className={`font-bold text-white ${dense ? 'text-xl' : 'text-3xl'} mb-1`}>
          Forgot Password
        </h2>
        <p className="text-gray-400 text-sm">{stepSubtitle}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {message && step !== 'success' && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-300 text-sm">{message}</p>
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div>
            <label htmlFor="forgot-email" className={`block font-medium text-gray-300 ${labelCls}`}>
              Registered email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-3 ${inputPad} bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20`}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${dense ? 'py-2.5 text-sm' : 'py-3'} px-4 rounded-xl font-semibold text-white transition-all ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="p-3 bg-[#121212] rounded-xl border border-gray-800 text-sm text-gray-400">
            OTP sent to <span className="text-gray-200">{email}</span>
            {expiresInMinutes ? <span> · valid for {expiresInMinutes} min</span> : null}
          </div>

          <div>
            <label className={`block font-medium text-gray-300 ${labelCls}`}>Enter OTP</label>
            <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`${dense ? 'h-11' : 'h-12'} w-full text-center text-lg font-semibold tracking-widest bg-[#121212] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20`}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <KeyRound className="w-3 h-3" /> 6-digit code from your email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 4}
            className={`w-full ${dense ? 'py-2.5 text-sm' : 'py-3'} px-4 rounded-xl font-semibold text-white transition-all ${
              loading || otp.length < 4
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25'
            }`}
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>

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

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="forgot-new-password" className={`block font-medium text-gray-300 ${labelCls}`}>
              New password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="forgot-new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-10 pr-10 ${inputPad} bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20`}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="forgot-confirm-password"
              className={`block font-medium text-gray-300 ${labelCls}`}
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="forgot-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-10 ${inputPad} bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20`}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 6}
            className={`w-full ${dense ? 'py-2.5 text-sm' : 'py-3'} px-4 rounded-xl font-semibold text-white transition-all ${
              loading || newPassword.length < 6
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25'
            }`}
          >
            {loading ? 'Updating…' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="space-y-5 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-medium">{message}</p>
            <p className="text-gray-400 text-sm mt-2">
              Use your new password to sign in to the dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className={`w-full ${dense ? 'py-2.5 text-sm' : 'py-3'} px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25`}
          >
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
