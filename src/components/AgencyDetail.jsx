import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Eye, User, Building2 } from 'lucide-react';
import { TableSkeleton } from './LoadingSkeleton';
import authService from '../services/authService';

const AgencyDetail = ({ agencyId, onBack }) => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // We can fetch the agency details separately if needed, but for now we focus on the list of hosts
  // as per the requirement.

  useEffect(() => {
    const fetchHosts = async () => {
      setLoading(true);
      try {
        console.log(`Fetching hosts for agency: ${agencyId}`);
        const result = await authService.getAllSubUserByCode(agencyId, 'HOST');
        console.log('Hosts API result:', result);
        
        if (result.success && Array.isArray(result.data)) {
            const transformedHosts = result.data.map(host => ({
                name: host.name,
                id: host.code || host.usercode || host.id,
                owner: host.ownername || '-', // Agency Name
                ownerId: host.owner || agencyId, // Agency Code
                hosts: [], // Hosts don't have hosts
                overalldiamonds: host.totaldiamonds || 0,
                stage: host.stage || "Unknown",
                currentslab: host.currentSlab || "Unknown",
                activehost: host.activecashouthost || "-",
                redeem: host.redeem || "--",
                earnings: host.earning,
                coins: host.coins || 0,
                joiningDate: host.joiningdate || host.createdAt || new Date(),
            }));
            setHosts(transformedHosts);
        } else {
            console.error('Failed to fetch hosts:', result.error);
            setHosts([]);
        }
      } catch (error) {
        console.error("Error fetching hosts:", error);
        setHosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, [agencyId]);

  const filteredHosts = hosts.filter(host => {
     const matchesSearch = host.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           host.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());
     return matchesSearch;
  });

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto" role="main">
       <div className="max-w-7xl mx-auto">
         {/* Header with Back Button */}
         <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-8">
            <div className="flex items-center space-x-3">
                <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors mr-2">
                   <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Agency Details (Hosts)</h1>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search hosts by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585]"
                  />
                </div>
            </div>
         </div>

         {/* Hosts Table - Using the same structure as Agencies table */}
          {loading ? (
          <TableSkeleton rows={10} columns={6} showHeader={true} />
        ) : (
          <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">List of Hosts for Agency: {agencyId}</h2>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[2000px]">
                <table className="w-full">
                  <thead className="bg-[#1A1A1A]">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm min-w-[250px]">Host Name</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Host code</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Master Agency</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Master Agency code</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Host count</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Overall diamonds</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Current Stage</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Current Slab</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">active cashout host</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Redeem</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">My Earning</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Availble coins</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Joining date</th>
                      {/* <th className="text-right py-4 px-6 text-gray-400 font-medium text-sm">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredHosts.map((host) => (
                      <tr 
                        key={host.id}
                        className="hover:bg-[#1A1A1A] transition-colors"
                      >
                        {/* Host Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {host.name?.charAt(0) || 'H'}
                            </div>
                            <div>
                              <p className="text-white font-medium">{host.name}</p>
                            </div>
                          </div>
                        </td>

                        {/* Host Code */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 font-mono text-sm">{host.id}</span>
                        </td>

                        {/* Master Agency (Owner) */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">{host.owner || '--'}</span>
                        </td>

                        {/* Master Agency Code */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 font-mono text-sm">{host.ownerId}</span>
                        </td>

                        {/* Host Count (N/A for Host) */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">--</span>
                        </td>

                        {/* Overall Diamonds */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">{host.overalldiamonds}</span>
                        </td>

                        {/* Current Stage */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">{host.stage}</span>
                        </td>

                        {/* Current Slab */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">{host.currentslab}</span>
                        </td>

                        {/* Active Cashout Host */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">{host.activehost}</span>
                        </td>

                        {/* Redeem */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">{host.redeem}</span>
                        </td>

                        {/* My Earning */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 font-semibold">{host.redeem}</span>
                        </td>

                        {/* Available Coins */}
                        <td className="py-4 px-6">
                          <span className="text-gray-300 text-sm">{host.coins}</span>
                        </td>

                        {/* Joining Date */}
                        <td className="py-4 px-6">
                           <span className="text-gray-300 text-sm">
                            {host.joiningDate && typeof host.joiningDate === 'string' 
                                ? new Date(host.joiningDate).toLocaleDateString() 
                                : String(host.joiningDate)}
                           </span>
                        </td>

                        {/* Actions - Removed actions as typically you might not view sub-details of a host from here, or we can add later */}
                        {/* <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td> */}
                      </tr> 
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {filteredHosts.length === 0 && !loading && (
              <div className="py-12 text-center">
                <p className="text-gray-400">No hosts found matching your search.</p>
              </div>
            )}
          </div>
        )}
       </div>
    </main>
  )
}

export default AgencyDetail;
