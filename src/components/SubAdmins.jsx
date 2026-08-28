import React, { useState, useEffect } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { APP_CONFIG } from '../config/api';
import { MobileDataCard, MobileCardRow } from './common/ResponsiveUI';

const ownerBase = `/${APP_CONFIG.OWNER_SECRET_PATH}`;

const SubAdmins = () => {
  const navigate = useNavigate();
  const [subAdmins, setSubAdmins] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let ignore = false;
    const fetchAdmins = async () => {
      setListLoading(true);
      setListError('');
      try {
        const res = await authService.getUsersByRole('ADMIN');
        if (!ignore) {
          if (res.success) {
            const items = Array.isArray(res.data) ? res.data : (res.data?.result || res.data?.data || []);
            const mapped = (items || []).map((u, idx) => {
              const adminId = authService.extractUserCode(u) || u?.adminCode || u?.adminId || '';
              return {
                id: u?.id || u?._id || u?.userId || adminId || idx + 1,
                name: u?.name || u?.username || u?.fullname || u?.email || `Admin ${idx + 1}`,
                adminId,
                masterAgencyCount: u?.masterAgencyCount || u?.count || 0,
                coins: u?.coins !== undefined ? u.coins : 0,
                diamond: u?.diamond !== undefined ? u.diamond : (u?.totaldiamonds ?? 0),
                slab: u?.slab || u?.currentSlab || '-',
                jod: u?.joinDate || u?.joiningdate || u?.createdAt || u?.created_at || 'N/A',
                api: u,
              };
            }).filter((a) => a.adminId);
            setSubAdmins(mapped);
          } else {
            setListError(res.error || 'Failed to load admins.');
          }
        }
      } catch (e) {
        if (!ignore) setListError(e?.message || 'Failed to load admins.');
      } finally {
        if (!ignore) setListLoading(false);
      }
    };
    fetchAdmins();
    return () => { ignore = true; };
  }, []);

  const handleViewSubAdmin = (subAdmin) => {
    if (!subAdmin?.adminId) return;
    navigate(`${ownerBase}/sub-admins/${encodeURIComponent(subAdmin.adminId)}`, {
      state: { name: subAdmin.name },
    });
  };

  // Paginated Slices
  const totalPages = Math.ceil(subAdmins.length / itemsPerPage);
  const paginatedSubAdmins = subAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex-1 bg-[#1A1A1A] text-white min-h-full flex flex-col overflow-hidden">
      <div className="bg-[#121212] border-b border-gray-800 p-4 sm:p-6 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
          <Users className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-[#F72585]" />
          List of Admins
        </h1>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
        <div className="h-full flex flex-col">
          <div className="bg-[#121212] border border-gray-800 rounded-xl overflow-hidden flex-1 flex flex-col">
            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-800">
              {listLoading && (
                <div className="px-4 py-8 text-gray-400 text-center">Loading admins...</div>
              )}
              {!listLoading && listError && (
                <div className="px-4 py-8 text-red-400 text-center">{listError}</div>
              )}
              {!listLoading && !listError && paginatedSubAdmins.map((subAdmin) => (
                <MobileDataCard key={subAdmin.adminId || subAdmin.id} onClick={() => handleViewSubAdmin(subAdmin)}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{subAdmin.name}</p>
                      <p className="text-gray-400 text-xs font-mono">{subAdmin.adminId}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MobileCardRow label="Master Agencies" value={subAdmin.masterAgencyCount} />
                    <MobileCardRow label="Diamonds" value={subAdmin.diamond} />
                    <MobileCardRow label="Slab" value={subAdmin.slab} />
                    <MobileCardRow label="Coins" value={subAdmin.coins} />
                    <MobileCardRow label="Joined" value={subAdmin.jod} />
                  </div>
                </MobileDataCard>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto flex-1">
              <div className="min-w-[900px] flex flex-col">
                <div className="bg-[#0A0A0A] border-b border-gray-800 flex-shrink-0">
                  <div className="grid grid-cols-8 gap-4 px-2 py-2">
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Admin Name</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Admin Code</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Master Agencies</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Overall Diamond</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Current Slab</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Available Coins</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Joining Date</div>
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-wider text-center">Action</div>
                  </div>
                </div>

                <div className="divide-y divide-gray-800">
                  {listLoading && (
                    <div className="px-6 py-8 text-gray-400 text-center">Loading admins...</div>
                  )}
                  {!listLoading && listError && (
                    <div className="px-6 py-8 text-red-400 text-center">{listError}</div>
                  )}
                  {!listLoading && !listError && paginatedSubAdmins.map((subAdmin, index) => (
                    <div
                      key={subAdmin.adminId || subAdmin.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleViewSubAdmin(subAdmin)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleViewSubAdmin(subAdmin);
                        }
                      }}
                      className="grid grid-cols-8 gap-5 px-2 py-4 hover:bg-[#222222] transition-all duration-200 group cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex-shrink-0 border border-gray-600 group-hover:border-[#F72585] transition-colors" />
                        <div className="text-white font-bold text-sm group-hover:text-[#F72585] transition-colors">
                          {subAdmin.name}
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-300 font-mono font-medium text-xs group-hover:text-white transition-colors">{subAdmin.adminId}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-sm group-hover:text-white transition-colors">{subAdmin.masterAgencyCount || '—'}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-sm group-hover:text-white transition-colors">{subAdmin.diamond}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-sm group-hover:text-white transition-colors">{subAdmin.slab}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-sm group-hover:text-white transition-colors">{subAdmin.coins}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-300 font-bold text-sm group-hover:text-white transition-colors">{subAdmin.jod || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="w-8 h-8 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center group-hover:opacity-90 group-hover:shadow-lg transform group-hover:scale-110 transition-all duration-200">
                          <ChevronRight className="w-4 h-4 text-white" />
                        </span>
                      </div>
                    </div>
                  ))}
                  {!listLoading && !listError && subAdmins.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
                        <Users className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">No admins found</h3>
                      <p className="text-gray-400 max-w-md">Admins will appear here when available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pagination Controls */}
            {!listLoading && !listError && subAdmins.length > 0 && (
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
                      Showing {Math.min(subAdmins.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(subAdmins.length, currentPage * itemsPerPage)} of {subAdmins.length}
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

export default SubAdmins;
