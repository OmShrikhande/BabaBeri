import React, { useCallback, useState } from 'react';
import API_CONFIG from '../config/api';
import useToast from '../hooks/useToast';
import ToastList from './ToastList';
import CoinRechargeHeader from './CoinRecharge/CoinRechargeHeader';
import HostRechargeSection from './CoinRecharge/HostRechargeSection';
import PlansTab from './CoinRecharge/Tabs/PlansTab';
import HistoryTab from './CoinRecharge/Tabs/HistoryTab';
import OfferModal from './CoinRecharge/Modals/OfferModal';
import PlanModal from './CoinRecharge/Modals/PlanModal';
import authService from '../services/authService';
import { MinusCircle, X } from 'lucide-react';
import {
  useUserData,
  useOfferManagement,
  usePlanManagement,
  useRechargeHistory
} from './CoinRecharge/hooks';

const RECHARGE_URL = (() => {
  const baseUrl = API_CONFIG.BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? '';
  return `${baseUrl}${API_CONFIG.ENDPOINTS.RECHARGE_MANUAL}`;
})();

const INITIAL_OFFERS = [
  { id: 1, coins: 1600, originalPrice: 1200.99, discountedPrice: 1000.99 },
  { id: 2, coins: 2000, originalPrice: 1300.99, discountedPrice: 900.99 },
  { id: 3, coins: 3000, originalPrice: 2000.99, discountedPrice: 1200.99 },
  { id: 4, coins: 10000, originalPrice: 1500.99, discountedPrice: 1200.99 }
];

const INITIAL_PLANS = [
  { id: 1, coins: 100, price: 199.0 },
  { id: 2, coins: 500, price: 599.0 },
  { id: 3, coins: 1000, price: 1200.99 },
  { id: 4, coins: 2000, price: 1200.99 },
  { id: 5, coins: 5000, price: 1200.99 },
  { id: 6, coins: 10000, price: 1200.99 }
];

// Deduct Coins Modal
const DeductCoinsModal = ({ isOpen, onClose, addToast }) => {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId.trim() || !amount || parseInt(amount, 10) <= 0) {
      addToast('error', 'Please enter a valid user ID and coin amount.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.deductCoinsFromHost(userId.trim(), parseInt(amount, 10));
      if (res.success) {
        addToast('success', `Successfully deducted ${amount} coins from user ${userId}.`);
        setUserId('');
        setAmount('');
        onClose();
      } else {
        addToast('error', res.error || 'Failed to deduct coins.');
      }
    } catch {
      addToast('error', 'Failed to deduct coins.');
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
            <div className="w-9 h-9 rounded-lg bg-red-900/40 border border-red-800 flex items-center justify-center">
              <MinusCircle className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Deduct Coins</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-400 text-sm">Deduct coins from a user's wallet. This action cannot be undone.</p>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">User ID</label>
            <input
              type="text" value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="Enter user ID..."
              className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Coin Amount</label>
            <input
              type="number" min="1" value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount to deduct..."
              className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-800">
          <button onClick={onClose} disabled={loading} className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg py-2 border border-gray-700 text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !userId || !amount}
            className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-800 rounded-lg py-2 font-medium text-sm disabled:opacity-50 transition-colors">
            {loading ? 'Deducting...' : 'Deduct Coins'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CoinRecharge = ({ currentUser, onNavigate }) => {
  const { toasts, addToast, removeToast } = useToast();
  const [deductModalOpen, setDeductModalOpen] = useState(false);

  const { state: userState, actions: userActions } = useUserData({ addToast });
  const { state: offerState, actions: offerActions } = useOfferManagement({ initialOffers: INITIAL_OFFERS, addToast });
  const { state: planState, actions: planActions } = usePlanManagement({ initialPlans: INITIAL_PLANS, addToast });
  const { history, isLoadingHistory, loadHistory } = useRechargeHistory({ headers: userState.headers, addToast });
  const [activeTab, setActiveTab] = useState('offers');

  const handleRecharge = useCallback(async () => {
    if (!userState.selectedUser || !userState.rechargeAmount) {
      addToast('error', 'Select user and enter coin amount');
      return;
    }
    userActions.setIsRecharging(true);
    try {
      const url = `${RECHARGE_URL}?code=${userState.selectedUser.code}&coins=${parseInt(userState.rechargeAmount, 10)}`;
      const response = await fetch(url, { method: 'PUT', headers: userState.headers });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Recharge failed');
      }
      addToast('success', 'Coins recharged successfully!');
      userActions.setRechargeAmount('');
      userActions.setSelectedUser(null);
    } catch (error) {
      console.error('Recharge coins error:', error);
      addToast('error', 'Recharge failed');
    } finally {
      userActions.setIsRecharging(false);
    }
  }, [userState.selectedUser, userState.rechargeAmount, userState.headers, userActions, addToast]);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div />
        <button
          onClick={() => setDeductModalOpen(true)}
          className="text-red-400 hover:text-red-300 border border-red-800 bg-red-900/20 hover:bg-red-900/40 rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors"
        >
          <MinusCircle className="w-4 h-4" />
          Deduct Coins
        </button>
      </div>

      <CoinRechargeHeader
        currentUser={currentUser}
        onNavigateToWallet={() => onNavigate('coin-recharge-wallet')}
      />

      <HostRechargeSection
        users={userState.users}
        filteredUsers={userState.filteredUsers}
        selectedUser={userState.selectedUser}
        rechargeAmount={userState.rechargeAmount}
        userSearch={userState.userSearch}
        isSearching={userState.isSearching}
        isRecharging={userState.isRecharging}
        onSearchChange={(event) => userActions.setUserSearch(event.target.value)}
        onSelectUser={(event) => {
          if (event.option) { userActions.setSelectedUser(event.option); return; }
          const selected = userState.filteredUsers.find((user) => String(user.id) === event.target.value);
          userActions.setSelectedUser(selected || null);
        }}
        onAmountChange={(event) => userActions.setRechargeAmount(event.target.value)}
        onRecharge={handleRecharge}
      />

      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-700">
          <button type="button" onClick={() => setActiveTab('plans')}
            className={`py-2 px-4 focus:outline-none ${activeTab === 'plans' ? 'text-[#F72585] border-b-2 border-[#F72585]' : 'text-gray-400 hover:text-white'}`}>
            Recharge Plans
          </button>
          <button type="button" onClick={() => setActiveTab('history')}
            className={`py-2 px-4 focus:outline-none ${activeTab === 'history' ? 'text-[#F72585] border-b-2 border-[#F72585]' : 'text-gray-400 hover:text-white'}`}>
            Recharge History
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'plans' && (
          <PlansTab plans={planState.rechargePlans} onOpenModal={() => planActions.setShowPlanModal(true)} />
        )}
        {activeTab === 'history' && (
          <HistoryTab history={history} loadHistory={loadHistory} isLoading={isLoadingHistory} />
        )}
      </div>

      <OfferModal
        isOpen={offerState.showOfferModal}
        form={offerState.newOfferForm}
        onClose={() => offerActions.setShowOfferModal(false)}
        onChange={offerActions.setNewOfferForm}
        onSubmit={offerActions.handleOfferSubmit}
      />

      <PlanModal
        isOpen={planState.showPlanModal}
        form={planState.newPlanForm}
        onClose={() => planActions.setShowPlanModal(false)}
        onChange={planActions.setNewPlanForm}
        onSubmit={planActions.handlePlanSubmit}
      />

      <DeductCoinsModal
        isOpen={deductModalOpen}
        onClose={() => setDeductModalOpen(false)}
        addToast={addToast}
      />

      <ToastList toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default CoinRecharge;
