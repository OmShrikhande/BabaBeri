import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image, X, Upload, Loader2, CheckCircle, XCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import authService from '../../services/services';
import { ApiResponsePanel } from './sharedPanels';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-10 duration-300 ${type === 'success'}
      ? 'bg-[#0F172A]/90 border-emerald-500/50 text-emerald-400 backdrop-blur-md'
      : 'bg-[#0F172A]/90 border-blue-500/50 text-blue-400 backdrop-blur-md'
        : 'bg-[#0F172A]/90 border-red-500/50 text-red-400 backdrop-blur-md'
    `}>
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : type === 'info' ? <Image className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
    <p className="text-sm font-bold tracking-wide">{message}</p>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const BannerCard = ({ banner, onEdit, onDelete, isDeleting }) => {
  const imageUrl = banner.image || '';
  const btnName = banner.btnName || 'Click Here';
  const externalLink = banner.externalLink || '#';
  const expiryDate = banner.expiryTime ? new Date(banner.expiryTime) : null;
  const isExpired = expiryDate && expiryDate < new Date();

  const formatDate = (date) => {
    if (!date) return 'No Expiry';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden hover:border-[#F72585]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F72585]/20 hover:-translate-y-1 group">
      <div className="relative h-48 bg-black/40 overflow-hidden">
        {imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
          <video src={imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" muted loop autoPlay />
        ) : (
          <img
            src={imageUrl}
            alt="Banner"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%231A1A1A"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%23666" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        )}
        {banner.status === 1 && !isExpired && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">Active</div>
        )}
        {banner.status === 0 && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gray-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">Inactive</div>
        )}
        {isExpired && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">Expired</div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Button Text</span>
            <span className="text-sm font-bold text-white">{btnName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Link</span>
            <span className="text-xs font-bold text-[#4CC9F0] truncate max-w-[200px]" title={externalLink}>{externalLink}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Expiry</span>
            <span className={`text-xs font-bold ${isExpired ? 'text-red-400' : 'text-[#4CC9F0]'}`}>{formatDate(expiryDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">ID</span>
            <span className="text-sm font-bold text-[#F72585]">#{banner.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button type="button" onClick={() => onEdit(banner)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-[#4361EE]/20 text-gray-300 hover:text-white text-xs font-bold transition-colors">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button type="button" onClick={() => onDelete(banner)} disabled={isDeleting} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-xs font-bold transition-colors disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const BannerFormModal = ({ isOpen, onClose, onSubmit, isLoading, mode = 'create', initialBanner = null }) => {
  const isEdit = mode === 'edit';
  const [formData, setFormData] = useState({ btnName: '', externalLink: '', expiryDays: '', status: '1' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileType, setFileType] = useState('');

  useEffect(() => {
    if (isOpen && isEdit && initialBanner) {
      setFormData({
        btnName: initialBanner.btnName || '',
        externalLink: initialBanner.externalLink || '',
        expiryDays: '',
        status: String(initialBanner.status ?? 1),
      });
      setPreviewUrl(initialBanner.image || '');
      setSelectedFile(null);
      setFileType('');
    }
    if (isOpen && !isEdit) {
      setFormData({ btnName: '', externalLink: '', expiryDays: '', status: '1' });
      setSelectedFile(null);
      setPreviewUrl('');
      setFileType('');
    }
  }, [isOpen, isEdit, initialBanner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialBanner?.id,
      file: selectedFile,
      status: Number(formData.status),
    });
    if (!isEdit) {
      setFormData({ btnName: '', externalLink: '', expiryDays: '', status: '1' });
      setSelectedFile(null);
      setPreviewUrl('');
      setFileType('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isEdit ? `Edit Banner #${initialBanner?.id}` : 'Add New Banner'}
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-1">
              {isEdit ? 'POST /auth/superadmin/updatebanner' : 'Upload media and set banner details'}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Banner Media {isEdit ? '(optional)' : '*'}
            </label>
            <input type="file" onChange={handleFileChange} className="hidden" id="banner-image-upload" required={!isEdit} />
            <label htmlFor="banner-image-upload" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white hover:border-[#F72585] transition-all cursor-pointer flex items-center justify-between">
              <span className={selectedFile ? 'text-white' : 'text-gray-500'}>
                {selectedFile ? selectedFile.name : 'Choose a media file...'}
              </span>
              <Upload className="w-5 h-5 text-gray-600" />
            </label>
            {previewUrl && (
              <div className="relative w-full h-48 bg-black/40 rounded-xl overflow-hidden border border-white/5">
                {fileType.startsWith('video/') || previewUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={previewUrl} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Button Text *</label>
            <input type="text" name="btnName" value={formData.btnName} onChange={handleChange} placeholder="Grab now" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all" required />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">External Link *</label>
            <input type="url" name="externalLink" value={formData.externalLink} onChange={handleChange} placeholder="https://proxstream.in/offer" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all" required />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Expiry Days {isEdit ? '(optional — extends from now)' : '*'}
            </label>
            <input type="number" name="expiryDays" value={formData.expiryDays} onChange={handleChange} placeholder="30" min="1" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all" required={!isEdit} />
          </div>

          {isEdit && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all">
                <option value="1">Active (1)</option>
                <option value="0">Inactive (0)</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold text-sm transition-all" disabled={isLoading}>Cancel</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-50">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Image className="w-5 h-5" />{isEdit ? 'Update Banner' : 'Create Banner'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BannersPage = ({ onBack }) => {
  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [apiDebug, setApiDebug] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    filterBanners();
  }, [banners, activeTab]);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const normalizeBannerList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (data && typeof data === 'object' && data.id) return [data];
    return [];
  };

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getAllBanners();
      setApiDebug({ endpoint: 'GET /auth/superadmin/getallebanners', response });

      if (response.success) {
        const sortedBanners = normalizeBannerList(response.data).sort((a, b) => b.id - a.id);
        setBanners(sortedBanners);
      } else {
        throw new Error(response.error || 'Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      showNotification('Failed to load banners', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBanners = () => {
    if (activeTab === 'active') {
      setFilteredBanners(banners.filter((banner) => banner.status === 1));
    } else {
      setFilteredBanners(banners.filter((banner) => banner.status === 0));
    }
  };

  const handleCreateBanner = async (data) => {
    setIsSubmitting(true);
    try {
      if (!data.file) throw new Error('Please select a media file');

      const formData = new FormData();
      formData.append('image', data.file);
      formData.append('btnName', data.btnName.trim());
      formData.append('externalLink', data.externalLink.trim());
      formData.append('expiryDays', String(data.expiryDays));

      const response = await authService.saveBanner(formData);
      setApiDebug({ endpoint: 'POST /auth/superadmin/savebanner', response });

      if (response.success) {
        showNotification('Banner created successfully');
        setIsModalOpen(false);
        await fetchBanners();
      } else {
        throw new Error(response.error || 'Failed to create banner');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to create banner', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBanner = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id', String(data.id));
      formData.append('btnName', data.btnName.trim());
      formData.append('externalLink', data.externalLink.trim());
      formData.append('status', String(data.status ?? 1));
      if (data.expiryDays) formData.append('expiryDays', String(data.expiryDays));
      if (data.file) formData.append('image', data.file);

      const response = await authService.updateBanner(formData);
      setApiDebug({
        endpoint: 'POST /auth/superadmin/updatebanner',
        request: { id: data.id, btnName: data.btnName, externalLink: data.externalLink, expiryDays: data.expiryDays, status: data.status },
        response,
      });

      if (response.success) {
        showNotification('Banner updated successfully');
        setIsModalOpen(false);
        setEditingBanner(null);
        await fetchBanners();
      } else {
        throw new Error(response.error || 'Failed to update banner');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to update banner', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (banner) => {
    if (!window.confirm(`Delete banner #${banner.id}?`)) return;
    setDeletingId(banner.id);
    try {
      const response = await authService.deleteBanner(banner.id);
      setApiDebug({ endpoint: `DELETE /auth/superadmin/deletebanner?id=${banner.id}`, response });

      if (response.success) {
        showNotification('Banner deleted successfully');
        await fetchBanners();
      } else {
        throw new Error(response.error || 'Failed to delete banner');
      }
    } catch (error) {
      showNotification(error.message || 'Failed to delete banner', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setModalMode('edit');
    setEditingBanner(banner);
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
              <h1 className="text-3xl font-black text-white tracking-tight">Banners</h1>
              <p className="text-gray-400 text-sm font-medium mt-1">Manage promotional banners — create, update, delete</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={openCreateModal} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-bold text-sm hover:opacity-90 transition-all">
              <Plus className="w-5 h-5" />
              Add Banner
            </button>
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#1A1A1A] border border-white/5">
              <button onClick={() => setActiveTab('active')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Active</button>
              <button onClick={() => setActiveTab('inactive')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'inactive' ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Inactive</button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden animate-pulse h-72" />
            ))}
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="text-center py-24">
            <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-3">No {activeTab === 'active' ? 'Active' : 'Inactive'} Banners</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBanners.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onEdit={openEditModal}
                onDelete={handleDeleteBanner}
                isDeleting={deletingId === banner.id}
              />
            ))}
          </div>
        )}

        <ApiResponsePanel title="Banners API response (last call)" data={apiDebug} />

        <BannerFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingBanner(null); }}
          onSubmit={modalMode === 'edit' ? handleUpdateBanner : handleCreateBanner}
          isLoading={isSubmitting}
          mode={modalMode}
          initialBanner={editingBanner}
        />

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default BannersPage;
