import { useState, useCallback } from 'react';
import authService from '../../../services/authService';

export const useUserSearch = (addToast) => {
  const [searchUserId, setSearchUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [cashoutHistory, setCashoutHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleUserSearch = useCallback(async () => {
    if (!searchUserId.trim()) {
      addToast('Please enter a user ID', 'error');
      return;
    }

    try {
      setLoadingUser(true);
      const response = await authService.getUserById(searchUserId);
      if (response.success) {
        const userData = response.data;
        setSelectedUser({
          name: userData.name || userData.username || searchUserId,
          username: userData.username || searchUserId,
          avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          totalCashout: userData.totalCashout || '0',
          totalDiamonds: userData.totalDiamonds || '0'
        });
        addToast(`User ${userData.name || searchUserId} loaded successfully`, 'success');
      } else {
        setSelectedUser(null);
        addToast(response.error || 'User not found', 'error');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setSelectedUser(null);
      addToast('Failed to load user', 'error');
    } finally {
      setLoadingUser(false);
    }
  }, [searchUserId, addToast]);

  const fetchCashoutHistory = useCallback(async (username) => {
    setLoadingHistory(true);
    try {
      const response = await authService.getCashoutHistory(username);
      
      if (response.success) {
        const data = response.data || [];
        const validHistory = Array.isArray(data) ? data.filter(item => 
          item && typeof item === 'object'
        ).map(item => ({
          diamonds: item.diamonds || 0,
          date: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown date',
          status: item.status || 'unknown',
          usercode: item.usercode || 'unknown',
          cashAmount: item.cashAmount || 0
        })) : [];
        setCashoutHistory(validHistory);
        addToast(`Loaded ${validHistory.length} history records`, 'success');
      } else {
        addToast(response.error || 'Failed to load cashout history', 'error');
      }
    } catch (err) {
      console.error('Error fetching cashout history:', err);
      addToast('Failed to load cashout history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  }, [addToast]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleUserSearch();
    }
  }, [handleUserSearch]);

  return {
    searchUserId,
    setSearchUserId,
    selectedUser,
    setSelectedUser,
    loadingUser,
    cashoutHistory,
    setCashoutHistory,
    loadingHistory,
    handleUserSearch,
    fetchCashoutHistory,
    handleKeyPress
  };
};
