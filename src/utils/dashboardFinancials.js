export const normalizeCashoutHistory = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.value)) return data.value;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const sumCashoutDiamonds = (records) =>
  normalizeCashoutHistory(records).reduce((sum, item) => sum + (Number(item?.diamonds) || 0), 0);

export const sumCashoutCashAmount = (records) =>
  normalizeCashoutHistory(records).reduce((sum, item) => sum + (Number(item?.cashAmount) || 0), 0);

export const aggregateDiamondRange = (entries = []) => {
  const list = Array.isArray(entries) ? entries : [];
  return list.reduce(
    (acc, entry) => {
      const status = String(entry?.status || '').toUpperCase();
      const amount = Number(entry?.diamonds) || 0;
      if (status === 'PROFIT') acc.profit += amount;
      else if (status === 'DEBIT' || status === 'LOSS') acc.loss += amount;
      else if (status === 'CASHOUT') acc.cashout += amount;
      else if (status === 'CREDIT') acc.credit += amount;
      return acc;
    },
    { profit: 0, loss: 0, cashout: 0, credit: 0 }
  );
};

export const formatMetricNumber = (value) => {
  const num = Number(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
};

export const parseNumericApiValue = (data) => {
  if (typeof data === 'number' && !Number.isNaN(data)) return data;
  if (typeof data === 'string' && data.trim() !== '' && !Number.isNaN(Number(data))) return Number(data);
  if (data && typeof data === 'object') {
    const candidate = data.coins ?? data.totalSell ?? data.total ?? data.count ?? data.value ?? data.message;
    if (typeof candidate === 'number') return candidate;
    if (typeof candidate === 'string' && candidate.trim() !== '' && !Number.isNaN(Number(candidate))) {
      return Number(candidate);
    }
  }
  return 0;
};

const mapApiTrend = (trend) => {
  const t = String(trend || '').toUpperCase();
  if (t === 'UP') return 'up';
  if (t === 'DOWN') return 'down';
  return '';
};

const formatChangePercent = (changePercent) => {
  if (changePercent === null || changePercent === undefined || Number.isNaN(Number(changePercent))) {
    return '';
  }
  const n = Number(changePercent);
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(n % 1 === 0 ? 0 : 1)}%`;
};

/** Normalize a single financialOverview metric block */
export const normalizeOverviewMetric = (metric) => {
  if (metric == null) {
    return { value: null, amount: null, changePercent: null, change: '', trend: '' };
  }
  if (typeof metric === 'number') {
    return { value: metric, amount: metric, changePercent: null, change: '', trend: '' };
  }

  const value = metric.value ?? metric.total ?? null;
  const amount = metric.amount ?? value;
  const hasChange = Object.prototype.hasOwnProperty.call(metric, 'changePercent');
  const changePercent = hasChange ? Number(metric.changePercent) : null;
  const trend = hasChange ? mapApiTrend(metric.trend) || (changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : '') : '';

  return {
    value: value === null ? null : Number(value) || 0,
    amount: amount === null ? null : Number(amount) || 0,
    changePercent,
    change: hasChange ? formatChangePercent(changePercent) : '',
    trend,
  };
};

/** Normalize GET /auth/api/financialOverview payload */
export const normalizeFinancialOverview = (payload) => {
  const data = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  if (!data || typeof data !== 'object') {
    return null;
  }

  return {
    usercode: data.usercode || null,
    name: data.name || null,
    role: data.role || null,
    period: data.period || null,
    periodFrom: data.periodFrom || null,
    periodTo: data.periodTo || null,
    coinRate: data.coinRate ?? null,
    diamondRate: data.diamondRate ?? null,
    totalRevenue: data.totalRevenue ?? null,
    totalCost: data.totalCost ?? null,
    netAmount: data.netAmount ?? null,
    totalCoinsSell: normalizeOverviewMetric(data.totalCoinsSell),
    totalProfit: normalizeOverviewMetric(data.totalProfit),
    totalLoss: normalizeOverviewMetric(data.totalLoss),
    totalDiamondCashout: normalizeOverviewMetric(data.totalDiamondCashout),
  };
};

/** Build FinancialMetricsCard props from normalized overview */
export const toFinancialMetricCards = (overview, { isLoading = false } = {}) => {
  const empty = { value: null, amount: null, change: '', trend: '' };
  const coins = overview?.totalCoinsSell || empty;
  const profit = overview?.totalProfit || empty;
  const loss = overview?.totalLoss || empty;
  const cashout = overview?.totalDiamondCashout || empty;

  const formatValue = (metric) => {
    if (isLoading) return '…';
    if (metric?.value === null || metric?.value === undefined) return '—';
    return formatMetricNumber(metric.value);
  };

  return [
    {
      title: 'Total Coins Sell',
      value: coins.value,
      formatted: formatValue(coins),
      change: coins.change,
      trend: coins.trend,
      icon: 'Coins',
      color: 'yellow',
    },
    {
      title: 'Total Profit',
      value: profit.value,
      formatted: formatValue(profit),
      change: profit.change,
      trend: profit.trend || (profit.value > 0 ? 'up' : ''),
      icon: 'DollarSign',
      color: 'green',
    },
    {
      title: 'Total Loss',
      value: loss.value,
      formatted: formatValue(loss),
      change: loss.change,
      trend: loss.trend || (loss.value > 0 ? 'down' : ''),
      icon: 'AlertTriangle',
      color: 'red',
    },
    {
      title: 'Total Diamond Cashout',
      value: cashout.value,
      // value = diamond units; amount = cash equivalent at diamondRate
      formatted: isLoading
        ? '…'
        : cashout.value === null || cashout.value === undefined
          ? '—'
          : `${formatMetricNumber(cashout.value)} diamonds`,
      subtitle:
        !isLoading && cashout.amount !== null && cashout.amount !== undefined
          ? `≈ ₹${formatMetricNumber(cashout.amount)}`
          : '',
      change: cashout.change,
      trend: cashout.trend,
      icon: 'Gem',
      color: 'purple',
    },
  ];
};

/** Normalize GET /auth/api/financialAnalytics payload for charts */
export const normalizeFinancialAnalytics = (payload) => {
  const data = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  if (!data || typeof data !== 'object') {
    return {
      title: '',
      type: null,
      year: null,
      totalCoins: 0,
      totalAmount: 0,
      highestAmount: 0,
      currency: 'INR',
      points: [],
      chartData: [],
    };
  }

  const points = Array.isArray(data.points) ? data.points : [];
  const chartData = points.map((p, index) => {
    const amount = Number(p?.amount ?? p?.coins ?? 0) || 0;
    const isLastNonZero = amount > 0 && !points.slice(index + 1).some((x) => (Number(x?.amount ?? x?.coins ?? 0) || 0) > 0);
    return {
      name: p?.label || p?.name || p?.date || '',
      date: p?.date || null,
      coins: Number(p?.coins ?? 0) || 0,
      amount,
      isCurrentPeriod: Boolean(p?.isCurrentPeriod) || isLastNonZero,
    };
  });

  return {
    title: data.title || 'Financial Analytics',
    type: data.type || null,
    year: data.year ?? null,
    totalCoins: Number(data.totalCoins ?? 0) || 0,
    totalAmount: Number(data.totalAmount ?? 0) || 0,
    highestAmount: Number(data.highestAmount ?? 0) || 0,
    currency: data.currency || 'INR',
    points,
    chartData,
  };
};
