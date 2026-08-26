import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, MoreVertical, ArrowUpDown, Plus, X, LayoutDashboard, Users, Settings, CreditCard, Bell, FileText, Shield, Diamond, CheckSquare, Building, Crown, Coins, TrendingUp, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { normalizeUserType } from '../utils/roleBasedAccess';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/api';

const ownerBase = `/${APP_CONFIG.OWNER_SECRET_PATH}`;

const MasterAgency = ({ onNavigateToDetail }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedAgency, setSelectedAgency] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [agenciesList, setAgenciesList] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [agenciesError, setAgenciesError] = useState(null);

  useEffect(() => {
    if (selectedAgency && selectedAgency.agencyId) {
      setAgenciesLoading(true);
      setAgenciesError(null);
      // Fetch agencies under the master agency. Assuming role 'AGENCY' for children.
      authService.getAllSubUserByCode(selectedAgency.agencyId, 'AGENCY')
        .then(res => {
          if (res.success) {
            // Ensure data is array
            setAgenciesList(Array.isArray(res.data) ? res.data : []);
          } else {
            setAgenciesError(res.error || 'Failed to load agencies');
            setAgenciesList([]);
          }
        })
        .catch(err => {
          setAgenciesError(err.message || 'Error loading agencies');
          setAgenciesList([]);
        })
        .finally(() => setAgenciesLoading(false));
    } else {
      setAgenciesList([]);
    }
  }, [selectedAgency]);

  const [apiMasterAgencies, setApiMasterAgencies] = useState(null); // null = not loaded, [] = loaded empty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentRole = normalizeUserType(currentUser?.userType);

  // Try to fetch from backend (super-admin can pass code; admin uses own code)
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        let res;
        if (currentRole === 'super-admin') {
          res = await authService.getUsersByRole('MASTER_AGENCY');
        } else if (currentRole === 'admin') {
          res = await authService.getMasterAgenciesForLoggedInAdmin();
        }
        if (!ignore && res && res.success) {
          const items = Array.isArray(res.data) ? res.data : (res.data?.result || res.data?.data || []);
          const mapped = items.map((item, idx) => ({
              id: item.id || item._id || idx + 1,
              name: item.name || item.masterAgencyName || item.username || 'Master Agency',
              agencyId: authService.extractUserCode(item) || item.agencyId || '#N/A',
              totalAgency: item.totalAgency || item.agencyCount || 0,
              myEarning: item.myEarning || item.earning || 0,
              redeemed: item.redeemed || 0,
              subAdminName: item.ownername || item.owner || item.subAdminName || item.adminName || '—',
              subAdminId: item.owner || item.subAdminId || item.adminId || 0,
              currentParent: item.ownername || item.owner || item.subAdminName || item.adminName || '—',
              coins: item.coins || item.coinBalance || 0,
              profilePic: item.profilePic || '',
              createdAt: item.createdAt ? new Date(item.createdAt) : null,
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
              joinDate: item.joinDate || item.joiningdate || '—',
              diamond: item.diamond || item.totaldiamonds || 0,
              slab: item.slab || item.currentSlab || '—',
              currentStage: item.stage || item.currentStage || '—',
            }));
          setApiMasterAgencies(mapped);
        } else if (!ignore && res && !res.success) {
          setError(res.error || 'Failed to load master agencies');
          setApiMasterAgencies([]);
        }
      } catch (e) {
        if (!ignore) { setError(e?.message || 'Failed to load master agencies'); setApiMasterAgencies([]); }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    if (currentRole === 'super-admin' || currentRole === 'admin') {
      load();
    }

    return () => { ignore = true; };
  }, [currentRole]);

  // Prefer API data when present
  const masterAgencies = (apiMasterAgencies ?? []);

  const filteredMasterAgencies = masterAgencies.filter(agency =>
    (agency.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(agency.agencyId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(agency.subAdminName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort master agencies
  const sortedMasterAgencies = [...filteredMasterAgencies].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = String(a.name || '').toLowerCase();
        bValue = String(b.name || '').toLowerCase();
        break;
      case 'subAdmin':
        aValue = String(a.subAdminName || '').toLowerCase();
        bValue = String(b.subAdminName || '').toLowerCase();
        break;
      case 'totalAgency':
        aValue = parseInt(a.totalAgency) || 0;
        bValue = parseInt(b.totalAgency) || 0;
        break;
      case 'myEarning':
        aValue = a.myEarning || 0;
        bValue = b.myEarning || 0;
        break;
      default:
        aValue = String(a.name || '').toLowerCase();
        bValue = String(b.name || '').toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginated Slices
  const totalPages = Math.ceil(sortedMasterAgencies.length / itemsPerPage);
  const paginatedMasterAgencies = sortedMasterAgencies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num?.toLocaleString() || '0';
  };

  const [showCreate, setShowCreate] = useState(false);

  // Calculate stats for the selected agency detail view
  const goals = {
    diamondTarget: 100000,
    hostTarget: 20
  };

  const stats = React.useMemo(() => {
    if (!agenciesList || agenciesList.length === 0) {
      return { totalDiamonds: 0, totalCoins: 0, totalRedeem: 0, hostCount: 0 };
    }
    return agenciesList.reduce((acc, curr) => ({
      totalDiamonds: acc.totalDiamonds + (Number(curr.totaldiamonds) || Number(curr.overalldiamonds) || 0),
      totalCoins: acc.totalCoins + (Number(curr.coins) || 0),
      totalRedeem: acc.totalRedeem + (Number(curr.redeem) || 0),
      hostCount: acc.hostCount + 1
    }), { totalDiamonds: 0, totalCoins: 0, totalRedeem: 0, hostCount: 0 });
  }, [agenciesList]);

  const goalsCompleted =
    (stats.totalDiamonds >= goals.diamondTarget ? 1 : 0) +
    (stats.hostCount >= goals.hostTarget ? 1 : 0);

  if (selectedAgency) {
    return (
      <div className="flex-1 bg-[#0F0F11] text-white flex flex-col font-sans overflow-hidden h-full">
        {/* Header */}
        <header className="h-16 bg-[#141416] border-b border-[#1A1A1E] flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white tracking-tight">Master Agency</h1>
            <span className="px-3 py-1 rounded-full bg-[#1A1A1E] border border-[#2B2B30] text-xs text-gray-400">
              {selectedAgency.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F72585] rounded-full" />
            </button>
            <button
              onClick={() => setSelectedAgency(null)}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#1A1A1E] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col gap-8 max-w-[1600px] mx-auto">
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
                          style={{ width: `${Math.min((stats.totalDiamonds / goals.diamondTarget) * 100, 100)}%` }}
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
                          style={{ width: `${Math.min((stats.hostCount / goals.hostTarget) * 100, 100)}%` }}
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
                      <select className="appearance-none bg-[#2A2A2A] text-white pl-4 pr-10 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-[#F72585] cursor-pointer hover:border-gray-600 transition-colors">
                        <option>Current Month</option>
                        <option>Last Month</option>
                        <option>Last Week</option>
                        <option>Last Year</option>
                        <option>Custom</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
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

            {/* Main Content Column */}
            <div className="flex-1 space-y-8 min-w-0">

              {/* Stats Grid */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Earnings', value: '$124,500', change: '+12.5%', icon: Diamond },
                  { label: 'Active Agencies', value: '45', change: '+3', icon: Building },
                  { label: 'Pending Requests', value: '12', change: '-2', icon: FileText },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#1C1C20] rounded-2xl p-5 border border-[#2B2B30] shadow-sm hover:border-[#3A3A40] transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-[#1A1A1E] rounded-xl group-hover:bg-[#25252A] transition-colors">
                        <stat.icon className="w-5 h-5 text-[#4CC9F0]" />
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div> */}

              {/* Agencies List */}
              <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800">


                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">List of Agencies</h2>
                    <div className="flex items-center space-x-4">
                      {/* Search Bar */}
                      {/* <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search agencies..."
                          className="pl-10 pr-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors w-64"
                        />
                      </div> */}

                      {/* Period Dropdown */}
                      {/* <div className="relative">
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
                      </div> */}
                    </div>
                  </div>
                </div>

                {/* Table Header */}
                <div className="bg-[#0A0A0A] border-b border-gray-800">
                  <div className="grid grid-cols-6 gap-6 px-4 py-4">
                    <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Agency Name</div>
                    <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Agency Id</div>
                    <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Total Hosts</div>
                    <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">My earning</div>
                    <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Redeemed</div>
                    <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
                  {agenciesLoading && (
                    <div className="p-8 text-center text-gray-400">Loading agencies...</div>
                  )}
                  {agenciesError && (
                    <div className="p-8 text-center text-red-400">Error: {agenciesError}</div>
                  )}
                  {!agenciesLoading && !agenciesError && agenciesList.length === 0 && (
                    <div className="p-8 text-center text-gray-400">No agencies found for this master agency.</div>
                  )}
                  {!agenciesLoading && !agenciesError && agenciesList.map((agency, index) => {
                    const agencyCode = authService.extractUserCode(agency) || agency.agencyId || agency.code || agency.usercode;
                    return (
                    <div
                      key={agencyCode || agency.id || index}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!agencyCode) return;
                        // Prefer ownerarea agency detail route (hosts via getAllSubUserByCode HOST)
                        navigate(`${ownerBase}/agencies/${encodeURIComponent(agencyCode)}`, {
                          state: { name: agency.name || agency.username },
                        });
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && agencyCode) {
                          e.preventDefault();
                          navigate(`${ownerBase}/agencies/${encodeURIComponent(agencyCode)}`, {
                            state: { name: agency.name || agency.username },
                          });
                        }
                      }}
                      className="grid grid-cols-6 gap-6 px-3 py-5 hover:bg-[#222222] transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors flex items-center justify-center text-xs font-bold text-white">
                          {agency.profilePic ? (
                            <img src={agency.profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            `A${index + 1}`
                          )}
                        </div>
                        <div>
                          <div className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors">
                            {agency.name || agency.username || 'Agency Name'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">
                          {agencyCode || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">
                          {agency.totalHosts || agency.hostCount || 0}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                        <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">
                          {formatNumber(agency.myEarning || agency.earning || 0)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                        <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">
                          {formatNumber(agency.redeemed || 0)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!agencyCode) return;
                            navigate(`${ownerBase}/agencies/${encodeURIComponent(agencyCode)}`, {
                              state: { name: agency.name || agency.username },
                            });
                          }}
                          className="text-gray-400 hover:text-[#F72585] transition-colors p-1 hover:bg-gray-800 rounded"
                          title="View Details"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1A1A1A] text-white min-h-full flex flex-col">
      {/* Header */}
      <div className="bg-[#121212] border-b border-gray-800 p-6 flex-shrink-0">
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center"> <Building className="w-8 h-8 mr-3 text-[#F72585]" /> List of Master Agencies</h1>
            {/* <p className="text-gray-400 mt-1">Manage all master agencies across sub-admins</p> */}
          </div>
          {/* <div className="flex items-center gap-4">
            <div className="text-gray-400 text-sm">{loading ? 'Loading…' : `Total: ${masterAgencies.length} Master Agencies`}{error ? ` • ${error}` : ''}</div>
            
          </div> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto table-scroll-container p-6">
        {/* Master Agencies List */}
        <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-0">
              <div className="flex items-center justify-between">
                {/* <h2 className="text-xl font-bold text-white">List of Master Agencies</h2> */}
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search master agencies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585] transition-colors w-64"
                    />
                  </div> */}

                  {/* Period Dropdown */}
                  {/* <div className="relative">
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
                  </div> */}
              </div>
            </div>

            {/* Table Container with Scroll */}
            <div className="overflow-x-auto">
              <div className="min-w-[2000px]">
                {/* Table Header */}
                <div className="bg-[#0A0A0A] border-b border-gray-800">
                  <div className="grid grid-cols-13 gap-4 px-4 py-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="text-gray-400 font-bold text-xs uppercase tracking-wider text-left flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>MA Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">MA Code</div>
                    <button
                      onClick={() => handleSort('subAdmin')}
                      className="text-gray-400 font-bold text-xs uppercase tracking-wider text-left flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>AD Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">AD Code</div>
                    <button
                      onClick={() => handleSort('totalAgency')}
                      className="text-gray-400 font-bold text-xs uppercase tracking-wider text-left flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>Total Agencies</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">over all diamonds</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">current stage</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">current slab</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">Redeem</div>
                    <button
                      onClick={() => handleSort('myEarning')}
                      className="text-gray-400 font-bold text-xs uppercase tracking-wider text-left flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <span>My Earning</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">Available coins</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">joining date</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
                  {paginatedMasterAgencies.map((masterAgency, index) => (
                    <div
                      key={`${masterAgency.agencyId}-${masterAgency.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (currentRole === 'super-admin' || currentRole === 'admin') {
                          setSelectedAgency(masterAgency);
                        }
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && (currentRole === 'super-admin' || currentRole === 'admin')) {
                          e.preventDefault();
                          setSelectedAgency(masterAgency);
                        }
                      }}
                      className="grid grid-cols-13 gap-4 px-4 py-5 hover:bg-[#222222] transition-all duration-200 group cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Master Agency Name */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors"></div>
                        <div>
                          <div className="text-white font-bold text-sm group-hover:text-[#F72585] transition-colors">
                            {masterAgency.name}
                          </div>
                        </div>
                      </div>

                      {/* Agency ID */}
                      <div className="flex items-center">
                        <span className="text-gray-300 font-mono text-sm group-hover:text-white transition-colors">
                          {masterAgency.agencyId}
                        </span>
                      </div>

                      {/* Sub Admin Name */}
                      <div className="flex items-center">
                        <span className="text-gray-300 text-[11px] group-hover:text-white transition-colors">
                          {masterAgency.subAdminName}
                        </span>
                      </div>

                      {/* Sub Admin ID */}
                      <div className="flex items-center">
                        <span className="text-gray-300 font-mono font-medium text-[11px] group-hover:text-white transition-colors">
                          {masterAgency.subAdminId}
                        </span>
                      </div>

                      {/* Total Agencies */}
                      <div className="flex items-center">
                        <span className="text-gray-300 font-bold text-xs group-hover:text-white transition-colors">
                          {masterAgency.totalAgency}
                        </span>
                      </div>

                      {/* Overall Diamonds */}
                      <div className="flex items-center">
                        <span className="text-gray-300 text-[11px] group-hover:text-white transition-colors">{masterAgency.diamond}</span>
                      </div>

                      {/* Current Stage */}
                      <div className="flex items-center">
                        <span className="text-gray-300 text-[10px] group-hover:text-white transition-colors">{masterAgency.currentStage}</span>
                      </div>

                      {/* Current Slab */}
                      <div className="flex items-center">
                        <span className="text-gray-300 text-[10px] group-hover:text-white transition-colors">{masterAgency.slab}</span>
                      </div>

                      {/* Redeem */}
                      <div className="flex items-center">
                        <span className="text-gray-300 text-[11px] group-hover:text-white transition-colors">{masterAgency.redeemed}</span>
                      </div>

                      {/* My Earnings */}
                      <div className="flex items-center">
                        <span className="text-gray-300 font-bold text-[11px] group-hover:text-white transition-colors">{formatNumber(masterAgency.myEarning)}</span>
                      </div>

                      {/* Available Coins */}
                      <div className="flex items-center">
                        <span className="text-gray-300 text-[11px] group-hover:text-white transition-colors">{masterAgency.coins}</span>
                      </div>

                      {/* Joining Date */}
                      <div className="flex items-center">
                        <span className="text-gray-300 text-[10px] group-hover:text-white transition-colors">{masterAgency.joinDate}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center">
                        {(currentRole === 'super-admin' || currentRole === 'admin') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAgency(masterAgency);
                            }}
                            className="text-gray-400 hover:text-[#F72585] transition-colors p-1 hover:bg-gray-800 rounded"
                            title="View Details"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty State */}
            {sortedMasterAgencies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No master agencies found</h3>
                <p className="text-gray-400 max-w-md">
                  {searchTerm
                    ? "No master agencies match your search criteria."
                    : "No master agencies are currently available."
                  }
                </p>
              </div>
            )}
            
            {/* Pagination Controls */}
            {!loading && !error && sortedMasterAgencies.length > 0 && (
              <div className="border-t border-gray-800 bg-gray-900/40">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>Show:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-200 text-sm focus:outline-none"
                      >
                        {[5, 10, 20, 50].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      <span>per page</span>
                    </div>
                    <div>
                      Showing {Math.min(sortedMasterAgencies.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(sortedMasterAgencies.length, currentPage * itemsPerPage)} of {sortedMasterAgencies.length}
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1.5 rounded bg-gray-800 border border-gray-700 text-xs disabled:opacity-40"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1.5 rounded bg-gray-800 border border-gray-700 text-xs disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span className="text-xs text-gray-400 px-2">Page {currentPage} of {totalPages}</span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2.5 py-1.5 rounded bg-gray-800 border border-gray-700 text-xs disabled:opacity-40"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-2.5 py-1.5 rounded bg-gray-800 border border-gray-700 text-xs disabled:opacity-40"
                      >
                        Last
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAgency;