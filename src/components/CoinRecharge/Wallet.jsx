import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, AlertCircle, Check } from 'lucide-react';
import useToast from '../../hooks/useToast';
import ToastList from '../ToastList';
import WalletSummary from './WalletSummary';
import DiamondCreditsTable from '../DiamondsCashout/DiamondCreditsTable';
import { useWalletData } from '../DiamondsCashout/hooks/useWalletData';
import { useCreditManagement } from '../DiamondsCashout/hooks/useCreditManagement';
import DiamondCreditsModal from '../DiamondsCashout/DiamondCreditsModal';
import SuperAdminWallet from '../SuperAdminWallet';
import authService from '../../services/authService';

const Wallet = ({ onBack, currentUser }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [componentError, setComponentError] = useState(null);
  const [showAddCoinsModal, setShowAddCoinsModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef([]);

  useEffect(() => {
    setComponentError(null);
  }, []);

  const handleAddCoins = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amount > 100000) {
      setError('Maximum amount per transaction is 100,000 coins');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
      // Call superadmin self recharge API to initiate the process
      const rechargeResponse = await authService.superAdminSelfRecharge(amount);
      if (rechargeResponse.success) {
        setShowAddCoinsModal(false);
        setShowOtpModal(true);
        setOtp(['', '', '', '', '', '']); // Clear any previous OTP
        otpRefs.current[0]?.focus();
      } else {
        setError(rechargeResponse.error || 'Failed to initiate recharge');
      }
    } catch (error) {
      console.error('Error initiating recharge:', error);
      setError('Failed to initiate recharge. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Verify OTP with the API
      const otpResponse = await authService.verifySuperAdminRechargeOtp(otpString);
      if (!otpResponse.success) {
        setError(otpResponse.error || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        return;
      }

      // OTP verified successfully, proceed with adding coins
      const amount = parseFloat(addAmount);
      const response = await authService.saveDiamond({
        diamonds: amount,
        status: 'CREDIT'
      });

      if (response.success) {
        setSuccess(`Successfully added ${amount} coins to wallet`);
        setShowOtpModal(false);
        setAddAmount('');
        setOtp(['', '', '', '', '', '']);
        // Refresh wallet data
        walletData.fetchWalletSummary();
        addToast('Coins added successfully!', 'success');
      } else {
        setError(response.error || 'Failed to add coins');
      }
    } catch (error) {
      console.error('Error verifying OTP or adding coins:', error);
      setError('Failed to process transaction. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModals = () => {
    setShowAddCoinsModal(false);
    setShowOtpModal(false);
    setAddAmount('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
  };

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
            currentUser={currentUser}
            onAddCoins={() => setShowAddCoinsModal(true)}
          />
          <DiamondCreditsTable
            diamondCredits={walletData.diamondCredits}
            loadingCredits={walletData.loadingCredits}
            deletingCreditId={creditMgmt.deletingCreditId}
            formattedLastUpdated={formattedLastUpdated}
            onAddClick={creditMgmt.openCreateCreditModal}
            onEditClick={() => addToast('Editing is not currently supported', 'info')}
            onDeleteClick={() => addToast('Deleting is not currently supported', 'info')}
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

      {/* Add Coins Modal */}
      {showAddCoinsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Add Coins to Wallet</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddCoinsModal(false);
                  setAddAmount('');
                  setError('');
                }}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (Coins)
                </label>
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Enter amount to add"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:border-transparent transition-all duration-200"
                  min="1"
                  max="100000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum: 100,000 coins per transaction
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddCoinsModal(false);
                    setAddAmount('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCoins}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:from-[#F72585]/80 hover:to-[#7209B7]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending OTP...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A1A1A] border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Verify OTP</h3>
              </div>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-300 mb-2">
                  Enter the 6-digit OTP sent to your registered device
                </p>
                <p className="text-sm text-gray-400">
                  Adding <span className="text-yellow-400 font-semibold">{parseFloat(addAmount).toLocaleString()} coins</span> to wallet
                </p>
              </div>

              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-gray-800 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:border-transparent transition-all duration-200"
                    maxLength={1}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">{success}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModals}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isProcessing || otp.some(digit => !digit)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] hover:from-[#F72585]/80 hover:to-[#7209B7]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Verify OTP
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    // In a real implementation, this would resend OTP
                    setError('');
                    setOtp(['', '', '', '', '', '']);
                    otpRefs.current[0]?.focus();
                  }}
                  className="text-sm text-[#F72585] hover:text-[#F72585]/80 transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastList toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Wallet;