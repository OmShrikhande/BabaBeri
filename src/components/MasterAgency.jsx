import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, MoreVertical, ArrowUpDown, Plus, X, LayoutDashboard, Users, Settings, CreditCard, Bell, FileText, Shield, Diamond, CheckSquare, Building, Crown } from 'lucide-react';
// import { subAdminsData } from '../data/subAdminsData';
// import MasterAgencyForm from './MasterAgencyForm';
import { normalizeUserType } from '../utils/roleBasedAccess';
import authService from '../services/authService';

const MasterAgency = ({ onNavigateToDetail, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedAgency, setSelectedAgency] = useState(null);

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
          const token = authService.getToken();
          const response = await fetch('https://proxstream.online/auth/api/alluserByRole?role=MASTER_AGENCY', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          res = { success: response.ok, data: data, error: response.ok ? null : 'Failed to fetch master agencies' };
        } else if (currentRole === 'admin') {
          res = await authService.getMasterAgenciesForLoggedInAdmin();
        }
        if (!ignore && res && res.success) {
          // Map backend data to UI shape, best-effort with safe fallbacks
          const mapped = Array.isArray(res.data)
            ? res.data.map((item, idx) => ({
                id: item.id || item._id || idx + 1,
                name: item.name || item.masterAgencyName || item.username || 'Master Agency',
                agencyId: item.agencyId || item.code || item.usercode || '#N/A',
                totalAgency: item.totalAgency || item.agencyCount || 0,
                myEarning: item.myEarning || item.earning || 0,
                redeemed: item.redeemed || 0,
                subAdminName: item.owner || item.subAdminName || item.adminName || '—',
                subAdminId: item.owner ? item.owner : item.subAdminId || item.adminId || 0,
                currentParent: item.owner || item.subAdminName || item.adminName || '—'
              }))
            : [];
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
                  {!agenciesLoading && !agenciesError && agenciesList.map((agency, index) => (
                    <div 
                      key={agency.id || index} 
                      className="grid grid-cols-6 gap-6 px-3 py-5 hover:bg-[#222222] transition-all duration-200 group"
                    >
                      {/* Agency Name */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors flex items-center justify-center text-xs font-bold text-white">
                           {agency.profilePic ? (
                             <img src={agency.profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                           ) : (
                             `A${index + 1}`
                           )}
                        </div>
                        <div>
                          <div className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors cursor-pointer">
                            {agency.name || agency.username || 'Agency Name'}
                          </div>
                        </div>
                      </div>

                      {/* Agency ID */}
                      <div className="flex items-center">
                        <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">
                          {agency.agencyId || agency.code || agency.usercode || 'N/A'}
                        </span>
                      </div>

                      {/* Total Hosts */}
                      <div className="flex items-center">
                        <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">
                          {agency.totalHosts || agency.hostCount || 0}
                        </span>
                      </div>

                      {/* My Earning */}
                      <div className="flex items-center space-x-1">
                        <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                        <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">
                          {formatNumber(agency.myEarning || agency.earning || 0)}
                        </span>
                      </div>

                      {/* Redeemed */}
                      <div className="flex items-center space-x-1">
                        <Diamond className="w-4 h-4 text-[#4CC9F0]" />
                        <span className="text-gray-300 font-bold text-base group-hover:text-white transition-colors">
                          {formatNumber(agency.redeemed || 0)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center">
                        <button
                          className="text-gray-400 hover:text-[#F72585] transition-colors p-1 hover:bg-gray-800 rounded"
                          title="View Details"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1A1A1A] text-white overflow-y-auto flex flex-col">
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
      <div className="flex-1 overflow-auto table-scroll-container">
        <div className="p-6 space-y-6">
          {/* Create Master Agency */}
          {/* {showCreate && (
            <MasterAgencyForm
              onCreated={(created) => {
                // Optionally, you can refetch or optimistically update UI here
                setShowCreate(false);
              }}
            />
          )} */}

          {/* Master Agencies List */}
          <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-0 border-b border-gray-800">
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
            </div>

            {/* Table Header */}
            <div className="bg-[#0A0A0A] border-b border-gray-800">
              <div className="grid grid-cols-6 gap-4 px-4 py-4">
                <button
                  onClick={() => handleSort('name')}
                  className="text-gray-400 font-bold text-sm uppercase tracking-wider text-left flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Master Agency</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider"> ID</div>
                <button
                  onClick={() => handleSort('subAdmin')}
                  className="text-gray-400 font-bold text-sm uppercase tracking-wider text-left flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Admin</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleSort('totalAgency')}
                  className="text-gray-400 font-bold text-sm uppercase tracking-wider text-left flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Total Agencies</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleSort('myEarning')}
                  className="text-gray-400 font-bold text-sm uppercase tracking-wider text-left flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>Earnings</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
              {sortedMasterAgencies.map((masterAgency, index) => (
                <div 
                  key={`${masterAgency.subAdminId}-${masterAgency.id}`} 
                  className="grid grid-cols-6 gap-4 px-4 py-5 hover:bg-[#222222] transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Master Agency Name */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border-2 border-gray-600 group-hover:border-[#F72585] transition-colors"></div>
                    <div>
                      <div 
                        className="text-white font-bold text-sm group-hover:text-[#F72585] transition-colors cursor-pointer"
                        onClick={() => onNavigateToDetail && onNavigateToDetail(masterAgency.subAdminId, masterAgency.id)}
                      >
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

                  {/* Sub Admin */}
                  <div className="flex items-center">
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                      {masterAgency.ownerName || masterAgency.subAdminName || masterAgency.owner ||'—' }
                    </span>
                  </div>

                  {/* Total Agencies */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-medium text-sm group-hover:text-white transition-colors">
                      {masterAgency.totalAgency}
                    </span>
                  </div>

                  {/* Earnings */}
                  <div className="flex items-center">
                    <span className="text-gray-300 font-bold text-sm group-hover:text-white transition-colors">
                      {formatNumber(masterAgency.myEarning)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center">
                    {(currentRole === 'super-admin' || currentRole === 'admin') && (
                      <button
                        onClick={() => setSelectedAgency(masterAgency)}
                        className="text-gray-400 hover:text-[#F72585] transition-colors p-1 hover:bg-gray-800 rounded"
                        title="View Details"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAgency;