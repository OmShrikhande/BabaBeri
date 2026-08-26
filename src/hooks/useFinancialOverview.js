import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';
import { resolveFinancialIdentity } from '../utils/financialApiRole';
import {
  normalizeFinancialOverview,
  toFinancialMetricCards,
} from '../utils/dashboardFinancials';

/**
 * Loads role-scoped financial overview cards for the logged-in user.
 * @param {{ initialPeriod?: 'ALL'|'WEEK'|'MONTH'|'YEAR' }} options
 */
export default function useFinancialOverview({ initialPeriod = 'MONTH' } = {}) {
  const [period, setPeriod] = useState(initialPeriod);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [identity, setIdentity] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const id = await resolveFinancialIdentity();
      setIdentity(id);
      if (!id.success) {
        setOverview(null);
        setError(id.error);
        return;
      }

      const res = await authService.getFinancialOverview({
        role: id.role,
        usercode: id.usercode,
        period: from && to ? undefined : period,
        from: from || undefined,
        to: to || undefined,
      });

      if (!res.success) {
        setOverview(null);
        setError(res.error || 'Failed to load financial overview');
        return;
      }

      setOverview(normalizeFinancialOverview(res.data));
    } catch (err) {
      setOverview(null);
      setError(err?.message || 'Failed to load financial overview');
    } finally {
      setIsLoading(false);
    }
  }, [period, from, to]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (ignore) return;
      await refetch();
    })();
    return () => { ignore = true; };
  }, [refetch]);

  const setCustomRange = useCallback((nextFrom, nextTo) => {
    setFrom(nextFrom || null);
    setTo(nextTo || null);
  }, []);

  const setPeriodOnly = useCallback((nextPeriod) => {
    setFrom(null);
    setTo(null);
    setPeriod(nextPeriod);
  }, []);

  const cards = toFinancialMetricCards(overview, { isLoading });

  return {
    overview,
    cards,
    isLoading,
    error,
    identity,
    period,
    setPeriod: setPeriodOnly,
    from,
    to,
    setCustomRange,
    refetch,
  };
}
