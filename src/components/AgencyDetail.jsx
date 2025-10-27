import React from 'react';
import { ArrowLeft, Diamond, TrendingUp, DollarSign, Award } from 'lucide-react';
import { agenciesData, achievementTiers } from '../data/agencyData';

const AgencyDetail = ({ agencyId, onBack }) => {
  const agency = agenciesData.find(a => a.id === agencyId);

  if (!agency) {
    return (
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto" role="main">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Agencies</span>
          </button>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Agency not found</p>
          </div>
        </div>
      </main>
    );
  }

  const progressPercentage = (agency.goals.moneyEarned / agency.goals.moneyTarget) * 100;
  const goalsRemaining = agency.goals.total - agency.goals.current;

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto" role="main">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Agencies</span>
            </button>
            <div className="w-px h-6 bg-gray-700"></div>
            <h1 className="text-3xl font-bold text-white">{agency.name}</h1>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Progress Overview</h2>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                ${agency.goals.moneyEarned.toLocaleString()} / ${agency.goals.moneyTarget.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">
                {goalsRemaining > 0 ? `${goalsRemaining} Goals Remaining` : 'All Goals Completed!'}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-[#7209B7] to-[#F72585] h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-400 text-sm">$0</span>
              <span className="text-gray-400 text-sm">${agency.goals.moneyTarget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Earnings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Earnings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Last Month's Earnings</p>
                    <p className="text-xl font-bold text-white">
                      ${agency.earnings.lastMonth.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-green-400">
                  <Diamond className="w-4 h-4 mr-1" />
                  <span className="text-sm">+12% from prev month</span>
                </div>
              </div>

              <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">This Month's Earnings</p>
                    <p className="text-xl font-bold text-white">
                      ${agency.earnings.thisMonth.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-green-400">
                  <Diamond className="w-4 h-4 mr-1" />
                  <span className="text-sm">+18% growth</span>
                </div>
              </div>

              <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Diamond className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Redeem Diamonds</p>
                    <p className="text-xl font-bold text-white">
                      {agency.earnings.redeemDiamonds.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-yellow-400">
                  <Diamond className="w-4 h-4 mr-1" />
                  <span className="text-sm">Available to redeem</span>
                </div>
              </div>
            </div>

            {/* Hosts Table */}
            <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white">List of Hosts</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Total hosts: {agency.hosts.length}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1A1A1A]">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Host Name</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Host ID</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Earnings</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Redeemed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {agency.hosts.map((host) => (
                      <tr key={host.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {host.name.charAt(0)}
                            </div>
                            <span className="text-white font-medium">{host.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300 font-mono text-sm">{host.id}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1">
                            <Diamond className="w-4 h-4 text-purple-400" />
                            <span className="text-white font-semibold">{host.earnings}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1">
                            <Diamond className="w-4 h-4 text-green-400" />
                            <span className="text-white font-semibold">{host.redeemed}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Achievement Tiers */}
          <div className="space-y-6">
            <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Achievement Tiers</h2>
              
              <div className="space-y-4">
                {achievementTiers.map((tier) => {
                  const isCurrentTier = agency.tier === tier.name;
                  
                  return (
                    <div 
                      key={tier.id}
                      className={`relative p-4 rounded-lg border transition-all ${
                        isCurrentTier 
                          ? 'border-[#F72585] bg-gradient-to-r from-[#F72585]/10 to-[#7209B7]/10' 
                          : 'border-gray-700 bg-[#1A1A1A]'
                      }`}
                    >
                      {isCurrentTier && (
                        <div className="absolute top-2 right-2">
                          <Award className="w-5 h-5 text-[#F72585]" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${isCurrentTier ? 'text-white' : 'text-gray-300'}`}>
                          {tier.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-2xl font-bold ${isCurrentTier ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                          {tier.revenueShare}%
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isCurrentTier ? 'bg-[#FFD700] text-black' : 'bg-gray-700 text-gray-300'
                        }`}>
                          Revenue Share
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400">
                        {tier.requirements}
                      </p>
                      
                      {isCurrentTier && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-[#F72585] font-medium">Current Tier</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Agency Info */}
            <div className="bg-[#2A2A2A] border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Agency Information</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Agency ID:</span>
                  <span className="text-white font-mono">{agency.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Hosts:</span>
                  <span className="text-white">{agency.hosts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Tier:</span>
                  <span className="text-white">{agency.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue Share:</span>
                  <span className="text-[#FFD700] font-semibold">{agency.revenueShare}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AgencyDetail;