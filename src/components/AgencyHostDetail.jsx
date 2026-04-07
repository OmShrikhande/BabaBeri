import React, { useState } from 'react';
import { ArrowLeft, Diamond, Search, ChevronDown, MoreVertical } from 'lucide-react';
import { subAdminsData, agenciesData, royalTiers } from '../data/subAdminsData';
import EntityMovementModal from './EntityMovementModal';

const AgencyHostDetail = ({ subAdminId, masterAgencyId, agencyId, onBack, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);

  const subAdmin = subAdminsData.find(sa => sa.id === subAdminId);
  const masterAgency = subAdmin?.masterAgencies?.find(ma => ma.id === masterAgencyId);
  const agency = agenciesData.find(a => a.id === agencyId);

  // Demo host data based on the image
  const hostsData = [
    { id: 1, name: 'Host 1', hostId: '#120989', earnings: 1200, redeemed: 1200 },
    { id: 2, name: 'Host 2', hostId: '#120989', earnings: 1200, redeemed: 1200 },
    { id: 3, name: 'Host 3', hostId: '#120989', earnings: 1200, redeemed: 1200 },
    { id: 4, name: 'Host 4', hostId: '#120989', earnings: 1200, redeemed: 1200 },
    { id: 5, name: 'Host 5', hostId: '#120989', earnings: 1200, redeemed: 1200 },
    { id: 6, name: 'Host 6', hostId: '#120989', earnings: 1200, redeemed: 1200 },
    { id: 7, name: 'Host 7', hostId: '#120989', earnings: 1200, redeemed: 1200 },
  ];

  if (!subAdmin || !masterAgency || !agency) {
    return (
      <div className="h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Agency Not Found</h2>
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

  const filteredHosts = hostsData.filter(host =>
    host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.hostId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMoveEntity = (host) => {
    setSelectedHost({
      ...host,
      currentParent: agency.name,
      currentSubAdminId: subAdminId,
      currentMasterAgencyId: masterAgencyId,
      currentAgencyId: agencyId
    });
    setShowMovementModal(true);
  };

  const handleEntityMove = async (moveData) => {
    // Here you would implement the actual move logic
    console.log('Moving host:', moveData);
    // For now, just close the modal
    setShowMovementModal(false);
    setSelectedHost(null);
  };

  const getAvailableAgencies = () => {
    return agenciesData
      .filter(a => a.id !== agencyId) // Exclude current agency
      .map(agency => ({
        id: agency.id,
        name: agency.name,
        count: agency.totalHosts || 0
      }));
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
    <div className="h-screen bg-[#1A1A1A] text-white overflow-hidden flex flex-col">
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
              Sub-admins / <span className="text-white">{subAdmin.name}</span> / <span className="text-white">{masterAgency.name}</span> / <span className="text-white">{agency.name}</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Master Agency</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Goals and Royal Tiers Section */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Side - Goals */}
            <div className="col-span-8 space-y-6">
              {/* Goals Remaining */}
              <div className="bg-[#121212] p-6 rounded-xl border border-gray-800">
                <div className="mb-4">
                  <div className="text-gray-400 text-sm mb-1">Agency 1</div>
                  <h2 className="text-2xl font-bold text-white">1 Goals Remaining</h2>
                  <div className="text-gray-400 mt-1">$1180 / $10000</div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#F72585] to-[#7209B7] h-2 rounded-full transition-all duration-500"
                      style={{ width: '11.8%' }}
                    ></div>
                  </div>
                  <div className="absolute right-0 -top-1">
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mt-4">
                  Complete the remaining goal to 5%. Increase your revenue share by completing those goals.
                </p>
              </div>

              {/* Earnings Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Diamond className="w-5 h-5 text-[#4CC9F0]" />
                    <span className="text-gray-400 text-sm">Last Month's Earnings</span>
                  </div>
                  <div className="text-white text-xl font-bold">12,390</div>
                </div>

                <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Diamond className="w-5 h-5 text-[#4CC9F0]" />
                    <span className="text-gray-400 text-sm">This Month's Earnings</span>
                  </div>
                  <div className="text-white text-xl font-bold">12.5M</div>
                </div>

                <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Diamond className="w-5 h-5 text-[#4CC9F0]" />
                    <span className="text-gray-400 text-sm">Redeem Diamonds</span>
                  </div>
                  <div className="text-white text-xl font-bold">12.5M</div>
                </div>
              </div>
            </div>

            {/* Right Side - Royal Tiers */}
            <div className="col-span-4 space-y-4">
              {royalTiers.map((tier) => (
                <div key={tier.id} className="bg-[#121212] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
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
              ))}
            </div>
          </div>

          {/* Hosts List */}
          <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">List of Hosts</h2>
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="userid ( host )"
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
              <div className="grid grid-cols-5 gap-4 px-6 py-4">
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Host Name</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Host Id</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Host earnings</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Redeemed</div>
                {currentUser?.userType === '' && (
                  <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Actions</div>
                )}
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
              {filteredHosts.map((host, index) => (
                <div 
                  key={host.id} 
                  className="grid grid-cols-4 gap-4 px-6 py-5 hover:bg-[#222222] transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Host Name */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors"></div>
                    <div>
                      <div className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors">{host.name}</div>
                    </div>
                  </div>

                  {/* Host ID */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{host.hostId}</span>
                  </div>

                  {/* Host Earnings */}
                  <div className="flex items-center space-x-1">
                    <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                    <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">{host.earnings}</span>
                  </div>

                  {/* Redeemed */}
                  <div className="flex items-center space-x-1">
                    <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                    <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">{host.redeemed}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredHosts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No hosts found</h3>
                <p className="text-gray-400 max-w-md">
                  {searchTerm 
                    ? "No hosts match your search criteria." 
                    : "This agency has no hosts assigned."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyHostDetail;