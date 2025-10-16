import React, { useState } from 'react';
import { Eye, EyeOff, LayoutDashboard, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Real API authentication
      const result = await authService.login({
        username: formData.username,
        email: formData.username, // Support both username and email
        password: formData.password
      });

      if (result.success) {
        // Always use normalized userType from service
        const userType = authService.getUserType();
        
        onLogin({
          username: formData.username,
          userType,
          token: result.token,
          isDemo: false,
          apiData: result.data
        });
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container bg-[#121212] min-h-screen overflow-y-auto enhanced-scrollbar mobile-scroll-fix prevent-horizontal-overflow">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F72585] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#7209B7] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[#4361EE] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Mobile Layout (Vertical) */}
      <div className="relative flex items-start justify-center min-h-screen p-4 py-8 md:hidden">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Login Card */}
          <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F72585] to-[#7209B7] p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-white mb-1">PRO X STREAM</h1>
              <p className="text-white/80 text-xs">Admin Dashboard Login</p>
              
            </div>

            {/* Mobile Login Form */}
            <div className="p-4">
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Username Field */}
                <div>
                  <label htmlFor="mobile-username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    id="mobile-username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors text-sm"
                    placeholder="Enter your username or email"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="mobile-password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="mobile-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors text-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    w-full py-2 px-3 rounded-lg font-semibold text-white transition-all duration-300 text-sm
                    ${isLoading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : `bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25 hover:scale-[1.02] active:scale-[0.98]`
                    }
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    `Sign In`
                  )}
                </button>
              </form>

              {/* Credentials Info */}
              <div className="mt-4 p-3 bg-[#121212] rounded-lg border border-gray-800">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Login with your credentials</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Role-based access will be automatically assigned.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="text-center mt-4">
            <p className="text-gray-500 text-xs">
              © 2024 PRO X STREAM. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Layout (Horizontal) */}
      <div className="hidden md:flex items-start justify-center min-h-screen p-6 py-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* Horizontal Login Card */}
          <div className="bg-[#1A1A1A] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              
              {/* Left Side - Branding */}
              <div className="bg-gradient-to-br from-[#F72585] via-[#7209B7] to-[#4361EE] p-8 lg:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
                  <div className="absolute bottom-10 right-10 w-24 h-24 border border-white/20 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6">
                    <LayoutDashboard className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">PRO X STREAM</h1>
                  <p className="text-white/90 text-lg mb-6">Admin Dashboard</p>
                  <div className="space-y-3 text-white/80">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Manage your streaming platform</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Monitor real-time analytics</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span>Control user permissions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Sign in to access your dashboard</p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Username Field */}
                    <div>
                      <label htmlFor="desktop-username" className="block text-sm font-medium text-gray-300 mb-2">
                        Username or Email
                      </label>
                      <input
                        type="text"
                        id="desktop-username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20 transition-colors"
                        placeholder="Enter your username or email"
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="desktop-password" className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="desktop-password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20 transition-colors"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`
                        w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300
                        ${isLoading 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : `bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:shadow-lg hover:shadow-[#F72585]/25 hover:scale-[1.02] active:scale-[0.98]`
                        }
                      `}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        `Sign In`
                      )}
                    </button>
                  </form>

                  {/* Credentials Info */}
                  <div className="mt-6 p-4 bg-[#121212] rounded-xl border border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Login with your credentials</h4>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Role-based access will be automatically assigned.</p>
                    </div>
                  </div>

                  {/* Desktop Footer */}
                  <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                      © 2024 PRO X STREAM. All rights reserved.
                    </p>
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
