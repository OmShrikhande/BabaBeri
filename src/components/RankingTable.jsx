import React, { useState, useMemo, useEffect } from 'react';
import { Diamond, Coins, Trophy, Crown, Medal, Award, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRankBadgeColor } from '../data/rankingData';

const ROWS_PER_PAGE = 10;
const MAX_ROWS = 100;

const RankingTable = ({ data, type, searchTerm }) => {
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data, searchTerm, type, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-3 h-3 text-[#F72585]" />
      : <ChevronDown className="w-3 h-3 text-[#F72585]" />;
  };

  const filteredAndSortedData = useMemo(() => {
    const q = String(searchTerm || '').toLowerCase();
    let filtered = (Array.isArray(data) ? data : [])
      .slice(0, MAX_ROWS)
      .filter((item) =>
        String(item.fullName || '').toLowerCase().includes(q) ||
        String(item.username || '').toLowerCase().includes(q) ||
        String(item.userId || '').toLowerCase().includes(q)
      );

    filtered.sort((a, b) => {
      let aValue;
      let bValue;
      switch (sortField) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'fullName':
          aValue = String(a.fullName || '').toLowerCase();
          bValue = String(b.fullName || '').toLowerCase();
          break;
        case 'username':
          aValue = String(a.username || '').toLowerCase();
          bValue = String(b.username || '').toLowerCase();
          break;
        case 'userId':
          aValue = String(a.userId || '').toLowerCase();
          bValue = String(b.userId || '').toLowerCase();
          break;
        case 'value':
          aValue = type === 'hosts' ? a.diamondsValue : a.coinsValue;
          bValue = type === 'hosts' ? b.diamondsValue : b.coinsValue;
          break;
        default:
          return 0;
      }
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, type]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedData = filteredAndSortedData.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Award className="w-4 h-4 text-orange-400" />;
    return null;
  };

  if (filteredAndSortedData.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500 py-16">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1 text-gray-400">No results found</p>
          <p className="text-sm text-gray-600">Try another date or search term</p>
        </div>
      </div>
    );
  }

  const SortTh = ({ field, children, className = '' }) => (
    <th
      className={`text-left py-3 px-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-gray-700 bg-[#0F0F0F]">
              <SortTh field="rank" className="w-20 pl-6">Rank</SortTh>
              <SortTh field="fullName">Name</SortTh>
              <SortTh field="username">Username</SortTh>
              <SortTh field="userId">Usercode</SortTh>
              <SortTh field="value" className="pr-6">
                {type === 'hosts' ? 'Total Diamonds' : 'Total Recharge'}
              </SortTh>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-800 hover:bg-[#1A1A1A] transition-colors duration-150 group"
              >
                <td className="py-3 px-4 pl-6 w-20">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getRankBadgeColor(item.rank)}`}>
                      {item.rank}
                    </div>
                    {getRankIcon(item.rank)}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.avatar}
                        alt={item.fullName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-700 group-hover:border-[#F72585] transition-colors"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName || 'User')}&background=F72585&color=fff&size=40`;
                        }}
                      />
                      {item.rank <= 3 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                          <span className="font-bold text-black" style={{ fontSize: '9px' }}>{item.rank}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white font-medium text-sm truncate">{item.fullName}</p>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <span className="text-[#F72585] text-sm font-medium">
                    {item.username && item.username !== '—' ? `@${item.username}` : '—'}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <span className="text-gray-400 font-mono text-xs bg-gray-800 px-2 py-1 rounded">{item.userId}</span>
                </td>

                <td className="py-3 px-4 pr-6">
                  {type === 'hosts' ? (
                    <div className="flex items-center gap-1.5">
                      <Diamond className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="font-semibold text-blue-400 text-sm">{item.diamonds}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="font-semibold text-yellow-400 text-sm">{item.coins}</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedData.length > ROWS_PER_PAGE && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 bg-[#0D0D0D] flex-shrink-0">
          <span className="text-sm text-gray-400">
            Page {safePage} of {totalPages} — {filteredAndSortedData.length} total
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
              const page = start + i;
              return (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === safePage
                      ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white'
                      : 'border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingTable;
