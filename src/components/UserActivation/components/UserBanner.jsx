const statusColors = {
  active: {
    bg: 'from-emerald-500/20 to-emerald-600/20',
    border: 'border-emerald-500/20',
    text: 'text-emerald-300',
    button: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500'
  },
  inactive: {
    bg: 'from-blue-500/20 to-purple-600/20',
    border: 'border-blue-500/20',
    text: 'text-blue-300',
    button: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500'
  }
};

const UserBanner = ({ user, isActive, onToggleActivation, isProcessing }) => {
  const palette = isActive ? statusColors.active : statusColors.inactive;
  const displayName = user?.name || user?.Name || user?.username || 'Unnamed User';
  const displayCode = user?.code || user?.UserCode || user?.userCode || 'N/A';
  const displayAvatar = user?.dp || user?.avatar || '/default-avatar.png';

  return (
    <div className={`relative overflow-hidden rounded-2xl mb-10 border ${palette.border}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${palette.bg} blur-2xl`} aria-hidden />
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-[#141414]/80 backdrop-blur">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" aria-hidden />
            <img
              src={displayAvatar}
              alt="User DP"
              className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight">{displayName}</h2>
              <span className={`px-3 py-1 text-xs rounded-full border ${palette.border} ${palette.text}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-gray-400 mt-1">
              <span className="font-medium text-gray-200">Code:</span> {displayCode}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleActivation}
          disabled={isProcessing}
          className={`px-6 py-3 rounded-xl font-semibold text-white shadow-xl transition-transform transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${palette.button}`}
        >
          {isProcessing ? 'Updating...' : isActive ? 'Deactivate User' : 'Activate User'}
        </button>
      </div>
    </div>
  );
};

export default UserBanner;
