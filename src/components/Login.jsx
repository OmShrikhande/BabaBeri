import React, { useState } from 'react';
import { Eye, EyeOff, LayoutDashboard, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import authService from '../services/authService';
import { writeStoredUserInfo } from '../services/tokenStore';
import ForgotPasswordForm from './ForgotPasswordForm';

const panelVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 48 : -48,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -48 : 48,
    transition: { duration: 0.24, ease: [0.4, 0, 1, 1] },
  }),
};

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  /** 'login' | 'forgot' */
  const [panel, setPanel] = useState('login');
  const [direction, setDirection] = useState(1);

  const goForgot = () => {
    setError('');
    setDirection(1);
    setPanel('forgot');
  };

  const goLogin = () => {
    setDirection(-1);
    setPanel('login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login({
        username: formData.username,
        email: formData.username,
        password: formData.password,
      });

      if (result.success) {
        const userType = authService.getUserType();

        onLogin({
          username: formData.username,
          userType,
          token: result.token,
          isDemo: false,
          apiData: result.data,
        });

        if (result.data) {
          try {
            const mergedInfo = {
              ...(authService.getUserInfo() || {}),
              ...(typeof result.data === 'object' ? result.data : {}),
            };
            writeStoredUserInfo(mergedInfo);
          } catch (storageError) {
            console.error('Failed to cache user info after login:', storageError);
          }
        }
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginForm = ({ dense }) => (
    <div className="w-full">
      {!dense && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to access your dashboard</p>
        </div>
      )}

      {error && (
        <div
          className={`mb-4 ${dense ? 'p-3' : 'mb-6 p-4'} bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2`}
        >
          <AlertCircle className={`${dense ? 'w-4 h-4' : 'w-5 h-5'} text-red-400 flex-shrink-0`} />
          <p className={`text-red-400 ${dense ? 'text-xs' : 'text-sm'}`}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={dense ? 'space-y-4' : 'space-y-6'}>
        <div>
          <label
            htmlFor={dense ? 'mobile-username' : 'desktop-username'}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Username or Email
          </label>
          <input
            type="text"
            id={dense ? 'mobile-username' : 'desktop-username'}
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full ${dense ? 'px-3 py-2 text-sm rounded-lg' : 'px-4 py-3 rounded-xl'} bg-[#121212] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20 transition-colors`}
            placeholder="Enter your username or email"
            required
          />
        </div>

        <div>
          <label
            htmlFor={dense ? 'mobile-password' : 'desktop-password'}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id={dense ? 'mobile-password' : 'desktop-password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full ${dense ? 'px-3 py-2 pr-10 text-sm rounded-lg' : 'px-4 py-3 pr-12 rounded-xl'} bg-[#121212] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20 transition-colors`}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${dense ? 'right-2' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors`}
            >
              {showPassword ? (
                <EyeOff className={dense ? 'w-4 h-4' : 'w-5 h-5'} />
              ) : (
                <Eye className={dense ? 'w-4 h-4' : 'w-5 h-5'} />
              )}
            </button>
          </div>
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={goForgot}
              className={`${dense ? 'text-xs' : 'text-sm'} text-[#F72585] hover:text-[#ff4fa0] transition-colors`}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full ${dense ? 'py-2 px-3 text-sm rounded-lg' : 'py-3 px-4 rounded-xl'} font-semibold text-white transition-all duration-300 ${
            isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div
                className={`${dense ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-white/30 border-t-white rounded-full animate-spin`}
              />
              <span>Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div
        className={`${dense ? 'mt-4 p-3 rounded-lg' : 'mt-6 p-4 rounded-xl'} bg-[#121212] border border-gray-800`}
      >
        <h4 className={`${dense ? 'text-xs' : 'text-sm'} font-semibold text-gray-300 mb-2`}>
          Login with your credentials
        </h4>
        <div className={`${dense ? 'text-xs' : 'text-sm'} text-gray-400 space-y-1`}>
          <p>Role-based access will be automatically assigned.</p>
        </div>
      </div>
    </div>
  );

  const animatedPanel = (dense) => (
    <div className="relative overflow-hidden min-h-[320px]">
      <AnimatePresence mode="wait" custom={direction}>
        {panel === 'login' ? (
          <motion.div
            key="login"
            custom={direction}
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {loginForm({ dense })}
          </motion.div>
        ) : (
          <motion.div
            key="forgot"
            custom={direction}
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ForgotPasswordForm onBack={goLogin} dense={dense} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="login-container bg-[#121212] min-h-screen overflow-y-auto enhanced-scrollbar mobile-scroll-fix prevent-horizontal-overflow">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F72585] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#7209B7] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[#4361EE] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000" />
      </div>

      {/* Mobile */}
      <div className="relative flex items-start justify-center min-h-screen p-4 py-8 md:hidden">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden w-full">
            <div className="bg-gradient-to-r from-[#F72585] to-[#7209B7] p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-white mb-1">PRO X STREAM</h1>
              <p className="text-white/80 text-xs">
                {panel === 'login' ? 'Admin Dashboard Login' : 'Password Recovery'}
              </p>
            </div>
            <div className="p-4">{animatedPanel(true)}</div>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500 text-xs">© 2024 PRO X STREAM. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-start justify-center min-h-screen p-6 py-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-[#1A1A1A] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              <div className="bg-gradient-to-br from-[#F72585] via-[#7209B7] to-[#4361EE] p-8 lg:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full" />
                  <div className="absolute bottom-10 right-10 w-24 h-24 border border-white/20 rounded-full" />
                  <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white/20 rounded-full" />
                </div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6">
                    <LayoutDashboard className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">PRO X STREAM</h1>
                  <p className="text-white/90 text-lg mb-6">Admin Dashboard</p>
                  <div className="space-y-3 text-white/80">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <span>Manage your streaming platform</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <span>Monitor real-time analytics</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <span>Control user permissions</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  {animatedPanel(false)}
                  <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">© 2024 PRO X STREAM. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
