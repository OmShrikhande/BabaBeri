import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader2, PlusCircle, Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';

const AdminForm = ({ onCreated, disabled = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.createAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        setSuccess(`Admin "${formData.name}" created successfully!`);
        const created = result.data;
        onCreated && onCreated(created);
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(result.error || 'Failed to create admin.');
      }
    } catch (err) {
      console.error('Create admin error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#18181B] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between h-full hover:border-gray-700/60 transition-colors">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F72585] to-[#7209B7] flex items-center justify-center shadow-lg shadow-purple-900/30">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Admin</h2>
            <p className="text-xs text-gray-400">Add an administrator role</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-3 bg-red-950/40 border border-red-900/40 text-red-400 p-4 rounded-xl mb-5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center space-x-3 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 p-4 rounded-xl mb-5">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0F0F12] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-all"
                placeholder="Enter admin name"
                required
                disabled={isLoading || disabled}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0F0F12] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-all"
                placeholder="Enter email"
                required
                disabled={isLoading || disabled}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-11 py-3 bg-[#0F0F12] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-all"
                placeholder="Enter password"
                required
                minLength={6}
                disabled={isLoading || disabled}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-11 py-3 bg-[#0F0F12] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-all"
                placeholder="Confirm password"
                required
                minLength={6}
                disabled={isLoading || disabled}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isLoading || disabled}
        className="mt-6 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50 glow-pink disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating Admin...</span>
          </>
        ) : (
          <>
            <PlusCircle className="w-5 h-5" />
            <span>Create Admin Account</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AdminForm;
