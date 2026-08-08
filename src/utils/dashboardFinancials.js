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
