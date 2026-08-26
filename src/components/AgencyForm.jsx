import React, { useState, useEffect } from 'react';
import { Building2, User, AlertCircle, CheckCircle, Loader2, PlusCircle, Users, Lock, Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';

const AgencyForm = ({ onCreated, disabled = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    masterAgencyCode: '',
    password: ''
  });
  const [masterAgencies, setMasterAgencies] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAgencies, setIsFetchingAgencies] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMasterAgencies();
  }, []);

  const extractAgencyCode = (agency) => authService.extractUserCode(agency) || '';

  const fetchMasterAgencies = async () => {
    setIsFetchingAgencies(true);
    try {
      const result = await authService.getMasterAgencies();
      if (result.success) {
        const agencies = Array.isArray(result.data) ? result.data : result.data?.data || [];
        setMasterAgencies(agencies);
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

    if (!formData.name.trim() || !formData.userId.trim() || !formData.masterAgencyCode.trim() || !formData.password.trim()) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.createAgency({
        name: formData.name,
        userId: formData.userId,
        masterAgencyCode: formData.masterAgencyCode,
        password: formData.password
      });

      if (result.success) {
        setSuccess(`Agency "${formData.name}" created successfully!`);
        const created = result.data;
        onCreated && onCreated(created);
        setFormData({ name: '', userId: '', masterAgencyCode: '', password: '' });
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
    <div className="bg-[#18181B] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between h-full hover:border-gray-700/60 transition-colors">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4361EE] to-[#4CC9F0] flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Agency</h2>
            <p className="text-xs text-gray-400">Add an agency branch under a master</p>
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
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Agency Name</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0F0F12] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-all"
                placeholder="Enter agency name"
                required
                disabled={isLoading || disabled}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Master Agency</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select
                name="masterAgencyCode"
                value={formData.masterAgencyCode}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0F0F12] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-all appearance-none cursor-pointer"
                required
                disabled={isLoading || disabled || isFetchingAgencies}
              >
                <option value="">Select a master agency</option>
                {masterAgencies.map((agency, index) => {
                  const code = extractAgencyCode(agency);
                  const displayName =
                    agency.name ||
                    agency.agencyName ||
                    agency.AgencyName ||
                    agency.userName ||
                    agency.username ||
                    agency.UserName ||
                    code ||
                    `Agency ${index + 1}`;
                  return (
                    <option key={`${code}-${index}`} value={code}>
                      {displayName} {code ? `(${code})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Host ID</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#0F0F12] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-all"
                placeholder="Enter host code (e.g. PX315)"
                required
                disabled={isLoading || disabled}
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-500">Host must not already belong to another agency.</p>
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
            <p className="mt-1 text-[10px] text-gray-500">Used for the new agency account credential.</p>
          </div>
        </form>
      </div>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isLoading || disabled || isFetchingAgencies}
        className="mt-6 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50 glow-pink disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating Agency...</span>
          </>
        ) : (
          <>
            <PlusCircle className="w-5 h-5" />
            <span>Create Agency Account</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AgencyForm;
