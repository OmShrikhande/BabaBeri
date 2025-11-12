import { useState, useCallback } from 'react';
import authService from '../../../services/authService';

export const useWalletData = (addToast) => {
  const [walletSummary, setWalletSummary] = useState({
    totalCredited: 0,
    totalDebited: 0,
    currentBalance: 0,
    lastUpdated: null
  });
  const [diamondCredits, setDiamondCredits] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(false);

  const fetchWalletSummary = useCallback(async () => {
    setLoadingWallet(true);
    try {
      const response = await authService.getDiamondWalletSummary?.();
      if (response?.success) {
        setWalletSummary({
          totalCredited: response.data?.totalCredited ?? 0,
          totalDebited: response.data?.totalDebited ?? 0,
          currentBalance: response.data?.currentBalance ?? 0,
          lastUpdated: response.data?.lastUpdated ?? null
        });
      } else if (response?.error) {
        addToast(response.error, 'error');
      }
    } catch (err) {
      console.error('Error fetching wallet summary:', err);
      addToast('Failed to load wallet summary', 'error');
    } finally {
      setLoadingWallet(false);
    }
  }, [addToast]);

  const fetchDiamondCredits = useCallback(async () => {
    setLoadingCredits(true);
    try {
      const response = await authService.getDiamondCredits?.();
      if (response?.success) {
        // API returns { records: [...], totalCREDIT: number }
        const creditsData = response.data?.records || [];
        // Transform API data to match table expectations
        const transformedCredits = Array.isArray(creditsData) ? creditsData.map(credit => ({
          id: credit.id,
          usercode: 'N/A',
          diamonds: credit.diamonds,
          amount: null,
          status: credit.status,
          transactionId: credit.id.toString(),
          paymentMethod: 'N/A',
          createdAt: credit.date,
          notes: 'N/A'
        })) : [];
        setDiamondCredits(transformedCredits);
      } else if (response?.error) {
        addToast(response.error, 'error');
      }
    } catch (err) {
      console.error('Error fetching diamond credits:', err);
      addToast('Failed to load diamond credits', 'error');
    } finally {
      setLoadingCredits(false);
    }
  }, [addToast]);

  const optimisticUpdateCredit = useCallback((updatedRecord) => {
    setDiamondCredits(prev => {
      if (!updatedRecord?.id) {
        return prev;
      }
      const exists = prev.some(record => record.id === updatedRecord.id);
      if (exists) {
        return prev.map(record => (record.id === updatedRecord.id ? updatedRecord : record));
      }
      return [updatedRecord, ...prev];
    });
  }, []);

  const removeCreditFromList = useCallback((creditId) => {
    setDiamondCredits(prev => prev.filter(record => record.id !== creditId));
  }, []);

  return {
    walletSummary,
    setWalletSummary,
    diamondCredits,
    setDiamondCredits,
    loadingWallet,
    loadingCredits,
    fetchWalletSummary,
    fetchDiamondCredits,
    optimisticUpdateCredit,
    removeCreditFromList
  };
};
