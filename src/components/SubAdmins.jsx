import React, { useState, useEffect } from 'react';
import { Users, ChevronRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { subAdminsData } from '../data/subAdminsData';
import authService from '../services/authService';

const SubAdmins = ({ onNavigateToDetail }) => {
  const [subAdmins, setSubAdmins] = useState(subAdminsData);
  
  // List loading and data from API
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

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
            const mapped = (items || []).map((u, idx) => ({
              id: u?.id || u?._id || u?.userId || idx + 1,
              name: u?.name || u?.username || u?.fullname || u?.email || `Admin ${idx + 1}`,
              adminId: u?.code || u?.usercode || u?.adminCode || u?.adminId || u?.userid || '',
              masterAgenciesCount: u?.masterAgenciesCount || u?.masteragencycount || u?.count || 0,
              coins: u?.coins !== undefined ? u.coins : 0,
              diamond: u?.diamond !== undefined ? u.diamond : 0,
              slab: u?.slab || '-',
              jod: u?.joiningDate || u?.createdAt || u?.created_at || 'N/A',
              api: u,
            }));
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

  


  const handleViewSubAdmin = async (subAdmin) => {
    if (onNavigateToDetail) {
      // Call the API to get sub users
      try {
        const res = await authService.getAllSubUserByCode(subAdmin?.adminId);
        const subUsers = res.success ? (Array.isArray(res.data) ? res.data : (res.data?.result || res.data?.data || [])) : [];
        onNavigateToDetail({
          id: subAdmin?.id,
          code: subAdmin?.adminId,
          name: subAdmin?.name,
          subUsers: subUsers
        });
      } catch (error) {
        console.error('Failed to fetch sub users:', error);
        // Still navigate even if API fails
        onNavigateToDetail({ id: subAdmin?.id, code: subAdmin?.adminId, name: subAdmin?.name, subUsers: [] });
      }
      // Make sure your parent passes an onBack handler to SubAdminDetail for the arrow to work.
    }
  };

  return (
    <div className="flex-1 bg-[#1A1A1A] text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-[#121212] border-b border-gray-800 p-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Users className="w-8 h-8 mr-3 text-[#F72585]" />
          List of Admins
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">

          {/* List of Sub-Admins */}
          <div className="bg-[#121212] border border-gray-800 overflow-hidden h-full flex flex-col">
            {/* <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">List of Sub-Admins</h2>
            </div>   */}

            {/* Table Header */}
            <div className="bg-[#0A0A0A] border-b border-gray-800">
              <div className="grid grid-cols-8 gap-4 px-2 py-2">
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider align-items-center text-center">Admin Name</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider align-items-center text-center">Admin Code</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider align-items-center text-center">Master Agencies</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider align-items-center text-center">overall diamond</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider align-items-center text-center">Current slab</div>
                {/* <div className="text-gray-400 font-bold text-sm uppercase tracking-wider">current diamond</div> */}
                
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider align-items-center text-center">available coins</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider align-items-center text-center">Joining date</div>
                <div className="text-gray-400 font-bold text-sm uppercase tracking-wider ">Action</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800 flex-1 overflow-y-auto">
              {listLoading && (
                <div className="px-6 py-8 text-gray-400 text-center">Loading admins...</div>
              )}
              {!listLoading && listError && (
                <div className="px-6 py-8 text-red-400 text-center">{listError}</div>
              )}
              {!listLoading && !listError && subAdmins.map((subAdmin, index) => (
                <div 
                  key={subAdmin.id} 
                  className="grid grid-cols-8 gap-5 px-2 py-4 hover:bg-[#222222] transition-all duration-200 group"
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
                  <div className="align-items-center text-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors">{subAdmin.adminId}</span>
                  </div>

                  {/* Master Agencies */}
                  <div className=" align-items-center text-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">{subAdmin.masterAgenciesCount || "-"}</span>
                  </div>
                  {/* Current slab */}
                  <div className="align-items-center text-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">{subAdmin.diamond }</span>
                  </div>
                  {/* overall diamonds */}
                  <div className="align-items-center text-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">{subAdmin.slab}</span>
                  </div>
                  {/* available Coins */}
                  <div className="align-items-center text-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">{subAdmin.coins }</span>
                  </div>
                  {/* joining date */}
                  <div className="align-items-center text-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">{subAdmin.jod || "N/A"}</span>
                  </div>

                  {/* Action Button */}
                  <div className="align-items-center text-center">
                    <button
                      onClick={() => handleViewSubAdmin(subAdmin)}
                      className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center hover:opacity-90 hover:shadow-lg transform hover:scale-110 transition-all duration-200 glow-pink"
                      aria-label="View sub-admin details"
                      title="View details"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                
              ))}

              {/* <div 
                 
                  className="grid grid-cols-7 gap-0 px-2 py-4 hover:bg-[#222222] transition-all duration-200 group"
                
                > */}
                  {/* Sub-Admin Name */}
                  {/* <div className="flex items-center space-x-4">
                  
                    <div>
                      <div className="text-white font-bold text-base group-hover:text-[#F72585] transition-colors"></div>
                    </div>
                  </div> */}

                  {/* Sub-Admin ID */}
                  {/* <div className="flex items-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors"></span>
                  </div> */}
                  
                  {/* <div className="flex items-center">
                    <span className="text-gray-300 font-mono font-medium group-hover:text-white transition-colors"></span>
                  </div> */}

                  {/* Master Agencies */}
                  {/* <div className="flex items-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">total </span>
                  </div> */}
                  {/* Current diamonds */}
                  {/* <div className="flex items-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">344</span>
                  </div> */}
                  {/* overall diamonds */}
                  {/* <div className="flex items-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">432</span>
                  </div> */}
                  {/* Total Coins */}
                  {/* <div className="flex items-center">
                    <span className="text-gray-300 font-bold text-lg group-hover:text-white transition-colors">3242</span>
                  </div> */}

                  {/* Action Button */}
                
                {/* </div> */}
                
            </div>

            {/* Empty State */}
            {subAdmins.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-6 border-2 border-gray-600">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No sub-admins found</h3>
                <p className="text-gray-400 max-w-md">
                  Add your first sub-admin using the form.
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