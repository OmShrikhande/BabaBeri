import React, { useState, useEffect } from 'react';
import { Search, Trash2, Eye, Building2, Filter, MoreVertical } from 'lucide-react';
import { CardSkeleton, TableSkeleton } from './LoadingSkeleton';
import EntityMovementModal from './EntityMovementModal';
import authService from '../services/authService';

const Agencies = ({ onNavigateToDetail, currentUser, agencies: propAgencies = [], loading: propLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencies, setAgencies] = useState(propAgencies);
  const [loading, setLoading] = useState(propLoading);

  useEffect(() => {
    const fetchAgencies = async () => {
      console.log('Starting to fetch agencies...');
      setLoading(true);
      const token = authService.getToken();
      console.log('Auth token:', token ? 'Present' : 'Not found');
      const result = await authService.getUsersByRole('AGENCY');
      console.log('API result:', result);
      if (result.success && Array.isArray(result.data)) {
        console.log('Fetched agencies:', result.data);
        const transformedAgencies = result.data.map(agency => ({
          id: agency.code || agency.id,
          name: agency.name,
          tier: 'Royal Silver', // Default tier since not in API
          earnings: { thisMonth: 0 }, // Default since not in API
          hosts: [], // Default empty array
          totalAgencies: 0 // Default
        }));
        console.log('Transformed agencies:', transformedAgencies);
        setAgencies(transformedAgencies);
      } else {
        console.error('Failed to fetch agencies:', result.error);
        setAgencies([]);
      }
      setLoading(false);
      console.log('Loading set to false');
    };

    fetchAgencies();
  }, []);

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || agency.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const handleViewAgency = (agencyId) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(agencyId);
    }
  };

  const handleDeleteAgency = (agencyId, agencyName) => {
    // In a real app, this would make an API call
    console.log(`Deleting agency: ${agencyName} (${agencyId})`);
    // You can implement actual delete logic here
  };

  const handleMoveEntity = (agency) => {
    // Add current parent information for the modal
    const agencyWithParent = {
      ...agency,
      currentParent: 'Current Master Agency', // This would come from actual data
      currentSubAdminId: 1 // This would come from actual data
    };
    setSelectedAgency(agencyWithParent);
    setShowMovementModal(true);
  };

  const handleEntityMove = async (moveData) => {
    // Here you would implement the actual move logic
    console.log('Moving agency:', moveData);
    // For now, just close the modal
    setShowMovementModal(false);
    setSelectedAgency(null);
  };

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto" role="main">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Agencies</h1>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search agencies by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585]"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-8 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] appearance-none cursor-pointer sm:min-w-[160px]"
              >
                <option value="all">All Tiers</option>
                <option value="Royal Silver">Royal Silver</option>
                <option value="Royal Gold">Royal Gold</option>
                <option value="Royal Platinum">Royal Platinum</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Agencies</p>
                  <p className="text-2xl font-bold text-white">{agencies.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active Agencies</p>
                  <p className="text-2xl font-bold text-white">{agencies.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">$</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">
                    ${agencies.reduce((sum, agency) => sum + agency.earnings.thisMonth, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">♦</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Hosts</p>
                  <p className="text-2xl font-bold text-white">
                    {agencies.reduce((sum, agency) => sum + agency.hosts.length, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agencies Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={6} showHeader={true} />
        ) : (
          <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">All Agencies</h2>
              <p className="text-gray-400 text-sm mt-1">
                Manage and monitor all registered agencies
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[#1A1A1A]">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Agency Name</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Agency ID</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Total Hosts</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Tier</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">This Month</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredAgencies.map((agency) => (
                    <tr 
                      key={agency.id}
                      className="hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                      onClick={() => handleViewAgency(agency.id)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {agency.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{agency.name}</p>
                            <p className="text-gray-400 text-sm">{agency.hosts.length} hosts</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300 font-mono text-sm">{agency.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[#FFD700] font-semibold">{agency.totalAgencies}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          agency.tier === 'Royal Platinum' 
                            ? 'bg-purple-100 text-purple-800' 
                            : agency.tier === 'Royal Gold' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agency.tier}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1">
                          <span className="text-green-400 font-semibold">
                            ${agency.earnings.thisMonth.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAgency(agency.id);
                            }}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                            title="View Agency Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(currentUser?.userType === 'admin' || currentUser?.userType === 'super-admin' || currentUser?.userType === 'sub-admin' || !currentUser?.userType) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveEntity(agency);
                              }}
                              className="p-2 text-[#F72585] hover:text-[#F72585]/80 hover:bg-[#F72585]/10 rounded-lg transition-all"
                              title="Move Agency"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAgency(agency.id, agency.name);
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete Agency"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAgencies.length === 0 && !loading && (
              <div className="py-12 text-center">
                <p className="text-gray-400">No agencies found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Entity Movement Modal */}
        {showMovementModal && selectedAgency && (
          <EntityMovementModal
            isOpen={showMovementModal}
            onClose={() => {
              setShowMovementModal(false);
              setSelectedAgency(null);
            }}
            entityType="agency"
            entityData={selectedAgency}
            availableTargets={[]}
            onMove={handleEntityMove}
            currentUserType={currentUser?.userType || 'admin'}
          />
        )}
      </div>
    </main>
  );
};




export default Agencies;