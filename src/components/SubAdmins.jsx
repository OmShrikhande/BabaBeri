import React, { useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { subAdminsData } from '../data/subAdminsData';

const SubAdmins = ({ onNavigateToDetail }) => {
  const [subAdmins, setSubAdmins] = useState(subAdminsData);
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    password: '',
    aadhaarNumber: '',
    mobileNumber: '',
    dateOfBirth: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubAdmin = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.id || !formData.password || !formData.aadhaarNumber || !formData.mobileNumber || !formData.dateOfBirth) {
      alert('Please fill all fields');
      return;
    }

    // Create new sub admin
    const newSubAdmin = {
      id: subAdmins.length + 1,
      name: formData.name,
      adminId: formData.id,
      masterAgenciesCount: 0,
      profileImage: null,
      email: `${formData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      mobile: formData.mobileNumber,
      aadhaar: formData.aadhaarNumber,
      dateOfBirth: formData.dateOfBirth,
      status: 'active',
      masterAgencies: []
    };

    setSubAdmins(prev => [...prev, newSubAdmin]);
    
    // Reset form
    setFormData({
      name: '',
      id: '',
      password: '',
      aadhaarNumber: '',
      mobileNumber: '',
      dateOfBirth: ''
    });

    console.log('Sub-admin added:', newSubAdmin);
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
            <h2 className="text-xl font-bold text-white mb-6">Add sub-admin</h2>
            
            <form onSubmit={handleAddSubAdmin} className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Id</label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                    placeholder="Enter ID"
                    required
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
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                    placeholder="Enter Aadhaar number"
                    maxLength="12"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-start">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:ring-opacity-50 glow-pink"
                >
                  Add Sub-Admin
                </button>
              </div>
            </form>
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