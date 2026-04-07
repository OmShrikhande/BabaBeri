import React, { useState, useEffect, useRef } from 'react';
import { Search, Coins, Loader2, ChevronDown, User } from 'lucide-react';

const InputField = ({ label, id, ...props }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300">
      {label}
    </label>
    <div className="relative">
      {props.icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {props.icon}
        </div>
      )}
      <input
        id={id}
        {...props}
        className={`
          w-full bg-[#1A1A1A] border border-gray-700/50 rounded-lg
          ${props.icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
          text-white placeholder-gray-500
          transition-colors duration-200
          focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585]
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      />
    </div>
  </div>
);

const SearchableSelect = ({ label, id, options, value, onSelect, isSearching, searchValue, onSearchChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => String(option.id) === String(value));

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        <div className="relative">
          <input
            id={id}
            type="text"
            value={searchValue}
            onChange={onSearchChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search by name, username, or ID"
            className="
              w-full bg-[#1A1A1A] border border-gray-700/50 rounded-lg
              pl-10 pr-4 py-2.5
              text-white placeholder-gray-500
              transition-colors duration-200
              focus:outline-none focus:border-[#F72585] focus:ring-1 focus:ring-[#F72585]
            "
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute inset-y-0 right-3 flex items-center"
          >
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </button>
        </div>

        {isOpen && (
          <div className="
            absolute z-50 w-full mt-1
            bg-[#1A1A1A] border border-gray-700/50 rounded-lg
            shadow-lg shadow-black/50
            max-h-60 overflow-y-auto
            scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
          ">
            {isSearching ? (
              <div className="flex items-center gap-2 p-3 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSelect({ target: { value: String(option.id), option } });
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5
                    text-left text-sm
                    transition-colors duration-200
                    hover:bg-gray-800
                    ${String(option.id) === String(value) ? 'bg-gray-800' : ''}
                  `}
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-col text-left">
                    <span className="text-white">
                      {option.name || option.username || `Host #${option.id}`}
                    </span>
                    <span className="text-xs text-gray-400">ID: {option.code}</span>
                    {/* <span className="text-xs text-gray-400">Code: {option.code}</span> */}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-400">
                No hosts found
              </div>
            )}
          </div>
        )}
      </div>
      {selectedOption && (
        <div className="mt-2 px-3 py-2 bg-gray-800/50 rounded-lg flex items-center gap-2">
          <User className="w-4 h-4 text-[#F72585]" />
          <div className="text-sm text-white">
            <span>
              Selected: {selectedOption.name || selectedOption.username || `User #${selectedOption.id}`}
            </span>
            <span className="block text-xs text-gray-400">ID: {selectedOption.code}</span>
            {/* <span className="block text-xs text-gray-400">Code: {selectedOption.code}</span> */}
          </div>
        </div>
      )}
    </div>
  );
};

const HostRechargeSection = ({
  users,
  filteredUsers,
  selectedUser,
  rechargeAmount,
  userSearch,
  isSearching,
  isRecharging,
  onSearchChange,
  onSelectUser,
  onAmountChange,
  onRecharge
}) => (
  <section className="bg-[#121212]/50 rounded-xl p-6 backdrop-blur-sm border border-gray-800/50 mb-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-[#F72585]/10 rounded-lg">
        <Coins className="w-6 h-6 text-[#F72585]" />
      </div>
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        Recharge Coins to Any User
      </h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
      <div className="space-y-4">
        <SearchableSelect
          label="Select User"
          id="user-select"
          options={filteredUsers}
          value={selectedUser ? selectedUser.id : ''}
          onSelect={onSelectUser}
          isSearching={isSearching}
          searchValue={userSearch}
          onSearchChange={onSearchChange}
        />
      </div>

      <div className="space-y-4">
        <InputField
          label="Coin Amount"
          id="coin-amount"
          type="number"
          min="1"
          value={rechargeAmount}
          onChange={onAmountChange}
          placeholder="Enter coins"
          aria-label="Enter coin amount"
        />

        <button
          onClick={onRecharge}
          disabled={isRecharging}
          className="
            w-full bg-gradient-to-r from-[#F72585] to-[#7209B7]
            px-6 py-2.5 rounded-lg
            text-white font-semibold
            transform transition-all duration-200
            hover:scale-[1.02] hover:shadow-lg hover:shadow-[#F72585]/20
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          "
        >
          {isRecharging ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Recharging...</span>
            </>
          ) : (
            <>
              <Coins className="w-5 h-5" />
              <span>Recharge</span>
            </>
          )}
        </button>
      </div>
    </div>

    <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-800/50">
      <div className="text-sm text-gray-400 mb-2">
        Available Users: <span className="text-white font-medium">{users.length}</span>
      </div>
      <div className="space-y-1">
        {users.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="text-xs text-gray-500 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#F72585]/50"></span>
            <span>{user.name || user.username || `User #${user.id}`}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HostRechargeSection;