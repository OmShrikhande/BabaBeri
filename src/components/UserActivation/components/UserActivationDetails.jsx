import React from 'react';
import { AlertCircle, Clock, Info, Search, ShieldCheck, UserCheck } from 'lucide-react';
import { formatDateTime } from '../utils/dateHelpers';
import { formatRoleLabel } from '../utils/roleHelpers';

const UserActivationDetails = ({
  record,
  onToggleStatus,
  isHistoryExpanded,
  onToggleHistory,
  statusResolver
}) => {
  if (!record) {
    return (
      <section className="lg:col-span-3">
        <div className="h-full bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl shadow-black/30 flex flex-col items-center justify-center gap-4 text-center px-6 py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#F72585]/15 to-[#7209B7]/15 flex items-center justify-center">
            <Search className="w-9 h-9 text-[#F72585]" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Select a record to manage activation
          </h2>
          <p className="text-sm text-gray-400 max-w-md">
            Use the filters above to find the right profile. Once selected, you can instantly update their access status while keeping an audit history.
          </p>
        </div>
      </section>
    );
  }

  const status = statusResolver(record.status);
  const isActive = record.status === 'active';

  return (
    <section className="lg:col-span-3">
      <div className="h-full bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl shadow-black/30 flex flex-col">
        <div className="p-5 sm:p-6 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F72585]" />
                {record.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Managing access for {formatRoleLabel(record.role)} ({record.id})
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 bg-[#161616] text-xs sm:text-sm text-gray-300">
                <Info className="w-4 h-4 text-[#F72585]" />
                Joined {formatDateTime(record.joinedAt)}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-800 bg-[#161616] text-xs sm:text-sm text-gray-300">
                <Clock className="w-4 h-4 text-[#F72585]" />
                Last active {formatDateTime(record.lastActive)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#161616] border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400">Role</p>
              <p className="text-sm sm:text-base font-semibold text-white mt-1">{formatRoleLabel(record.role)}</p>
            </div>
            <div className="bg-[#161616] border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400">Region</p>
              <p className="text-sm sm:text-base font-semibold text-white mt-1">{record.region}</p>
            </div>
            <div className="bg-[#161616] border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400">Total Coins</p>
              <p className="text-sm sm:text-base font-semibold text-white mt-1">{record.coins.toLocaleString()}</p>
            </div>
            <div className="bg-[#161616] border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400">Unique Identifier</p>
              <p className="text-sm sm:text-base font-semibold text-white mt-1">{record.id}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#F72585]/10 via-[#5A189A]/10 to-[#4361EE]/10 border border-[#F72585]/20 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Current Status</p>
                <div className="mt-2 inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-white">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-xs sm:text-sm font-medium ${status.badgeClass}`}>
                    <status.icon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-300">
                    Updated {formatDateTime(record.auditHistory?.[0]?.timestamp)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleStatus}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]
                  ${isActive
                    ? 'border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 focus-visible:ring-red-400/60'
                    : 'border border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20 focus-visible:ring-green-400/60'
                  }`}
              >
                <UserCheck className="w-4 h-4" />
                {isActive ? 'Deactivate User' : 'Activate User'}
              </button>
            </div>
          </div>

          <div className="bg-[#161616] border border-gray-800 rounded-xl">
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left text-sm font-semibold text-white border-b border-gray-800"
              onClick={onToggleHistory}
              aria-expanded={isHistoryExpanded}
            >
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#F72585]" />
                Status Change History
              </span>
              <span className="text-xs text-gray-400">{isHistoryExpanded ? 'Hide' : 'Show'}</span>
            </button>

            {isHistoryExpanded && (
              <div className="divide-y divide-gray-800">
                {(record.auditHistory || []).map((entry, index) => {
                  const entryStatus = statusResolver(entry.status);
                  return (
                    <article key={`${entry.timestamp}-${index}`} className="px-5 sm:px-6 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <entryStatus.icon className="w-4 h-4" />
                            <p className="text-xs sm:text-sm font-semibold text-white">{entryStatus.label}</p>
                          </div>
                          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                            {formatDateTime(entry.timestamp)} · {entry.actor}
                          </p>
                        </div>
                        <span className="text-[11px] sm:text-xs text-[#F72585] uppercase tracking-wide">Audit Trail</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserActivationDetails;