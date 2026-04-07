import React, { useState, useEffect } from 'react';
import useToast from '../../hooks/useToast';
import ToastList from '../ToastList';
import ExchangeRateBar from './ExchangeRateBar';
import DiamondCreditsModal from './DiamondCreditsModal';
import UserSearchSection from './UserSearchSection';
import UserProfileCard from './UserProfileCard';
import CashoutHistorySection from './CashoutHistorySection';
import CashoutRequestsSection from './CashoutRequestsSection';
import { useWalletData } from './hooks/useWalletData';
import { useCreditManagement } from './hooks/useCreditManagement';
import { useCashoutRequests } from './hooks/useCashoutRequests';
import { useUserSearch } from './hooks/useUserSearch';
import authService from '../../services/authService';
import { ArrowLeftRight, X, Wallet } from 'lucide-react';

const ConvertDiamondsModal = ({ isOpen, onClose, onSuccess, addToast }) => {
  const [diamonds, setDiamonds] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const amount = parseInt(diamonds, 10);
    if (isNaN(amount) || amount <= 0) {
      addToast('Please enter a valid diamond amount.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.convertDiamondsToCoins(amount);
      if (res.success) {
        addToast('Successfully converted diamonds to coins.', 'success');
        setDiamonds('');
        onSuccess && onSuccess();
        onClose();
      } else {
        addToast(res.error || 'Failed to convert diamonds.', 'error');
      }
    } catch {
      addToast('Failed to convert diamonds.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] rounded-2xl border border-gray-800 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#F72585] to-[#7209B7] flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">Convert Diamonds to Coins</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-400 text-sm">Enter the number of diamonds to convert to coins for your super admin wallet.</p>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Diamond Amount</label>
            <input
              type="number" min="1" value={diamonds}
              onChange={e => setDiamonds(e.target.value)}
              placeholder="Enter diamond amount..."
              className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button onClick={onClose} disabled={loading} className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg py-2 border border-gray-700 text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !diamonds}
            className="flex-1 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg py-2 font-medium text-sm disabled:opacity-50">
            {loading ? 'Converting...' : 'Convert'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DiamondsCashout = ({ onNavigateToWallet, onNavigateToDiamondsWallet }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [componentError, setComponentError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Monthly');
  const [convertModalOpen, setConvertModalOpen] = useState(false);

  useEffect(() => { setComponentError(null); }, []);

  const walletData = useWalletData(addToast);
  const creditMgmt = useCreditManagement(addToast, () => {
    walletData.fetchDiamondCredits();
    walletData.fetchWalletSummary();
  });
  const cashoutReqs = useCashoutRequests(addToast);
  const userSearch = useUserSearch(addToast);

  useEffect(() => {
    cashoutReqs.fetchPendingRequests();
    walletData.fetchWalletSummary();
    walletData.fetchDiamondCredits();
  }, []);

  useEffect(() => {
    if (userSearch.selectedUser) {
      userSearch.fetchCashoutHistory(userSearch.selectedUser.username);
    }
  }, [userSearch.selectedUser]);

  const handleDeleteCredit = (creditId) => {
    creditMgmt.handleDeleteCredit(creditId, () => {
      walletData.removeCreditFromList(creditId);
      walletData.fetchWalletSummary();
    });
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    addToast(`Filter changed to ${filter}`, 'success');
  };

  if (componentError) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Component Error</h2>
          <p className="text-red-300 mb-4">{componentError}</p>
          <button onClick={() => { setComponentError(null); window.location.reload(); }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Reload Component
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 main-content-scroll">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Diamonds Cashout</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToDiamondsWallet && onNavigateToDiamondsWallet()}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#4361EE] to-[#4CC9F0] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </button>
          <button
            onClick={() => setConvertModalOpen(true)}
            className="bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg px-4 py-2 font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Convert to Coins
          </button>
        </div>
      </div>

      <ExchangeRateBar />

      <UserSearchSection
        searchUserId={userSearch.searchUserId}
        loadingUser={userSearch.loadingUser}
        selectedFilter={selectedFilter}
        onSearchChange={userSearch.setSearchUserId}
        onSearch={userSearch.handleUserSearch}
        onKeyPress={userSearch.handleKeyPress}
        onFilterSelect={handleFilterSelect}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <UserProfileCard selectedUser={userSearch.selectedUser} loadingUser={userSearch.loadingUser} />
          <CashoutHistorySection
            selectedUser={userSearch.selectedUser}
            cashoutHistory={userSearch.cashoutHistory}
            loadingHistory={userSearch.loadingHistory}
          />
        </div>
        <div className="lg:col-span-1">
          <CashoutRequestsSection
            cashoutRequests={cashoutReqs.cashoutRequests}
            loadingRequests={cashoutReqs.loadingRequests}
            error={cashoutReqs.error}
            onApprove={cashoutReqs.handleApprove}
            onReject={cashoutReqs.handleReject}
          />
        </div>
      </div>

      <DiamondCreditsModal
        isOpen={creditMgmt.creditModalOpen}
        isEditing={!!creditMgmt.editingCreditId}
        creditForm={creditMgmt.creditForm}
        submittingCredit={creditMgmt.submittingCredit}
        onFieldChange={creditMgmt.handleCreditFieldChange}
        onSubmit={creditMgmt.handleSubmitCredit}
        onClose={creditMgmt.closeCreditModal}
      />

      <ConvertDiamondsModal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        onSuccess={() => { walletData.fetchWalletSummary(); walletData.fetchDiamondCredits(); }}
        addToast={addToast}
      />

      <ToastList toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DiamondsCashout;
