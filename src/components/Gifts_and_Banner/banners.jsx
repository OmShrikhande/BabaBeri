import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image, X, Upload, Loader2, CheckCircle, XCircle, Plus, Calendar, Tag } from 'lucide-react';
import authService from '../../services/services';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-10 duration-300 ${
    type === 'success' 
      ? 'bg-[#0F172A]/90 border-emerald-500/50 text-emerald-400 backdrop-blur-md' 
      : type === 'info'
      ? 'bg-[#0F172A]/90 border-blue-500/50 text-blue-400 backdrop-blur-md'
      : 'bg-[#0F172A]/90 border-red-500/50 text-red-400 backdrop-blur-md'
  }`}>
    {type === 'success' ? <CheckCircle className="w-5 h-5" /> : type === 'info' ? <Image className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
    <p className="text-sm font-bold tracking-wide">{message}</p>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const BannerCard = ({ banner }) => {
  const imageUrl = banner.image || '';
  const btnName = banner.btnName || 'Click Here';
  const externalLink = banner.externalLink || '#';
  const expiryDate = banner.expiryTime ? new Date(banner.expiryTime) : null;
  const isExpired = expiryDate && expiryDate < new Date();
  
  const formatDate = (date) => {
    if (!date) return 'No Expiry';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden hover:border-[#F72585]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F72585]/20 hover:-translate-y-1 group">
      <div className="relative h-48 bg-black/40 overflow-hidden">
        {imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
          <video 
            src={imageUrl} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            muted
            loop
            autoPlay
          />
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
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">
            Active
          </div>
        )}
        {banner.status === 0 && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gray-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">
            Inactive
          </div>
        )}
        {isExpired && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-lg">
            Expired
          </div>
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
            <span className="text-xs font-bold text-[#4CC9F0] truncate max-w-[200px]" title={externalLink}>
              {externalLink}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Expiry Date</span>
            <span className={`text-xs font-bold ${isExpired ? 'text-red-400' : 'text-[#4CC9F0]'}`}>
              {formatDate(expiryDate)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">ID</span>
            <span className="text-sm font-bold text-[#F72585]">#{banner.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BannerFormModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    btnName: '',
    externalLink: '',
    expiryDays: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileType, setFileType] = useState('');

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
      setFileType(file.type);
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
      status: 1
    });
    setFormData({
      btnName: '',
      externalLink: '',
      expiryDays: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setFileType('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Add New Banner</h2>
            <p className="text-gray-400 text-sm font-medium mt-1">Upload image and set banner details</p>
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
              Banner Media (Image/Video/GIF) *
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*,video/*,.gif"
                onChange={handleFileChange}
                className="hidden"
                id="banner-image-upload"
                required
              />
              <label 
                htmlFor="banner-image-upload"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white hover:border-[#F72585] transition-all cursor-pointer flex items-center justify-between"
              >
                <span className={selectedFile ? 'text-white' : 'text-gray-500'}>
                  {selectedFile ? selectedFile.name : 'Choose a media file...'}
                </span>
                <Upload className="w-5 h-5 text-gray-600" />
              </label>
            </div>
            {previewUrl && (
              <div className="relative w-full h-48 bg-black/40 rounded-xl overflow-hidden border border-white/5">
                {fileType.startsWith('video/') ? (
                  <video 
                    src={previewUrl} 
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Button Text *
            </label>
            <input
              type="text"
              name="btnName"
              value={formData.btnName}
              onChange={handleChange}
              placeholder="Watch Now"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              External Link *
            </label>
            <input
              type="url"
              name="externalLink"
              value={formData.externalLink}
              onChange={handleChange}
              placeholder="https://proxstream.online/movie"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Expiry Days *
            </label>
            <input
              type="number"
              name="expiryDays"
              value={formData.expiryDays}
              onChange={handleChange}
              placeholder="7"
              min="1"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#F72585] transition-all"
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
                  <Image className="w-5 h-5" />
                  Create Banner
                </>
              )}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

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

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching banners...');
      const response = await authService.getAllBanners();
      console.log('Fetch banners response:', response);
      
      if (response.success) {
        const rawList = Array.isArray(response.data) ? response.data : [];
        console.log('Banner count:', rawList.length);
        
        const sortedBanners = rawList.sort((a, b) => b.id - a.id);
        
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
      setFilteredBanners(banners.filter(banner => banner.status === 1));
    } else {
      setFilteredBanners(banners.filter(banner => banner.status === 0));
    }
  };

  const handleCreateBanner = async (data) => {
    setIsSubmitting(true);
    try {
      if (!data.file) {
        throw new Error('Please select a media file');
      }

      const formData = new FormData();
      formData.append('image', data.file);
      formData.append('btnName', data.btnName.trim());
      formData.append('externalLink', data.externalLink.trim());
      formData.append('expiryDays', String(data.expiryDays));

      console.log('Sending banner data:', {
        fileName: data.file.name,
        fileType: data.file.type,
        fileSize: data.file.size,
        btnName: data.btnName,
        externalLink: data.externalLink,
        expiryDays: data.expiryDays
      });

      const response = await authService.saveBanner(formData);
      
      if (response.success) {
        showNotification('Banner created successfully');
        setIsModalOpen(false);
        await fetchBanners();
      } else {
        throw new Error(response.error || 'Failed to create banner');
      }
    } catch (error) {
      console.error('Error creating banner:', error);
      showNotification(error.message || 'Failed to create banner', 'error');
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
              <h1 className="text-3xl font-black text-white tracking-tight">Banners</h1>
              <p className="text-gray-400 text-sm font-medium mt-1">Manage promotional banners</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#F72585]/20"
            >
              <Plus className="w-5 h-5" />
              Add Banner
            </button>
            
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#1A1A1A] border border-white/5">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'active'
                    ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'inactive'
                    ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden animate-pulse">
                <div className="h-48 bg-black/40"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-white/5 mb-8 shadow-xl">
              <Image className="w-16 h-16 text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">
              No {activeTab === 'active' ? 'Active' : 'Inactive'} Banners
            </h3>
            <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto">
              {activeTab === 'active' 
                ? 'Start by creating your first banner to promote content' 
                : 'No inactive banners at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBanners.map((banner) => (
              <BannerCard key={banner.id} banner={banner} />
            ))}
          </div>
        )}

        <BannerFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateBanner}
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

export default BannersPage;
