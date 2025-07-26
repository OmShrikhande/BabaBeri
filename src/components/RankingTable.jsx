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
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };
  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First filter
    let filtered = data.filter(item => 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'fullName':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'username':
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
          break;
        case 'userId':
          aValue = a.userId.toLowerCase();
          bValue = b.userId.toLowerCase();
          break;
        case 'value':
          aValue = type === 'hosts' ? a.diamondsValue : a.coinsValue;
          bValue = type === 'hosts' ? b.diamondsValue : b.coinsValue;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' ? 
          aValue - bValue : 
          bValue - aValue;
      }
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, type]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Award className="w-4 h-4 text-orange-400" />;
    return <Trophy className="w-4 h-4 text-[#F72585]" />;
  };

  const formatValue = (value, type) => {
    if (type === 'hosts') {
      return (
        <div className="flex items-center gap-2">
          <Diamond className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-blue-400">{value}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-yellow-400">{value}</span>
        </div>
      );
    }
  };

  if (filteredAndSortedData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 py-12">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No results found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th 
                className="text-left py-4 px-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center gap-2">
                  Rank
                  {getSortIcon('rank')}
                </div>
              </th>
              <th 
                className="text-left py-4 px-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('fullName')}
              >
                <div className="flex items-center gap-2">
                  Full Name
                  {getSortIcon('fullName')}
                </div>
              </th>
              <th 
                className="text-left py-4 px-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('username')}
              >
                <div className="flex items-center gap-2">
                  Username
                  {getSortIcon('username')}
                </div>
              </th>
              <th 
                className="text-left py-4 px-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('userId')}
              >
                <div className="flex items-center gap-2">
                  User ID
                  {getSortIcon('userId')}
                </div>
              </th>
              <th 
                className="text-left py-4 px-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center gap-2">
                  {type === 'hosts' ? 'Diamonds' : 'Coins'}
                  {getSortIcon('value')}
                </div>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto table-scroll-container" 
        style={{ maxHeight: 'calc(100vh - 300px)' }}
        role="region"
        aria-label={`${type === 'hosts' ? 'Hosts' : 'Supporters'} ranking table`}
      >
        <table className="w-full min-w-[800px]">
          <tbody>
            {filteredAndSortedData.map((item, index) => (
              <tr 
                key={item.id}
                className="border-b border-gray-800 hover:bg-[#1A1A1A] transition-colors duration-200 group"
              >
                {/* Rank */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${getRankBadgeColor(item.rank)}
                    `}>
                      {item.rank}
                    </div>
                    {getRankIcon(item.rank)}
                  </div>
                </td>

                {/* Full Name */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={item.avatar}
                        alt={`${item.fullName}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-[#F72585] transition-colors duration-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName)}&background=F72585&color=fff&size=40`;
                        }}
                      />
                      {item.rank <= 3 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                          <span className="text-xs font-bold text-black">{item.rank}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{item.fullName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`
                          text-xs px-2 py-1 rounded-full border truncate
                          ${getLevelBadgeColor(item.level)}
                        `}>
                          {item.level}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{item.country}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Username */}
                <td className="py-4 px-4">
                  <span className="text-[#F72585] font-medium">@{item.username}</span>
                </td>

                {/* User ID */}
                <td className="py-4 px-4">
                  <span className="text-gray-300 font-mono text-sm">{item.userId}</span>
                </td>

                {/* Diamonds/Coins */}
                <td className="py-4 px-4">
                  {formatValue(type === 'hosts' ? item.diamonds : item.coins, type)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTable;