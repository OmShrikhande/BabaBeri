import { useEffect, useMemo, useState, useCallback } from 'react';
import API_CONFIG, { DEFAULT_HEADERS, TOKEN_CONFIG } from '../../config/api';
import authService from '../../services/services';

// Shared utilities -----------------------------------------------------------
const getStoredToken = () => sessionStorage.getItem(TOKEN_CONFIG.STORAGE_KEY) || localStorage.getItem(TOKEN_CONFIG.STORAGE_KEY);
const getStoredUserInfo = () => {
  try {
    const userInfo = sessionStorage.getItem(TOKEN_CONFIG.USER_INFO_KEY) || localStorage.getItem(TOKEN_CONFIG.USER_INFO_KEY) || '{}';
    return JSON.parse(userInfo);
  } catch (error) {
    console.error('Failed to parse user info from storage:', error);
    return {};
  }
};

const deriveUserCode = (userInfo) => (
  userInfo.userCode || userInfo.UserCode || userInfo.code || ''
);

const buildAuthHeaders = (token) => (
  token
    ? { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` }
    : DEFAULT_HEADERS
);

// Users ---------------------------------------------------------------------
export const useUserData = ({ addToast }) => {
  const [users, setUsers] = useState([]);
  const [isRecharging, setIsRecharging] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [token, setToken] = useState(() => getStoredToken());

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(getStoredToken());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const headers = useMemo(() => buildAuthHeaders(token), [token]);
  const userInfo = useMemo(() => getStoredUserInfo(), []);
  const userCode = deriveUserCode(userInfo);

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        const result = await authService.getAllUsers();

        if (result.success && isMounted) {
          setUsers(result.data);
        } else {
          console.error('Fetch users error:', result.error);
          if (isMounted) {
            addToast('error', result.error || 'Error fetching users');
          }
        }
      } catch (error) {
        console.error('Fetch users error:', error);
        if (isMounted) {
          addToast('error', 'Error fetching users');
        }
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [addToast]);

  useEffect(() => {
    if (!userSearch) return undefined;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await authService.getAllUsers();

        if (result.success) {
          // Filter users based on search
          const searchLower = userSearch.toLowerCase();
          const filtered = result.data.filter((user) => (
            String(user.id).includes(searchLower) ||
            (user.name && user.name.toLowerCase().includes(searchLower)) ||
            (user.username && user.username.toLowerCase().includes(searchLower)) ||
            (user.code && user.code.toLowerCase().includes(searchLower))
          ));
          setUsers(filtered);
        } else {
          console.error('User search error:', result.error);
          addToast('error', result.error || 'User search failed');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('User search error:', error);
          addToast('error', 'User search failed');
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [userSearch, addToast]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;

    const searchLower = userSearch.toLowerCase();
    return users.filter((user) => (
      String(user.id).includes(searchLower) ||
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.code && user.code.toLowerCase().includes(searchLower))
    ));
  }, [users, userSearch]);

  return {
    state: {
      users,
      filteredUsers,
      selectedUser,
      rechargeAmount,
      isRecharging,
      userSearch,
      isSearching,
      headers,
      userCode
    },
    actions: {
      setUsers,
      setSelectedUser,
      setRechargeAmount,
      setIsRecharging,
      setUserSearch,
      setIsSearching
    }
  };
};

// Offers --------------------------------------------------------------------
export const useOfferManagement = ({ initialOffers, addToast }) => {
  const [offers, setOffers] = useState(initialOffers);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [newOfferForm, setNewOfferForm] = useState({
    coins: '',
    originalPrice: '',
    discountedPrice: '',
    description: ''
  });

  const handleOfferSubmit = (event) => {
    event.preventDefault();

    const newOffer = {
      id: offers.length + 1,
      ...newOfferForm,
      coins: parseInt(newOfferForm.coins, 10),
      originalPrice: parseFloat(newOfferForm.originalPrice),
      discountedPrice: parseFloat(newOfferForm.discountedPrice)
    };

    setOffers([...offers, newOffer]);
    setNewOfferForm({ coins: '', originalPrice: '', discountedPrice: '', description: '' });
    addToast('success', 'New offer created successfully!');
  };

  return {
    state: {
      offers,
      showOfferModal,
      newOfferForm
    },
    actions: {
      setOffers,
      setShowOfferModal,
      setNewOfferForm,
      handleOfferSubmit
    }
  };
};

// Plans ---------------------------------------------------------------------
export const usePlanManagement = ({ initialPlans, addToast }) => {
  const [rechargePlans, setRechargePlans] = useState(initialPlans);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({ coins: '', price: '', description: '' });

  const handlePlanSubmit = (event) => {
    event.preventDefault();

    const newPlan = {
      id: rechargePlans.length + 1,
      ...newPlanForm,
      coins: parseInt(newPlanForm.coins, 10),
      price: parseFloat(newPlanForm.price)
    };

    setRechargePlans([...rechargePlans, newPlan]);
    setShowPlanModal(false);
    setNewPlanForm({ coins: '', price: '', description: '' });
    addToast('success', 'New plan created successfully!');
  };

  return {
    state: {
      rechargePlans,
      showPlanModal,
      newPlanForm
    },
    actions: {
      setRechargePlans,
      setShowPlanModal,
      setNewPlanForm,
      handlePlanSubmit
    }
  };
};

// History -------------------------------------------------------------------
export const useRechargeHistory = ({ headers, addToast }) => {
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = useCallback(async ({ userCode, signal }) => {
    if (!userCode) {
      addToast?.('error', 'User code is required to load history');
      return [];
    }

    const query = new URLSearchParams({ userCode }).toString();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_RECHARGE_HISTORY}?${query}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('You are not authorized to view recharge history');
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Failed to fetch history');
      }

      const data = await response.json();
      const records = Array.isArray(data)
        ? data
        : data.history || data.records || data.items || [];

      return records;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch history error:', error);
        addToast?.('error', error.message || 'Could not load history');
      }
      throw error;
    }
  }, [headers, addToast]);

  const loadHistory = useCallback(async ({ userCode }) => {
    const controller = new AbortController();
    setIsLoadingHistory(true);
    try {
      const records = await fetchHistory({ userCode, signal: controller.signal });
      setHistory(records);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setHistory([]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
    return () => controller.abort();
  }, [fetchHistory]);

  return {
    history,
    isLoadingHistory,
    loadHistory
  };
};

// Diamond Analytics -------------------------------------------------------
export const useDiamondAnalytics = ({ addToast }) => {
  const [diamondData, setDiamondData] = useState({
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [isLoadingDiamonds, setIsLoadingDiamonds] = useState(false);
  const [token, setToken] = useState(() => getStoredToken());

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(getStoredToken());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const headers = useMemo(() => buildAuthHeaders(token), [token]);

  const fetchDiamondRangeData = useCallback(async (fromDate, toDate) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/range?from=${fromDate}&to=${toDate}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized to fetch diamond analytics');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Fetch diamond range data error:', error);
      throw error;
    }
  }, [token, headers]);

  const fetchDiamondDailyData = useCallback(async (date) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/date/${date}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized to fetch diamond analytics');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      return {
        date,
        entries: Array.isArray(data) ? data : []
      };
    } catch (error) {
      console.error(`Fetch diamond daily data error for ${date}:`, error);
      return {
        date,
        entries: []
      };
    }
  }, [token, headers]);

  const loadDiamondData = useCallback(async (period, fromDate, toDate, weeklyDates) => {
    setIsLoadingDiamonds(true);
    try {
      let rawData = [];

      if (period === 'weekly' && weeklyDates && Array.isArray(weeklyDates)) {
        const dailyDataPromises = weeklyDates.map(date => fetchDiamondDailyData(date));
        rawData = await Promise.all(dailyDataPromises);
      } else {
        rawData = await fetchDiamondRangeData(fromDate, toDate);
      }

      setDiamondData(prev => ({
        ...prev,
        [period]: rawData
      }));
    } catch (error) {
      console.error('Load diamond data error:', error);
      addToast?.('error', `Failed to load ${period} diamond analytics`);
      setDiamondData(prev => ({
        ...prev,
        [period]: []
      }));
    } finally {
      setIsLoadingDiamonds(false);
    }
  }, [fetchDiamondRangeData, fetchDiamondDailyData, addToast]);

  return {
    diamondData,
    isLoadingDiamonds,
    loadDiamondData
  };
};