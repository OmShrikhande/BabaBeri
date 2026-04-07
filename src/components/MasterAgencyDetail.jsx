import React, { useState, useEffect } from 'react';
import { ArrowLeft, Diamond, Search, ChevronDown, MoreVertical } from 'lucide-react';
import { subAdminsData, royalTiers } from '../data/subAdminsData';
import EntityMovementModal from './EntityMovementModal';
import authService from '../services/authService';

const MasterAgencyDetail = ({ subAdminId, masterAgencyId, onBack, onNavigateToAgencyHost, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);

  const subAdmin = subAdminsData.find(sa => sa.id === subAdminId);
  const masterAgency = subAdmin?.masterAgencies?.find(ma => ma.id === masterAgencyId);

  const [apiAgencies, setApiAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const fetchAgencies = async () => {
        if (!masterAgency?.agencyId) return;
        setLoading(true);
        setError(null);
        try {
            const code = String(masterAgency.agencyId).replace(/^#/, '');
            const res = await authService.getAllSubUserByCode(code);
            if (!ignore) {
                if (res.success && res.data) {
                    const dataList = Array.isArray(res.data) ? res.data : (res.data.data || []);
                    const mapped = dataList.map((item, idx) => ({
                        id: item.id || item._id || idx,
                        name: item.name || item.username || 'Agency',
                        agencyId: item.usercode || item.code || item.agencyId || 'N/A',
                        totalHosts: item.totalHosts || item.hostsCount || 0,
                        myEarning: item.earning || item.myEarning || 0,
                        redeemed: item.redeemed || 0,
                        ...item
                    }));
                    setApiAgencies(mapped);
                } else {
                    if (!res.success) setError(res.error || 'Failed to fetch agencies');
                    setApiAgencies([]);
                }
            }
        } catch (err) {
            if (!ignore) {
                setError(err.message || 'An error occurred');
                setApiAgencies([]);
            }
        } finally {
            if (!ignore) setLoading(false);
        }
    };

    if (masterAgency) {
        fetchAgencies();
    }
    return () => { ignore = true; };
  }, [masterAgency]);

  if (!subAdmin || !masterAgency) {
    return (
      <div className="flex-1 bg-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Master Agency Not Found</h2>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const filteredAgencies = apiAgencies.filter(agency =>
    (agency.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(agency.agencyId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMoveEntity = (agency) => {
    setSelectedAgency({
      ...agency,
      currentParent: masterAgency.name
    });
    setShowMovementModal(true);
  };

  const handleEntityMove = async (entityId, targetId) => {
    // Here you would implement the actual move logic
    console.log(`Moving agency ${entityId} to master agency ${targetId}`);
    // For now, just close the modal
    setShowMovementModal(false);
    setSelectedAgency(null);
  };

  const getAvailableMasterAgencies = () => {
    const allMasterAgencies = [];
    subAdminsData.forEach(subAdmin => {
      if (subAdmin.masterAgencies) {
        subAdmin.masterAgencies.forEach(ma => {
          if (ma.id !== masterAgencyId) { // Exclude current master agency
            allMasterAgencies.push({
              id: ma.id,
              name: ma.name,
              count: ma.totalAgency || 0
            });
          }
        });
      }
    });
    return allMasterAgencies;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="flex-1 bg-[#1A1A1A] text-white overflow-y-auto flex flex-col">
      {/* Header with Breadcrumb */}
      <div className="bg-[#121212] border-b border-gray-800 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-gray-400 text-sm">
              Sub-admins / <span className="text-white">{subAdmin.name}</span> / <span className="text-white">{masterAgency.name}</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Master Agency</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto table-scroll-container">
        <div className="p-6 space-y-6">
          {/* Goals and Royal Tiers Section */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Side - Goals */}
            <div className="col-span-8 space-y-6">
              {/* Goals Remaining */}
              <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
                <div className="mb-4">
                  <div className="text-gray-400 text-sm mb-1">Sub-admins / {subAdmin.name} / {masterAgency.name}</div>
                  <h2 className="text-2xl font-bold text-white">1 Goals Remaining</h2>
                  <div className="text-gray-400 mt-1">${subAdmin.goalsRemaining?.current || 1180} / $10000</div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#F72585] to-[#7209B7] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${subAdmin.goalsRemaining?.percentage || 11.8}%` }}
                    ></div>
                  </div>
                  <div className="absolute right-0 -top-1">
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mt-4">
                  Complete the remaining goal to get 5%. Increase your revenue share by completing these goals.
                </p>
              </div>

              {/* Earnings Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Diamond className="w-5 h-5 text-[#4CC9F0]" />
                    <span className="text-gray-400 text-sm">Last Month's Earnings</span>
                  </div>
                  <div className="text-white text-xl font-bold">{formatNumber(subAdmin.earnings?.lastMonth || 12390)}</div>
                </div>

                <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Diamond className="w-5 h-5 text-[#4CC9F0]" />
                    <span className="text-gray-400 text-sm">This Month's Earnings</span>
                  </div>
                  <div className="text-white text-xl font-bold">{formatNumber(subAdmin.earnings?.thisMonth || 12500000)}</div>
                </div>
              </div>
            </div>

            {/* Right Side - Royal Tiers */}
            <div className="col-span-4 space-y-4">
              {royalTiers.map((tier, idx) => {
                // Determine active tier (example: first one is active)
                const isActive = idx === 0;
                return (
                  <div
                    key={tier.id}
                    className={
                      `bg-[#121212] p-4 rounded-xl border transition-colors ` +
                      (isActive
                        ? 'border-[#F72585] ring-2 ring-[#F72585]'
                        : 'border-gray-700 grayscale pointer-events-none')
                    }
                    style={isActive ? {} : { filter: 'grayscale(1)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${tier.bgColor} rounded-lg flex items-center justify-center text-2xl`}>
                        {tier.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{tier.name}</h3>
                        <p className="text-gray-400 text-sm">{tier.revenueShare}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agencies List */}
          <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">List of Agencies</h2>
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="userid ( agency )"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors w-64"
                    />
                  </div>

                  {/* Period Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                      className="bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-2 text-white flex items-center space-x-2 hover:border-gray-600 focus:outline-none focus:border-[#F72585] transition-colors"
                    >
                      <span>{selectedPeriod}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isPeriodDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 bg-[#2A2A2A] border border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
                        {['Monthly', 'Weekly', 'Daily'].map((period) => (
                          <button
                            key={period}
                            onClick={() => {
                              setSelectedPeriod(period);
                              setIsPeriodDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="bg-[#0A0A0A] border-b border-gray-800">
              <div className="grid grid-cols-6 gap-2 px-4 py-4">
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Agency Name</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Agency Id</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider"> Hosts</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">My earning</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Redeemed</div>
                {currentUser?.userType === 'super-admin' && (
                  <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Actions</div>
                )}
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
              {filteredAgencies.map((agency, index) => (
                <div 
                  key={agency.id} 
                  className="grid grid-cols-6 gap-8 px-6 py-5 hover:bg-[#222222] transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Agency Name */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors"></div>
                    <div>
                      <div 
                        className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors cursor-pointer"
                        onClick={() => onNavigateToAgencyHost && onNavigateToAgencyHost(subAdminId, masterAgencyId, agency.id)}
                      >
                        {agency.name}
                      </div>
                    </div>
                  </div>

                  {/* Agency ID */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{agency.agencyId}</span>
                  </div>

                  {/* total hosts */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{agency.totalHosts}</span>
                  </div>

                  {/* My Earning */}
                  <div className="flex items-center space-x-1">
                    <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                    <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">{agency.myEarning}</span>
                  </div>

                  {/* Redeemed */}
                  <div className="flex items-center space-x-1">
                    <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                    <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">{agency.redeemed}</span>
                  </div>

                  {/* Actions */}
                  {currentUser?.userType === 'super-admin' && (
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveEntity(agency);
                        }}
                        className="text-gray-400 hover:text-[#F72585] transition-colors p-1 hover:bg-gray-800 rounded"
                        title="Move to different Master Agency"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Loading / Empty State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 border-4 border-[#F72585] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-white">Loading Agencies...</h3>
                </div>
            ) : filteredAgencies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No agencies found</h3>
                <p className="text-gray-400 max-w-md">
                  {searchTerm 
                    ? "No agencies match your search criteria." 
                    : "This master agency has no agencies assigned."
                  }
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

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
          availableTargets={getAvailableMasterAgencies()}
          onMove={handleEntityMove}
        />
      )}
    </div>
  );
};

export default MasterAgencyDetail;