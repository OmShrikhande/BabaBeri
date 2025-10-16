import React from 'react';
import { Search } from 'lucide-react';

const HostRechargeSection = ({
  hosts,
  filteredHosts,
  selectedHost,
  rechargeAmount,
  hostSearch,
  isSearching,
  isRecharging,
  onSearchChange,
  onSelectHost,
  onAmountChange,
  onRecharge
}) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Recharge Coins to Host</h2>
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="flex-1 w-full">
        <label className="block text-gray-400 mb-1">Find host</label>
        <div className="flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <input
              type="text"
              value={hostSearch}
              onChange={onSearchChange}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#F72585] mb-2"
              placeholder="Search by name, username, or ID"
            />
          </div>
          {isSearching && <span className="text-sm text-gray-400">Searching...</span>}
        </div>
        <label className="block text-gray-400 mb-1">Choose host</label>
        <select
          value={selectedHost ? selectedHost.id : ''}
          onChange={onSelectHost}
          className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
        >
          <option value="">-- Select Host --</option>
          {filteredHosts.map((host) => (
            <option key={host.id} value={host.id}>
              {host.name || host.username || `Host #${host.id}`}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 w-full">
        <label className="block text-gray-400 mb-1">Coin Amount</label>
        <input
          type="number"
          min="1"
          value={rechargeAmount}
          onChange={onAmountChange}
          className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
          placeholder="Enter coins"
        />
      </div>
      <button
        onClick={onRecharge}
        disabled={isRecharging}
        className="bg-gradient-to-r from-[#F72585] to-[#7209B7] px-4 py-2 rounded-lg text-white font-semibold mt-4 md:mt-0"
      >
        {isRecharging ? 'Recharging...' : 'Recharge'}
      </button>
    </div>
    <div className="mt-3 text-sm text-gray-400">
      <div>
        Hosts fetched: <span className="text-white">{hosts.length}</span>
      </div>
      {hosts.slice(0, 3).map((host, index) => (
        <div key={index} className="text-xs text-gray-500">
          {host.id} — {host.name || host.username || JSON.stringify(host)}
        </div>
      ))}
    </div>
  </div>
);

export default HostRechargeSection;