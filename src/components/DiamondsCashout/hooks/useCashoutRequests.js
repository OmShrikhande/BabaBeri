import { useState, useCallback } from 'react';
import authService from '../../../services/authService';

const normalizeStatus = (status) => {
  const raw = String(status || 'PENDING').trim().toUpperCase();
  if (raw === 'APPROVED' || raw === 'APPROVE' || raw === 'ACCEPT' || raw === 'ACCEPTED') {
    return 'APPROVED';
  }
  if (raw === 'REJECTED' || raw === 'REJECT') {
    return 'REJECTED';
  }
  return 'PENDING';
};

const transformCashoutRequest = (item) => ({
  id: item.id,
  usercode: item.usercode || '',
  diamonds: Number(item.diamonds) || 0,
  cashAmount: item.cashAmount != null ? Number(item.cashAmount) : null,
  profitOrLoss: item.profitOrLoss ?? null,
  remark: item.remark || '',
  status: normalizeStatus(item.status),
  transactionno: item.transactionno || '',
  role: item.role || 'HOST',
  redeemed_request_date: item.redeemed_request_date || null,
  redeemed_approve_reject_date: item.redeemed_approve_reject_date || null,
});

export const useCashoutRequests = (addToast) => {
  const [cashoutRequests, setCashoutRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    setError(null);
    try {
      const response = await authService.getPendingCashoutList();

      if (response.success) {
        const data = response.data || [];
        const validRequests = Array.isArray(data)
          ? data
              .filter((item) => item && typeof item === 'object' && item.id != null)
              .map(transformCashoutRequest)
          : [];
        setCashoutRequests(validRequests);
      } else {
        setError(response.error || 'Failed to load pending cashout requests');
        addToast(response.error || 'Failed to load pending cashout requests', 'error');
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('Failed to load pending cashout requests');
      addToast('Failed to load pending cashout requests', 'error');
    } finally {
      setLoadingRequests(false);
    }
  }, [addToast]);

  const updateCashoutStatus = useCallback(
    async (requestId, status) => {
      const request = cashoutRequests.find((r) => r.id === requestId);
      if (!request) {
        addToast('Request not found', 'error');
        return;
      }
      if (!request.transactionno) {
        addToast('Missing transaction number for this request', 'error');
        return;
      }

      setActionLoadingId(requestId);
      try {
        const result = await authService.approveRejectCashout({
          usercode: request.usercode,
          status,
          transactionno: request.transactionno,
          role: request.role || 'HOST',
        });

        if (result.success) {
          const nextStatus = status === 'APPROVE' ? 'APPROVED' : 'REJECTED';
          setCashoutRequests((prev) =>
            prev.map((r) => (r.id === requestId ? { ...r, status: nextStatus } : r)),
          );
          addToast(
            status === 'APPROVE' ? 'Cashout approved successfully' : 'Cashout rejected',
            status === 'APPROVE' ? 'success' : 'error',
          );
          await fetchPendingRequests();
        } else {
          addToast(result.error || `Failed to ${status.toLowerCase()} cashout`, 'error');
        }
      } catch (err) {
        console.error(`Error ${status} cashout:`, err);
        addToast(`Failed to ${status.toLowerCase()} cashout`, 'error');
      } finally {
        setActionLoadingId(null);
      }
    },
    [cashoutRequests, addToast, fetchPendingRequests],
  );

  const handleApprove = useCallback(
    (requestId) => updateCashoutStatus(requestId, 'APPROVE'),
    [updateCashoutStatus],
  );

  const handleReject = useCallback(
    (requestId) => updateCashoutStatus(requestId, 'REJECT'),
    [updateCashoutStatus],
  );

  return {
    cashoutRequests,
    setCashoutRequests,
    loadingRequests,
    actionLoadingId,
    error,
    fetchPendingRequests,
    handleApprove,
    handleReject,
  };
};
