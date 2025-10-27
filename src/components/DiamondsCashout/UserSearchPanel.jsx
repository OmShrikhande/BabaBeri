import React from 'react';
import { Search, Bell } from 'lucide-react';
import CustomDropdown from '../CustomDropdown';

const UserSearchPanel = ({
  searchValue,
  onSearchChange,
  onSearch,
  onKeyPress,
  loading,
  selectedFilter,
  onFilterChange,
  filterOptions,
}) => (
  <div className="flex items-end justify-between space-x-4">
    <div className="flex-1 max-w-md">
      <label className="block text-sm font-medium text-gray-300 mb-2">Search User</label>
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={onSearchChange}
          onKeyPress={onKeyPress}
          placeholder="Enter user ID to search"
          className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] transition-colors"
        />
        <button
          onClick={onSearch}
          disabled={loading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center hover:glow-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        onChange={onFilterChange}
        className="w-32"
      />
    </div>
  </div>
);

export default UserSearchPanel;
