import React, { useState } from 'react';
import { Users, ChevronRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { subAdminsData } from '../data/subAdminsData';
import authService from '../services/authService';

const SubAdmins = ({ onNavigateToDetail }) => {
  const [subAdmins, setSubAdmins] = useState(subAdminsData);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
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

  const handleAddSubAdmin = async (e) => {
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
      // Call the API to create sub-admin
      const result = await authService.createSubAdmin(formData);

      if (result.success) {
        setSuccess(`Sub-admin "${formData.name}" created successfully!`);
        
        // Add to local state for immediate UI update
        const newSubAdmin = {
          id: result.data?.id || (subAdmins.length + 1),
          name: formData.name,
          adminId: result.data?.id || `SA${Date.now()}`,
          masterAgenciesCount: 0,
          profileImage: null,
          email: formData.email,
          mobile: result.data?.mobile || '',
          aadhaar: result.data?.aadhaar || '',
          dateOfBirth: result.data?.dateOfBirth || '',
          status: 'active',
          masterAgencies: [],
          apiData: result.data // Store the full API response
        };

        setSubAdmins(prev => [...prev, newSubAdmin]);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: ''
        });

        console.log('Sub-admin created via API:', result.data);
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

  const handleViewSubAdmin = (subAdminId) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(subAdminId);
    }
  };

  return (
    <div className="flex-1 bg-[#1A1A1A] text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-[#121212] border-b border-gray-800 p-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Users className="w-8 h-8 mr-3 text-[#F72585]" />
          Sub-Admins
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto table-scroll-container p-6">
        <div className="space-y-8">
          {/* Add Sub-Admin Form */}
          <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">Add Sub-Admin</h2>
            
            {/* Status Messages */}
            {error && (
              <div className="flex items-center space-x-3 bg-red-900/20 border border-red-800/50 text-red-400 p-4 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-3 bg-green-900/20 border border-green-800/50 text-green-400 p-4 rounded-lg mb-6">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}
            
            <form onSubmit={handleAddSubAdmin} className="space-y-6">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                    placeholder="Enter admin's full name"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                    placeholder="Enter admin's email address"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                    placeholder="Enter a secure password (min. 6 characters)"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              </div>
              
              {/* Password Info */}
              <div className="text-xs text-gray-500">
                Password must be at least 6 characters long
              </div>

              {/* Submit Button */}
              <div className="flex justify-start">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50 glow-pink disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Sub-Admin...</span>
                    </>
                  ) : (
                    <span>Add Sub-Admin</span>
                  )}
                </button>
              </div>
            </form>
            
            {/* API Info Box */}
            <div className="mt-6 bg-[#2A2A2A] border border-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">API Integration</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Sub-admins are created via API: <code className="text-[#F72585]">POST /create-admin</code></li>
                <li>• Requires JWT authentication token</li>
                <li>• Only Super Admins can create Sub-Admins</li>
                <li>• Created sub-admins will have limited dashboard access</li>
              </ul>
            </div>
          </div>

          {/* List of Sub-Admins */}
          <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">List of Sub-Admins</h2>
            </div>

            {/* Table Header */}
            <div className="bg-[#0A0A0A] border-b border-gray-800">
              <div className="grid grid-cols-4 gap-6 px-6 py-4">
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Sub-Admin Name</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Sub-Admin ID</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Master Agencies</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Action</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
              {subAdmins.map((subAdmin, index) => (
                <div 
                  key={subAdmin.id} 
                  className="grid grid-cols-4 gap-6 px-6 py-5 hover:bg-[#222222] transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Sub-Admin Name */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors"></div>
                    <div>
                      <div className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors">{subAdmin.name}</div>
                    </div>
                  </div>

                  {/* Sub-Admin ID */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{subAdmin.adminId}</span>
                  </div>

                  {/* Master Agencies */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">{subAdmin.masterAgenciesCount}</span>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center">
                    <button
                      onClick={() => handleViewSubAdmin(subAdmin.id)}
                      className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center hover:opacity-90 hover:shadow-lg transform hover:scale-110 transition-all duration-200 glow-pink"
                      aria-label="View sub-admin details"
                      title="View details"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {subAdmins.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No sub-admins found</h3>
                <p className="text-gray-400 max-w-md">
                  Add your first sub-admin using the form above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdmins;