import { useEffect, useMemo, useState, useCallback } from 'react';
import API_CONFIG, { DEFAULT_HEADERS, TOKEN_CONFIG } from '../../config/api';

// Shared utilities -----------------------------------------------------------
const getStoredToken = () => localStorage.getItem(TOKEN_CONFIG.STORAGE_KEY);
const getStoredUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_CONFIG.USER_INFO_KEY) || '{}');
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

// Hosts ---------------------------------------------------------------------
export const useHostData = ({ addToast }) => {
  const [hosts, setHosts] = useState([]);
  const [isRecharging, setIsRecharging] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [hostSearch, setHostSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const token = useMemo(() => getStoredToken(), []);
  const headers = useMemo(() => buildAuthHeaders(token), [token]);
  const userInfo = useMemo(() => getStoredUserInfo(), []);
  const userCode = deriveUserCode(userInfo);

  useEffect(() => {
    if (!userCode) {
      addToast('error', 'Missing UserCode for active host lookup');
      return;
    }

    let isMounted = true;

    async function fetchHosts() {
      try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ACTIVE_HOSTS}?${new URLSearchParams({ UserCode: userCode }).toString()}`;
        const response = await fetch(url, { method: 'PUT', headers });
        if (!response.ok) {
          throw new Error(`Failed: ${response.status}`);
        }
        const data = await response.json();
        const rawHosts = Array.isArray(data) ? data : data.hosts || [];
        const normalized = rawHosts.map((host) => ({
          ...host,
          id:
            host.id ||
            host._id ||
            host.hostId ||
            host.userId ||
            String(host.id || host._id || host.hostId || host.userId || '')
        }));
        if (isMounted) {
          setHosts(normalized);
        }
      } catch (error) {
        console.error('Fetch hosts error:', error);
        if (isMounted) {
          addToast('error', 'Error fetching hosts');
        }
      }
    }

    fetchHosts();

    return () => {
      isMounted = false;
    };
  }, [addToast, headers, userCode]);

  useEffect(() => {
    if (!hostSearch) return undefined;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `${API_CONFIG.BASE_URL}/auth/user/getallhost?role=HOST${hostSearch ? `&search=${encodeURIComponent(hostSearch)}` : ''}`;
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Search hosts failed');
        }

        const data = await response.json();
        const raw = Array.isArray(data) ? data : data.hosts || data.users || [];
        const normalized = raw.map((host) => ({
          ...host,
          id:
            host.id ||
            host._id ||
            host.hostId ||
            host.userId ||
            String(host.id || host._id || host.hostId || host.userId || '')
        }));

        setHosts(normalized);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Host search error:', error);
          addToast('error', 'Host search failed');
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [headers, hostSearch, addToast]);

  
  const filteredHosts = useMemo(() => {
    const searchLower = hostSearch.toLowerCase();
    return hosts.filter((host) => (
      String(host.id).includes(searchLower) ||
      (host.name && host.name.toLowerCase().includes(searchLower)) ||
      (host.username && host.username.toLowerCase().includes(searchLower))
    ));
  }, [hosts, hostSearch]);

  return {
    state: {
      hosts,
      filteredHosts,
      selectedHost,
      rechargeAmount,
      isRecharging,
      hostSearch,
      isSearching,
      headers,
      userCode
    },
    actions: {
      setHosts,
      setSelectedHost,
      setRechargeAmount,
      setIsRecharging,
      setHostSearch,
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