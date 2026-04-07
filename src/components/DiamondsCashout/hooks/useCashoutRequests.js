import { useState, useCallback } from 'react';
import authService from '../../../services/authService';

const transformCashoutRequest = (item) => ({
  id: item.id,
  user: {
    name: item.usercode || 'Unknown User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    time: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown time'
  },
  amount: item.diamonds || 0,
  status: item.status === 'PENDING' ? 'pending' : item.status?.toLowerCase() || 'pending',
  cashAmount: item.cashAmount || 0,
  usercode: item.usercode || 'unknown'
});

export const useCashoutRequests = (addToast) => {
  const [cashoutRequests, setCashoutRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState(null);

  const fetchPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    setError(null);
    try {
      const response = await authService.getPendingCashoutList();
      
      if (response.success) {
        const data = response.data || [];
        const validRequests = Array.isArray(data) ? data.filter(item => 
          item && typeof item === 'object' && item.id
        ).map(transformCashoutRequest) : [];
        setCashoutRequests(validRequests);
        addToast(`Loaded ${validRequests.length} pending requests`, 'success');
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

  const handleApprove = useCallback(async (requestId) => {
    try {
      const request = cashoutRequests.find(r => r.id === requestId);
      if (!request) {
        addToast('Request not found', 'error');
        return;
      }

      const result = await authService.saveDiamond({ 
        diamonds: request.amount, 
        status: "CREDIT",
        usercode: request.usercode || 'unknown'
      });
      
      if (result.success) {
        setCashoutRequests(prev =>
          prev.map(r =>
            r.id === requestId
              ? { ...r, status: 'approved' }
              : r
          )
        );
        addToast('Request approved successfully', 'success');

        await fetchPendingRequests();
      } else {
        addToast(result.error || 'Failed to approve request', 'error');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      addToast('Failed to approve request', 'error');
    }
  }, [cashoutRequests, addToast, fetchPendingRequests]);

  const handleReject = useCallback((requestId) => {
    setCashoutRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' }
          : request
      )
    );
    addToast('Request rejected', 'error');
  }, [addToast]);

  return {
    cashoutRequests,
    setCashoutRequests,
    loadingRequests,
    error,
    fetchPendingRequests,
    handleApprove,
    handleReject
  };
};
