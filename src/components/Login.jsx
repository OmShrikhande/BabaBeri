import React, { useState } from 'react';
import { Eye, EyeOff, LayoutDashboard, Shield, Crown, User, AlertCircle, TestTube } from 'lucide-react';
import authService from '../services/authService';
import RoleTestComponent from './RoleTestComponent';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showRoleTest, setShowRoleTest] = useState(false);

  const userTypes = [
    {
      id: 'super-admin',
      label: 'Super Admin',
      icon: Crown,
      color: 'from-[#F72585] to-[#7209B7]',
      description: 'Full system access'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      color: 'from-[#7209B7] to-[#4361EE]',
      description: 'Administrative access'
    },
    {
      id: 'sub-admin',
      label: 'Sub Admin',
      icon: User,
      color: 'from-[#4361EE] to-[#4CC9F0]',
      description: 'Sub admin access'
    },
    {
      id: 'master-agency',
      label: 'Master Agency',
      icon: User,
      color: 'from-[#4CC9F0] to-[#06FFA5]',
      description: 'Master agency access'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeSelect = (userType) => {
    setFormData(prev => ({
      ...prev,
      userType
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isDemoMode) {
        // Demo mode - simulate login
        setTimeout(() => {
          setIsLoading(false);
          onLogin({
            ...formData,
            isDemo: true
          });
        }, 1500);
        return;
      }

      // Real API authentication
      const result = await authService.login({
        username: formData.username,
        email: formData.username, // Support both username and email
        password: formData.password
      });

      if (result.success) {
        // Get user type from token or default based on selection
        const userType = authService.getUserType() || formData.userType;
        
        onLogin({
          username: formData.username,
          userType: userType,
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

  const handleDemoLogin = () => {
    setIsDemoMode(true);
    setFormData({
      username: 'admin',
      password: 'admin123',
      userType: 'admin'
    });
  };

  const handleRealLogin = () => {
    setIsDemoMode(false);
    setError('');
    setFormData({
      username: '',
      password: '',
      userType: 'super-admin'
    });
  };

  const selectedUserType = userTypes.find(type => type.id === formData.userType);

  // Show role test component if requested
  if (showRoleTest) {
    return <RoleTestComponent onLogin={onLogin} />;
  }

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
              
              {/* Mode Toggle */}
              <div className="flex mt-3 bg-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={handleRealLogin}
                  className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-all ${
                    !isDemoMode 
                      ? 'bg-white text-[#F72585]' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Real Login
                </button>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-all ${
                    isDemoMode 
                      ? 'bg-white text-[#F72585]' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Demo Mode
                </button>
              </div>
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
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select User Type
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {userTypes.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = formData.userType === type.id;
                      
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleUserTypeSelect(type.id)}
                          className={`
                            relative p-3 rounded-lg border-2 transition-all duration-300 text-left
                            ${isSelected 
                              ? 'border-[#F72585] bg-[#F72585]/10 glow-pink' 
                              : 'border-gray-700 hover:border-gray-600 bg-[#121212]'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              bg-gradient-to-r ${type.color}
                            `}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{type.label}</h3>
                              <p className="text-xs text-gray-400">{type.description}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-[#F72585] rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Username Field */}
                <div>
                  <label htmlFor="mobile-username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="mobile-username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors text-sm"
                    placeholder="Enter your username"
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
                      : `bg-gradient-to-r ${selectedUserType.color} hover:shadow-lg hover:shadow-[#F72585]/25 hover:scale-[1.02] active:scale-[0.98]`
                    }
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    `Sign In as ${selectedUserType.label}`
                  )}
                </button>
              </form>

              {/* Credentials Info */}
              <div className="mt-4 p-3 bg-[#121212] rounded-lg border border-gray-800">
                {isDemoMode ? (
                  <>
                    <h4 className="text-xs font-semibold text-gray-300 mb-2">Demo Credentials:</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Username: <span className="text-white">admin</span> | Password: <span className="text-white">admin123</span></p>
                      <p className="text-gray-500">Any credentials will work for demo purposes</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-xs font-semibold text-gray-300 mb-2">Super Admin Login:</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Use your Super Admin credentials</p>
                      <p className="text-gray-500">Real API authentication enabled</p>
                    </div>
                  </>
                )}
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
                    
                    {/* Mode Toggle */}
                    <div className="flex mt-4 bg-[#121212] rounded-xl p-1 border border-gray-700">
                      <button
                        type="button"
                        onClick={handleRealLogin}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          !isDemoMode 
                            ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Real Login
                      </button>
                      <button
                        type="button"
                        onClick={handleDemoLogin}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          isDemoMode 
                            ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Demo Mode
                      </button>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Select User Type
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {userTypes.map((type) => {
                          const IconComponent = type.icon;
                          const isSelected = formData.userType === type.id;
                          
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => handleUserTypeSelect(type.id)}
                              className={`
                                relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                                ${isSelected 
                                  ? 'border-[#F72585] bg-[#F72585]/10 glow-pink' 
                                  : 'border-gray-700 hover:border-gray-600 bg-[#121212]'
                                }
                              `}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`
                                  w-12 h-12 rounded-xl flex items-center justify-center
                                  bg-gradient-to-r ${type.color}
                                `}>
                                  <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-base font-semibold text-white">{type.label}</h3>
                                  <p className="text-sm text-gray-400">{type.description}</p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-3 h-3 bg-[#F72585] rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Username Field */}
                    <div>
                      <label htmlFor="desktop-username" className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        id="desktop-username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/20 transition-colors"
                        placeholder="Enter your username"
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
                          : `bg-gradient-to-r ${selectedUserType.color} hover:shadow-lg hover:shadow-[#F72585]/25 hover:scale-[1.02] active:scale-[0.98]`
                        }
                      `}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        `Sign In as ${selectedUserType.label}`
                      )}
                    </button>
                  </form>

                  {/* Credentials Info */}
                  <div className="mt-6 p-4 bg-[#121212] rounded-xl border border-gray-800">
                    {isDemoMode ? (
                      <>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Demo Credentials:</h4>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Username: <span className="text-white">admin</span> | Password: <span className="text-white">admin123</span></p>
                          <p className="text-gray-500">Any credentials will work for demo purposes</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Super Admin Login:</h4>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Use your Super Admin credentials</p>
                          <p className="text-gray-500">Real API authentication enabled</p>
                        </div>
                      </>
                    )}
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