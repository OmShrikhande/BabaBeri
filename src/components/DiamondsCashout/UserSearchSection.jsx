import React from 'react';
import { Search, Bell } from 'lucide-react';
import CustomDropdown from '../CustomDropdown';
import { filterOptions } from '../../data/diamondsDemoData';

const UserSearchSection = ({
  searchUserId,
  loadingUser,
  selectedFilter,
  onSearchChange,
  onSearch,
  onKeyPress,
  onFilterSelect
}) => {
  return (
    <div className="flex items-end justify-between space-x-4">
      <div className="flex-1 max-w-md">
        <label className="block text-sm font-medium text-gray-300 mb-2">Search User</label>
        <div className="relative">
          <input
            type="text"
            value={searchUserId}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Enter user ID to search"
            className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] transition-colors"
          />
          <button
            onClick={onSearch}
            disabled={loadingUser}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center hover:glow-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingUser ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Bell className="w-6 h-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
        
        <CustomDropdown
          options={filterOptions}
          value={selectedFilter}
          onChange={onFilterSelect}
          className="w-32"
        />
      </div>
    </div>
  );
};

export default UserSearchSection;
