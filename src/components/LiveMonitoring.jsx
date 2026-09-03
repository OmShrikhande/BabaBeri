import React, { useState, useEffect, useCallback, useRef } from 'react';
import UserCard from './UserCard';
import WarningModal from './WarningModal';
import { Room, RoomEvent, Track } from 'livekit-client';
import { Eye, Users, Diamond, Play, Search, Filter, Clock, RefreshCw, Activity, MessageSquare, AlertTriangle, ShieldAlert, Ban, Radio, Volume2, VolumeX, RadioReceiver, ArrowUpDown, Award, Crown } from 'lucide-react';
import { mockLiveUsers, streamCategories, sortOptions, violationTypes } from '../data/liveMonitoringData';
import authService from '../services/services';

const LIVE_BACKEND_URL = import.meta.env.VITE_LIVE_BACKEND_URL || 'http://169.58.40.205:5000';
const LIVEKIT_WS_URL = import.meta.env.VITE_LIVEKIT_WS_URL || 'ws://169.58.40.205:7880';

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
    profilepic: session.profilepic || session.profilePic || thumbnail,
    viewerCount: String(session.viewerCount ?? session.viewer_count ?? session.viewers ?? '0'),
    diamondCount: String(session.totalDiamonds ?? session.diamond_count ?? session.diamondCount ?? session.diamonds ?? '0'),
    totalDiamonds: session.totalDiamonds != null ? String(session.totalDiamonds) : null,
    isLive: session.status === 'active' || session.isLive === true || !session.offline,
    status: session.status || 'streaming',
    streamTitle: session.title || session.stream_title || session.streamTitle || session.room_name || session.roomName || 'Live Stream Broadcast',
    category: session.category || 'General',
    duration: session.duration || session.elapsed || 'Live',
    country: session.country || session.nationality || '—',
    sessionId: session.session_id || session.sessionId || session.roomName || session.id,
    roomName,
    usercode: session.usercode || session.hostCode || session.host_code,
    rank: session.rank != null ? Number(session.rank) : null,
    vipBadgeUri: session.vipBadgeUri || null,
    vipPlanName: session.vipPlanName || null,
    isVip: Boolean(session.isVip),
  };
};

/** Real-time WebRTC LiveKit Video & Audio Player Component */
const LiveStreamPlayer = ({ roomName, thumbnail, username, category, duration, onRoomConnected }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    if (!roomName) return;

    let room = null;
    let cancelled = false;
    setConnecting(true);
    setHasVideo(false);
    setIsConnected(false);

    const connectToLiveRoom = async () => {
      try {
        // 1. Request viewer token from LiveKit backend (admin_monitor_ prefix prevents join alerts)
        const tokenRes = await fetch(`${LIVE_BACKEND_URL}/getTokenLiveKit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: String(roomName),
            participantName: `admin_monitor_${Math.random().toString(36).slice(2, 7)}`,
            displayName: 'Admin Monitor',
            isHost: false,
          }),
        });

        if (!tokenRes.ok) {
          throw new Error(`Token fetch failed: ${tokenRes.status}`);
        }

        const data = await tokenRes.json();
        const token = data?.token;
        if (cancelled || !token) return;

        // 2. Create LiveKit Room instance
        room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        // 3. Register WebRTC track subscriptions
        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === Track.Kind.Video) {
            setHasVideo(true);
            if (videoRef.current) {
              track.attach(videoRef.current);
            }
          } else if (track.kind === Track.Kind.Audio) {
            if (audioRef.current) {
              track.attach(audioRef.current);
            }
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach();
          if (track.kind === Track.Kind.Video) {
            setHasVideo(false);
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          if (!cancelled) {
            setIsConnected(false);
            setHasVideo(false);
            onRoomConnected?.(null);
          }
        });

        // 4. Connect to LiveKit server
        await room.connect(LIVEKIT_WS_URL, token);

        if (!cancelled) {
          setIsConnected(true);
          onRoomConnected?.(room);

          // Attach any already published tracks in the room
          room.remoteParticipants.forEach((participant) => {
            participant.trackPublications.forEach((pub) => {
              if (pub.isSubscribed && pub.track) {
                if (pub.track.kind === Track.Kind.Video) {
                  setHasVideo(true);
                  if (videoRef.current) pub.track.attach(videoRef.current);
                } else if (pub.track.kind === Track.Kind.Audio) {
                  if (audioRef.current) pub.track.attach(audioRef.current);
                }
              }
            });
          });
        }
      } catch (err) {
        console.error('LiveKit web player connection failed:', err);
      } finally {
        if (!cancelled) setConnecting(false);
      }
    };

    connectToLiveRoom();

    return () => {
      cancelled = true;
      if (room) {
        onRoomConnected?.(null);
        room.disconnect();
      }
    };
  }, [roomName]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-2xl">
      {/* Real-time HTML5 Video Track */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className={`w-full h-full object-cover ${hasVideo ? 'block' : 'hidden'}`}
      />

      {/* Real-time HTML5 Audio Track */}
      <audio ref={audioRef} autoPlay muted={isMuted} />

      {/* Poster & Connecting Overlay when video loading */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-black to-[#121212] p-4 text-center">
          <img
            src={thumbnail}
            alt={username}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#F72585] shadow-2xl animate-pulse mb-4"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=F72585&color=fff&size=128`;
            }}
          />
          <p className="text-white text-sm font-bold mb-1">
            {connecting ? 'Connecting Live Stream...' : 'Live Stream Active'}
          </p>
          <span className="text-xs text-gray-400">
            {connecting ? 'Establishing WebRTC connection...' : 'Waiting for host camera'}
          </span>
        </div>
      )}

      {/* Overlay UI Badges */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 p-3 flex flex-col justify-between pointer-events-none">
        {/* Top Badges */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="bg-red-600/90 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <RadioReceiver className="w-3.5 h-3.5 animate-pulse" />
            LIVE 9:16
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/80 backdrop-blur-md hover:bg-black text-white px-3 py-1 rounded-full text-xs font-semibold border border-gray-700 flex items-center gap-1.5 transition-all shadow-lg"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
                Muted
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                Sound On
              </>
            )}
          </button>
        </div>

        {/* Bottom Details */}
        <div className="flex items-center justify-between text-xs text-gray-200">
          <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-700 text-xs font-medium">
            {category}
          </span>
          <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-gray-700 text-xs font-medium flex items-center gap-1 text-yellow-400">
            <Clock className="w-3.5 h-3.5" /> {duration}
          </span>
        </div>
      </div>
    </div>
  );
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

  // Active WebRTC LiveKit Room ref for publishing real-time warnings & chat
  const activeRoomRef = useRef(null);

  // Real-time Room Chat Comments State
  const [roomComments, setRoomComments] = useState([]);
  const [customComment, setCustomComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const parseMetric = (val) => {
    if (typeof val === 'number') return val;
    const s = String(val).replace(/[KM]/gi, '');
    return parseFloat(s) || 0;
  };

  // Persistent cache for host card-info (profilepic, usercode, vipBadge, totalDiamonds)
  const cardInfoCacheRef = useRef({});

  // Helper to fetch MySQL DB profilepic, usercode, and vipBadgeUri via card-info
  const enrichUserWithCardInfo = useCallback(async (userObj) => {
    if (!userObj?.roomName) return userObj;
    
    if (cardInfoCacheRef.current[userObj.roomName]) {
      return {
        ...userObj,
        ...cardInfoCacheRef.current[userObj.roomName],
      };
    }

    try {
      const res = await fetch(`${LIVE_BACKEND_URL}/live/card-info/${encodeURIComponent(userObj.roomName)}`);
      if (res.ok) {
        const info = await res.json();
        const enriched = {
          profilepic: info.profilepic || userObj.profilepic || userObj.thumbnail,
          usercode: info.hostCode || userObj.usercode,
          vipBadgeUri: info.vipBadgeUri || userObj.vipBadgeUri,
          vipPlanName: info.vipPlanName || userObj.vipPlanName,
          isVip: Boolean(info.isVip),
          totalDiamonds: info.totalDiamonds != null ? String(info.totalDiamonds) : userObj.diamondCount,
        };
        cardInfoCacheRef.current[userObj.roomName] = enriched;
        return {
          ...userObj,
          ...enriched,
        };
      }
    } catch {
      /* ignore */
    }
    return userObj;
  }, []);

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
        const mapped = rawList.map((session, idx) => {
          const user = mapSessionToUser(session, idx);
          if (cardInfoCacheRef.current[user.roomName]) {
            return { ...user, ...cardInfoCacheRef.current[user.roomName] };
          }
          return user;
        });

        setLiveUsers((prevUsers) => {
          return mapped.map((newUser) => {
            const existing = prevUsers.find((p) => p.roomName === newUser.roomName || p.id === newUser.id);
            if (existing) {
              return {
                ...newUser,
                profilepic: existing.profilepic || newUser.profilepic,
                usercode: existing.usercode || newUser.usercode,
                vipBadgeUri: existing.vipBadgeUri || newUser.vipBadgeUri,
                vipPlanName: existing.vipPlanName || newUser.vipPlanName,
                isVip: existing.isVip ?? newUser.isVip,
                totalDiamonds: existing.totalDiamonds || newUser.totalDiamonds,
              };
            }
            return newUser;
          });
        });

        setSelectedUser((prev) => {
          if (!prev) return mapped[0];
          const found = mapped.find((m) => m.id === prev.id || m.roomName === prev.roomName);
          return found ? { ...prev, ...found } : mapped[0];
        });
        setUsingMockData(false);

        // Fetch any un-cached rooms in background
        const uncachedRooms = mapped.filter((u) => !cardInfoCacheRef.current[u.roomName]);
        if (uncachedRooms.length > 0) {
          Promise.all(uncachedRooms.map(enrichUserWithCardInfo)).then((enrichedList) => {
            setLiveUsers((prevUsers) =>
              prevUsers.map((u) => {
                const updated = enrichedList.find((e) => e.roomName === u.roomName);
                return updated ? { ...u, ...updated } : u;
              })
            );
            setSelectedUser((prev) => {
              if (!prev) return null;
              const updated = enrichedList.find((e) => e.roomName === prev.roomName);
              return updated ? { ...prev, ...updated } : prev;
            });
          });
        }
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
  }, [enrichUserWithCardInfo]);

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

  // Fetch real-time room comments (filtering out admin join notifications)
  const fetchRoomComments = useCallback(async (roomName) => {
    if (!roomName) return;
    try {
      const res = await fetch(`${LIVE_BACKEND_URL}/live/chat/history/${encodeURIComponent(roomName)}?limit=80`);
      if (res.ok) {
        const data = await res.json();
        const rawMessages = Array.isArray(data.messages) ? data.messages : [];
        // Filter out Super Admin Monitor join messages so they stay hidden
        const filtered = rawMessages.filter((m) => {
          const text = String(m.text || '').toLowerCase();
          const from = String(m.from || m.fromName || '').toLowerCase();
          if (text.includes('admin monitor') || from.includes('admin monitor') || from.includes('super admin')) {
            return false;
          }
          if (text.includes('admin monitor joined') || text.includes('super admin monitor joined')) {
            return false;
          }
          return true;
        });
        setRoomComments(filtered);
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
                           user.streamTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.usercode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || user.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort users by rank first if set, then selected sort option
    filtered.sort((a, b) => {
      if (a.rank != null && b.rank != null) return a.rank - b.rank;
      if (a.rank != null) return -1;
      if (b.rank != null) return 1;

      switch (sortBy) {
        case 'viewers':
          return parseMetric(b.viewerCount) - parseMetric(a.viewerCount);
        case 'diamonds':
          return parseMetric(b.totalDiamonds || b.diamondCount) - parseMetric(a.totalDiamonds || a.diamondCount);
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

  // Set Super Admin Live Feed Rank / Position
  const handleSetLiveRank = async (rankVal) => {
    if (!selectedUser) return;
    const roomName = selectedUser.roomName || selectedUser.sessionId || selectedUser.id;
    const numRank = rankVal !== '' && rankVal !== null && rankVal !== undefined ? Number(rankVal) : null;

    try {
      const res = await fetch(`${LIVE_BACKEND_URL}/live/rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: String(roomName),
          rank: numRank,
        }),
      });

      if (res.ok) {
        setSelectedUser((prev) => (prev ? { ...prev, rank: numRank } : null));
        setLiveUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id || u.roomName === roomName ? { ...u, rank: numRank } : u))
        );
        alert(`Live feed rank updated for ${selectedUser.username}! Assigned Position: ${numRank ? numRank : 'Default'}`);
        fetchLiveSessions();
      } else {
        alert('Failed to set live rank on backend.');
      }
    } catch (e) {
      console.error('Set live rank error:', e);
      alert('Error updating live rank.');
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

      // 2. Broadcast WebRTC DataPacket directly to room participants
      if (activeRoomRef.current && activeRoomRef.current.state === 'connected') {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            t: 'system',
            kind: 'system',
            text: `🚫 Host ${selectedUser.username} has been blocked and the live stream is terminated by Admin.`,
            msgId: `block_${Date.now()}`,
          })
        );
        await activeRoomRef.current.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
      }

      // 3. End live stream room on backend
      await fetch(`${LIVE_BACKEND_URL}/live/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: String(roomName) }),
      }).catch(() => {});

      // 4. Deactivate seller if usercode exists
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
      // 1. Append warning to backend DB history
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

      // 2. Broadcast live WebRTC DataPacket directly to host's phone & all live viewers!
      if (activeRoomRef.current && activeRoomRef.current.state === 'connected') {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            t: 'system',
            kind: 'system',
            text: warningText,
            msgId: `warn_${Date.now()}`,
          })
        );
        await activeRoomRef.current.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
      }

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
      // 1. Append comment to backend DB history
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

      // 2. Broadcast live WebRTC DataPacket directly to host's phone & all live viewers!
      if (activeRoomRef.current && activeRoomRef.current.state === 'connected') {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            t: 'chat_v2',
            from: 'Admin',
            fromName: 'System Moderator',
            text: text,
          })
        );
        await activeRoomRef.current.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
      }

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
            <p className="text-gray-400 text-xs sm:text-sm">Real-time live backend stream monitoring, ranking, and host moderation</p>
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

      {/* Main Content - 12 Column Layout with Prominent Center Stage Video */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-h-0 overflow-y-auto lg:overflow-hidden live-monitoring-grid">
        {/* Left Panel - Live Users Grid (3 Cols) */}
        <div className="lg:col-span-3 bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col min-h-0 overflow-hidden live-monitoring-panel shadow-lg">
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
                placeholder="Search users, title, or code..."
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
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

        {/* Center Panel - PROMINENT BIG 9:16 LIVE STREAM PLAYER (6 Cols - 50% Screen Width) */}
        <div className="lg:col-span-6 bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col h-full min-h-0 overflow-hidden live-monitoring-panel shadow-2xl">
          {selectedUser ? (
            <div className="h-full flex flex-col min-h-0">
              {/* TOP: Host Details Header (Profile Pic, User Code, & VIP Badge) */}
              <div className="bg-[#181818] p-3 rounded-xl border border-gray-800 mb-3 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={selectedUser.profilepic || selectedUser.thumbnail}
                      alt={selectedUser.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#F72585] shadow-md"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.username)}&background=F72585&color=fff&size=64`;
                      }}
                    />
                    {selectedUser.vipBadgeUri && (
                      <img
                        src={selectedUser.vipBadgeUri}
                        alt="VIP Badge"
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full object-contain border border-yellow-400 bg-black shadow-md"
                        title={selectedUser.vipPlanName || 'VIP Member'}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-sm sm:text-base truncate">{selectedUser.username}</h3>
                      {selectedUser.usercode && (
                        <span className="bg-gray-800 text-pink-400 border border-gray-700 text-xs px-2 py-0.5 rounded-md font-mono font-bold">
                          Code: {selectedUser.usercode}
                        </span>
                      )}
                      <span className="bg-green-500/20 text-green-400 border border-green-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                      {selectedUser.rank != null && (
                        <span className="bg-[#F72585]/20 text-[#F72585] border border-[#F72585]/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#F72585]" />
                          Position #{selectedUser.rank}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-gray-400 text-xs truncate">{selectedUser.streamTitle}</p>
                      {selectedUser.vipPlanName && (
                        <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          {selectedUser.vipPlanName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0 pl-2">
                  <div className="text-right">
                    <span className="text-blue-400 font-bold text-sm flex items-center justify-end gap-1">
                      <Users className="w-4 h-4" /> {selectedUser.viewerCount}
                    </span>
                    <span className="text-purple-400 font-bold text-sm flex items-center justify-end gap-1 mt-0.5">
                      <Diamond className="w-4 h-4" /> {selectedUser.totalDiamonds || selectedUser.diamondCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* CENTER: BIG PROMINENT 9:16 VERTICAL MOBILE STREAM PLAYER */}
              <div className="flex-1 min-h-0 flex justify-center items-center py-2 overflow-hidden">
                <div className="h-full max-h-[460px] sm:max-h-[500px] xl:max-h-[540px] aspect-[9/16] bg-black rounded-2xl overflow-hidden relative border-2 border-[#F72585]/50 shadow-2xl flex flex-col shrink-0 transition-all hover:border-[#F72585]">
                  <LiveStreamPlayer
                    key={selectedUser.roomName || selectedUser.sessionId || selectedUser.id}
                    roomName={selectedUser.roomName || selectedUser.sessionId || selectedUser.id}
                    thumbnail={selectedUser.profilepic || selectedUser.thumbnail}
                    username={selectedUser.username}
                    category={selectedUser.category}
                    duration={selectedUser.duration}
                    onRoomConnected={(room) => {
                      activeRoomRef.current = room;
                    }}
                  />
                </div>
              </div>

              {/* BOTTOM: Compact Host Room Comments Box */}
              <div className="mt-3 bg-black/80 backdrop-blur-md rounded-xl p-3 border border-gray-800 flex flex-col shrink-0 h-[170px] shadow-xl">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-800/80 shrink-0">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#F72585]" />
                    Host Room Comments ({roomComments.length})
                  </span>
                  <span className="text-[10px] text-gray-400 animate-pulse">Live Broadcast Sync</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scroll-container text-xs">
                  {roomComments.length > 0 ? (
                    roomComments.map((msg, idx) => (
                      <div
                        key={msg.id || idx}
                        className={`p-2 rounded-lg ${
                          msg.kind === 'system'
                            ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 font-medium'
                            : 'bg-black/60 border border-gray-800 text-white'
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
                    <div className="h-full flex items-center justify-center text-gray-400 text-center py-2">
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
                    className="bg-[#F72585] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 p-6 text-center">
              <div>
                <Eye className="w-14 h-14 mx-auto mb-3 opacity-40 text-gray-400" />
                <p className="text-base font-medium text-gray-300">Select a host to view prominent 9:16 stream</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Action Buttons & Details (3 Cols) */}
        <div className="lg:col-span-3 bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col min-h-0 overflow-hidden live-monitoring-panel shadow-lg">
          <h2 className="text-base font-semibold text-white mb-3 flex-shrink-0 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-yellow-500" />
            Host Actions & Live Feed Rank
          </h2>
          
          {selectedUser ? (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-container">
              {/* Selected User Header */}
              <div className="bg-[#181818] rounded-xl p-3.5 border border-gray-800 flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={selectedUser.profilepic || selectedUser.thumbnail}
                    alt={selectedUser.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#F72585]"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.username)}&background=F72585&color=fff&size=48`;
                    }}
                  />
                  {selectedUser.vipBadgeUri && (
                    <img
                      src={selectedUser.vipBadgeUri}
                      alt="VIP Badge"
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full object-contain border border-yellow-400 bg-black"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-white font-bold text-sm truncate">{selectedUser.username}</p>
                    {selectedUser.usercode && (
                      <span className="bg-gray-800 text-pink-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                        {selectedUser.usercode}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs truncate mt-0.5">
                    {selectedUser.viewerCount} viewers • {selectedUser.totalDiamonds || selectedUser.diamondCount} diamonds
                  </p>
                  {selectedUser.vipPlanName && (
                    <p className="text-yellow-400 text-[10px] font-bold mt-0.5 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-400" /> {selectedUser.vipPlanName} Member
                    </p>
                  )}
                </div>
              </div>

              {/* LIVE RANK POSITIONING CONTROLS */}
              <div className="bg-[#181818] rounded-xl p-3.5 border border-gray-800">
                <h3 className="text-white font-semibold text-xs mb-1.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#F72585]" />
                  Live Feed Rank (Positioning)
                </h3>
                <p className="text-gray-400 text-[11px] mb-3">
                  Pin or order this live stream position in the app "For You" feed
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedUser.rank ?? ''}
                    onChange={(e) => handleSetLiveRank(e.target.value)}
                    className="flex-1 bg-black/70 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#F72585] focus:outline-none"
                  >
                    <option value="">Default Ranking (Viewer Count)</option>
                    <option value="1">🥇 1st Position (Top Live)</option>
                    <option value="2">🥈 2nd Position</option>
                    <option value="3">🥉 3rd Position</option>
                    <option value="4">Position 4 (4th Live)</option>
                    <option value="5">Position 5</option>
                    <option value="6">Position 6</option>
                    <option value="7">Position 7</option>
                    <option value="8">Position 8</option>
                    <option value="9">Position 9</option>
                    <option value="10">Position 10</option>
                  </select>
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
                  {selectedUser.usercode && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">User Code:</span>
                      <span className="text-pink-400 font-mono font-bold">{selectedUser.usercode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Viewers:</span>
                    <span className="text-white font-semibold">
                      {sessionStats?.viewer_count ?? sessionStats?.viewerCount ?? selectedUser.viewerCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Total Diamonds:</span>
                    <span className="text-purple-400 font-semibold">
                      {selectedUser.totalDiamonds || (sessionStats?.diamond_count ?? sessionStats?.diamondCount ?? selectedUser.diamondCount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Duration:</span>
                    <span className="text-yellow-400 font-semibold">
                      {sessionStats?.duration ?? sessionStats?.elapsed ?? selectedUser.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Category:</span>
                    <span className="text-[#F72585] font-semibold">{selectedUser.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">VIP Tier:</span>
                    <span className="text-yellow-400 font-semibold">{selectedUser.vipPlanName || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Country / Region:</span>
                    <span className="text-blue-400 font-semibold">{selectedUser.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Feed Position:</span>
                    <span className="text-[#F72585] font-semibold">
                      {selectedUser.rank ? `Position #${selectedUser.rank}` : 'Default (Engaged)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Status:</span>
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