import React, { useState, useEffect } from 'react';
import { Building2, User, AlertCircle, CheckCircle, Loader2, PlusCircle, Users } from 'lucide-react';
import authService from '../services/authService';

const MasterAgencyCreateAgency = ({ onCreated, disabled = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    masterAgencyCode: ''
  });
  const [masterAgencies, setMasterAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAgencies, setIsFetchingAgencies] = useState(true);
  const [isMasterAgencyUser, setIsMasterAgencyUser] = useState(false);
  const [currentMasterAgencyName, setCurrentMasterAgencyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = () => {
    const userType = authService.getUserType();
    const userInfo = authService.getUserInfo();
    
    if (userType === 'master-agency') {
      setIsMasterAgencyUser(true);
      const userCode = authService.extractUserCode(userInfo);
      const userName = userInfo?.username || userInfo?.name || userInfo?.email || 'Current User';
      
      if (userCode) {
        setFormData(prev => ({ ...prev, masterAgencyCode: userCode }));
        setCurrentMasterAgencyName(userName);
      }
      setIsFetchingAgencies(false);
    } else {
      fetchMasterAgencies();
    }
  };

  const fetchMasterAgencies = async () => {
    setIsFetchingAgencies(true);
    try {
      const result = await authService.getMasterAgencies();
      if (result.success) {
        const agencies = Array.isArray(result.data) ? result.data : result.data?.data || [];
        setMasterAgencies(agencies);
        if (agencies.length === 0) {
          console.warn('No master agencies found');
        }
      } else {
        console.error('Failed to load master agencies:', result.error);
      }
    } catch (err) {
      console.error('Fetch master agencies error:', err);
    } finally {
      setIsFetchingAgencies(false);
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

    if (!formData.name.trim() || !formData.userId.trim() || !formData.masterAgencyCode.trim()) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.createAgency({
        name: formData.name,
        userId: formData.userId,
        masterAgencyCode: formData.masterAgencyCode
      });

      if (result.success) {
        setSuccess(`Agency "${formData.name}" created successfully!`);
        const created = result.data;
        onCreated && onCreated(created);
        setFormData({ name: '', userId: '', masterAgencyCode: '' });
      } else {
        setError(result.error || 'Failed to create agency.');
      }
    } catch (err) {
      console.error('Create agency error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-[#F72585]" />
        Create Agency
      </h2>

      {error && (
        <div className="flex items-center space-x-3 bg-red-900/20 border border-red-800/50 text-red-400 p-4 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-3 bg-green-900/20 border border-green-800/50 text-green-400 p-4 rounded-lg mb-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Agency Name</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
              placeholder="Enter agency name"
              required
              disabled={isLoading || disabled}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Master Agency</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            {isMasterAgencyUser ? (
              <input
                type="text"
                value={`${currentMasterAgencyName} (${formData.masterAgencyCode})`}
                readOnly
                className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed focus:outline-none"
              />
            ) : (
              <select
                name="masterAgencyCode"
                value={formData.masterAgencyCode}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                required
                disabled={isLoading || disabled || isFetchingAgencies}
              >
                <option value="">Select a master agency</option>
                {masterAgencies.map((agency, index) => {
                  const code = agency.userCode || agency.UserCode || agency.code || agency.Code || agency.user_code || agency.usercode || agency.Usercode || agency.id || agency.userId;
                  const displayName = agency.name || agency.userName || `Agency ${index}`;
                  return (
                    <option key={index} value={code}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
              placeholder="Enter user ID"
              required
              disabled={isLoading || disabled}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || disabled || isFetchingAgencies}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50 glow-pink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>Create Agency</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MasterAgencyCreateAgency;
