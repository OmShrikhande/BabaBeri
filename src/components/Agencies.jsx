import React, { useState, useEffect } from 'react';
import { Search, Trash2, Eye, Building2, Filter, MoreVertical } from 'lucide-react';
import { CardSkeleton, TableSkeleton } from './LoadingSkeleton';
import { MobileDataCard, MobileCardRow, ScrollTableWrap } from './common/ResponsiveUI';
import EntityMovementModal from './EntityMovementModal';
import authService from '../services/authService';
import AgencyDetail from './AgencyDetail';
import { useAuth } from '../context/AuthContext';
import { normalizeUserType } from '../utils/roleBasedAccess';

/** Numeric API fields: show 0 as 0; null/empty/non-numeric text → null (display as —). */
const toNumericOrNull = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const displayNumeric = (value) => {
  const n = toNumericOrNull(value);
  return n === null ? '—' : n;
};

const Agencies = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingAgency, setViewingAgency] = useState(null);
  const [error, setError] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      setError('');
      const role = normalizeUserType(authService.getUserType() || currentUser?.userType);
      const userInfo = authService.getUserInfo();
      const myCode = authService.extractUserCode(userInfo);

      let result;
      if ((role === 'admin' || role === 'master-agency') && myCode) {
        result = await authService.getAllSubUserByCode(myCode, 'AGENCY');
      } else {
        result = await authService.getUsersByRole('AGENCY');
      }

      if (result.success) {
        const items = Array.isArray(result.data) ? result.data : (result.data?.result || result.data?.data || []);
        const transformedAgencies = items.map(agency => {
          const id = authService.extractUserCode(agency) || agency.code || '';
          const hosttoagnc = agency.hosttoagnc || agency.hostToAgnc || '';
          const activeCashoutHost =
            agency.activeCashoutHost ?? agency.activecashouthost ?? agency.activehost;
          return {
            name: agency.name || agency.username || 'Agency',
            id,
            hosttoagnc,
            owner: agency.ownername || agency.ownerName || '—',
            ownerId: agency.owner ?? agency.ownerId ?? null,
            hosts: agency.hosts ?? agency.hostCount ?? 0,
            overalldiamonds: agency.totaldiamonds ?? agency.diamond ?? agency.overalldiamonds ?? 0,
            livehost: agency.livehost ||'NULL',
            stage: agency.stage || '—',
            currentslab: agency.activeTier ?? agency.currentSlab ?? agency.slab ?? '—',
            activeCashoutHost,
            redeem: agency.redeem ?? agency.redeemed ?? agency.currentMonthRedeem,
            earnings: agency.myEarning ?? agency.earning ?? agency.currentMonthEarning,
            coins: agency.coins,
            joiningDate: agency.joiningdate || agency.joinDate || agency.createdAt || '—',
          };
        }).filter((a) => a.id || a.hosttoagnc);
        setAgencies(transformedAgencies);
      } else {
        setError(result.error || 'Failed to fetch agencies');
        setAgencies([]);
      }
      setLoading(false);
    };

    fetchAgencies();
  }, [currentUser?.userType]);

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(agency.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(agency.hosttoagnc || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || agency.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  // Paginated Slices
  const totalPages = Math.ceil(filteredAgencies.length / itemsPerPage);
  const paginatedAgencies = filteredAgencies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewAgency = (agency) => {
    const code = agency?.hosttoagnc || agency?.id;
    if (!code) return;
    setViewingAgency(agency);
  };

  const handleMoveEntity = (agency) => {
    setSelectedAgency({
      ...agency,
      currentParent: agency.owner || '—',
    });
    setShowMovementModal(true);
  };

  const handleEntityMove = async () => {
    setShowMovementModal(false);
    setSelectedAgency(null);
  };

  if (viewingAgency) {
    return (
      <AgencyDetail
        hosttoagnc={viewingAgency.hosttoagnc || viewingAgency.id}
        agencyCode={viewingAgency.id}
        masterAgencyCode={viewingAgency.ownerId}
        onBack={() => setViewingAgency(null)}
      />
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#1A1A1A] min-h-full" role="main">
      <div className="max-w-full mx-auto">
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
          // <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          //   <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
          //     <div className="flex items-center space-x-3">
          //       <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          //         <Building2 className="w-6 h-6 text-white" />
          //       </div>
          //       <div>
          //         <p className="text-gray-400 text-sm">Total Agencies</p>
          //         <p className="text-2xl font-bold text-white">{agencies.length}</p>
          //       </div>
          //     </div>
          //   </div>

          //   <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
          //     <div className="flex items-center space-x-3">
          //       <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
          //         <Eye className="w-6 h-6 text-white" />
          //       </div>
          //       <div>
          //         <p className="text-gray-400 text-sm">Active Agencies</p>
          //         <p className="text-2xl font-bold text-white">{agencies.length}</p>
          //       </div>
          //     </div>
          //   </div>

          //   <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
          //     <div className="flex items-center space-x-3">
          //       <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
          //         <span className="text-white font-bold text-lg">$</span>
          //       </div>
          //       <div>
          //         <p className="text-gray-400 text-sm">Total Earnings</p>
          //         <p className="text-2xl font-bold text-white">
          //           ${agencies.reduce((sum, agency) => sum + agency.earnings.thisMonth, 0).toLocaleString()}
          //         </p>
          //       </div>
          //     </div>
          //   </div>

          //   <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
          //     <div className="flex items-center space-x-3">
          //       <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          //         <span className="text-white font-bold text-lg">♦</span>
          //       </div>
          //       <div>
          //         <p className="text-gray-400 text-sm">Total Hosts</p>
          //         <p className="text-2xl font-bold text-white">
          //           {agencies.reduce((sum, agency) => sum + agency.hosts.length, 0)}
          //         </p>
          //       </div>
          //     </div>
          //   </div>
          // </div>
          <p>   </p>
        )}

        {/* Agencies Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={6} showHeader={true} />
        ) : (
          <div className="bg-[#121212] border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-800">
              <h2 className="text-lg sm:text-xl font-semibold text-white">List of Agencies</h2>
            </div>

            {/* Mobile card list */}
            <div className="lg:hidden divide-y divide-gray-800">
              {paginatedAgencies.map((agency) => (
                <MobileDataCard key={agency.id} onClick={() => handleViewAgency(agency)}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {agency.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate">{agency.name}</p>
                        <p className="text-gray-400 text-xs font-mono">{agency.id}</p>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-blue-400 shrink-0" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MobileCardRow label="Master Agency" value={agency.owner || '—'} />
                    <MobileCardRow label="Host Count" value={Array.isArray(agency.hosts) ? agency.hosts.length : (agency.hosts || 0)} />
                    <MobileCardRow label="Active Cashout Host" value={displayNumeric(agency.activeCashoutHost)} />
                    <MobileCardRow label="Diamonds" value={displayNumeric(agency.overalldiamonds)} />
                    <MobileCardRow label="Coins" value={displayNumeric(agency.coins)} />
                    <MobileCardRow label="Stage" value={agency.stage || '—'} />
                    <MobileCardRow label="Joined" value={agency.joiningDate || '—'} />
                  </div>
                </MobileDataCard>
              ))}
            </div>

            {/* Desktop table */}
            <ScrollTableWrap className="hidden lg:block">
              <table className="w-full min-w-[900px]">
                  <thead className="bg-[#1A1A1A]">
                    <tr>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs min-w-[160px]">Agency Name</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Agency code</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Master Agency</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Master Agency code</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Host count</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Live host</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Overall diamonds</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Current Stage</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Current Slab</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">active cashout host</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Redeem</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">My Earning</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Availble coins</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Joining date</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {paginatedAgencies.map((agency) => (
                      <tr
                        key={agency.id}
                        className="hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                        onClick={() => handleViewAgency(agency)}
                      >
                        {/* Agency Name */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                              {agency.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">{agency.name}</p>
                            </div>
                          </div>
                        </td>

                        {/* Agency Code */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 font-mono text-xs">{agency.hosttoagnc}</span>
                        </td>

                        {/* Master Agency */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{agency.owner || '--'}</span>
                        </td>

                        {/* Master Agency Code */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 font-mono text-xs">{agency.ownerId}</span>
                        </td>

                        {/* Host Count */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{Array.isArray(agency.hosts) ? agency.hosts.length : (agency.hosts || 0)}</span>
                        </td>

                         {/* livehost */}
                         <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{agency.livehost}</span>
                        </td>

                        {/* Overall Diamonds */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{displayNumeric(agency.overalldiamonds)}</span>
                        </td>

                        {/* Current Stage */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{agency.stage || '--'}</span>
                        </td>

                        {/* Current Slab */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{agency.currentslab || '- / -'}</span>
                        </td>

                        {/* Active Cashout Host */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{displayNumeric(agency.activeCashoutHost)}</span>
                        </td>

                        {/* Redeem */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{displayNumeric(agency.redeem)}</span>
                        </td>

                        {/* My Earning */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 font-bold text-xs">
                            {displayNumeric(agency.earnings)}
                          </span>
                        </td>

                        {/* Available Coins */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{displayNumeric(agency.coins)}</span>
                        </td>

                        {/* Joining Date */}
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-300 text-xs">{agency.joiningDate || '--'}</span>
                        </td>



                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewAgency(agency);
                              }}
                              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                              title="View Agency Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </ScrollTableWrap>

            {filteredAgencies.length === 0 && !loading && (
              <div className="py-12 text-center">
                <p className="text-gray-400">No agencies found matching your search.</p>
              </div>
            )}
            
            {/* Pagination Controls */}
            {!loading && !error && filteredAgencies.length > 0 && (
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
                      Showing {Math.min(filteredAgencies.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredAgencies.length, currentPage * itemsPerPage)} of {filteredAgencies.length}
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