import React, { useMemo, useState } from 'react';
import { ArrowLeft, Diamond, Search, ChevronDown, MoreVertical, PlusCircle, X, Shield, Crown, Lock, Coins, TrendingUp, User } from 'lucide-react';
import { subAdminsData } from '../data/subAdminsData';
import EntityMovementModal from './EntityMovementModal';
import MasterAgencyForm from './MasterAgencyForm';
// import authService from '../services/authService';

const SubAdminDetail = ({ subAdminId, onBack, onNavigateToMasterAgency, currentUser, adminCode, subAdminName, subUsers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedMasterAgency, setSelectedMasterAgency] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Calendar selection value (YYYY-MM for Monthly, YYYY-MM-DD for Daily)
  const [selectedValue, setSelectedValue] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // default to current month
  });

  const isApiMode = !!adminCode;

  const subAdmin = useMemo(() => {
    if (isApiMode) {
      return { id: subAdminId, name: subAdminName || 'Admin', masterAgencies: [] };
    }
    return subAdminsData.find(sa => sa.id === subAdminId);
  }, [isApiMode, subAdminId, subAdminName]);

  // Derive earnings based on selected period and value
  const selectedEarnings = useMemo(() => {
    if (!subAdmin) return { earnings: 0, redeemDiamonds: 0 };
    const history = subAdmin.earningsHistory || {};

    if (selectedPeriod === 'Monthly') {
      const monthly = history.monthly || {};
      const rec = monthly[selectedValue];
      return {
        earnings: rec?.earnings ?? (subAdmin.earnings?.thisMonth ?? 0),
        redeemDiamonds: rec?.redeemDiamonds ?? (subAdmin.earnings?.redeemDiamonds ?? 0),
      };
    }

    // Daily
    const daily = history.daily || {};
    const rec = daily[selectedValue];
    return {
      earnings: rec?.earnings ?? 0,
      redeemDiamonds: rec?.redeemDiamonds ?? 0,
    };
  }, [subAdmin, selectedPeriod, selectedValue]);

  const effectiveMasterAgencies = useMemo(() => {
    if (subUsers.length > 0) {
      // Map subUsers from API to expected format
      return subUsers.map((u, idx) => ({
        id: u?.id || u?._id || u?.agencyId || u?.userid || idx + 1,
        name: u?.name || u?.username || u?.fullname || u?.agencyname || `Master Agency ${idx + 1}`,
        agencyId: u?.code || u?.usercode || u?.agencyCode || u?.agencyid || u?.userid || '',
        totalAgency: u?.totalAgency || u?.total || u?.count || 0,
        myEarning: u?.myEarning || u?.earning || 0,
        redeemed: u?.redeemed || u?.redeem || 0,
      }));
    }
    return subAdmin?.masterAgencies ?? [];
  }, [subUsers, subAdmin]);

  // Calculate stats first, since goalsCompleted depends on it
  const stats = {
    totalDiamonds: selectedEarnings.earnings || 0,
    totalCoins: subAdmin.coins || 0,
    totalRedeem: selectedEarnings.redeemDiamonds || 0,
    hostCount: effectiveMasterAgencies.length || 0
  };

  const goals = {
    diamondTarget: 100000,
    hostTarget: 20
  };

  const goalsCompleted = 
    (stats.totalDiamonds >= goals.diamondTarget ? 1 : 0) + 
    (stats.hostCount >= goals.hostTarget ? 1 : 0);



  if (!subAdmin && !isApiMode) {
    return (
      <div className="flex-1 bg-[#1A1A1A] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sub-Admin Not Found</h2>
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

  const filteredMasterAgencies = effectiveMasterAgencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agency.agencyId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMasterAgencyClick = (masterAgencyId) => {
    if (onNavigateToMasterAgency) {
      onNavigateToMasterAgency(subAdminId, masterAgencyId);
    }
  };

  const handleMoveEntity = (masterAgency) => {
    setSelectedMasterAgency({
      ...masterAgency,
      currentParent: subAdmin.name
    });
    setShowMovementModal(true);
  };

  const handleEntityMove = async (entityId, targetId) => {
    // Here you would implement the actual move logic
    console.log(`Moving master agency ${entityId} to sub-admin ${targetId}`);
    // For now, just close the modal
    setShowMovementModal(false);
    setSelectedMasterAgency(null);
  };

  const getAvailableSubAdmins = () => {
    return subAdminsData
      .filter(sa => sa.id !== subAdminId) // Exclude current sub-admin
      .map(subAdmin => ({
        id: subAdmin.id,
        name: subAdmin.name,
        count: subAdmin.masterAgenciesCount || 0
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
    <div className="flex-1 bg-[#1A1A1A] text-white overflow-y-auto flex flex-col">
      {/* Header with Breadcrumb */}
      <div className="bg-[#121212] border-b border-gray-800 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack} // <-- Ensure this calls the parent navigation
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-gray-400 text-sm">
              Sub-admins / <span className="text-white">{subAdmin.name}</span>
            </div>
          </div>
        
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto table-scroll-container">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            {/* Left Column: Goals + Stats */}
            <div className="w-full lg:w-[65%] flex flex-col gap-8">
                {/* Goals Section */}
                <div className="w-full border border-gray-800 rounded-xl p-5">
                    <h2 className="text-xl font-bold text-white mb-6">{goalsCompleted}/2 Goals Remaining</h2>
                    
                    {/* Diamond Goal */}
                    <div className="mb-6">
                        <div className="flex items-center text-white mb-2">
                        <Diamond className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="font-medium">{stats.totalDiamonds} / {goals.diamondTarget}</span>
                        </div>
                        <div className="flex items-center">
                        <div className="flex-1 h-3 bg-gray-700 rounded-full mr-4 overflow-hidden">
                            <div 
                                className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                                style={{width: `${Math.min((stats.totalDiamonds/goals.diamondTarget)*100, 100)}%`}}
                            ></div>
                        </div>
                        <div className={`w-5 h-5 border ${stats.totalDiamonds >= goals.diamondTarget ? 'border-pink-500' : 'border-gray-500'} rounded flex items-center justify-center transition-colors`}>
                            {stats.totalDiamonds >= goals.diamondTarget && <div className="w-3 h-3 bg-pink-500 rounded-sm" />}
                        </div>
                        </div>
                    </div>

                    {/* Host Goal */}
                    <div className="mb-6">
                        <div className="flex items-center text-white mb-2">
                        <User className="w-4 h-4 mr-2 text-purple-400" />
                        <span className="font-medium">{stats.hostCount} / {goals.hostTarget}</span>
                        </div>
                        <div className="flex items-center">
                        <div className="flex-1 h-3 bg-gray-700 rounded-full mr-4 overflow-hidden">
                            <div 
                                className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                                style={{width: `${Math.min((stats.hostCount/goals.hostTarget)*100, 100)}%`}}
                            ></div>
                        </div>
                        <div className={`w-5 h-5 border ${stats.hostCount >= goals.hostTarget ? 'border-pink-500' : 'border-gray-500'} rounded flex items-center justify-center transition-colors`}>
                            {stats.hostCount >= goals.hostTarget && <div className="w-3 h-3 bg-pink-500 rounded-sm" />}
                        </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Filter Section */}
                <div className="w-full">
                    {/* Date Filter */}
                    <div className="mb-6">
                        <div className="relative inline-block">
                             {/* Use native inputs to avoid adding deps */}
                            {selectedPeriod === 'Monthly' ? (
                                <input
                                type="month"
                                value={selectedValue}
                                onChange={(e) => setSelectedValue(e.target.value)}
                                className="appearance-none bg-[#2A2A2A] text-white pl-4 pr-10 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-[#F72585] cursor-pointer hover:border-gray-600 transition-colors"
                                />
                            ) : (
                                <input
                                type="date"
                                value={selectedValue.length === 7 ? `${selectedValue}-01` : selectedValue}
                                onChange={(e) => setSelectedValue(e.target.value)}
                                className="appearance-none bg-[#2A2A2A] text-white pl-4 pr-10 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-[#F72585] cursor-pointer hover:border-gray-600 transition-colors"
                                />
                            )}
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Redeem Card */}
                        <div className="bg-[#2A2A2A] p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                            <p className="text-gray-400 text-sm mb-2">Redeemed Diamonds</p>
                            <div className="flex items-center">
                                <Diamond className="w-5 h-5 text-blue-400 mr-2" />
                                <span className="text-xl font-bold text-white">{stats.totalRedeem.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Coins Card */}
                        <div className="bg-[#2A2A2A] p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                            <p className="text-gray-400 text-sm mb-2">Total Coins</p>
                            <div className="flex items-center">
                                <Coins className="w-5 h-5 text-yellow-400 mr-2" />
                                <span className="text-xl font-bold text-white">{stats.totalCoins.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Growth Card */}
                        <div className="bg-[#2A2A2A] p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                            <p className="text-gray-400 text-sm mb-2">Growth</p>
                            <div className="flex items-center">
                                <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
                                <span className="text-xl font-bold text-white">+12.5%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Royal Tiers */}
            <div className="w-full lg:w-[35%] flex flex-col gap-4">
                 {/* Royal Silver */}
                 <div className="bg-[#111] border border-gray-800 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-gray-600 transition-all shadow-lg">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center">
                             <Shield className="w-6 h-6 text-gray-300 fill-gray-300/20" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Royal Silver</h3>
                            <p className="text-gray-400 text-xs">10.0% revenue share</p>
                        </div>
                    </div>
                </div>

                {/* Royal Gold */}
                <div className="bg-[#111] border border-gray-800 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-gray-600 transition-all shadow-lg">
                     <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-yellow-600 to-yellow-900 border border-yellow-700 flex items-center justify-center">
                             <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Royal Gold</h3>
                            <p className="text-gray-400 text-xs">10.0% revenue share</p>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700">
                        <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                </div>

                {/* Royal Platinum */}
                <div className="bg-[#111] border border-gray-800 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-gray-600 transition-all shadow-lg">
                     <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-600 flex items-center justify-center">
                             <Shield className="w-6 h-6 text-slate-300 fill-slate-300/20" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Royal Platinum</h3>
                            <p className="text-gray-400 text-xs">10.0% revenue share</p>
                        </div>
                    </div>
                     <div className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700">
                        <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>
         </div>
          </div>

          {/* Master Agencies List */}
          <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">List of Master Agencies</h2>
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="userid ( master agency )"
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
                        {['Monthly', 'Daily'].map((period) => (
                          <button
                            key={period}
                            onClick={() => {
                              // Adjust selectedValue format when switching period
                              setSelectedPeriod(period);
                              setIsPeriodDropdownOpen(false);
                              setSelectedValue((prev) => {
                                if (period === 'Monthly') {
                                  // Convert YYYY-MM-DD -> YYYY-MM
                                  return prev.length === 10 ? prev.slice(0, 7) : prev;
                                }
                                // Daily: Convert YYYY-MM -> YYYY-MM-01 (default to 1st day)
                                return prev.length === 7 ? `${prev}-01` : prev;
                              });
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
              <div className="grid grid-cols-6 gap-6 px-4 py-4">
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Master Agency Name</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Agency Id</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Total Agencies</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">My earning</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Redeemed</div>
                {currentUser?.userType === '' && (
                  <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Actions</div>
                )}
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800 max-h-100 overflow-y-auto">
              {filteredMasterAgencies.map((masterAgency, index) => (
                <div 
                  key={masterAgency.id} 
                  className="grid grid-cols-6 gap-6 px-3 py-5 hover:bg-[#222222] transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Master Agency Name */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors"></div>
                    <div>
                      <div 
                        className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors cursor-pointer"
                        onClick={() => handleMasterAgencyClick(masterAgency.id)}
                      >
                        {masterAgency.name}
                      </div>
                    </div>
                  </div>

                  {/* Agency ID */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{masterAgency.agencyId}</span>
                  </div>

                  {/* Agency ID */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{masterAgency.totalAgency}</span>
                  </div>

                  {/* My Earning */}
                  <div className="flex items-center space-x-1">
                    <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                    <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">{masterAgency.myEarning}</span>
                  </div>

                  {/* Redeemed */}
                  <div className="flex items-center space-x-1">
                    <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                    <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">{masterAgency.redeemed}</span>
                  </div>

                  {/* Actions */}
                  {currentUser?.userType === '' && (
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveEntity(masterAgency);
                        }}
                        className="text-gray-400 hover:text-[#F72585] transition-colors p-1 hover:bg-gray-800 rounded"
                        title="Move to different Sub Admin"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredMasterAgencies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No master agencies found</h3>
                <p className="text-gray-400 max-w-md">
                  {searchTerm 
                    ? "No master agencies match your search criteria." 
                    : "This sub-admin has no master agencies assigned."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
    

      {/* Entity Movement Modal */}
      {showMovementModal && selectedMasterAgency && (
        <EntityMovementModal
          isOpen={showMovementModal}
          onClose={() => {
            setShowMovementModal(false);
            setSelectedMasterAgency(null);
          }}
          entityType="masterAgency"
          entityData={selectedMasterAgency}
          availableTargets={getAvailableSubAdmins()}
          onMove={handleEntityMove}
        />
      )}

      {/* Create Master Agency Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0F0F0F] w-full max-w-lg rounded-2xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#F72585]" />
                Create Master Agency
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminDetail;