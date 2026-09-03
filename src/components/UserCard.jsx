import React from 'react';
import { Users, Diamond, Play, Crown } from 'lucide-react';

const UserCard = ({ user, isSelected, onClick }) => {
  const displayPic = user.profilepic || user.thumbnail;

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-[#1A1A1A] rounded-xl p-3 cursor-pointer transition-all duration-200 border-2
        ${isSelected 
          ? 'border-[#F72585] glow-pink bg-gradient-to-br from-[#1A1A1A] to-[#2A1A2A] shadow-lg' 
          : 'border-gray-800 hover:border-gray-700 hover:bg-[#222222]'
        }
      `}
    >
      {/* Live Indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-red-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-md">
          <Play className="w-2.5 h-2.5 fill-white" />
          LIVE
        </div>
      </div>

      {/* User Thumbnail & VIP Badge */}
      <div className="relative mb-3">
        <img
          src={displayPic}
          alt={user.username}
          className={`
            w-full aspect-square rounded-xl object-cover transition-all duration-200
            ${isSelected ? 'ring-2 ring-[#F72585] ring-offset-2 ring-offset-[#1A1A1A]' : ''}
          `}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=F72585&color=fff&size=120`;
          }}
        />
        
        {/* VIP Badge Icon Overlay */}
        {user.vipBadgeUri && (
          <div className="absolute bottom-2 left-2 bg-black/80 p-0.5 rounded-full border border-yellow-400 shadow-md">
            <img src={user.vipBadgeUri} alt="VIP" className="w-5 h-5 rounded-full object-contain" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
      </div>

      {/* User Info */}
      <div className="space-y-1.5">
        {/* Username & User Code */}
        <div className="flex items-center justify-between gap-1">
          <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-[#F72585]' : 'text-white'}`}>
            {user.username}
          </h3>
          {user.usercode && (
            <span className="bg-gray-800 text-pink-400 border border-gray-700 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
              {user.usercode}
            </span>
          )}
        </div>
        
        {/* Stream Title */}
        {user.streamTitle && (
          <p className="text-gray-400 text-xs truncate">
            {user.streamTitle}
          </p>
        )}

        {/* VIP Tier Badge if active */}
        {user.vipPlanName && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 rounded-full w-fit">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span>{user.vipPlanName}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs pt-1">
          {/* Viewer Count */}
          <div className="flex items-center gap-1 text-blue-400 font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{user.viewerCount}</span>
          </div>

          {/* Diamond Count */}
          <div className="flex items-center gap-1 text-purple-400 font-bold">
            <Diamond className="w-3.5 h-3.5" />
            <span>{user.diamondCount}</span>
          </div>
        </div>

        {/* Category and Status */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {user.category && (
              <span className="bg-[#F72585]/20 text-[#F72585] px-2 py-0.5 rounded text-[10px] font-medium">
                {user.category}
              </span>
            )}
          </div>
          
          {/* Live indicator dot */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-green-400 font-bold">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;