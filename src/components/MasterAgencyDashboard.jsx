import React, { useState, useEffect } from 'react';
import { Users, Mic, DollarSign, Target } from 'lucide-react';
import MetricsCard from './MetricsCard';
import LoadingCard from './LoadingCard';
import StatusBadge from './StatusBadge';
import FinancialMetricsCard from './FinancialMetricsCard';
import EnhancedChartCard from './EnhancedChartCard';
import SupporterCard from './SupporterCard';
import authService from '../services/authService';
import services from '../services/services';
import { supporterCardsData } from '../data/dashboardData';
import {
  aggregateDiamondRange,
  formatMetricNumber,
  normalizeCashoutHistory,
  sumCashoutDiamonds,
  sumCashoutCashAmount,
} from '../utils/dashboardFinancials';

const MasterAgencyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    agencies: 0,
    hosts: 0,
    pendingCashouts: 0
  });
  const [agencies, setAgencies] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [goalData, setGoalData] = useState(null);
  const [goalLoading, setGoalLoading] = useState(true);

  // Financial Overview State
  const [totalCoinsSell, setTotalCoinsSell] = useState(null);
  const [totalCoinsSellLoading, setTotalCoinsSellLoading] = useState(false);
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

        const [agencyCount, hostCount, cashoutData, agenciesData] = await Promise.all([
          authService.countByRole('AGENCY'),
          authService.countByRole('HOST'),
          services.getPendingCashoutList(),
          myCode ? authService.getAllSubUserByCode(myCode, 'AGENCY') : Promise.resolve({ success: true, data: [] })
        ]);

        if (ignore) return;

        const cashoutList = Array.isArray(cashoutData?.data) ? cashoutData.data : [];

        setMetrics({
          agencies: agencyCount?.data?.count ?? 0,
          hosts: hostCount?.data?.count ?? 0,
          pendingCashouts: cashoutList.length
        });

        if (agenciesData.success) {
          const list = Array.isArray(agenciesData.data) ? agenciesData.data : [];
          setAgencies(list);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching master agency dashboard data:', err);
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
          'https://proxstreamapi.in/auth/user/getcurrentmonthtarget',
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

  // Fetch total coins sell
  useEffect(() => {
    let ignore = false;
    const fetchTotalCoinsSell = async () => {
      setTotalCoinsSellLoading(true);
      try {
        const res = await authService.getTotalSellCoins();
        if (!ignore) setTotalCoinsSell(res.success ? (res.data?.totalSell ?? 0) : null);
      } catch {
        if (!ignore) setTotalCoinsSell(null);
      } finally {
        if (!ignore) setTotalCoinsSellLoading(false);
      }
    };
    fetchTotalCoinsSell();
    return () => { ignore = true; };
  }, []);

  // Fetch financial overview
  useEffect(() => {
    let ignore = false;
    const fetchFinancialSummary = async () => {
      setFinancialLoading(true);
      try {
        const year = new Date().getFullYear();
        const [cashoutRes, rangeRes, pendingRes] = await Promise.all([
          authService.getCashoutHistory(),
          authService.getDiamondRange(`${year}-01-01`, `${year}-12-31`),
          services.getPendingCashoutList(),
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
        if (!ignore) setFinancialSummary({ totalProfit: null, totalLoss: null, totalDiamondCashout: null, pendingCashouts: null });
      } finally {
        if (!ignore) setFinancialLoading(false);
      }
    };
    fetchFinancialSummary();
    return () => { ignore = true; };
  }, []);

  // Supporter summary
  useEffect(() => {
    let ignore = false;
    const fetchSupporterSummary = async () => {
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
  }, []);

  const financialCards = [
    {
      title: 'Total Coins Sell',
      value: totalCoinsSellLoading ? 'Loading...' : (totalCoinsSell !== null ? totalCoinsSell : 'N/A'),
      formatted: totalCoinsSellLoading ? '' : (totalCoinsSell !== null ? Number(totalCoinsSell).toLocaleString() : '—'),
      change: '', trend: '', icon: 'Coins', color: 'yellow'
    },
    {
      title: 'Total Profit',
      value: financialLoading ? 'Loading...' : (financialSummary.totalProfit ?? 'N/A'),
      formatted: financialLoading ? '' : (financialSummary.totalProfit !== null ? formatMetricNumber(financialSummary.totalProfit) : '—'),
      change: '', trend: financialSummary.totalProfit > 0 ? 'up' : '', icon: 'DollarSign', color: 'green'
    },
    {
      title: 'Total Loss',
      value: financialLoading ? 'Loading...' : (financialSummary.totalLoss ?? 'N/A'),
      formatted: financialLoading ? '' : (financialSummary.totalLoss !== null ? formatMetricNumber(financialSummary.totalLoss) : '—'),
      change: '', trend: financialSummary.totalLoss > 0 ? 'down' : '', icon: 'AlertTriangle', color: 'red'
    },
    {
      title: 'Total Diamond Cashout',
      value: financialLoading ? 'Loading...' : (financialSummary.totalDiamondCashout ?? 'N/A'),
      formatted: financialLoading ? '' : (financialSummary.totalDiamondCashout !== null ? formatMetricNumber(financialSummary.totalDiamondCashout) : '—'),
      change: financialSummary.pendingCashouts !== null ? `${financialSummary.pendingCashouts} pending` : '',
      trend: '', icon: 'Gem', color: 'purple'
    }
  ];

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
          <div className="p-3 rounded-lg bg-gradient-to-r from-[#4361EE] to-[#4CC9F0]">
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
                className="bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] h-2 rounded-full transition-all"
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
              <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-900/30 text-cyan-400 border border-cyan-800/50">
                Master Agency
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, {userInfo?.username || userInfo?.name || 'Master Agency'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <MetricsCard
                title="Agencies Under Me"
                value={metrics.agencies}
                icon="Users"
                color="blue"
              />
              <MetricsCard
                title="Total Hosts"
                value={metrics.hosts}
                icon="Mic"
                color="pink"
              />
              <MetricsCard
                title="Pending Cashouts"
                value={metrics.pendingCashouts}
                icon="DollarSign"
                color="cyan"
              />
            </>
          )}
        </div>

        {/* Financial Overview Section */}
        {/* <section className="mb-8" aria-labelledby="ma-financial-heading">
          <div className="mb-6">
            <h2 id="ma-financial-heading" className="text-2xl font-bold text-white">Financial Overview</h2>
            <p className="text-gray-400 mt-1">Track your revenue, profits, and financial performance</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {financialCards.map((card, index) => (
              <FinancialMetricsCard
                key={`ma-financial-${index}`}
                title={card.title}
                value={card.value}
                formatted={card.formatted}
                change={card.change}
                trend={card.trend}
                icon={card.icon}
                color={card.color}
                isLoading={financialLoading || totalCoinsSellLoading}
              />
            ))}
          </div>
        </section> */}

        {/* Analytics & Insights Section */}
        {/* <section className="mb-8" aria-labelledby="ma-analytics-heading">
          <div className="mb-6">
            <h2 id="ma-analytics-heading" className="text-2xl font-bold text-white">Analytics & Insights</h2>
            <p className="text-gray-400 mt-1">Detailed analysis of coins and diamonds performance</p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <EnhancedChartCard />
            </div>
            <div className="space-y-6">
              <SupporterCard
                title="Total Coins Sold"
                value={supporterSummary.totalRecharge !== null
                  ? Number(supporterSummary.totalRecharge).toLocaleString()
                  : supporterCardsData.totalRecharge.value}
                icon={supporterCardsData.totalRecharge.icon}
                color={supporterCardsData.totalRecharge.color}
              />
              <SupporterCard
                title="Available Platform Coins"
                value={supporterSummary.availableCoins !== null
                  ? Number(supporterSummary.availableCoins).toLocaleString()
                  : supporterCardsData.thisMonthRecharge.value}
                icon={supporterCardsData.thisMonthRecharge.icon}
                color={supporterCardsData.thisMonthRecharge.color}
              />
            </div>
          </div>
        </section> */}

        {/* My Agencies Table */}
        <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">My Agencies</h2>
            <p className="text-gray-400 text-sm mt-1">Agencies under your management</p>
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
          ) : agencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No agencies found</p>
              <p className="text-gray-600 text-sm mt-1">Agencies will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Name</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Code</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Hosts</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.map((agency, index) => (
                    <tr key={agency.id || index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 text-white">{agency.name || agency.username || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-mono bg-gray-800 text-gray-300">
                          {authService.extractUserCode(agency) || agency.code || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={agency.status || 'active'} />
                      </td>
                      <td className="px-6 py-4 text-gray-400">—</td>
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

export default MasterAgencyDashboard;
