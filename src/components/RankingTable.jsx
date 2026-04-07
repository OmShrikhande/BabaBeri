import React, { useState, useMemo } from 'react';
import { Diamond, Coins, Trophy, Crown, Medal, Award, ChevronUp, ChevronDown } from 'lucide-react';
import { getRankBadgeColor, getLevelBadgeColor } from '../data/rankingData';

const RankingTable = ({ data, type, searchTerm }) => {
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');

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
    let filtered = data.filter(item =>
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case 'rank':      aValue = a.rank; bValue = b.rank; break;
        case 'fullName':  aValue = a.fullName.toLowerCase(); bValue = b.fullName.toLowerCase(); break;
        case 'username':  aValue = a.username.toLowerCase(); bValue = b.username.toLowerCase(); break;
        case 'userId':    aValue = a.userId.toLowerCase(); bValue = b.userId.toLowerCase(); break;
        case 'value':
          aValue = type === 'hosts' ? a.diamondsValue : a.coinsValue;
          bValue = type === 'hosts' ? b.diamondsValue : b.coinsValue;
          break;
        default: return 0;
      }
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, type]);

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
          <p className="text-sm text-gray-600">Try adjusting your search terms</p>
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="border-b border-gray-700 bg-[#0F0F0F]">
            <SortTh field="rank" className="w-20 pl-6">Rank</SortTh>
            <SortTh field="fullName">Player</SortTh>
            <SortTh field="username">Username</SortTh>
            <SortTh field="userId">User ID</SortTh>
            <SortTh field="value" className="pr-6">
              {type === 'hosts' ? 'Diamonds' : 'Coins'}
            </SortTh>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedData.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-800 hover:bg-[#1A1A1A] transition-colors duration-150 group"
            >
              {/* Rank */}
              <td className="py-3 px-4 pl-6 w-20">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getRankBadgeColor(item.rank)}`}>
                    {item.rank}
                  </div>
                  {getRankIcon(item.rank)}
                </div>
              </td>

              {/* Player */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.avatar}
                      alt={item.fullName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-gray-700 group-hover:border-[#F72585] transition-colors"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName)}&background=F72585&color=fff&size=40`;
                      }}
                    />
                    {item.rank <= 3 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-black" style={{ fontSize: '9px' }}>{item.rank}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full border ${getLevelBadgeColor(item.level)}`}>
                        {item.level}
                      </span>
                      <span className="text-xs text-gray-500">{item.country}</span>
                    </div>
                  </div>
                </div>
              </td>

              {/* Username */}
              <td className="py-3 px-4">
                <span className="text-[#F72585] text-sm font-medium">@{item.username}</span>
              </td>

              {/* User ID */}
              <td className="py-3 px-4">
                <span className="text-gray-400 font-mono text-xs bg-gray-800 px-2 py-1 rounded">{item.userId}</span>
              </td>

              {/* Value */}
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
  );
};

export default RankingTable;
