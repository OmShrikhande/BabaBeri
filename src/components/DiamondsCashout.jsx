import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, Wallet, PlusCircle, XCircle, CircleDollarSign, Clock, ClipboardList, Edit2, Trash2 } from 'lucide-react';
import { ToastContainer, useToast } from './Toast';
import CustomDropdown from './CustomDropdown';
import authService from '../services/authService';
import {
  filterOptions
} from '../data/diamondsDemoData';

const INITIAL_CREDIT_FORM = {
  usercode: '',
  diamonds: '',
  amount: '',
  status: 'CREDIT',
  transactionId: '',
  paymentMethod: 'MANUAL',
  notes: ''
};

const CREDIT_STATUS_OPTIONS = [
  { value: 'CREDIT', label: 'Credit' },
  { value: 'DEBIT', label: 'Debit' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' }
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'MANUAL', label: 'Manual Entry' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CASH', label: 'Cash' },
  { value: 'OTHER', label: 'Other' }
];

const DiamondsCashout = () => {
  // Toast hook
  const { toasts, addToast, removeToast } = useToast();

  // Error boundary for component
  const [componentError, setComponentError] = useState(null);

  // Reset error when component mounts
  useEffect(() => {
    setComponentError(null);
  }, []);

  // State management
  const [searchUserId, setSearchUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Monthly');
  const [cashoutRequests, setCashoutRequests] = useState([]);
  const [cashoutHistory, setCashoutHistory] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [error, setError] = useState(null);

  // Admin wallet data
  const [walletSummary, setWalletSummary] = useState({
    totalCredited: 0,
    totalDebited: 0,
    currentBalance: 0,
    lastUpdated: null
  });
  const [diamondCredits, setDiamondCredits] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [creditForm, setCreditForm] = useState(INITIAL_CREDIT_FORM);
  const [editingCreditId, setEditingCreditId] = useState(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [submittingCredit, setSubmittingCredit] = useState(false);
  const [deletingCreditId, setDeletingCreditId] = useState(null);

  const resetCreditForm = () => {
    setCreditForm(INITIAL_CREDIT_FORM);
    setEditingCreditId(null);
  };

  const handleCreditFieldChange = (field, value) => {
    setCreditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const optimisticUpdateCredit = (updatedRecord) => {
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
  };

  const removeCreditFromList = (creditId) => {
    setDiamondCredits(prev => prev.filter(record => record.id !== creditId));
  };

  const fetchWalletSummary = async () => {
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
  };

  const fetchDiamondCredits = async () => {
    setLoadingCredits(true);
    try {
      const response = await authService.getDiamondCredits?.();
      if (response?.success) {
        setDiamondCredits(Array.isArray(response.data) ? response.data : []);
      } else if (response?.error) {
        addToast(response.error, 'error');
      }
    } catch (err) {
      console.error('Error fetching diamond credits:', err);
      addToast('Failed to load diamond credits', 'error');
    } finally {
      setLoadingCredits(false);
    }
  };

  // Handle user search
  const handleUserSearch = async () => {
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
  };

  // Handle cashout request approval
  const handleApprove = async (requestId) => {
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

        // Update wallet data optimistically
        if (result.data?.record) {
          optimisticUpdateCredit(result.data.record);
        }
        if (result.summary) {
          setWalletSummary(result.summary);
        }

        // Optionally refresh the pending requests
        const response = await authService.getAllPendingCashout();
        if (response.success) {
          const data = response.data || [];
          const validRequests = Array.isArray(data) ? data.filter(item => 
            item && typeof item === 'object' && item.id
          ).map(item => ({
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
          })) : [];
          setCashoutRequests(validRequests);
        }
      } else {
        addToast(result.error || 'Failed to approve request', 'error');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      addToast('Failed to approve request', 'error');
    }
  };

  // Handle cashout request rejection
  const handleReject = (requestId) => {
    setCashoutRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' }
          : request
      )
    );
    addToast('Request rejected', 'error');
  };

  const openCreateCreditModal = () => {
    resetCreditForm();
    setCreditModalOpen(true);
  };

  const openEditCreditModal = (credit) => {
    setCreditForm({
      usercode: credit.usercode || '',
      diamonds: credit.diamonds?.toString() || '',
      amount: credit.amount?.toString() || '',
      status: credit.status || 'CREDIT',
      transactionId: credit.transactionId || '',
      paymentMethod: credit.paymentMethod || 'MANUAL',
      notes: credit.notes || ''
    });
    setEditingCreditId(credit.id);
    setCreditModalOpen(true);
  };

  const closeCreditModal = () => {
    setCreditModalOpen(false);
    resetCreditForm();
  };

  // Handle filter selection
  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    addToast(`Filter changed to ${filter}`, 'success');
  };

  // Handle keyboard events for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUserSearch();
    }
  };

  // Fetch pending cashout requests on component mount
  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoadingRequests(true);
      setError(null);
      try {
        console.log('Fetching pending cashout requests...');
        const response = await authService.getAllPendingCashout();
        console.log('Pending cashout response:', response);
        
        if (response.success) {
          const data = response.data || [];
          // Validate and filter the data, transform to expected format
          const validRequests = Array.isArray(data) ? data.filter(item => 
            item && typeof item === 'object' && item.id
          ).map(item => ({
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
          })) : [];
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
    };
    fetchPendingRequests();
    fetchWalletSummary();
    fetchDiamondCredits();
  }, []);

  // Fetch cashout history when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          console.log('Fetching cashout history for user:', selectedUser.username);
          const response = await authService.getCashoutHistory(selectedUser.username);
          console.log('Cashout history response:', response);
          
        if (response.success) {
          const data = response.data || [];
          // Validate and filter the data, transform to expected format
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
          console.error('Cashout history error:', response.error);
        }
        } catch (err) {
          console.error('Error fetching cashout history:', err);
          addToast('Failed to load cashout history', 'error');
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [selectedUser]);

  // Check authentication status on component mount
  useEffect(() => {
    console.log('Auth status:', authService.isAuthenticated());
    console.log('User type:', authService.getUserType());
    console.log('User info:', authService.getUserInfo());
  }, []);

  const walletCards = useMemo(() => {
    return [
      {
        id: 'current-balance',
        label: 'Current Balance',
        value: walletSummary.currentBalance,
        icon: Wallet,
        accent: 'from-[#F72585] to-[#7209B7]'
      },
      {
        id: 'total-credited',
        label: 'Total Credited',
        value: walletSummary.totalCredited,
        icon: PlusCircle,
        accent: 'from-[#4CC9F0] to-[#4361EE]'
      },
      {
        id: 'total-debited',
        label: 'Total Debited',
        value: walletSummary.totalDebited,
        icon: XCircle,
        accent: 'from-[#FF7E67] to-[#F36F6F]'
      }
    ];
  }, [walletSummary]);

  const formattedLastUpdated = useMemo(() => {
    if (!walletSummary.lastUpdated) {
      return 'Not available';
    }
    const date = new Date(walletSummary.lastUpdated);
    if (Number.isNaN(date.getTime())) {
      return walletSummary.lastUpdated;
    }
    return date.toLocaleString();
  }, [walletSummary.lastUpdated]);

  const validateCreditPayload = () => {
    const requiredFields = ['usercode', 'diamonds', 'status'];
    const missing = requiredFields.filter(field => {
      const value = creditForm[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length) {
      addToast(`Please fill: ${missing.join(', ')}`, 'error');
      return false;
    }

    if (Number.isNaN(Number(creditForm.diamonds))) {
      addToast('Diamonds amount must be a number', 'error');
      return false;
    }

    if (creditForm.amount && Number.isNaN(Number(creditForm.amount))) {
      addToast('Cash amount must be a number', 'error');
      return false;
    }

    return true;
  };

  const handleSubmitCredit = async (event) => {
    event?.preventDefault?.();
    if (submittingCredit) {
      return;
    }

    if (!validateCreditPayload()) {
      return;
    }

    setSubmittingCredit(true);

    const payload = {
      usercode: creditForm.usercode.trim(),
      diamonds: Number(creditForm.diamonds),
      status: creditForm.status,
      amount: creditForm.amount ? Number(creditForm.amount) : undefined,
      transactionId: creditForm.transactionId?.trim() || undefined,
      paymentMethod: creditForm.paymentMethod || undefined,
      notes: creditForm.notes?.trim() || undefined,
      id: editingCreditId || undefined
    };

    try {
      const response = editingCreditId
        ? await authService.updateDiamondCredit?.(editingCreditId, payload)
        : await authService.saveDiamond(payload);

      if (response?.success) {
        addToast(response.message || 'Diamond credit saved successfully', 'success');

        if (response.data?.record) {
          optimisticUpdateCredit(response.data.record);
        } else if (payload.id) {
          optimisticUpdateCredit({ ...payload, id: payload.id });
        }

        if (response.summary) {
          setWalletSummary(response.summary);
        } else {
          fetchWalletSummary();
        }

        closeCreditModal();
      } else {
        addToast(response?.error || 'Failed to save diamond credit', 'error');
      }
    } catch (error) {
      console.error('Error saving diamond credit:', error);
      addToast(error.message || 'Failed to save diamond credit', 'error');
    } finally {
      setSubmittingCredit(false);
    }
  };

  const handleDeleteCredit = async (creditId) => {
    if (!creditId) {
      return;
    }
    setDeletingCreditId(creditId);
    try {
      const response = await authService.deleteDiamondCredit?.(creditId);
      if (response?.success) {
        removeCreditFromList(creditId);
        if (response.summary) {
          setWalletSummary(response.summary);
        } else {
          fetchWalletSummary();
        }
        addToast('Credit record deleted', 'success');
      } else {
        addToast(response?.error || 'Failed to delete credit record', 'error');
      }
    } catch (error) {
      console.error('Error deleting credit record:', error);
      addToast(error.message || 'Failed to delete credit record', 'error');
    } finally {
      setDeletingCreditId(null);
    }
  };

  const creditStatusBadgeClass = (status = '') => {
    const normalized = status.toUpperCase();
    switch (normalized) {
      case 'CREDIT':
        return 'bg-green-900/20 text-green-400 border border-green-500/30';
      case 'DEBIT':
        return 'bg-red-900/20 text-red-400 border border-red-500/30';
      case 'PENDING':
        return 'bg-yellow-900/20 text-yellow-300 border border-yellow-500/30';
      default:
        return 'bg-gray-800 text-gray-300 border border-gray-600/40';
    }
  };

  const CRUDTableEmptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <ClipboardList className="w-10 h-10 mb-3" />
      <p className="text-sm font-medium">No credit records yet</p>
      <p className="text-xs">Use the "Add Credit" button to create a new entry</p>
    </div>
  ), []);

  const renderWalletCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {walletCards.map(card => (
        <div
          key={card.id}
          className="relative overflow-hidden bg-[#121212] rounded-xl border border-gray-700 p-5 shadow-lg hover:border-gray-600 transition-colors"
        >
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${card.accent}`} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-white">
                {loadingWallet ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : (
                  card.value?.toLocaleString?.() ?? card.value ?? 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center">
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCreditModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${creditModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${creditModalOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeCreditModal} />
      <div className={`relative bg-[#1A1A1A] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-200 ${creditModalOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {editingCreditId ? 'Edit Diamond Credit' : 'Add Diamond Credit'}
            </h3>
            <p className="text-xs text-gray-400">
              Capture complete transaction details for auditing and reporting
            </p>
          </div>
          <button
            onClick={closeCreditModal}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitCredit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto coin-scroll">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">User Code</label>
              <input
                type="text"
                value={creditForm.usercode}
                onChange={(e) => handleCreditFieldChange('usercode', e.target.value)}
                placeholder="Enter user code"
                className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Diamonds</label>
              <input
                type="number"
                min="0"
                value={creditForm.diamonds}
                onChange={(e) => handleCreditFieldChange('diamonds', e.target.value)}
                placeholder="Enter diamond amount"
                className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cash Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={creditForm.amount}
                onChange={(e) => handleCreditFieldChange('amount', e.target.value)}
                placeholder="Optional cash equivalent"
                className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Transaction ID</label>
              <input
                type="text"
                value={creditForm.transactionId}
                onChange={(e) => handleCreditFieldChange('transactionId', e.target.value)}
                placeholder="Optional transaction reference"
                className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
              <select
                value={creditForm.paymentMethod}
                onChange={(e) => handleCreditFieldChange('paymentMethod', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#F72585]"
              >
                {PAYMENT_METHOD_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#121212] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={creditForm.status}
                onChange={(e) => handleCreditFieldChange('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#F72585]"
                required
              >
                {CREDIT_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#121212] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              rows="3"
              value={creditForm.notes}
              onChange={(e) => handleCreditFieldChange('notes', e.target.value)}
              placeholder="Optional additional information or remarks"
              className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F72585] resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeCreditModal}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCredit}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-sm font-semibold hover:glow-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              {submittingCredit ? 'Saving...' : editingCreditId ? 'Update Credit' : 'Add Credit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderCreditTable = () => (
    <div className="bg-[#121212] rounded-lg border border-gray-700">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <CircleDollarSign className="w-5 h-5 text-[#F72585]" />
            <span>Diamond Credits</span>
          </h3>
          <p className="text-xs text-gray-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last updated: {formattedLastUpdated}</span>
          </p>
        </div>
        <button
          onClick={openCreateCreditModal}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-sm font-semibold hover:glow-pink transition-all duration-300"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Credit
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#1A1A1A] text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-medium">User Code</th>
              <th className="px-6 py-3 text-left font-medium">Diamonds</th>
              <th className="px-6 py-3 text-left font-medium">Amount (₹)</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">Transaction ID</th>
              <th className="px-6 py-3 text-left font-medium">Payment Method</th>
              <th className="px-6 py-3 text-left font-medium">Created At</th>
              <th className="px-6 py-3 text-left font-medium">Notes</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-300">
            {loadingCredits ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                  Loading diamond credits...
                </td>
              </tr>
            ) : diamondCredits.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-10">
                  {CRUDTableEmptyState}
                </td>
              </tr>
            ) : (
              diamondCredits.map((credit) => {
                const createdAt = credit.createdAt ? new Date(credit.createdAt).toLocaleString() : 'N/A';
                return (
                  <tr key={credit.id} className="hover:bg-[#1D1D1D] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{credit.usercode || 'N/A'}</td>
                    <td className="px-6 py-4 text-white">{credit.diamonds?.toLocaleString?.() ?? credit.diamonds ?? 0}</td>
                    <td className="px-6 py-4">
                      {credit.amount ? `₹${Number(credit.amount).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${creditStatusBadgeClass(credit.status)}`}>
                        {credit.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {credit.transactionId || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 uppercase">
                      {credit.paymentMethod || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {createdAt}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {credit.notes || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => openEditCreditModal(credit)}
                          className="p-2 rounded-full bg-[#1F1F1F] text-gray-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCredit(credit.id)}
                          className="p-2 rounded-full bg-[#1F1F1F] text-gray-400 hover:text-red-400"
                          disabled={deletingCreditId === credit.id}
                          title="Delete"
                        >
                          {deletingCreditId === credit.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Show error if component crashed
  if (componentError) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Component Error</h2>
          <p className="text-red-300 mb-4">{componentError}</p>
          <button
            onClick={() => {
              setComponentError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Component
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 main-content-scroll">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Diamonds Wallet (Cashout)</h1>
      </div>

      {/* Exchange Rate Bar */}
      <div className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-4 border border-gray-700">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">●</span>
            </div>
            <span className="text-white font-medium">1 Coins</span>
          </div>
          
          <div className="text-gray-400 text-xl font-bold">=</div>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">♦</span>
            </div>
            <span className="text-white font-medium">1 Diamonds</span>
          </div>
        </div>

        <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center glow-pink">
          <span className="text-white text-lg">⚡</span>
        </div>
      </div>

      {/* Admin Wallet Overview */}
      <div className="space-y-4">
        <div className="bg-[#1A1A1A] rounded-lg border border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Admin Diamonds Wallet</h2>
              <p className="text-sm text-gray-400">Monitor and manage all diamond credits in real-time</p>
            </div>
            <button
              onClick={openCreateCreditModal}
              className="hidden md:inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-sm font-semibold hover:glow-pink transition-all duration-300"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Credit
            </button>
          </div>
          {renderWalletCards()}
        </div>
        <div className="bg-[#1A1A1A] rounded-lg border border-gray-700 p-5">
          {renderCreditTable()}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-end justify-between space-x-4">
        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-gray-300 mb-2">Search User</label>
          <div className="relative">
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter user ID to search"
              className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] transition-colors"
            />
            <button
              onClick={handleUserSearch}
              disabled={loadingUser}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center hover:glow-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingUser ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Bell className="w-6 h-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
          
          {/* Filter Dropdown */}
          <CustomDropdown
            options={filterOptions}
            value={selectedFilter}
            onChange={handleFilterSelect}
            className="w-32"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Section - User Details and History (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* User Profile Card */}
          {loadingUser ? (
            <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#F72585] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-400">Loading user...</span>
              </div>
            </div>
          ) : selectedUser ? (
            <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-16 h-16 rounded-full border-2 border-[#F72585] object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#1A1A1A]"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedUser.username}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-12">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">●</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{selectedUser.totalCashout}</span>
                    </div>
                    <p className="text-gray-400 text-sm">Total Cashout</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">♦</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{selectedUser.totalDiamonds}</span>
                    </div>
                    <p className="text-gray-400 text-sm">Total Diamonds</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Search for a User</h3>
                <p className="text-gray-400">Enter a user ID above to view their cashout details and history</p>
              </div>
            </div>
          )}

          {/* Cashout History */}
          {selectedUser && (
            <div className="bg-[#1A1A1A] rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Cashout History</h3>
              </div>
              
              <div className="p-6">
                {/* Table Header */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-medium text-gray-300 pb-2 border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">♦</span>
                    </div>
                    <span>Diamonds</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📅</span>
                    <span>Date & Time</span>
                  </div>
                </div>
                
                {/* Table Body */}
                <div className="space-y-3 max-h-80 overflow-y-auto coin-scroll">
                  {loadingHistory ? (
                    <div className="text-center py-4 text-gray-400">Loading history...</div>
                  ) : cashoutHistory.length > 0 ? (
                    cashoutHistory.map((record, index) => {
                      // Validate record data structure
                      if (!record || typeof record !== 'object') {
                        console.warn('Invalid history record:', record);
                        return null;
                      }
                      
                      const diamonds = record.diamonds || 0;
                      const date = record.date || 'Unknown date';
                      
                      return (
                        <div
                          key={index}
                          className="grid grid-cols-2 gap-4 py-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/30 transition-colors duration-200 rounded-lg px-2"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                              <span className="text-black text-xs font-bold">♦</span>
                            </div>
                            <span className="text-white font-medium">{diamonds}</span>
                          </div>
                          <div className="text-gray-400 text-sm">{date}</div>
                        </div>
                      );
                    }).filter(Boolean) // Remove null entries
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      {selectedUser ? 'No cashout history found for this user' : 'Search for a user to view cashout history'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Cashout Requests (1/4 width) */}
        <div className="lg:col-span-1">
          <div className="bg-[#1A1A1A] rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-white">Cashout Requests</h3>
                <div className="w-6 h-6 bg-[#F72585] rounded-full flex items-center justify-center glow-pink">
                  <span className="text-white text-xs font-bold">{cashoutRequests.filter(r => r.status === 'pending').length}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto coin-scroll">
              {loadingRequests ? (
                <div className="text-center py-4 text-gray-400">Loading cashout requests...</div>
              ) : cashoutRequests.length > 0 ? (
                cashoutRequests.map((request) => {
                  // Validate request data structure
                  if (!request || typeof request !== 'object') {
                    console.warn('Invalid request object:', request);
                    return null;
                  }
                  
                  // Ensure user object exists with fallbacks
                  const user = request.user || {};
                  const avatar = user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                  const name = user.name || 'Unknown User';
                  const time = user.time || 'Unknown time';
                  const amount = request.amount || 0;
                  const status = request.status || 'pending';
                  
                  return (
                    <div key={request.id || Math.random()} className="space-y-3 p-3 bg-[#121212] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={avatar}
                            alt={name}
                            className="w-10 h-10 rounded-full border border-gray-600 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-[#121212]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">{name}</h4>
                          <p className="text-gray-400 text-xs">{time}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                            <span className="text-black text-xs font-bold">♦</span>
                          </div>
                          <span className="text-white font-bold text-sm">{amount.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 py-2 px-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg text-xs font-medium hover:glow-pink transition-all duration-300 transform hover:scale-105"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors transform hover:scale-105"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {status === 'approved' && (
                        <div className="text-center py-2 px-3 bg-green-900/20 text-green-400 rounded-lg text-xs font-medium border border-green-500/30">
                          Approved
                        </div>
                      )}
                      
                      {status === 'rejected' && (
                        <div className="text-center py-2 px-3 bg-red-900/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/30">
                          Rejected
                        </div>
                      )}
                    </div>
                  );
                }).filter(Boolean) // Remove null entries
              ) : (
                <div className="text-center py-4 text-gray-400">
                  {error ? `Error: ${error}` : 'No pending cashout requests found'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DiamondsCashout;