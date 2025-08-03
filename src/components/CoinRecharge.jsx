import React, { useState } from 'react';
import { Plus, Coins, User, History, Send, Minus, Search } from 'lucide-react';
import { ToastContainer, useToast } from './Toast';

const CoinRecharge = () => {
  // Toast hook
  const { toasts, addToast, removeToast } = useToast();

  // State for offers
  const [offers, setOffers] = useState([
    {
      id: 1,
      coins: 1600,
      originalPrice: 1200.99,
      discountedPrice: 1000.99,
    },
    {
      id: 2,
      coins: 2000,
      originalPrice: 1300.99,
      discountedPrice: 900.99,
    },
    {
      id: 3,
      coins: 3000,
      originalPrice: 2000.99,
      discountedPrice: 1200.99,
    },
    {
      id: 4,
      coins: 10000,
      originalPrice: 1500.99,
      discountedPrice: 1200.99,
    },
  ]);

  // State for recharge plans
  const [rechargePlans, setRechargePlans] = useState([
    { id: 1, coins: 100, price: 199.00 },
    { id: 2, coins: 500, price: 599.00 },
    { id: 3, coins: 1000, price: 1200.99 },
    { id: 4, coins: 2000, price: 1200.99 },
    { id: 5, coins: 5000, price: 1200.99 },
    { id: 6, coins: 10000, price: 1200.99 },
  ]);

  // Modal states
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Form states
  const [offerForm, setOfferForm] = useState({
    coins: '',
    originalPrice: '',
    discountedPrice: '',
  });

  const [planForm, setPlanForm] = useState({
    coins: '',
    price: '',
  });

  // Offline recharge states
  const [userId, setUserId] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [revokeAmount, setRevokeAmount] = useState('');

  // Mock user data
  const mockUserData = {
    '123456': {
      name: 'Mohan Manohar',
      id: '123123',
      avatar: 'https://via.placeholder.com/60',
      currentCoins: 500,
      rechargeHistory: [
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
        { amount: 699, coins: 500, date: '3:24 PM, 24 Jun 2025' },
      ],
    },
  };

  // Toast notification function
  const showToast = (message, type = 'success') => {
    addToast(message, type);
  };

  // Handle offer form submission
  const handleOfferSubmit = (e) => {
    e.preventDefault();
    const newOffer = {
      id: Date.now(),
      coins: parseInt(offerForm.coins),
      originalPrice: parseFloat(offerForm.originalPrice),
      discountedPrice: parseFloat(offerForm.discountedPrice),
    };
    setOffers([...offers, newOffer]);
    setOfferForm({ coins: '', originalPrice: '', discountedPrice: '' });
    setShowOfferModal(false);
    showToast('Offer added successfully');
  };

  // Handle plan form submission
  const handlePlanSubmit = (e) => {
    e.preventDefault();
    const newPlan = {
      id: Date.now(),
      coins: parseInt(planForm.coins),
      price: parseFloat(planForm.price),
    };
    setRechargePlans([...rechargePlans, newPlan]);
    setPlanForm({ coins: '', price: '' });
    setShowPlanModal(false);
    showToast('Recharge plan added successfully');
  };

  // Handle user ID search
  const handleUserSearch = () => {
    if (mockUserData[userId]) {
      setUserDetails(mockUserData[userId]);
    } else {
      setUserDetails(null);
      showToast('User not found', 'error');
    }
  };

  // Handle coin transfer
  const handleTransfer = () => {
    if (userDetails && transferAmount) {
      showToast(`Successfully transferred ${transferAmount} coins to ${userDetails.name}`);
      setTransferAmount('');
      // Update user details
      setUserDetails({
        ...userDetails,
        currentCoins: userDetails.currentCoins + parseInt(transferAmount),
      });
    }
  };

  // Handle coin revoke
  const handleRevoke = () => {
    if (userDetails && revokeAmount) {
      showToast(`Successfully revoked ${revokeAmount} coins from ${userDetails.name}`);
      setRevokeAmount('');
      // Update user details
      setUserDetails({
        ...userDetails,
        currentCoins: userDetails.currentCoins - parseInt(revokeAmount),
      });
    }
  };

  return (
    <div className="p-6 space-y-6 main-content-scroll">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-bold text-white">Coin Recharge</h1>
      </div>

      {/* Online Recharge Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Online Recharge</h2>
        
        {/* Offers */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Offers</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-700 hover:border-[#F72585] transition-all duration-300"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-yellow-400 font-bold text-sm">●{offer.coins}</div>
                  <div className="space-y-1">
                    <div className="text-white font-bold text-sm">₹{offer.discountedPrice}</div>
                    <div className="text-gray-400 text-xs line-through">₹{offer.originalPrice}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add More Card */}
            <div
              onClick={() => setShowOfferModal(true)}
              className="bg-[#1A1A1A] rounded-lg p-4 border-2 border-dashed border-gray-600 hover:border-[#F72585] transition-all duration-300 cursor-pointer flex items-center justify-center"
            >
              <div className="text-center space-y-2">
                <Plus className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-gray-400 text-xs">Add More</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recharge Plans */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Recharge Plans</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {rechargePlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-700 hover:border-[#7209B7] transition-all duration-300"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-yellow-400 font-bold text-sm">●{plan.coins}</div>
                  <div className="text-white font-bold text-sm">₹{plan.price}</div>
                </div>
              </div>
            ))}
            
            {/* Add More Card */}
            <div
              onClick={() => setShowPlanModal(true)}
              className="bg-[#1A1A1A] rounded-lg p-4 border-2 border-dashed border-gray-600 hover:border-[#7209B7] transition-all duration-300 cursor-pointer flex items-center justify-center"
            >
              <div className="text-center space-y-2">
                <Plus className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-gray-400 text-xs">Add More</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Recharge Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Offline Recharge</h2>
        
        {/* User Search */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">User Id</h3>
          <div className="relative max-w-md">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="#123456"
              className="w-full px-4 py-3 pr-12 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] transition-colors"
            />
            <button
              onClick={handleUserSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-full flex items-center justify-center hover:glow-pink transition-all duration-300"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* User Details */}
        {userDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Info & Actions */}
            <div className="space-y-4">
              <div className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={userDetails.avatar}
                    alt={userDetails.name}
                    className="w-12 h-12 rounded-full border-2 border-[#F72585]"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{userDetails.name}</h4>
                    <p className="text-gray-400 text-sm">{userDetails.id}</p>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{userDetails.currentCoins}</span>
                  </div>
                </div>
              </div>

              {/* Transfer Coins */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Transfer Coins</h4>
                <input
                  type="text"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter coins amount"
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#4CC9F0] transition-colors"
                />
                <button
                  onClick={handleTransfer}
                  className="w-full py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg hover:glow-pink transition-all duration-300 font-medium"
                >
                  Transfer
                </button>
              </div>

              {/* Revoke Coins */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Revoke Coins</h4>
                <input
                  type="text"
                  value={revokeAmount}
                  onChange={(e) => setRevokeAmount(e.target.value)}
                  placeholder="Enter coins amount"
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                />
                <button
                  onClick={handleRevoke}
                  className="w-full py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg hover:glow-pink transition-all duration-300 font-medium"
                >
                  Revoke
                </button>
              </div>
            </div>

            {/* Recharge History */}
            <div className="space-y-4">
              <h4 className="text-white font-medium">Recharge History</h4>
              <div className="bg-[#1A1A1A] rounded-lg border border-gray-700">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-700 text-sm font-medium text-gray-300">
                  <div>₹ Amount</div>
                  <div>🪙 Coins</div>
                  <div>📅 Date & Time</div>
                </div>
                
                {/* Table Body */}
                <div className="max-h-64 overflow-y-auto">
                  {userDetails.rechargeHistory.map((record, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b border-gray-700 last:border-b-0 text-sm">
                      <div className="text-white">₹ {record.amount}</div>
                      <div className="text-yellow-400">●{record.coins}</div>
                      <div className="text-gray-400">{record.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-sm border border-gray-700 relative">
            <button
              onClick={() => setShowOfferModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold text-white mb-6">Add Offer</h3>
            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Coins Amount</label>
                <input
                  type="number"
                  value={offerForm.coins}
                  onChange={(e) => setOfferForm({ ...offerForm, coins: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] transition-colors"
                  placeholder="Enter coins amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Original Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerForm.originalPrice}
                  onChange={(e) => setOfferForm({ ...offerForm, originalPrice: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] transition-colors"
                  placeholder="Enter original price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Discounted Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerForm.discountedPrice}
                  onChange={(e) => setOfferForm({ ...offerForm, discountedPrice: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585] transition-colors"
                  placeholder="Enter discounted price"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg hover:glow-pink transition-all duration-300 font-medium mt-6"
              >
                Create Offer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-[#1A1A1A] rounded-lg p-6 w-full max-w-sm border border-gray-700 relative">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold text-white mb-6">Add Plan</h3>
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Coins Amount</label>
                <input
                  type="number"
                  value={planForm.coins}
                  onChange={(e) => setPlanForm({ ...planForm, coins: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7209B7] transition-colors"
                  placeholder="Enter coins amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#121212] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7209B7] transition-colors"
                  placeholder="Enter price amount"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg hover:glow-pink transition-all duration-300 font-medium mt-6"
              >
                Create Offer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default CoinRecharge;