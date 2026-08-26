import { useCallback, useEffect, useState } from 'react';
import authService from '../services/authService';

/** Current-month target + past months history (token-scoped). */
export default function useTargetProgress() {
  const [currentTarget, setCurrentTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [currentRes, historyRes] = await Promise.all([
        authService.getCurrentMonthTarget(),
        authService.getMyTargetHistory(),
      ]);

      if (!currentRes.success && !historyRes.success) {
        setCurrentTarget(null);
        setHistory([]);
        setError(currentRes.error || historyRes.error || 'Failed to load targets');
        return;
      }

      setCurrentTarget(currentRes.success ? currentRes.data : null);
      setHistory(historyRes.success ? (Array.isArray(historyRes.data) ? historyRes.data : []) : []);
      if (!currentRes.success) setError(currentRes.error);
      else if (!historyRes.success) setError(historyRes.error);
    } catch (err) {
      setCurrentTarget(null);
      setHistory([]);
      setError(err?.message || 'Failed to load targets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (ignore) return;
      await refetch();
    })();
    return () => { ignore = true; };
  }, [refetch]);

  return {
    currentTarget,
    history,
    isLoading,
    error,
    refetch,
  };
}
