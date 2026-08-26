import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import FinancialMetricsCard from './FinancialMetricsCard';
import EnhancedChartCard from './EnhancedChartCard';
import SupporterCard from './SupporterCard';
import { supporterCardsData } from '../data/dashboardData';
import useFinancialOverview from '../hooks/useFinancialOverview';
import authService from '../services/authService';
import { formatMetricNumber } from '../utils/dashboardFinancials';

const PERIOD_OPTIONS = [
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
  { value: 'YEAR', label: 'Year' },
  { value: 'ALL', label: 'All time' },
];

/**
 * Shared Financial Overview + Analytics block for all role dashboards.
 * Diamonds: overview returns totals only (no duration series) → cards only, not chart.
 */
const FinancialInsightsSection = ({
  overviewHeadingId = 'financial-heading',
  analyticsHeadingId = 'analytics-heading',
  compact = false,
  showPeriodToggle = true,
}) => {
  const {
    cards,
    overview,
    isLoading,
    error,
    period,
    setPeriod,
    from,
    to,
    setCustomRange,
  } = useFinancialOverview({ initialPeriod: 'MONTH' });

  const [availableCoins, setAvailableCoins] = useState(null);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');

  useEffect(() => {
    setDraftFrom(from || '');
    setDraftTo(to || '');
  }, [from, to]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await authService.getTotalAvailableCoins();
        if (!ignore) {
          setAvailableCoins(res.success ? (res.data?.coins ?? 0) : null);
        }
      } catch {
        if (!ignore) setAvailableCoins(null);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const coinsSold = overview?.totalCoinsSell?.value;
  const diamondCashout = overview?.totalDiamondCashout;
  const isCustomRange = Boolean(from && to);
  const headingClass = compact ? 'text-lg font-semibold text-white mb-4' : 'text-2xl font-bold text-white';
  const canApplyRange = Boolean(draftFrom && draftTo && draftFrom <= draftTo);

  const handleApplyRange = () => {
    if (!canApplyRange) return;
    setCustomRange(draftFrom, draftTo);
  };

  const handleClearRange = () => {
    setDraftFrom('');
    setDraftTo('');
    setPeriod(period || 'MONTH');
  };

  return (
    <>
      <section className="mb-8" aria-labelledby={overviewHeadingId}>
        <div className={`flex flex-col gap-4 ${compact ? 'mb-4' : 'mb-6'}`}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 id={overviewHeadingId} className={headingClass}>
                {compact ? 'Revenue Breakdown' : 'Financial Overview'}
              </h2>
              {!compact && (
                <p className="text-gray-400 mt-1">Track your revenue, profits, and financial performance</p>
              )}
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
              {isCustomRange && (
                <p className="text-pink-300 text-xs mt-2">
                  Custom range: {from} → {to}
                </p>
              )}
            </div>

            {showPeriodToggle && (
              <div
                className="flex flex-wrap bg-[#121212] rounded-lg p-1 border border-gray-700 self-start"
                role="tablist"
                aria-label="Financial overview period"
              >
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriod(option.value)}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                      ${!isCustomRange && period === option.value
                        ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }
                    `}
                    role="tab"
                    aria-selected={!isCustomRange && period === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* from / to calendar — financialOverview ignores period when both dates are sent */}
          {showPeriodToggle && (
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 rounded-xl border border-gray-800 bg-[#121212]">
              <div className="flex items-center gap-2 text-gray-400 mb-0 sm:mb-2">
                <Calendar className="w-4 h-4 text-pink-400" />
                <span className="text-sm">Custom range</span>
              </div>
              <label className="flex flex-col gap-1 text-xs text-gray-400">
                From
                <input
                  type="date"
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  className="bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#F72585] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-400">
                To
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom || undefined}
                  onChange={(e) => setDraftTo(e.target.value)}
                  className="bg-[#1A1A1A] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#F72585] focus:outline-none"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyRange}
                  disabled={!canApplyRange}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
                {(isCustomRange || draftFrom || draftTo) && (
                  <button
                    type="button"
                    onClick={handleClearRange}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card, index) => (
            <FinancialMetricsCard
              key={`financial-${index}`}
              title={card.title}
              value={card.value}
              formatted={card.formatted}
              subtitle={card.subtitle}
              change={card.change}
              trend={card.trend}
              icon={card.icon}
              color={card.color}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>

      <section className="mb-8" aria-labelledby={analyticsHeadingId}>
        <div className={compact ? 'mb-4' : 'mb-6'}>
          <h2 id={analyticsHeadingId} className={headingClass}>Analytics & Insights</h2>
          {!compact && (
            <p className="text-gray-400 mt-1">
              Coins recharge over time. Diamond totals appear in the overview cards (no diamond series from this API).
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:items-stretch">
          <div className="xl:col-span-2 min-h-0 flex">
            <div className="w-full h-full">
              <EnhancedChartCard />
            </div>
          </div>
          <div className="flex flex-col gap-4 xl:h-full min-h-0">
            <SupporterCard
              className="flex-1 min-h-0"
              title="Total Coins Sold"
              value={
                coinsSold !== null && coinsSold !== undefined
                  ? Number(coinsSold).toLocaleString()
                  : supporterCardsData.totalRecharge.value
              }
              icon={supporterCardsData.totalRecharge.icon}
              color={supporterCardsData.totalRecharge.color}
            />
            <SupporterCard
              className="flex-1 min-h-0"
              title="Diamond Cashout"
              value={
                diamondCashout?.value !== null && diamondCashout?.value !== undefined
                  ? `${formatMetricNumber(diamondCashout.value)} · ₹${formatMetricNumber(diamondCashout.amount ?? 0)}`
                  : '—'
              }
              icon="Gem"
              color="purple"
            />
            <SupporterCard
              className="flex-1 min-h-0"
              title="Available Platform Coins"
              value={
                availableCoins !== null
                  ? Number(availableCoins).toLocaleString()
                  : supporterCardsData.thisMonthRecharge.value
              }
              icon={supporterCardsData.thisMonthRecharge.icon}
              color={supporterCardsData.thisMonthRecharge.color}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default FinancialInsightsSection;
