import React, { useState, useEffect, useCallback } from 'react';
import UserCard from './UserCard';
import WarningModal from './WarningModal';
import { Eye, Users, Diamond, Play, Search, Filter, Clock, RefreshCw, Activity, MessageSquare, AlertTriangle, ShieldAlert, Ban, Radio } from 'lucide-react';
import { mockLiveUsers, streamCategories, sortOptions, violationTypes } from '../data/liveMonitoringData';
import authService from '../services/services';

const LIVE_BACKEND_URL = import.meta.env.VITE_LIVE_BACKEND_URL || 'http://169.58.40.205:5000';

const mapSessionToUser = (session, index) => {
  const name =
    session.username ||
    session.hostName ||
    session.host_name ||
    session.hostDisplayName ||
    session.hostUsername ||
    session.host_id ||
    `Host ${session.roomName || index + 1}`;
  const id = session.id || session.session_id || session.sessionId || session.roomName || index + 1;
  const roomName = session.roomName || session.room_name || session.session_id || session.sessionId || session.id || `room-${index}`;
  const thumbnail =
    session.thumbnail ||
    session.avatar ||
    session.profilepic ||
    session.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F72585&color=fff&size=128`;

  return {
    id,
    username: name,
    thumbnail,
    viewerCount: String(session.viewerCount ?? session.viewer_count ?? session.viewers ?? '0'),
    diamondCount: String(session.totalDiamonds ?? session.diamond_count ?? session.diamondCount ?? session.diamonds ?? '0'),
    isLive: session.status === 'active' || session.isLive === true || !session.offline,
    status: session.status || 'streaming',
    streamTitle: session.title || session.stream_title || session.streamTitle || session.room_name || session.roomName || 'Live Stream Broadcast',
    category: session.category || 'General',
    duration: session.duration || session.elapsed || 'Live',
    country: session.country || session.nationality || '—',
    sessionId: session.session_id || session.sessionId || session.roomName || session.id,
    roomName,
    usercode: session.usercode || session.hostCode || session.host_code,
  };
};

const LiveMonitoring = () => {
  const [liveUsers, setLiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('viewers');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [sessionGifters, setSessionGifters] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Real-time Room Chat Comments State
  const [roomComments, setRoomComments] = useState([]);
  const [customComment, setCustomComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const parseMetric = (val) => {
    if (typeof val === 'number') return val;
    const s = String(val).replace(/[KM]/gi, '');
    return parseFloat(s) || 0;
  };

  const fetchLiveSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      let rawList = [];

      // 1. Connect to VPS LiveKit backend discover endpoint
      try {
        const res = await fetch(`${LIVE_BACKEND_URL}/discover?kind=all`);
        if (res.ok) {
          const data = await res.json();
          const rooms = Array.isArray(data.rooms) ? data.rooms : (Array.isArray(data) ? data : []);
          rawList = rooms.filter((r) => !r.offline);
        }
      } catch (err) {
        console.error('Live backend discover fetch error:', err);
      }

      // 2. If empty, try relative path fallback
      if (!rawList.length) {
        try {
          const res = await fetch('/discover?kind=all');
          if (res.ok) {
            const data = await res.json();
            const rooms = Array.isArray(data.rooms) ? data.rooms : (Array.isArray(data) ? data : []);
            rawList = rooms.filter((r) => !r.offline);
          }
        } catch {
          /* ignore */
        }
      }

      // 3. If still empty, try admin live sessions API
      if (!rawList.length) {
        try {
          const result = await authService.getAdminLiveSessions({ status: 'active' });
          if (result.success && result.data) {
            rawList = Array.isArray(result.data)
              ? result.data
              : (result.data.sessions || result.data.data || result.data.rooms || []);
          }
        } catch (err) {
          console.error('Admin sessions error:', err);
        }
      }

      if (rawList.length > 0) {
        const mapped = rawList.map(mapSessionToUser);
        setLiveUsers(mapped);
        setSelectedUser((prev) => {
          if (!prev) return mapped[0];
          const found = mapped.find((m) => m.id === prev.id || m.roomName === prev.roomName);
          return found || mapped[0];
        });
        setUsingMockData(false);
      } else {
        // No active live streams right now
        setLiveUsers([]);
        setSelectedUser(null);
        setUsingMockData(false);
      }
    } catch (e) {
      console.error('Fetch live sessions error:', e);
      setLiveUsers([]);
      setSelectedUser(null);
      setUsingMockData(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll live backend sessions every 5 seconds
  useEffect(() => {
    fetchLiveSessions();
    const timer = setInterval(() => {
      fetchLiveSessions();
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchLiveSessions]);

  // Fetch session details & gifters
  useEffect(() => {
    if (!selectedUser?.sessionId || usingMockData) {
      setSessionStats(null);
      setSessionGifters([]);
      return;
    }

    let ignore = false;
    const fetchSessionDetails = async () => {
      setStatsLoading(true);
      try {
        const [statsRes, giftersRes] = await Promise.all([
          authService.getSessionStats(selectedUser.sessionId),
          authService.getSessionGifters(selectedUser.sessionId, { limit: 10, offset: 0 }),
        ]);
        if (!ignore) {
          setSessionStats(statsRes.success ? statsRes.data : null);
          const gifters = giftersRes.success
            ? (Array.isArray(giftersRes.data) ? giftersRes.data : (giftersRes.data?.gifters || giftersRes.data?.data || []))
            : [];
          setSessionGifters(gifters);
        }
      } catch {
        if (!ignore) {
          setSessionStats(null);
          setSessionGifters([]);
        }
      } finally {
        if (!ignore) setStatsLoading(false);
      }
    };

    fetchSessionDetails();
    return () => { ignore = true; };
  }, [selectedUser?.sessionId, usingMockData]);

  // Fetch real-time room comments
  const fetchRoomComments = useCallback(async (roomName) => {
    if (!roomName) return;
    try {
      const res = await fetch(`${LIVE_BACKEND_URL}/live/chat/history/${encodeURIComponent(roomName)}?limit=80`);
      if (res.ok) {
        const data = await res.json();
        const messages = Array.isArray(data.messages) ? data.messages : [];
        setRoomComments(messages);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Poll room comments every 3 seconds for active selected stream
  useEffect(() => {
    if (!selectedUser) {
      setRoomComments([]);
      return;
    }
    const targetRoom = selectedUser.roomName || selectedUser.sessionId || selectedUser.id;
    fetchRoomComments(targetRoom);
    const commentsInterval = setInterval(() => {
      fetchRoomComments(targetRoom);
    }, 3000);
    return () => clearInterval(commentsInterval);
  }, [selectedUser, fetchRoomComments]);

  // Filter and sort users
  useEffect(() => {
    let filtered = liveUsers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.streamTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || user.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort users
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'viewers':
          return parseMetric(b.viewerCount) - parseMetric(a.viewerCount);
        case 'diamonds':
          return parseMetric(b.diamondCount) - parseMetric(a.diamondCount);
        case 'duration':
          return String(b.duration).localeCompare(String(a.duration));
        case 'recent':
          return b.id - a.id;
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, liveUsers]);

  // Toggle Demo Mode manually if needed
  const handleToggleDemoMode = () => {
    if (usingMockData) {
      setUsingMockData(false);
      fetchLiveSessions();
    } else {
      setUsingMockData(true);
      const mapped = mockLiveUsers.map(mapSessionToUser);
      setLiveUsers(mapped);
      setSelectedUser(mapped[0]);
    }
  };

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    const confirmBlock = window.confirm(
      `Are you sure you want to block host "${selectedUser.username}" and terminate their live stream?`
    );
    if (!confirmBlock) return;

    const roomName = selectedUser.roomName || selectedUser.sessionId || selectedUser.id;

    try {
      // 1. Send system comment to live room chat
      await fetch(`${LIVE_BACKEND_URL}/live/chat/append`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: String(roomName),
          kind: 'system',
          from: 'System Admin 🚫',
          fromName: 'Super Admin',
          text: `🚫 Host ${selectedUser.username} has been blocked and the live stream is terminated by Admin.`,
        }),
      }).catch(() => {});

      // 2. End live stream room on backend
      await fetch(`${LIVE_BACKEND_URL}/live/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: String(roomName) }),
      }).catch(() => {});

      // 3. Deactivate seller if usercode exists
      if (selectedUser.usercode) {
        await authService.activeDeactiveSeller(selectedUser.usercode, false).catch(() => {});
      }

      // Update state
      const remaining = liveUsers.filter((u) => u.id !== selectedUser.id);
      setLiveUsers(remaining);
      setSelectedUser(remaining[0] || null);
      alert(`Host ${selectedUser.username} blocked and live stream terminated.`);
    } catch (e) {
      console.error('Block user error:', e);
      alert('Failed to block host.');
    }
  };

  const handleWarnUser = () => {
    setShowWarningModal(true);
  };

  const handleSendWarning = async (warningType) => {
    if (!selectedUser) return;
    const roomName = selectedUser.roomName || selectedUser.sessionId || selectedUser.id;
    const violationObj = violationTypes.find((v) => v.id === warningType);
    const violationLabel = violationObj?.label || warningType;
    const warningText = `⚠️ ADMIN WARNING: Host ${selectedUser.username} has been issued a warning for ${violationLabel}. Please follow community guidelines.`;

    try {
      await fetch(`${LIVE_BACKEND_URL}/live/chat/append`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: String(roomName),
          kind: 'system',
          from: 'System Admin ⚠️',
          fromName: 'Super Admin',
          text: warningText,
        }),
      });

      setRoomComments((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          kind: 'system',
          from: 'System Admin ⚠️',
          text: warningText,
        },
      ]);

      alert(`Warning sent to host ${selectedUser.username} in live room chat!`);
    } catch (e) {
      console.error('Send warning error:', e);
      alert('Failed to send warning.');
    } finally {
      setShowWarningModal(false);
    }
  };

  const handlePostAdminComment = async (e) => {
    e.preventDefault();
    if (!selectedUser || !customComment.trim()) return;
    const roomName = selectedUser.roomName || selectedUser.sessionId || selectedUser.id;
    const text = customComment.trim();
    setSendingComment(true);
    try {
      await fetch(`${LIVE_BACKEND_URL}/live/chat/append`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: String(roomName),
          kind: 'chat',
          from: 'Admin',
          fromName: 'System Moderator',
          text,
        }),
      });
      setCustomComment('');
      fetchRoomComments(roomName);
    } catch (err) {
      console.error('Send comment error:', err);
    } finally {
      setSendingComment(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-1 bg-[#1A1A1A] p-4 sm:p-6 overflow-hidden flex flex-col h-full live-monitoring-container">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#F72585]" />
              Live Monitoring
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">Real-time live backend stream monitoring and host moderation</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleDemoMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                usingMockData
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
              }`}
            >
              {usingMockData ? 'Demo Data Active' : 'Live Backend Mode'}
            </button>
            <button
              onClick={fetchLiveSessions}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50 text-xs font-semibold shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Lives
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-0 overflow-hidden live-monitoring-grid">
        {/* Left Panel - Live Users Grid */}
        <div className="lg:col-span-1 bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col min-h-0 overflow-hidden live-monitoring-panel shadow-lg">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#F72585]" />
              Ongoing App Lives ({filteredUsers.length})
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 mb-4 flex-shrink-0">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users or streams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-[#F72585] focus:outline-none transition-colors text-xs"
              />
            </div>

            {/* Filters Row */}
            <div className="flex gap-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:border-[#F72585] focus:outline-none"
              >
                {streamCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:border-[#F72585] focus:outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Grid */}
          <div className="flex-1 overflow-y-auto scroll-container">
            {currentUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {currentUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isSelected={selectedUser?.id === user.id}
                    onClick={() => handleUserSelect(user)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 py-12">
                <div className="text-center p-4">
                  <Radio className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#F72585]" />
                  <p className="text-sm font-semibold mb-1 text-gray-300">No active live streams</p>
                  <p className="text-xs text-gray-500 mb-3">Live broadcasts from the mobile app will appear here in real time.</p>
                  <button
                    onClick={handleToggleDemoMode}
                    className="px-3 py-1.5 bg-[#F72585]/20 text-[#F72585] border border-[#F72585]/40 rounded-lg text-xs font-semibold hover:bg-[#F72585]/30 transition-colors"
                  >
                    View Demo Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2 flex-shrink-0">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    currentPage === page
                      ? 'bg-[#F72585] text-white font-bold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Panel - Focused Host Preview (16:9) & Live Comments */}
        <div className="lg:col-span-1 bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col min-h-0 overflow-hidden live-monitoring-panel shadow-lg">
          {selectedUser ? (
            <div className="h-full flex flex-col min-h-0">
              {/* TOP: Host Details Header */}
              <div className="bg-[#181818] p-3 rounded-xl border border-gray-800 mb-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={selectedUser.thumbnail}
                    alt={selectedUser.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#F72585] shadow-md shrink-0"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${selectedUser.username}&background=F72585&color=fff&size=64`;
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-xs sm:text-sm truncate">{selectedUser.username}</h3>
                      <span className="bg-green-500/20 text-green-400 border border-green-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px] truncate mt-0.5">{selectedUser.streamTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0 pl-2">
                  <div className="text-right">
                    <span className="text-blue-400 font-bold text-xs flex items-center justify-end gap-1">
                      <Users className="w-3.5 h-3.5" /> {selectedUser.viewerCount}
                    </span>
                    <span className="text-purple-400 font-bold text-xs flex items-center justify-end gap-1 mt-0.5">
                      <Diamond className="w-3.5 h-3.5" /> {selectedUser.diamondCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* CENTER: 16:9 Host Stream Preview Video Screen */}
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative border border-gray-800 shadow-xl flex items-center justify-center shrink-0">
                <img
                  src={selectedUser.thumbnail}
                  alt={selectedUser.username}
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${selectedUser.username}&background=F72585&color=fff&size=256`;
                  }}
                />

                {/* Overlay live indicators */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-3 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div className="bg-red-600/90 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Play className="w-3 h-3 fill-current" />
                      LIVE PREVIEW
                    </div>
                    <span className="bg-black/60 backdrop-blur-md text-gray-200 px-2 py-0.5 rounded text-[10px] font-mono border border-gray-700">
                      16:9 Stream
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-200">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-700 text-[11px] font-medium">
                      Category: {selectedUser.category}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-700 text-[11px] font-medium flex items-center gap-1 text-yellow-400">
                      <Clock className="w-3.5 h-3.5" /> {selectedUser.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM: Small Semi-Black Box for Live Comments (White Text) */}
              <div className="mt-3 bg-black/70 backdrop-blur-md rounded-xl p-3 border border-gray-800/80 flex flex-col flex-1 min-h-0 shadow-lg">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-800/60 shrink-0">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#F72585]" />
                    Host Room Comments ({roomComments.length})
                  </span>
                  <span className="text-[10px] text-gray-400 animate-pulse">Live</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scroll-container text-xs">
                  {roomComments.length > 0 ? (
                    roomComments.map((msg, idx) => (
                      <div
                        key={msg.id || idx}
                        className={`p-2 rounded-lg ${
                          msg.kind === 'system'
                            ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 font-medium'
                            : 'bg-black/50 border border-gray-800 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold text-xs text-[#F72585]">
                            {msg.fromName || msg.from || 'Viewer'}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-white">{msg.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-center py-4">
                      <p className="text-xs text-gray-400">No comments posted in host's room yet</p>
                    </div>
                  )}
                </div>

                {/* Send Comment / Warning Input */}
                <form onSubmit={handlePostAdminComment} className="mt-2 flex gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Send comment in host room..."
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    className="flex-1 bg-black/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585]"
                  />
                  <button
                    type="submit"
                    disabled={sendingComment || !customComment.trim()}
                    className="bg-[#F72585] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 p-6 text-center">
              <div>
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-40 text-gray-400" />
                <p className="text-sm font-medium">Select a host to monitor focused 16:9 screen</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Action Buttons & Details */}
        <div className="lg:col-span-1 bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col min-h-0 overflow-hidden live-monitoring-panel shadow-lg">
          <h2 className="text-base font-semibold text-white mb-3 flex-shrink-0 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-yellow-500" />
            Host Actions & Details
          </h2>
          
          {selectedUser ? (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-container">
              {/* Selected User Header */}
              <div className="bg-[#181818] rounded-xl p-3.5 border border-gray-800 flex items-center gap-3">
                <img
                  src={selectedUser.thumbnail}
                  alt={selectedUser.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#F72585]"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${selectedUser.username}&background=F72585&color=fff&size=48`;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-sm truncate">{selectedUser.username}</p>
                  <p className="text-gray-400 text-xs truncate">
                    {selectedUser.viewerCount} viewers • {selectedUser.diamondCount} diamonds
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleWarnUser}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs shadow-md"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Warn Host (Broadcast Warning Comment)
                </button>
                
                <button
                  onClick={handleBlockUser}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs shadow-md"
                >
                  <Ban className="w-4 h-4" />
                  Block Host & Terminate Stream
                </button>
              </div>

              {/* User Stats */}
              <div className="bg-[#181818] rounded-xl p-3.5 border border-gray-800">
                <h3 className="text-white font-semibold text-xs mb-3 pb-1 border-b border-gray-800">
                  Live Stream Statistics
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Viewers:</span>
                    <span className="text-white font-semibold">
                      {sessionStats?.viewer_count ?? sessionStats?.viewerCount ?? selectedUser.viewerCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Diamonds:</span>
                    <span className="text-purple-400 font-semibold">
                      {sessionStats?.diamond_count ?? sessionStats?.diamondCount ?? selectedUser.diamondCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-yellow-400 font-semibold">
                      {sessionStats?.duration ?? sessionStats?.elapsed ?? selectedUser.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-[#F72585] font-semibold">{selectedUser.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Country / Region:</span>
                    <span className="text-blue-400 font-semibold">{selectedUser.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 capitalize font-semibold">{selectedUser.status}</span>
                  </div>
                  {statsLoading && (
                    <p className="text-[10px] text-gray-500 pt-1">Loading session details...</p>
                  )}
                </div>
              </div>

              {/* Top Gifters */}
              {sessionGifters.length > 0 && (
                <div className="bg-[#181818] rounded-xl p-3.5 border border-gray-800">
                  <h3 className="text-white font-semibold text-xs mb-3 pb-1 border-b border-gray-800">
                    Top Session Gifters
                  </h3>
                  <div className="space-y-2">
                    {sessionGifters.slice(0, 5).map((gifter, i) => (
                      <div key={gifter.user_id || gifter.userId || i} className="flex justify-between text-xs">
                        <span className="text-gray-300">
                          {gifter.username || gifter.user_name || gifter.userId || `User ${i + 1}`}
                        </span>
                        <span className="text-purple-400 font-semibold">
                          {gifter.total_gifts ?? gifter.totalGifts ?? gifter.amount ?? gifter.coins ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-center p-6">
              <div>
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-gray-400" />
                <p className="text-xs">Select a host to view actions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <WarningModal
          user={selectedUser}
          onClose={() => setShowWarningModal(false)}
          onSendWarning={handleSendWarning}
        />
      )}
    </div>
  );
};

export default LiveMonitoring;