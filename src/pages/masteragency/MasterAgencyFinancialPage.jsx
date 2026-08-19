import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import FinancialMetricsCard from '../../components/FinancialMetricsCard';
import EnhancedChartCard from '../../components/EnhancedChartCard';
import SupporterCard from '../../components/SupporterCard';
import StatusBadge from '../../components/StatusBadge';
import MasterAgencyGoals from './MasterAgencyGoals';
import authService from '../../services/authService';
import services from '../../services/services';
import { supporterCardsData } from '../../data/dashboardData';
import {
  aggregateDiamondRange,
  formatMetricNumber,
  normalizeCashoutHistory,
  sumCashoutDiamonds,
  sumCashoutCashAmount,
} from '../../utils/dashboardFinancials';

const MasterAgencyFinancialPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const [totalCoinsSell, setTotalCoinsSell] = useState(null);
  const [totalCoinsSellLoading, setTotalCoinsSellLoading] = useState(false);
  const [financialSummary, setFinancialSummary] = useState({
    totalProfit: null, totalLoss: null, totalDiamondCashout: null, pendingCashouts: null,
  });
  const [financialLoading, setFinancialLoading] = useState(false);
  const [supporterSummary, setSupporterSummary] = useState({
    totalRecharge: null, availableCoins: null,
  });

  // Fetch agencies table
  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      setTableLoading(true);
      try {
        const info = authService.getUserInfo();
        if (!ignore) setUserInfo(info);
        const myCode = authService.extractUserCode(info);
        const res = myCode
          ? await authService.getAllSubUserByCode(myCode, 'AGENCY')
          : { success: true, data: [] };
        if (!ignore && res.success) {
          setAgencies(Array.isArray(res.data) ? res.data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setTableLoading(false);
      }
    };
    fetch();
    return () => { ignore = true; };
  }, []);

  // Total coins sell
  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      setTotalCoinsSellLoading(true);
      try {
        const res = await authService.getTotalSellCoins();
        if (!ignore) setTotalCoinsSell(res.success ? (res.data?.totalSell ?? 0) : null);
      } catch { if (!ignore) setTotalCoinsSell(null); }
      finally { if (!ignore) setTotalCoinsSellLoading(false); }
    };
    fetch();
    return () => { ignore = true; };
  }, []);

  // Financial summary
  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
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
          ? (Array.isArray(pendingRes.data) ? pendingRes.data : pendingRes.data?.data || []) : [];
        setFinancialSummary({
          totalProfit: rangeTotals?.profit ?? sumCashoutCashAmount(cashoutHistory),
          totalLoss: rangeTotals?.loss ?? 0,
          totalDiamondCashout: sumCashoutDiamonds(cashoutHistory) || rangeTotals?.cashout || 0,
          pendingCashouts: pendingList.length,
        });
      } catch { if (!ignore) setFinancialSummary({ totalProfit: null, totalLoss: null, totalDiamondCashout: null, pendingCashouts: null }); }
      finally { if (!ignore) setFinancialLoading(false); }
    };
    fetch();
    return () => { ignore = true; };
  }, []);

  // Supporter summary
  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      try {
        const [sellRes, coinsRes] = await Promise.all([
          authService.getTotalSellCoins(),
          authService.getTotalAvailableCoins(),
        ]);
        if (!ignore) setSupporterSummary({
          totalRecharge: sellRes.success ? (sellRes.data?.totalSell ?? 0) : null,
          availableCoins: coinsRes.success ? (coinsRes.data?.coins ?? 0) : null,
        });
      } catch { if (!ignore) setSupporterSummary({ totalRecharge: null, availableCoins: null }); }
    };
    fetch();
    return () => { ignore = true; };
  }, []);

  const financialCards = [
    {
      title: 'Total Coins Sell',
      formatted: totalCoinsSellLoading ? '…' : (totalCoinsSell !== null ? Number(totalCoinsSell).toLocaleString() : '—'),
      change: '', trend: '', icon: 'Coins', color: 'yellow',
    },
    {
      title: 'Total Profit',
      formatted: financialLoading ? '…' : (financialSummary.totalProfit !== null ? formatMetricNumber(financialSummary.totalProfit) : '—'),
      change: '', trend: financialSummary.totalProfit > 0 ? 'up' : '', icon: 'DollarSign', color: 'green',
    },
    {
      title: 'Total Loss',
      formatted: financialLoading ? '…' : (financialSummary.totalLoss !== null ? formatMetricNumber(financialSummary.totalLoss) : '—'),
      change: '', trend: financialSummary.totalLoss > 0 ? 'down' : '', icon: 'AlertTriangle', color: 'red',
    },
    {
      title: 'Total Diamond Cashout',
      formatted: financialLoading ? '…' : (financialSummary.totalDiamondCashout !== null ? formatMetricNumber(financialSummary.totalDiamondCashout) : '—'),
      change: financialSummary.pendingCashouts !== null ? `${financialSummary.pendingCashouts} pending` : '',
      trend: '', icon: 'Gem', color: 'purple',
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-black/70 min-h-full">

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Financial Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Track revenue, profits, analytics and your goals</p>
      </div>

      {/* Financial Cards */}
      <section aria-labelledby="ma-fin-heading">
        <h2 id="ma-fin-heading" className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {financialCards.map((card, i) => (
            <FinancialMetricsCard
              key={`ma-fin-${i}`}
              title={card.title}
              formatted={card.formatted}
              change={card.change}
              trend={card.trend}
              icon={card.icon}
              color={card.color}
              isLoading={financialLoading || totalCoinsSellLoading}
            />
          ))}
        </div>
      </section>

      {/* Analytics & Insights */}
      <section aria-labelledby="ma-analytics-heading">
        <h2 id="ma-analytics-heading" className="text-lg font-semibold text-white mb-4">Analytics & Insights</h2>
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
      </section>

      {/* Goals */}
      {/* <section aria-labelledby="ma-goals-heading">
        <h2 id="ma-goals-heading" className="text-lg font-semibold text-white mb-4">My Goals</h2>
        <MasterAgencyGoals />
      </section> */}

      {/* Agencies Table */}
      {/* <section aria-labelledby="ma-table-heading">
        <h2 id="ma-table-heading" className="text-lg font-semibold text-white mb-4">My Agencies</h2>
        <div className="bg-[#121212] rounded-xl border border-gray-800 overflow-hidden">
          {tableLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Name</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Code</th>
                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section> */}
    </div>
  );
};

export default MasterAgencyFinancialPage;
