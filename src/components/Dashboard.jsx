import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Crown, Shield, User, ChevronDown, Bell,UserRoundPlus } from 'lucide-react';
import MetricsCard from './MetricsCard';
import EnhancedChartCard from './EnhancedChartCard';
import FinancialMetricsCard from './FinancialMetricsCard';
import SupporterCard from './SupporterCard';
import { metricsData as staticMetrics, supporterCardsData } from '../data/dashboardData';
import DpVerificationModal from './DpVerificationModal';

import authService from '../services/authService';
import liveService from '../services/services';
import LiveGiftsDashboardSection from './LiveGiftsDashboardSection';
import {
  aggregateDiamondRange,
  formatMetricNumber,
  normalizeCashoutHistory,
  sumCashoutDiamonds,
  sumCashoutCashAmount,
} from '../utils/dashboardFinancials';

const Dashboard = ({ currentUser, onLogout, onNavigate }) => {
  const [dynamicCounts, setDynamicCounts] = useState({
    SUPERADMIN: null,
    ADMIN: null,
    MASTER_AGENCY: null,
    AGENCY: null,
    HOST: null,
  });
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDpModal, setShowDpModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [overallCoins, setOverallCoins] = useState(null);
  const [overallCoinsLoading, setOverallCoinsLoading] = useState(false);
  const [overallCoinsError, setOverallCoinsError] = useState(null);
  const [totalCoinsSell, setTotalCoinsSell] = useState(null);
  const [totalCoinsSellLoading, setTotalCoinsSellLoading] = useState(false);
  const [totalCoinsSellError, setTotalCoinsSellError] = useState(null);
  const [liveUsersCount, setLiveUsersCount] = useState(null);
  const [liveUsersLoading, setLiveUsersLoading] = useState(false);
  const [totalDiamonds, setTotalDiamonds] = useState(null);
  const [totalDiamondsLoading, setTotalDiamondsLoading] = useState(false);
  const [giftTransactionsCount, setGiftTransactionsCount] = useState(null);
  const [giftTransactionsLoading, setGiftTransactionsLoading] = useState(false);
  const [liveTrackingCount, setLiveTrackingCount] = useState(null);
  const [liveTrackingLoading, setLiveTrackingLoading] = useState(false);
  const [financialSummary, setFinancialSummary] = useState({
    totalProfit: null,
    totalLoss: null,
    totalDiamondCashout: null,
    pendingCashouts: null,
  });
  const [financialLoading, setFinancialLoading] = useState(false);
  const [supporterSummary, setSupporterSummary] = useState({
    totalRecharge: null,
    availableCoins: null,
  });
  const userMenuRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchCounts = async () => {
      setLoadingCounts(true);
      try {
        const roles = ['SUPERADMIN', 'ADMIN', 'MASTER_AGENCY', 'AGENCY', 'HOST'];
        const results = await Promise.all(roles.map((r) => authService.countByRole(r)));
        const next = {};
        roles.forEach((r, i) => {
          next[r] = results[i]?.success ? (results[i].data?.count ?? results[i].data ?? 0) : 0;
        });
        if (!ignore) setDynamicCounts(next);
      } catch (e) {
        if (!ignore) setDynamicCounts({ SUPERADMIN: 0, ADMIN: 0, MASTER_AGENCY: 0, AGENCY: 0, HOST: 0 });
      } finally {
        if (!ignore) setLoadingCounts(false);
      }
    };

    fetchCounts();
    return () => { ignore = true; };
  }, []);

  // Fetch overall coins (API)
  useEffect(() => {
    let ignore = false;
    const fetchOverallCoins = async () => {
      if (!currentUser || currentUser.userType !== 'super-admin') return;
      setOverallCoinsLoading(true);
      setOverallCoinsError(null);
      try {
        const res = await authService.getTotalAvailableCoins();
        if (!ignore) {
          if (res.success) {
            // API may return { coins: number } or similar
            setOverallCoins(res.data?.coins ?? res.data ?? 0);
          } else {
            setOverallCoinsError(res.error || 'Failed to fetch overall coins');
            setOverallCoins(0);
          }
        }
      } catch (e) {
        if (!ignore) {
          setOverallCoinsError(e?.message || 'Failed to fetch overall coins');
          setOverallCoins(0);
        }
      } finally {
        if (!ignore) setOverallCoinsLoading(false);
      }
    };
    fetchOverallCoins();
    return () => { ignore = true; };
  }, [currentUser]);

  // Fetch total coins sell (API)
  useEffect(() => {
    let ignore = false;
    const fetchTotalCoinsSell = async () => {
      if (!currentUser || currentUser.userType !== 'super-admin') return;
      setTotalCoinsSellLoading(true);
      setTotalCoinsSellError(null);
      try {
        const res = await authService.getTotalSellCoins();
        if (!ignore) {
          if (res.success) {
            // API may return { totalSell: number } or similar
            setTotalCoinsSell(res.data?.totalSell ?? res.data ?? 0);
          } else {
            setTotalCoinsSellError(res.error || 'Failed to fetch total coins sell');
            setTotalCoinsSell(0);
          }
        }
      } catch (e) {
        if (!ignore) {
          setTotalCoinsSellError(e?.message || 'Failed to fetch total coins sell');
          setTotalCoinsSell(0);
        }
      } finally {
        if (!ignore) setTotalCoinsSellLoading(false);
      }
    };
    fetchTotalCoinsSell();
    return () => { ignore = true; };
  }, [currentUser]);

  // Fetch active live users count
  useEffect(() => {
    let ignore = false;
    const fetchLiveUsers = async () => {
      if (!currentUser || currentUser.userType !== 'super-admin') return;
      setLiveUsersLoading(true);
      try {
        const res = await liveService.getAdminLiveSessions({ status: 'active' });
        if (!ignore) {
          if (res.success) {
            const list = Array.isArray(res.data)
              ? res.data
              : (res.data?.sessions || res.data?.data || []);
            setLiveUsersCount(list.length);
          } else {
            setLiveUsersCount(staticMetrics.liveUsers);
          }
        }
      } catch {
        if (!ignore) setLiveUsersCount(staticMetrics.liveUsers);
      } finally {
        if (!ignore) setLiveUsersLoading(false);
      }
    };
    fetchLiveUsers();
    return () => { ignore = true; };
  }, [currentUser]);

  // Fetch total diamonds (credits)
  useEffect(() => {
    let ignore = false;
    const fetchDiamonds = async () => {
      if (!currentUser || currentUser.userType !== 'super-admin') return;
      setTotalDiamondsLoading(true);
      try {
        const res = await authService.getDiamondCredits();
        if (!ignore) {
          if (res.success) {
            setTotalDiamonds(res.data?.count ?? res.data?.total ?? res.data ?? 0);
          } else {
            setTotalDiamonds(staticMetrics.totalDiamonds);
          }
        }
      } catch {
        if (!ignore) setTotalDiamonds(staticMetrics.totalDiamonds);
      } finally {
        if (!ignore) setTotalDiamondsLoading(false);
      }
    };
    fetchDiamonds();
    return () => { ignore = true; };
  }, [currentUser]);

  // Fetch gift transactions count
  useEffect(() => {
    let ignore = false;
    const fetchGiftTransactions = async () => {
      if (!currentUser || currentUser.userType !== 'super-admin') return;
      setGiftTransactionsLoading(true);
      try {
        const res = await liveService.getAdminGiftTransactions({ page: 1, limit: 100 });
        if (!ignore) {
          if (res.success) {
            const list = Array.isArray(res.data)
              ? res.data
              : (res.data?.transactions || res.data?.data || res.data?.items || []);
            const total = res.data?.total ?? res.data?.totalCount ?? list.length;
            setGiftTransactionsCount(total);
          } else {
            setGiftTransactionsCount(0);
          }
        }
      } catch {
        if (!ignore) setGiftTransactionsCount(0);
      } finally {
        if (!ignore) setGiftTransactionsLoading(false);
      }
    };
    fetchGiftTransactions();
    return () => { ignore = true; };
  }, [currentUser]);

  // Fetch public live tracking sessions (replaces static voice rooms metric)
  useEffect(() => {
    let ignore = false;
    const fetchLiveTracking = async () => {
      if (!currentUser || currentUser.userType !== 'super-admin') return;
      setLiveTrackingLoading(true);
      try {
        const res = await liveService.getAllLiveTracking();
        if (!ignore) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          setLiveTrackingCount(list.length);
        }
      } catch {
        if (!ignore) setLiveTrackingCount(staticMetrics.voiceRooms);
      } finally {
        if (!ignore) setLiveTrackingLoading(false);
      }
    };
    fetchLiveTracking();
    return () => { ignore = true; };
  }, [currentUser]);

  // Fetch financial overview from cashout history + diamond range APIs
  useEffect(() => {
    let ignore = false;
    const fetchFinancialSummary = async () => {
      if (!currentUser || currentUser.userType !== 'super-admin') return;
      setFinancialLoading(true);
      try {
        const year = new Date().getFullYear();
        const [cashoutRes, rangeRes, pendingRes] = await Promise.all([
          authService.getCashoutHistory(),
          authService.getDiamondRange(`${year}-01-01`, `${year}-12-31`),
          authService.getPendingCashoutList(),
        ]);

        if (ignore) return;

        const cashoutHistory = cashoutRes.success ? normalizeCashoutHistory(cashoutRes.data) : [];
        const rangeTotals = rangeRes.success ? aggregateDiamondRange(rangeRes.data) : null;
        const pendingList = pendingRes.success
          ? (Array.isArray(pendingRes.data) ? pendingRes.data : pendingRes.data?.data || [])
          : [];

        setFinancialSummary({
          totalProfit: rangeTotals?.profit ?? sumCashoutCashAmount(cashoutHistory),
          totalLoss: rangeTotals?.loss ?? 0,
          totalDiamondCashout: sumCashoutDiamonds(cashoutHistory) || rangeTotals?.cashout || 0,
          pendingCashouts: pendingList.length,
        });
      } catch {
        if (!ignore) {
          setFinancialSummary({
            totalProfit: null,
            totalLoss: null,
            totalDiamondCashout: null,
            pendingCashouts: null,
          });
        }
      } finally {
        if (!ignore) setFinancialLoading(false);
      }
    };
    fetchFinancialSummary();
    return () => { ignore = true; };
  }, [currentUser]);

  // Supporter summary cards from total coins APIs
  useEffect(() => {
    let ignore = false;
    const fetchSupporterSummary = async () => {
      if (!currentUser || currentUser.userType !== 'super-admin') return;
      try {
        const [sellRes, coinsRes] = await Promise.all([
          authService.getTotalSellCoins(),
          authService.getTotalAvailableCoins(),
        ]);
        if (!ignore) {
          setSupporterSummary({
            totalRecharge: sellRes.success ? (sellRes.data?.totalSell ?? 0) : null,
            availableCoins: coinsRes.success ? (coinsRes.data?.coins ?? 0) : null,
          });
        }
      } catch {
        if (!ignore) setSupporterSummary({ totalRecharge: null, availableCoins: null });
      }
    };
    fetchSupporterSummary();
    return () => { ignore = true; };
  }, [currentUser]);

  const metricsCards = [
    {
      title: 'Total Sub-Admins',
      value: dynamicCounts.ADMIN ?? staticMetrics.totalSubAdmins,
      icon: 'Users',
      color: 'pink'
    },
    {
      title: 'Total Master Agencies',
      value: dynamicCounts.MASTER_AGENCY ?? staticMetrics.totalMasterAgencies,
      icon: 'Building',
      color: 'purple'
    },
    {
      title: 'Agencies',
      value: dynamicCounts.AGENCY ?? staticMetrics.agencies,
      icon: 'Building',
      color: 'blue'
    },
    {
      title: 'Hosts',
      value: dynamicCounts.HOST ?? staticMetrics.hosts,
      icon: 'UserCheck',
      color: 'cyan'
    },
    {
      title: 'Overall Coins',
      value: overallCoinsLoading
        ? 'Loading...'
        : (overallCoins !== null ? overallCoins : (staticMetrics.overallCoins ?? 'N/A')),
      icon: 'Coins',
      color: 'pink'
    },
    {
      title: 'Live Users',
      value: liveUsersLoading
        ? 'Loading...'
        : (liveUsersCount !== null ? liveUsersCount : staticMetrics.liveUsers),
      icon: 'Activity',
      color: 'purple'
    },
    {
      title: 'Live Tracking',
      value: liveTrackingLoading
        ? 'Loading...'
        : (liveTrackingCount !== null ? liveTrackingCount : staticMetrics.voiceRooms),
      icon: 'Mic',
      color: 'blue'
    },
    {
      title: 'Total Diamonds',
      value: totalDiamondsLoading
        ? 'Loading...'
        : (totalDiamonds !== null ? totalDiamonds : staticMetrics.totalDiamonds),
      icon: 'Gem',
      color: 'cyan'
    },
    {
      title: 'Gift Transactions',
      value: giftTransactionsLoading
        ? 'Loading...'
        : (giftTransactionsCount !== null ? giftTransactionsCount : 0),
      icon: 'Hash',
      color: 'pink'
    }
  ];

  const financialCards = [
    {
      title: 'Total Coins Sell',
      value: totalCoinsSellLoading
        ? 'Loading...'
        : (totalCoinsSell !== null ? totalCoinsSell : 'N/A'),
      formatted: totalCoinsSellLoading
        ? ''
        : (totalCoinsSell !== null ? Number(totalCoinsSell).toLocaleString() : ''),
      change: '',
      trend: '',
      icon: 'Coins',
      color: 'yellow'
    },
    {
      title: 'Total Profit',
      value: financialLoading
        ? 'Loading...'
        : (financialSummary.totalProfit ?? 'N/A'),
      formatted: financialLoading
        ? ''
        : (financialSummary.totalProfit !== null ? formatMetricNumber(financialSummary.totalProfit) : ''),
      change: '',
      trend: financialSummary.totalProfit > 0 ? 'up' : '',
      icon: 'DollarSign',
      color: 'green'
    },
    {
      title: 'Total Loss',
      value: financialLoading
        ? 'Loading...'
        : (financialSummary.totalLoss ?? 'N/A'),
      formatted: financialLoading
        ? ''
        : (financialSummary.totalLoss !== null ? formatMetricNumber(financialSummary.totalLoss) : ''),
      change: '',
      trend: financialSummary.totalLoss > 0 ? 'down' : '',
      icon: 'AlertTriangle',
      color: 'red'
    },
    {
      title: 'Total Diamond Cashout',
      value: financialLoading
        ? 'Loading...'
        : (financialSummary.totalDiamondCashout ?? 'N/A'),
      formatted: financialLoading
        ? ''
        : (financialSummary.totalDiamondCashout !== null ? formatMetricNumber(financialSummary.totalDiamondCashout) : ''),
      change: financialSummary.pendingCashouts !== null ? `${financialSummary.pendingCashouts} pending` : '',
      trend: '',
      icon: 'Gem',
      color: 'purple'
    }
  ];

  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto" role="main">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
            <p className="text-gray-400">
              Welcome back{currentUser ? `, ${currentUser.username}` : ''}! Here's what's happening with your platform.
            </p>
          </div>
          
          {/* User Info & Logout Button */}
          {currentUser && (
            <div className="flex items-center space-x-6">
              {/* Notification Button - Only for super-admin */}
              {currentUser.userType === 'super-admin' && (
                <div>
                  <button
                    onClick={() => {
                      setShowDpModal(true);
                      setSelectedUser(null);
                    }}
                    className="flex items-center justify-center bg-[#1A1A1A] px-5 py-3 rounded-xl border border-gray-700 hover:border-gray-600 focus:outline-none"
                    aria-label="Notifications"
                    style={{ minWidth: '64px', minHeight: '48px' }}
                  >
                    <Bell className="w-7 h-7 text-pink-400" />
                    <span className="ml-2 inline-block w-3 h-3 rounded-full bg-pink-500"></span>
                  </button>
                </div>
              )}
              {/* User Badge with dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center space-x-3 bg-[#1A1A1A] px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600"
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${currentUser.userType === 'super-admin' ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7]' :
                      currentUser.userType === 'admin' ? 'bg-gradient-to-r from-[#7209B7] to-[#4361EE]' :
                      'bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]'}
                  `}>
                    {currentUser.userType === 'super-admin' ? <Crown className="w-4 h-4 text-white" /> :
                     currentUser.userType === 'admin' ? <Shield className="w-4 h-4 text-white" /> :
                     <User className="w-4 h-4 text-white" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{currentUser.username}</p>
                    <p className="text-xs text-gray-400 capitalize">{currentUser.userType.replace('-', ' ')}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl z-50">
                    <button
                      onClick={() => { setShowUserMenu(false); onNavigate && onNavigate('profile'); }}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); onLogout && onLogout(); }}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:bg-red-900/20 hover:text-red-400 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <section 
        className="mb-8"
        aria-labelledby="metrics-heading"
      >
        <h2 id="metrics-heading" className="sr-only">Platform Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {metricsCards.map((card, index) => (
            <MetricsCard
              key={`metric-${index}`}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </section>

      {/* Financial Metrics Section */}
      <section 
        className="mb-8"
        aria-labelledby="financial-heading"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="financial-heading" className="text-2xl font-bold text-white">Financial Overview</h2>
            <p className="text-gray-400 mt-1">Track your revenue, profits, and financial performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {financialCards.map((card, index) => (
            <FinancialMetricsCard
              key={`financial-${index}`}
              title={card.title}
              value={card.value}
              formatted={card.formatted}
              change={card.change}
              trend={card.trend}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      </section>

      {/* Live & Gifts Activity from APIs */}
      {currentUser?.userType === 'super-admin' && (
        <LiveGiftsDashboardSection />
      )}

      {/* Analytics Section */}
      <section 
        className="mb-8"
        aria-labelledby="analytics-heading"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="analytics-heading" className="text-2xl font-bold text-white">Analytics & Insights</h2>
            <p className="text-gray-400 mt-1">Detailed analysis of coins and diamonds performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Enhanced Chart Card - Takes 2 columns on XL screens */}
          <div className="xl:col-span-2">
            <EnhancedChartCard />
          </div>

          {/* Supporter Cards - Takes 1 column on XL screens */}
          <div className="space-y-6">
            <SupporterCard
              title="Total Coins Sold"
              value={
                supporterSummary.totalRecharge !== null
                  ? Number(supporterSummary.totalRecharge).toLocaleString()
                  : supporterCardsData.totalRecharge.value
              }
              icon={supporterCardsData.totalRecharge.icon}
              color={supporterCardsData.totalRecharge.color}
            />
            <SupporterCard
              title="Available Platform Coins"
              value={
                supporterSummary.availableCoins !== null
                  ? Number(supporterSummary.availableCoins).toLocaleString()
                  : supporterCardsData.thisMonthRecharge.value
              }
              icon={supporterCardsData.thisMonthRecharge.icon}
              color={supporterCardsData.thisMonthRecharge.color}
            />
          </div>
        </div>
      </section>

  

      


      {/* DP Verification Modal as full-page overlay */}
      {showDpModal && (
        <DpVerificationModal
          isOpen={showDpModal}
          onClose={() => setShowDpModal(false)}
          requests={[]}
          initialSelectedId={null}
          fullPage={true}
          onApprove={async (usercode) => {
            try {
              const res = await authService.approveProfile(usercode);
              if (!res.success) {
                console.error(res.error || 'Approve failed');
              }
            } catch (e) {
              console.error('Approve error:', e?.message || e);
            } finally {
              setShowDpModal(false);
            }
          }}
          onReject={() => {
            setShowDpModal(false);
          }}
        />
      )}
    </main>
  );
};

export default Dashboard;

