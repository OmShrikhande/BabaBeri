import React from 'react';
import { Users, Diamond, Play } from 'lucide-react';

const UserCard = ({ user, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-[#1A1A1A] rounded-lg p-3 cursor-pointer transition-all duration-200 border-2
        ${isSelected 
          ? 'border-[#F72585] glow-pink bg-gradient-to-br from-[#1A1A1A] to-[#2A1A2A]' 
          : 'border-gray-700 hover:border-gray-600 hover:bg-[#222222]'
        }
      `}
    >
      {/* Live Indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
          <Play className="w-2 h-2" />
          LIVE
        </div>
      </div>

      {/* User Thumbnail */}
      <div className="relative mb-3">
        <img
          src={user.thumbnail}
          alt={user.username}
          className={`
            w-full aspect-square rounded-lg object-cover transition-all duration-200
            ${isSelected ? 'ring-2 ring-[#F72585] ring-offset-2 ring-offset-[#1A1A1A]' : ''}
          `}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=F72585&color=fff&size=120`;
          }}
        />
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />
      </div>

      {/* User Info */}
      <div className="space-y-2">
        {/* Username */}
        <h3 className={`
          font-semibold text-sm truncate transition-colors duration-200
          ${isSelected ? 'text-[#F72585]' : 'text-white'}
        `}>
          {user.username}
        </h3>
        
        {/* Stream Title */}
        {user.streamTitle && (
          <p className="text-gray-400 text-xs truncate mb-1">
            {user.streamTitle}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs">
          {/* Viewer Count */}
          <div className="flex items-center gap-1 text-blue-400">
            <Users className="w-3 h-3" />
            <span className="font-medium">{user.viewerCount}</span>
          </div>

          {/* Diamond Count */}
          <div className="flex items-center gap-1 text-purple-400">
            <Diamond className="w-3 h-3" />
            <span className="font-medium">{user.diamondCount}</span>
          </div>
        </div>

        {/* Category and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {user.category && (
              <span className="bg-[#F72585]/20 text-[#F72585] px-2 py-1 rounded text-xs font-medium">
                {user.category}
              </span>
            )}
          </div>
          
          {/* Live indicator dot */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg border-2 border-[#F72585] pointer-events-none">
          <div className="absolute top-2 left-2 w-3 h-3 bg-[#F72585] rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;