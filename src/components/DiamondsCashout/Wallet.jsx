import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import useToast from '../../hooks/useToast';
import ToastList from '../ToastList';
import WalletSummary from './WalletSummary';
import DiamondCreditsTable from './DiamondCreditsTable';
import { useWalletData } from './hooks/useWalletData';
import { useCreditManagement } from './hooks/useCreditManagement';
import DiamondCreditsModal from './DiamondCreditsModal';

const Wallet = ({ onBack }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [componentError, setComponentError] = useState(null);

  useEffect(() => {
    setComponentError(null);
  }, []);

  const walletData = useWalletData(addToast);
  const creditMgmt = useCreditManagement(addToast, () => {
    walletData.fetchDiamondCredits();
    walletData.fetchWalletSummary();
  });

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
    walletData.fetchWalletSummary();
    walletData.fetchDiamondCredits();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-[#1A1A1A] text-gray-400 hover:text-white transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Admin Wallet</h1>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
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
            onDeleteClick={(creditId) => creditMgmt.handleDeleteCredit(creditId, () => {
              walletData.fetchDiamondCredits();
              walletData.fetchWalletSummary();
            })}
          />
        </div>
      </div>

      {/* Modals */}
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

export default Wallet;