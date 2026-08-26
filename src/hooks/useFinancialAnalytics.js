import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';
import { resolveFinancialIdentity } from '../utils/financialApiRole';
import { normalizeFinancialAnalytics } from '../utils/dashboardFinancials';

const PERIOD_TO_TYPE = {
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  yearly: 'YEARLY',
};

/**
 * Loads role-scoped financial analytics chart data for the logged-in user.
 * @param {{ initialPeriod?: 'weekly'|'monthly'|'yearly' }} options
 */
export default function useFinancialAnalytics({ initialPeriod = 'monthly' } = {}) {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [year, setYear] = useState(null);
  const [analytics, setAnalytics] = useState(() => normalizeFinancialAnalytics(null));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const type = PERIOD_TO_TYPE[selectedPeriod] || 'MONTHLY';

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await resolveFinancialIdentity();
      if (!id.success) {
        setAnalytics(normalizeFinancialAnalytics(null));
        setError(id.error);
        return;
      }

      const res = await authService.getFinancialAnalytics({
        role: id.role,
        usercode: id.usercode,
        type,
        year: type === 'MONTHLY' && year ? year : undefined,
      });

      if (!res.success) {
        setAnalytics(normalizeFinancialAnalytics(null));
        setError(res.error || 'Failed to load financial analytics');
        return;
      }

      setAnalytics(normalizeFinancialAnalytics(res.data));
    } catch (err) {
      setAnalytics(normalizeFinancialAnalytics(null));
      setError(err?.message || 'Failed to load financial analytics');
    } finally {
      setIsLoading(false);
    }
  }, [type, year]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (ignore) return;
      await refetch();
    })();
    return () => { ignore = true; };
  }, [refetch]);

  return {
    analytics,
    chartData: analytics.chartData || [],
    isLoading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    type,
    year,
    setYear,
    refetch,
  };
}
