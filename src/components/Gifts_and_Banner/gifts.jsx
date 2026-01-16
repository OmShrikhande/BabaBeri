import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, X, Upload, Loader2, CheckCircle, XCircle, Plus } from 'lucide-react';
import authService from '../../services/services';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-10 duration-300 ${
    type === 'success' 
      ? 'bg-[#0F172A]/90 border-emerald-500/50 text-emerald-400 backdrop-blur-md' 
      : type === 'info'
      ? 'bg-[#0F172A]/90 border-blue-500/50 text-blue-400 backdrop-blur-md'
      : 'bg-[#0F172A]/90 border-red-500/50 text-red-400 backdrop-blur-md'
  }`}>
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : type === 'info' ? <Gift className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
    <p className="text-sm font-bold tracking-wide">{message}</p>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const GiftCard = ({ gift }) => {
  const imageUrl = gift.file || gift.imageurl || gift.image || gift.imageUrl || '';
  const price = gift.price || 0;
  const coins = gift.coins || 0;
  
  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden hover:border-[#F72585]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F72585]/20 hover:-translate-y-1 group">
      <div className="relative h-40 bg-black/40 overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Gift" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%231A1A1A"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        {gift.status === 1 && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">
            Active
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Price</span>
            <span className="text-lg font-black text-white">₹{price.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Coins</span>
            <span className="text-sm font-bold text-[#F72585]">{coins.toLocaleString()}</span>
          </div>
          
          {gift.validity && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Validity</span>
              <span className="text-sm font-bold text-[#4CC9F0]">{gift.validity} days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GiftFormModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    validity: '',
    coins: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadedend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...formData, 
      file: selectedFile,
      price: 0,
      status: 1
    });
    setFormData({
      validity: '',
      coins: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Add New Gift</h2>
            <p className="text-gray-400 text-sm font-medium mt-1">Upload image and set gift details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Gift Image *
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="gift-image-upload"
                required
              />
              <label 
                htmlFor="gift-image-upload"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white hover:border-[#F72585] transition-all cursor-pointer flex items-center justify-between"
              >
                <span className={selectedFile ? 'text-white' : 'text-gray-500'}>
                  {selectedFile ? selectedFile.name : 'Choose a file'}
                </span>
                <Upload className="w-5 h-5 text-gray-600" />
              </label>
            </div>
            {previewUrl && (
              <div className="relative w-full h-48 bg-black/40 rounded-xl overflow-hidden border border-white/5">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Coins *
            </label>
            <input
              type="number"
              name="coins"
              value={formData.coins}
              onChange={handleChange}
              placeholder="1000"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all font-mono"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Validity (Days) *
            </label>
            <input
              type="number"
              name="validity"
              value={formData.validity}
              onChange={handleChange}
              placeholder="30"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all font-mono"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-black text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#F72585]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5" />
                  Create Gift
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GiftsPage = ({ onBack, onNavigateToBanners }) => {
  const [gifts, setGifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchGifts();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGifts = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getAllGifts();
      
      if (response.success) {
        const rawList = Array.isArray(response.data) ? response.data : [];
        
        const sortedGifts = rawList
          .filter(gift => gift.status === 1)
          .sort((a, b) => b.id - a.id);
        
        setGifts(sortedGifts);
      } else {
        throw new Error(response.error || 'Failed to fetch gifts');
      }
    } catch (error) {
      console.error('Error fetching gifts:', error);
      showNotification('Failed to load gifts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGift = async (data) => {
    setIsSubmitting(true);
    try {
      if (!data.file) {
        throw new Error('Please select an image file');
      }

      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('coins', data.coins);
      formData.append('price', data.price);
      formData.append('status', data.status);
      if (data.validity) {
        formData.append('validity', data.validity);
      }

      const response = await authService.saveGift(formData);
      
      if (response.success) {
        showNotification('Gift created successfully');
        setIsModalOpen(false);
        fetchGifts();
      } else {
        throw new Error(response.error || 'Failed to create gift');
      }
    } catch (error) {
      console.error('Error creating gift:', error);
      showNotification(error.message || 'Failed to create gift', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-400 hover:text-white transition-all border border-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Gifts</h1>
              <p className="text-gray-400 text-sm font-medium mt-1">Manage gift items and rewards</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToBanners}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#4361EE] text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#7209B7]/20"
            >
              Banners
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden animate-pulse">
                <div className="h-40 bg-black/40"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-white/5 mb-8 shadow-xl">
              <Gift className="w-16 h-16 text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">No Gifts Available</h3>
            <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto">Start by creating your first gift item to offer rewards to your users</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-black text-sm hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#F72585]/30"
            >
              <Plus className="w-5 h-5" />
              Create Gift
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {gifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))}
          </div>
        )}

        {gifts.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-8 right-8 p-5 rounded-2xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-2xl shadow-[#F72585]/40 hover:scale-110 active:scale-95 transition-all z-40 hover:shadow-[#F72585]/60"
            title="Add New Gift"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        <GiftFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateGift}
          isLoading={isSubmitting}
        />

        {toast && (
          <Toast 
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default GiftsPage;
