import React, { useEffect, useState } from 'react';
import { Plus, Coins, User, History, Send, Minus, Search } from 'lucide-react';
import { ToastContainer, useToast } from './Toast';
import authService from '../services/authService';

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
  const [newOfferForm, setNewOfferForm] = useState({
    coins: '',
    originalPrice: '',
    discountedPrice: '',
    description: '',
  });

  const [newPlanForm, setNewPlanForm] = useState({
    coins: '',
    price: '',
    description: '',
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState('offers');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Handle offer form submission
  const handleOfferSubmit = (e) => {
    e.preventDefault();
    const newOffer = {
      id: offers.length + 1,
      ...newOfferForm,
      coins: parseInt(newOfferForm.coins),
      originalPrice: parseFloat(newOfferForm.originalPrice),
      discountedPrice: parseFloat(newOfferForm.discountedPrice),
    };
    setOffers([...offers, newOffer]);
    setShowOfferModal(false);
    setNewOfferForm({
      coins: '',
      originalPrice: '',
      discountedPrice: '',
      description: '',
    });
    addToast('success', 'New offer created successfully!');
  };

  // Handle plan form submission
  const handlePlanSubmit = (e) => {
    e.preventDefault();
    const newPlan = {
      id: rechargePlans.length + 1,
      ...newPlanForm,
      coins: parseInt(newPlanForm.coins),
      price: parseFloat(newPlanForm.price),
    };
    setRechargePlans([...rechargePlans, newPlan]);
    setShowPlanModal(false);
    setNewPlanForm({
      coins: '',
      price: '',
      description: '',
    });
    addToast('success', 'New plan created successfully!');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Coin Recharge Management</h1>
        <p className="text-gray-400">Manage all coin recharge related operations</p>
      </div>

      {/* Search and filter section */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by coins or price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg py-2 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#F72585]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('offers')}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'offers'
                ? 'text-[#F72585] border-b-2 border-[#F72585]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Special Offers
          </button>
          <button
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

      {/* Content section */}
      <div className="space-y-6">
        {/* Offers tab */}
        {activeTab === 'offers' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Special Offers</h2>
              <button
                onClick={() => setShowOfferModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] px-4 py-2 rounded-lg hover:glow-pink transition-all duration-300"
              >
                <Plus size={18} />
                <span>Create Offer</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700 hover:border-[#F72585] transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Coins className="text-[#F72585]" size={24} />
                    <span className="text-2xl font-bold">{offer.coins}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400">
                      Original Price:{' '}
                      <span className="line-through">${offer.originalPrice}</span>
                    </p>
                    <p className="text-[#F72585] font-semibold">
                      Special Price: ${offer.discountedPrice}
                    </p>
                  </div>
                  <button className="w-full mt-4 py-2 bg-[#F72585] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plans tab */}
        {activeTab === 'plans' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recharge Plans</h2>
              <button
                onClick={() => setShowPlanModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#F72585] to-[#7209B7] px-4 py-2 rounded-lg hover:glow-pink transition-all duration-300"
              >
                <Plus size={18} />
                <span>Create Plan</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rechargePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-[#1A1A1A] rounded-lg p-6 border border-gray-700 hover:border-[#F72585] transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Coins className="text-[#F72585]" size={24} />
                    <span className="text-2xl font-bold">{plan.coins}</span>
                  </div>
                  <p className="text-[#F72585] font-semibold">
                    Price: ${plan.price}
                  </p>
                  <button className="w-full mt-4 py-2 bg-[#F72585] text-white rounded-lg hover:bg-opacity-90 transition-colors">
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recharge History</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-[#1A1A1A] rounded-lg border border-gray-700 p-4">
                <p className="text-gray-400 text-sm">History not available yet</p>
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
              <Minus size={24} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Create New Offer</h3>
            <form onSubmit={handleOfferSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">Coins</label>
                  <input
                    type="number"
                    value={newOfferForm.coins}
                    onChange={(e) =>
                      setNewOfferForm({ ...newOfferForm, coins: e.target.value })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                    placeholder="Enter coins amount"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOfferForm.originalPrice}
                    onChange={(e) =>
                      setNewOfferForm({
                        ...newOfferForm,
                        originalPrice: e.target.value,
                      })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                    placeholder="Enter original price"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOfferForm.discountedPrice}
                    onChange={(e) =>
                      setNewOfferForm({
                        ...newOfferForm,
                        discountedPrice: e.target.value,
                      })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                    placeholder="Enter discounted price"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newOfferForm.description}
                    onChange={(e) =>
                      setNewOfferForm({
                        ...newOfferForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585] resize-none"
                    rows="3"
                    placeholder="Enter offer description"
                  />
                </div>
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
              <Minus size={24} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Create New Plan</h3>
            <form onSubmit={handlePlanSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">Coins</label>
                  <input
                    type="number"
                    value={newPlanForm.coins}
                    onChange={(e) =>
                      setNewPlanForm({ ...newPlanForm, coins: e.target.value })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                    placeholder="Enter coins amount"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPlanForm.price}
                    onChange={(e) =>
                      setNewPlanForm({ ...newPlanForm, price: e.target.value })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585]"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newPlanForm.description}
                    onChange={(e) =>
                      setNewPlanForm({
                        ...newPlanForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F72585] resize-none"
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg hover:glow-pink transition-all duration-300 font-medium mt-2"
              >
                Create Plan
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