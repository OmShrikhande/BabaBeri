import React, { useState, useEffect } from 'react';
import { Building2, Mail, Lock, AlertCircle, CheckCircle, Loader2, PlusCircle, User } from 'lucide-react';
import authService from '../services/authService';

// Reusable form to create a Master Agency
// Props:
// - onCreated: function(newAgencyData) -> called when API succeeds
// - disabled: boolean -> disable form when parent restricts
// - adminName: string -> default admin name to use
const MasterAgencyForm = ({ onCreated, disabled = false, adminName = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    code: adminName || ''
  });
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAdmins, setIsFetchingAdmins] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsFetchingAdmins(true);
    setFetchError('');
    try {
      const result = await authService.getAdmins();
      if (result.success) {
        const adminList = Array.isArray(result.data) ? result.data : result.data?.data || [];
        setAdmins(adminList);
        if (adminList.length === 0) {
          console.warn('No admins found');
        }
      } else {
        console.error('Failed to load admins:', result.error);
        setFetchError('Could not load admins list. You can still create a master agency by entering the admin name manually.');
      }
    } catch (err) {
      console.error('Fetch admins error:', err);
      setFetchError('Could not load admins list. You can still create a master agency by entering the admin name manually.');
    } finally {
      setIsFetchingAdmins(false);
    }
  };

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

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.code.trim()) {
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
      const result = await authService.createMasterAgency({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        code: formData.code
      });

      if (result.success) {
        setSuccess(`Master agency "${formData.name}" created successfully!`);
        const created = result.data;
        // Inform parent
        onCreated && onCreated(created);
        // Reset form
        setFormData({ name: '', email: '', password: '', code: adminName || '' });
      } else {
        setError(result.error || 'Failed to create master agency.');
      }
    } catch (err) {
      console.error('Create master agency error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-[#F72585]" />
        Create Master Agency
      </h2>

      {error && (
        <div className="flex items-center space-x-3 bg-red-900/20 border border-red-800/50 text-red-400 p-4 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {fetchError && (
        <div className="flex items-center space-x-3 bg-yellow-900/20 border border-yellow-800/50 text-yellow-400 p-4 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{fetchError}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-3 bg-green-900/20 border border-green-800/50 text-green-400 p-4 rounded-lg mb-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Master Agency Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Master Agency Name</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
              placeholder="Enter master agency name"
              required
              disabled={isLoading || disabled}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
              placeholder="Enter email"
              required
              disabled={isLoading || disabled}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
              placeholder="Enter a secure password (min. 6 characters)"
              required
              minLength={6}
              disabled={isLoading || disabled}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
        </div>

        {/* Admin Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Admin</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
              required
              disabled={isLoading || disabled || isFetchingAdmins}
            >
              <option value="">Select an admin</option>
              {admins.map((admin, index) => (
                <option key={index} value={admin.name || admin.userName || `Admin ${index}`}>
                  {admin.name || admin.userName || `Admin ${index}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || disabled || isFetchingAdmins}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50 glow-pink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>Create Master Agency</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MasterAgencyForm;