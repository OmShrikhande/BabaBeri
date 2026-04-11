import React, { useState, useEffect } from 'react';
import { Mic, Activity, Gem, Target } from 'lucide-react';
import MetricsCard from './MetricsCard';
import LoadingCard from './LoadingCard';
import StatusBadge from './StatusBadge';
import authService from '../services/authService';

const AgencyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalHosts: 0,
    activeHosts: 0,
    diamonds: 0
  });
  const [hosts, setHosts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [goalData, setGoalData] = useState(null);
  const [goalLoading, setGoalLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const info = authService.getUserInfo();
        if (!ignore) {
          setUserInfo(info);
        }

        const myCode = authService.extractUserCode(info);

        // Fetch hosts
        const hostsResponse = await authService.getActiveHosts();

        if (ignore) return;

        if (hostsResponse.success) {
          const allHosts = Array.isArray(hostsResponse.data) ? hostsResponse.data : [];
          const myHosts = allHosts.filter(host => host.owner === myCode);
          const activeHosts = myHosts.filter(host => host.status?.toLowerCase() === 'activate');

          setHosts(myHosts);
          setMetrics({
            totalHosts: myHosts.length,
            activeHosts: activeHosts.length,
            diamonds: 0
          });
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching agency dashboard data:', err);
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const fetchGoalData = async () => {
      try {
        setGoalLoading(true);
        const response = await authService.makeAuthenticatedRequest(
          'https://proxstream.online/auth/user/getcurrentmonthtarget',
          { method: 'GET' }
        );

        if (ignore) return;

        if (response.ok) {
          const data = await response.json();
          setGoalData(data);
        } else {
          setGoalData(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching goal data:', err);
          setGoalData(null);
        }
      } finally {
        if (!ignore) {
          setGoalLoading(false);
        }
      }
    };

    fetchGoalData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const renderGoalCard = () => {
    if (goalLoading) {
      return <LoadingCard />;
    }

    if (!goalData || !goalData.tierName) {
      return (
        <div className="bg-[#121212] rounded-xl border border-gray-800 p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No active goal this month</p>
            <p className="text-gray-600 text-sm mt-1">Goals will appear here when assigned</p>
          </div>
        </div>
      );
    }

    const diamondTarget = goalData.diamondTarget ?? goalData.goals?.[0]?.minValue ?? 0;
    const diamondEarned = goalData.diamondEarned ?? 0;
    const cashoutTarget = goalData.cashoutTarget ?? goalData.goals?.[0]?.maxValue ?? 0;
    const cashoutCount = goalData.cashoutCount ?? 0;

    const diamondPercent = diamondTarget > 0 ? Math.min((diamondEarned / diamondTarget) * 100, 100) : 0;
    const cashoutPercent = cashoutTarget > 0 ? Math.min((cashoutCount / cashoutTarget) * 100, 100) : 0;

    return (
      <div className="bg-[#121212] rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-r from-[#7209B7] to-[#F72585]">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">{goalData.tierName}</h3>
            <p className="text-gray-400 text-sm">Current Month Target</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Diamonds</span>
              <span className="text-white text-sm font-medium">{diamondEarned} / {diamondTarget}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#F72585] to-[#7209B7] h-2 rounded-full transition-all"
                style={{ width: `${diamondPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1 block">{diamondPercent.toFixed(1)}%</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Cashouts</span>
              <span className="text-white text-sm font-medium">{cashoutCount} / {cashoutTarget}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#7209B7] to-[#F72585] h-2 rounded-full transition-all"
                style={{ width: `${cashoutPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1 block">{cashoutPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1A1A1A]">
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">My Agency</h1>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-900/30 text-pink-400 border border-pink-800/50">
                Agency
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {userInfo?.username || userInfo?.name || 'Agency'} • 
              <span className="ml-2 px-2 py-0.5 rounded bg-gray-800 text-xs font-mono">
                {authService.extractUserCode(userInfo) || 'N/A'}
              </span>
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-red-400">⚠</div>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="text-red-400 hover:text-red-300 text-sm border border-red-800 px-3 py-1 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Goal Card */}
        <div className="mb-6">
          {renderGoalCard()}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <MetricsCard
                title="Total Hosts"
                value={metrics.totalHosts}
                icon="Mic"
                color="pink"
              />
              <MetricsCard
                title="Active Hosts"
                value={metrics.activeHosts}
                icon="Activity"
                color="purple"
              />
              <MetricsCard
                title="Diamonds This Month"
                value={metrics.diamonds}
                icon="Gem"
                color="cyan"
              />
            </>
          )}
        </div>

        {/* My Hosts Table */}
        <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">My Hosts</h2>
            <p className="text-gray-400 text-sm mt-1">Hosts under your management</p>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#1A1A1A] rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : hosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No hosts found</p>
              <p className="text-gray-600 text-sm mt-1">Hosts will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">#</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Name</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Code</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Diamonds</th>
                  </tr>
                </thead>
                <tbody>
                  {hosts.map((host, index) => (
                    <tr key={host.id || index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-white">{index + 1}</td>
                      <td className="px-6 py-4 text-white">{host.name || host.username || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-800 text-gray-300">
                          {authService.extractUserCode(host) || host.code || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={host.status || 'active'} />
                      </td>
                      <td className="px-6 py-4 text-white">{host.diamond ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
