import React, { useState, useEffect, useMemo } from 'react';
import useToast from '../../hooks/useToast';
import ToastList from '../ToastList';
import ExchangeRateBar from './ExchangeRateBar';
import WalletSummary from './WalletSummary';
import DiamondCreditsModal from './DiamondCreditsModal';
import DiamondCreditsTable from './DiamondCreditsTable';
import UserSearchSection from './UserSearchSection';
import UserProfileCard from './UserProfileCard';
import CashoutHistorySection from './CashoutHistorySection';
import CashoutRequestsSection from './CashoutRequestsSection';
import { useWalletData } from './hooks/useWalletData';
import { useCreditManagement } from './hooks/useCreditManagement';
import { useCashoutRequests } from './hooks/useCashoutRequests';
import { useUserSearch } from './hooks/useUserSearch';

const DiamondsCashout = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [componentError, setComponentError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Monthly');

  useEffect(() => {
    setComponentError(null);
  }, []);

  const walletData = useWalletData(addToast);
  const creditMgmt = useCreditManagement(addToast, () => {
    walletData.fetchDiamondCredits();
    walletData.fetchWalletSummary();
  });
  const cashoutReqs = useCashoutRequests(addToast);
  const userSearch = useUserSearch(addToast);

  const formattedLastUpdated = useMemo(() => {
    if (!walletData.walletSummary.lastUpdated) {
      return 'Not available';
    }
    const date = new Date(walletData.walletSummary.lastUpdated);
    if (Number.isNaN(date.getTime())) {
      return walletData.walletSummary.lastUpdated;
    }
    return date.toLocaleString();
  }, [walletData.walletSummary.lastUpdated]);

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

  useEffect(() => {
    console.log('Auth status:', require('../../services/authService').default.isAuthenticated());
  }, []);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Diamonds Wallet (Cashout)</h1>
      </div>

      <ExchangeRateBar />

      <WalletSummary
        walletSummary={walletData.walletSummary}
        loadingWallet={walletData.loadingWallet}
        onAddCredit={creditMgmt.openCreateCreditModal}
      />

      <DiamondCreditsTable
        diamondCredits={walletData.diamondCredits}
        loadingCredits={walletData.loadingCredits}
        deletingCreditId={creditMgmt.deletingCreditId}
        formattedLastUpdated={formattedLastUpdated}
        onAddClick={creditMgmt.openCreateCreditModal}
        onEditClick={creditMgmt.openEditCreditModal}
        onDeleteClick={handleDeleteCredit}
      />

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
          <UserProfileCard
            selectedUser={userSearch.selectedUser}
            loadingUser={userSearch.loadingUser}
          />

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

      <ToastList toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DiamondsCashout;
