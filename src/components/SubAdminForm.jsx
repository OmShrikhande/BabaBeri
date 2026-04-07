import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import authService from '../services/authService';

const SubAdminForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.createSubAdmin(formData);

      if (result.success) {
        setSuccess(`Sub-admin "${formData.name}" created successfully!`);
        setFormData({ name: '', email: '', password: '' });
      } else {
        setError(result.error || 'Failed to create sub-admin.');
      }
    } catch (error) {
      console.error('Create sub-admin error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-3 bg-red-900/20 border border-red-800/50 text-red-400 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center space-x-3 bg-green-900/20 border border-green-800/50 text-green-400 p-4 rounded-lg">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Full Name</span>
            </div>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter admin's full name"
            className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:border-transparent transition-all duration-300"
            required
            disabled={isLoading}
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </div>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter admin's email address"
            className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:border-transparent transition-all duration-300"
            required
            disabled={isLoading}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Password</span>
            </div>
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter a secure password (min. 6 characters)"
            className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:border-transparent transition-all duration-300"
            required
            disabled={isLoading}
            minLength={6}
          />
          <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-medium rounded-lg hover:glow-pink focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Sub-Admin...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>Create Sub-Admin</span>
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="bg-[#2A2A2A] border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Sub-Admin Permissions</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Access to dashboard analytics and metrics</li>
          <li>• Manage agencies and hosts</li>
          <li>• View financial reports and transactions</li>
          <li>• Limited administrative privileges</li>
        </ul>
      </div>
    </div>
  );
};

export default SubAdminForm;
