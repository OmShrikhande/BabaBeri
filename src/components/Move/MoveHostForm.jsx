import React, { useState, useEffect } from 'react';
import { Users, ArrowRightLeft, AlertCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import authService from '../../services/authService';

const MoveHostForm = ({ onMoved, disabled = false }) => {
  const [formData, setFormData] = useState({
    userId: '',
    newAgencyId: ''
  });
  const [currentHierarchy, setCurrentHierarchy] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    if (formData.userId) {
      fetchCurrentHierarchy();
    } else {
      setCurrentHierarchy(null);
    }
  }, [formData.userId]);

  const fetchAgencies = async () => {
    setIsFetching(true);
    try {
      const result = await authService.getAgencies();
      if (result.success) {
        setAgencies(result.data);
      }
    } catch (err) {
      console.error('Fetch agencies error:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCurrentHierarchy = async () => {
    setIsFetching(true);
    try {
      const result = await authService.getHostHierarchy(formData.userId);
      if (result.success) {
        setCurrentHierarchy(result.data);
      }
    } catch (err) {
      console.error('Fetch hierarchy error:', err);
    } finally {
      setIsFetching(false);
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

    if (!formData.userId.trim() || !formData.newRole.trim()) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.moveHost({
        userId: formData.userId,
        newAgencyId: formData.newAgencyId
      });

      if (result.success) {
        setSuccess(`Host "${formData.userId}" moved successfully!`);
        const moved = result.data;
        onMoved && onMoved(moved);
        setFormData({ userId: '', newAgencyId: '' });
        setCurrentHierarchy(null);
      } else {
        setError(result.error || 'Failed to move host.');
      }
    } catch (err) {
      console.error('Move admin error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ArrowRightLeft className="w-5 h-5 text-[#F72585]" />
        Move Host
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Host ID</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
              placeholder="Enter host ID"
              required
              disabled={isLoading || disabled}
            />
          </div>
        </div>

        {formData.userId && (
          <div className="space-y-6">
            <div className="p-4 bg-[#1A1A1A] rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Current Hierarchy</h3>
              <div className="space-y-3">
                <div className="p-3 bg-[#2A2A2A] rounded border border-gray-600">
                  <p className="text-xs text-gray-400">Current Admin</p>
                  <p className="text-sm text-white mt-1">
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentHierarchy?.admin ? (
                      currentHierarchy.admin.name
                    ) : (
                      'No admin found'
                    )}
                  </p>
                </div>

                <div className="p-3 bg-[#2A2A2A] rounded border border-gray-600">
                  <p className="text-xs text-gray-400">Current Master Agency</p>
                  <p className="text-sm text-white mt-1">
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentHierarchy?.masterAgency ? (
                      currentHierarchy.masterAgency.name
                    ) : (
                      'No master agency found'
                    )}
                  </p>
                </div>

                <div className="p-3 bg-[#2A2A2A] rounded border border-gray-600">
                  <p className="text-xs text-gray-400">Current Agency</p>
                  <p className="text-sm text-white mt-1">
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentHierarchy?.agency ? (
                      currentHierarchy.agency.name
                    ) : (
                      'No agency found'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-700"></div>
              <ArrowRight className="w-5 h-5 text-[#F72585]" />
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Agency</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  name="newAgencyId"
                  value={formData.newAgencyId}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                  required
                  disabled={isLoading || disabled || isFetching}
                >
                  <option value="">Select new agency</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || disabled}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50 glow-pink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Moving...</span>
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-5 h-5" />
              <span>Move Host</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MoveHostForm;