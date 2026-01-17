import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Eye, User, Building2, Diamond, TrendingUp, Coins, ChevronDown, Lock, Shield, Crown } from 'lucide-react';
import { TableSkeleton } from './LoadingSkeleton';
import authService from '../services/authService';

const AgencyDetail = ({ agencyId, onBack }) => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalDiamonds: 0,
    totalCoins: 0,
    totalRedeem: 0,
    hostCount: 0
  });

  // Mock targets
  const goals = {
    diamondTarget: 10000,
    hostTarget: 10
  };
  
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
                overalldiamonds: Number(host.totaldiamonds) || 0,
                stage: host.stage || "Unknown",
                currentslab: host.currentSlab || "Unknown",
                activehost: host.activecashouthost || "-",
                redeem: Number(host.redeem) || 0,
                earnings: host.earning,
                coins: Number(host.coins) || 0,
                joiningDate: host.joiningdate || host.createdAt || new Date(),
            }));
            setHosts(transformedHosts);

            // Calculate stats
            const calculatedStats = transformedHosts.reduce((acc, curr) => ({
                totalDiamonds: acc.totalDiamonds + (curr.overalldiamonds || 0),
                totalCoins: acc.totalCoins + (curr.coins || 0),
                totalRedeem: acc.totalRedeem + (curr.redeem || 0),
                hostCount: acc.hostCount + 1
            }), { totalDiamonds: 0, totalCoins: 0, totalRedeem: 0, hostCount: 0 });
            setStats(calculatedStats);

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

  const goalsCompleted = 
    (stats.totalDiamonds >= goals.diamondTarget ? 1 : 0) + 
    (stats.hostCount >= goals.hostTarget ? 1 : 0);

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#000000]/20 backdrop-blur-md" role="main">
       <div className="max-wmx-auto mx-auto">
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
