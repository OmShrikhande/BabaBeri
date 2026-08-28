import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, X, Upload, Loader2, CheckCircle, XCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import authService from '../../services/services';
import { ApiResponsePanel } from './sharedPanels';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-10 duration-300 ${type === 'success'
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

const GiftCard = ({ gift, onEdit, onDelete, isDeleting }) => {
  const imageUrl = gift.file || gift.imageurl || gift.image || gift.imageUrl || '';
  const price = gift.price ?? '—';
  const coins = gift.coins ?? 0;

  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden hover:border-[#F72585]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F72585]/20 hover:-translate-y-1 group">
      <div className="relative h-40 bg-black/40 overflow-hidden">
        {imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
          <video src={imageUrl} className="w-full h-full object-cover" muted loop autoPlay />
        ) : (
          <img
            src={imageUrl}
            alt="Gift"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%231A1A1A"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        )}
        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 text-white text-[10px] font-mono">
          #{gift.id}
        </div>
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
            <span className="text-sm font-bold text-white">{price === '—' ? '—' : `₹${Number(price).toLocaleString()}`}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Coins</span>
            <span className="text-sm font-bold text-[#F72585]">{Number(coins).toLocaleString()}</span>
          </div>
          {gift.validity != null && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Validity</span>
              <span className="text-sm font-bold text-[#4CC9F0]">{gift.validity} days</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => onEdit(gift)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-[#4361EE]/20 text-gray-300 hover:text-white text-xs font-bold transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(gift)}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const GiftFormModal = ({ isOpen, onClose, onSubmit, isLoading, mode = 'create', initialGift = null }) => {
  const isEdit = mode === 'edit';
  const [formData, setFormData] = useState({ validity: '', coins: '', price: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (isOpen && isEdit && initialGift) {
      setFormData({
        validity: initialGift.validity ?? '',
        coins: initialGift.coins ?? '',
        price: initialGift.price ?? '',
      });
      setPreviewUrl(initialGift.file || '');
      setSelectedFile(null);
    }
    if (isOpen && !isEdit) {
      setFormData({ validity: '', coins: '', price: '' });
      setSelectedFile(null);
      setPreviewUrl('');
    }
  }, [isOpen, isEdit, initialGift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialGift?.id,
      file: selectedFile,
      price: formData.price || 0,
      status: initialGift?.status ?? 1,
    });
    if (!isEdit) {
      setFormData({ validity: '', coins: '', price: '' });
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isEdit ? `Edit Gift #${initialGift?.id}` : 'Add New Gift'}
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-1">
              {isEdit ? 'POST /auth/superadmin/updategift' : 'Upload image and set gift details'}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Gift Image {isEdit ? '(optional)' : '*'}
            </label>
            <input type="file" onChange={handleFileChange} className="hidden" id="gift-image-upload" required={!isEdit} />
            <label htmlFor="gift-image-upload" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white hover:border-[#F72585] transition-all cursor-pointer flex items-center justify-between">
              <span className={selectedFile ? 'text-white' : 'text-gray-500'}>
                {selectedFile ? selectedFile.name : 'Choose a file'}
              </span>
              <Upload className="w-5 h-5 text-gray-600" />
            </label>
            {previewUrl && (
              <div className="relative w-full h-48 bg-black/40 rounded-xl overflow-hidden border border-white/5">
                {previewUrl.match(/\.(mp4|webm|ogg)$/i) || (selectedFile && selectedFile.type?.startsWith('video/')) ? (
                  <video src={previewUrl} className="w-full h-full object-contain" controls />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Coins *</label>
            <input type="number" name="coins" value={formData.coins} onChange={handleChange} placeholder="500" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all font-mono" required />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Price</label>
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="49.0" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all font-mono" />
          </div>

          {!isEdit && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Validity (Days)</label>
              <input type="number" name="validity" value={formData.validity} onChange={handleChange} placeholder="30" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all font-mono" />
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-50">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Gift className="w-5 h-5" />{isEdit ? 'Update Gift' : 'Create Gift'}</>}
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
  const [modalMode, setModalMode] = useState('create');
  const [editingGift, setEditingGift] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [apiDebug, setApiDebug] = useState(null);

  useEffect(() => {
    fetchGifts();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const normalizeGiftList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (data && typeof data === 'object' && data.id) return [data];
    return [];
  };

  const fetchGifts = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getAllGifts();
      setApiDebug({ endpoint: 'GET /auth/superadmin/getallgifts', response });

      if (response.success) {
        const sortedGifts = normalizeGiftList(response.data).sort((a, b) => b.id - a.id);
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
      if (!data.file) throw new Error('Please select an image file');

      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('coins', String(data.coins));
      formData.append('price', String(data.price ?? 0));
      formData.append('status', String(data.status ?? 1));
      if (data.validity) formData.append('validity', String(data.validity));

      const response = await authService.saveGift(formData);
      setApiDebug({ endpoint: 'POST /auth/superadmin/savegifts', response });

      if (response.success) {
        showNotification('Gift created successfully');
        setIsModalOpen(false);
        fetchGifts();
      } else {
        throw new Error(response.error || 'Failed to create gift');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to create gift', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGift = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id', String(data.id));
      formData.append('coins', String(data.coins));
      formData.append('price', String(data.price ?? 0));
      if (data.file) formData.append('file', data.file);

      const response = await authService.updateGift(formData);
      setApiDebug({ endpoint: 'POST /auth/superadmin/updategift', request: { id: data.id, coins: data.coins, price: data.price }, response });

      if (response.success) {
        showNotification('Gift updated successfully');
        setIsModalOpen(false);
        setEditingGift(null);
        fetchGifts();
      } else {
        throw new Error(response.error || 'Failed to update gift');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update gift', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGift = async (gift) => {
    if (!window.confirm(`Delete gift #${gift.id}?`)) return;
    setDeletingId(gift.id);
    try {
      const response = await authService.deleteGift(gift.id);
      setApiDebug({ endpoint: `DELETE /auth/superadmin/deletegift?id=${gift.id}`, response });

      if (response.success) {
        showNotification('Gift deleted successfully');
        fetchGifts();
      } else {
        throw new Error(response.error || 'Failed to delete gift');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to delete gift', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingGift(null);
    setIsModalOpen(true);
  };

  const openEditModal = (gift) => {
    setModalMode('edit');
    setEditingGift(gift);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#121212] p-4 sm:p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-400 hover:text-white transition-all border border-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Gifts</h1>
              <p className="text-gray-400 text-sm font-medium mt-1">Manage gift items — create, update, delete</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onNavigateToBanners} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#4361EE] text-white font-bold text-sm hover:opacity-90 transition-all">
              Banners
            </button>
            <button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-bold text-sm hover:opacity-90 transition-all">
              <Plus className="w-5 h-5" />
              Add Gift
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden animate-pulse h-64" />
            ))}
          </div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-24">
            <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-3">No Gifts Available</h3>
            <button onClick={openCreateModal} className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-black text-sm">
              <Plus className="w-5 h-5" />
              Create Gift
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                onEdit={openEditModal}
                onDelete={handleDeleteGift}
                isDeleting={deletingId === gift.id}
              />
            ))}
          </div>
        )}

        <ApiResponsePanel title="Gifts API response (last call)" data={apiDebug} />

        <GiftFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingGift(null); }}
          onSubmit={modalMode === 'edit' ? handleUpdateGift : handleCreateGift}
          isLoading={isSubmitting}
          mode={modalMode}
          initialGift={editingGift}
        />

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default GiftsPage;
