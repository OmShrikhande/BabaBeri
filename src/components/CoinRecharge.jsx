import React, { useCallback, useState } from 'react';
import API_CONFIG from '../config/api';
import useToast from '../hooks/useToast';
import ToastList from './ToastList';

const COINS_PLUS_URL = (() => {
  const baseUrl = API_CONFIG.BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? '';
  return `${baseUrl}${API_CONFIG.ENDPOINTS.COINS_PLUS}`;
})();
import CoinRechargeHeader from './CoinRecharge/CoinRechargeHeader';
import HostRechargeSection from './CoinRecharge/HostRechargeSection';
// import OffersTab from './CoinRecharge/Tabs/OffersTab';
import PlansTab from './CoinRecharge/Tabs/PlansTab';
import HistoryTab from './CoinRecharge/Tabs/HistoryTab';
import OfferModal from './CoinRecharge/Modals/OfferModal';
import PlanModal from './CoinRecharge/Modals/PlanModal';
import {
  useHostData,
  useOfferManagement,
  usePlanManagement,
  useRechargeHistory
} from './CoinRecharge/hooks';

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

const CoinRecharge = () => {
  const { toasts, addToast, removeToast } = useToast();

  const {
    state: hostState,
    actions: hostActions
  } = useHostData({ addToast });

  const {
    state: offerState,
    actions: offerActions
  } = useOfferManagement({ initialOffers: INITIAL_OFFERS, addToast });

  const {
    state: planState,
    actions: planActions
  } = usePlanManagement({ initialPlans: INITIAL_PLANS, addToast });

  const {
    history,
    isLoadingHistory,
    loadHistory
  } = useRechargeHistory({ headers: hostState.headers, addToast });
  const [activeTab, setActiveTab] = useState('offers');


  const handleRecharge = useCallback(async () => {
    if (!hostState.selectedHost || !hostState.rechargeAmount) {
      addToast('error', 'Select host and enter coin amount');
      return;
    }

    hostActions.setIsRecharging(true);
    try {
      const url = `${COINS_PLUS_URL}?id=${hostState.selectedHost.id}&coins=${hostState.rechargeAmount}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: hostState.headers
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Recharge failed');
      }

      addToast('success', 'Coins recharged successfully!');
      hostActions.setRechargeAmount('');
      hostActions.setSelectedHost(null);
    } catch (error) {
      console.error('Recharge coins error:', error);
      addToast('error', 'Recharge failed');
    } finally {
      hostActions.setIsRecharging(false);
    }
  }, [hostState.selectedHost, hostState.rechargeAmount, hostState.headers, hostActions, addToast]);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <CoinRechargeHeader />

      <HostRechargeSection
        hosts={hostState.hosts}
        filteredHosts={hostState.filteredHosts}
        selectedHost={hostState.selectedHost}
        rechargeAmount={hostState.rechargeAmount}
        hostSearch={hostState.hostSearch}
        isSearching={hostState.isSearching}
        isRecharging={hostState.isRecharging}
        onSearchChange={(event) => hostActions.setHostSearch(event.target.value)}
        onSelectHost={(event) => {
          if (event.option) {
            hostActions.setSelectedHost(event.option);
            return;
          }
          const selected = hostState.filteredHosts.find((host) => String(host.id) === event.target.value);
          hostActions.setSelectedHost(selected || null);
        }}
        onAmountChange={(event) => hostActions.setRechargeAmount(event.target.value)}
        onRecharge={handleRecharge}
      />

      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-700">
          
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'plans'
                ? 'text-[#F72585] border-b-2 border-[#F72585]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Recharge Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'history'
                ? 'text-[#F72585] border-b-2 border-[#F72585]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Recharge History
          </button>
        </div>
      </div>

      <div className="space-y-6">
      

        {activeTab === 'plans' && (
          <PlansTab
            plans={planState.rechargePlans}
            onOpenModal={() => planActions.setShowPlanModal(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            history={history}
            loadHistory={loadHistory}
            isLoading={isLoadingHistory}
          />
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

      <ToastList toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default CoinRecharge;