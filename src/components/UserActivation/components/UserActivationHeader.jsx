import React from 'react';
import { CheckCircle2, Search, ShieldCheck, ShieldOff } from 'lucide-react';

const UserActivationHeader = ({
  identifierOptions,
  identifierType,
  onIdentifierChange,
  query,
  onQueryChange,
  buildPlaceholder,
  searchInputRef,
  onReset,
  totalMatches,
  currentRoleFilter
}) => {
  return (
    <header className="border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Account Activation Center</h1>
              <p className="text-sm text-gray-400">
                Quickly locate role-based accounts and manage their activation status.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-[#161616] border border-gray-800 rounded-lg shadow-inner shadow-black/40">
                <div className="grid grid-cols-3 overflow-hidden rounded-lg">
                  {identifierOptions.map((option) => {
                    const isActive = option.value === identifierType;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onIdentifierChange(option.value)}
                        className={`relative px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F72585] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]
                          ${isActive ? 'text-white bg-gradient-to-r from-[#F72585]/90 to-[#7209B7]/90 shadow-lg shadow-pink-500/20' : 'text-gray-400 hover:text-white hover:bg-[#1F1F1F]'}`}
                        aria-pressed={isActive}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex-1">
                <span className="sr-only">Search user</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder={buildPlaceholder(identifierType)}
                    className="w-full bg-[#161616] border border-gray-800 hover:border-gray-700 focus:border-[#F72585] focus:ring-2 focus:ring-[#F72585]/50 text-sm sm:text-base text-white placeholder-gray-500 rounded-lg py-3 pl-11 pr-4 transition-all duration-300"
                    autoComplete="off"
                  />
                </div>
              </label>
            </div>

            <div className="flex gap-2 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-2 bg-[#161616] border border-gray-800 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Instant status change</span>
              </div>
              <div className="flex items-center gap-2 bg-[#161616] border border-gray-800 rounded-lg px-3 py-2">
                <ShieldOff className="w-4 h-4 text-red-400" />
                <span>Audit trail preserved</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-gray-400">
            <p>
              {totalMatches} record{totalMatches === 1 ? '' : 's'} found
              {identifierType === 'role' && currentRoleFilter && ` for "${currentRoleFilter}"`}
            </p>
            <button
              type="button"
              onClick={onReset}
              className="text-xs sm:text-sm text-gray-400 hover:text-white underline decoration-dotted"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserActivationHeader;