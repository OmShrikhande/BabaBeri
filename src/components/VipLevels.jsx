import React, { useState, useEffect } from 'react';
import {
  Crown, Plus, Edit2, Trash2, Coins, Calendar, Eye, EyeOff, Users,
  X, RefreshCw, Download, AlertCircle, ChevronUp, ChevronDown, Info, Award, TrendingUp
} from 'lucide-react';
import authService from '../services/authService';
import ConfirmDialog from './RoleStages/ConfirmDialog';
import SearchBar from './SearchBar';
import ToggleButtonGroup from './ToggleButtonGroup';

const VipLevels = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [vipMembers, setVipMembers] = useState([]);
  const [activeView, setActiveView] = useState('members');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('planName');
  const [sortDir, setSortDir] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [formData, setFormData] = useState({
    planName: '', coinsRequired: '', validFor: '',
    vipFriendCount: '', invisibleMode: false, avatarImage: null
  });

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.makeAuthenticatedRequest(
        '/auth/api/getappvipplans', { method: 'GET' }
      );
      if (response.ok) {
        const data = await response.json();
        setPlans(Array.isArray(data) ? data : data?.data ?? []);
      } else {
        throw new Error('Failed to fetch VIP plans');
      }
    } catch (err) {
      setError(err.message || 'Failed to load VIP plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchVipMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: API endpoint for VIP members not found in documentation
      // Trying common endpoint patterns
      const response = await authService.makeAuthenticatedRequest(
        '/auth/api/getvipusers', { method: 'GET' }
      );
      if (response.ok) {
        const data = await response.json();
        setVipMembers(Array.isArray(data) ? data : data?.data ?? []);
      } else {
        // If endpoint doesn't exist, show informative message
        throw new Error('VIP members endpoint not available. Please contact backend team to implement /auth/api/getvipusers endpoint.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load VIP members. API endpoint may not be implemented yet.');
      setVipMembers([]); // Set empty array to prevent further errors
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const handleRefresh = () => {
    if (activeView === 'members') {
      fetchVipMembers();
    } else {
      fetchPlans();
    }
  };

  useEffect(() => {
    if (activeView === 'members') {
      fetchVipMembers();
    } else {
      fetchPlans();
    }
  }, [activeView]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-[#F72585]" />
      : <ChevronDown className="w-3 h-3 text-[#F72585]" />;
  };

  const filteredPlans = React.useMemo(() => {
    let f = plans.filter(p =>
      (p.planName || p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    f.sort((a, b) => {
      let av, bv;
      if (sortField === 'planName') { av = (a.planName || a.name || '').toLowerCase(); bv = (b.planName || b.name || '').toLowerCase(); }
      else if (sortField === 'coinsRequired') { av = Number(a.coinsRequired || a.coins || 0); bv = Number(b.coinsRequired || b.coins || 0); }
      else if (sortField === 'validFor') { av = Number(a.validFor || a.validity || 0); bv = Number(b.validFor || b.validity || 0); }
      else if (sortField === 'vipFriendCount') { av = Number(a.vipFriendCount || a.friendCount || 0); bv = Number(b.vipFriendCount || b.friendCount || 0); }
      else return 0;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return f;
  }, [plans, searchTerm, sortField, sortDir]);

  const filteredMembers = React.useMemo(() => {
    let filtered = vipMembers.filter(member => {
      const matchesSearch = 
        (member.fullName || member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.userId || member.id || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevel === 'all' || 
        (member.vipLevel || member.planName || '').toLowerCase() === selectedLevel.toLowerCase();
      
      return matchesSearch && matchesLevel;
    });

    filtered.sort((a, b) => {
      let av, bv;
      if (sortField === 'fullName') {
        av = (a.fullName || a.name || '').toLowerCase();
        bv = (b.fullName || b.name || '').toLowerCase();
      } else if (sortField === 'username') {
        av = (a.username || '').toLowerCase();
        bv = (b.username || '').toLowerCase();
      } else if (sortField === 'vipLevel') {
        av = (a.vipLevel || a.planName || '').toLowerCase();
        bv = (b.vipLevel || b.planName || '').toLowerCase();
      } else if (sortField === 'expiryDate') {
        av = new Date(a.expiryDate || a.validUntil || 0).getTime();
        bv = new Date(b.expiryDate || b.validUntil || 0).getTime();
      } else {
        return 0;
      }
      
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return filtered;
  }, [vipMembers, searchTerm, selectedLevel, sortField, sortDir]);

  const stats = React.useMemo(() => {
    if (activeView === 'members') {
      const levelCounts = {};
      vipMembers.forEach(member => {
        const level = member.vipLevel || member.planName || 'Unknown';
        levelCounts[level] = (levelCounts[level] || 0) + 1;
      });
      
      return {
        total: vipMembers.length,
        filtered: filteredMembers.length,
        levelCounts,
        activeMembers: vipMembers.filter(m => {
          const expiry = new Date(m.expiryDate || m.validUntil);
          return expiry > new Date();
        }).length
      };
    } else {
      return {
        total: plans.length,
        avgCoins: plans.length ? Math.round(plans.reduce((s, p) => s + Number(p.coinsRequired || p.coins || 0), 0) / plans.length) : 0,
        invisibleCount: plans.filter(p => p.invisibleMode).length,
        avgValidity: plans.length ? Math.round(plans.reduce((s, p) => s + Number(p.validFor || p.validity || 0), 0) / plans.length) : 0
      };
    }
  }, [plans, vipMembers, filteredMembers, activeView]);

  const openCreate = () => {
    setEditingPlan(null);
    setFormData({ planName: '', coinsRequired: '', validFor: '', vipFriendCount: '', invisibleMode: false, avatarImage: null });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName || plan.name || '',
      coinsRequired: plan.coinsRequired || plan.coins || '',
      validFor: plan.validFor || plan.validity || '',
      vipFriendCount: plan.vipFriendCount || plan.friendCount || '',
      invisibleMode: plan.invisibleMode || false,
      avatarImage: null
    });
    setImagePreview(plan.image || plan.avatar || null);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(f => ({ ...f, avatarImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.planName || !formData.coinsRequired || !formData.validFor) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('planName', formData.planName);
      fd.append('needCoins', formData.coinsRequired);
      fd.append('validFor', formData.validFor);
      fd.append('vipAFriend', formData.vipFriendCount || 0);
      fd.append('invisibleMode', formData.invisibleMode);
      if (formData.avatarImage) fd.append('avatarFile', formData.avatarImage);
      const response = await authService.makeAuthenticatedRequest(
        '/auth/superadmin/create-vip-plan', { method: 'POST', body: fd, headers: {} }
      );
      if (response.ok) { setShowModal(false); fetchPlans(); }
      else throw new Error('Failed to save VIP plan');
    } catch (err) {
      alert(err.message || 'Failed to save VIP plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;
    try {
      const response = await authService.makeAuthenticatedRequest(
        `/auth/superadmin/delete-vip-plan/${deletingPlan.id}`, { method: 'DELETE' }
      );
      if (response.ok) { setDeletingPlan(null); fetchPlans(); }
      else throw new Error('Failed to delete VIP plan');
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleExport = () => {
    if (activeView === 'members') {
      const csv = [
        ['Full Name', 'Username', 'User ID', 'VIP Level', 'Expiry Date', 'Country'],
        ...filteredMembers.map(m => [
          m.fullName || m.name || '',
          m.username || '',
          m.userId || m.id || '',
          m.vipLevel || m.planName || '',
          m.expiryDate || m.validUntil || '',
          m.country || ''
        ])
      ].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vip-members-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const csv = [
        ['Plan Name', 'Coins Required', 'Valid (days)', 'VIP Friends', 'Invisible Mode'],
        ...plans.map(p => [
          p.planName || p.name,
          p.coinsRequired || p.coins,
          p.validFor || p.validity,
          p.vipFriendCount || p.friendCount || 0,
          p.invisibleMode ? 'Yes' : 'No'
        ])
      ].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vip-plans-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const getLevelBadgeColor = (level) => {
    const levelLower = (level || '').toLowerCase();
    if (levelLower.includes('platinum') || levelLower.includes('diamond')) return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
    if (levelLower.includes('gold')) return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
    if (levelLower.includes('silver')) return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
    if (levelLower.includes('bronze')) return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
    return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
  };

  const viewOptions = [
    { id: 'members', label: 'VIP Members', icon: 'Users' },
    { id: 'plans', label: 'VIP Plans', icon: 'Crown' }
  ];

  const SortTh = ({ field, children, className = '' }) => (
    <th
      className={`text-left py-3 px-4 text-gray-400 font-medium text-sm cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">{children}{getSortIcon(field)}</div>
    </th>
  );

  return (
    <div className="flex-1 bg-[#1A1A1A] p-6 overflow-y-auto">
      <div className="min-h-full flex flex-col">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">VIP / Levels</h1>
                <p className="text-gray-400 text-sm">Manage VIP plans for app users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-[#121212] hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" /> Export
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-[#121212] hover:bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 transition-colors text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              {activeView === 'plans' && (
                <button
                  onClick={openCreate}
                  className="bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Create Plan
                </button>
              )}
            </div>
          </div>

          {/* Info note */}
          <div className="bg-[#121212] border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#F72585] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[#F72585] font-medium text-sm mb-1">Note</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {activeView === 'members' 
                    ? 'View all VIP members grouped by their subscription levels. Members are ranked based on their VIP tier and activity. Note: If no data appears, the VIP members API endpoint may need to be implemented on the backend.'
                    : 'VIP plans grant users special privileges in the app. Invisible Mode hides the user from public listings. VIP a Friend allows users to grant VIP status to a set number of friends.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
            <button onClick={fetchPlans} className="text-red-400 hover:text-red-300 text-sm border border-red-800 px-3 py-1 rounded-lg flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {activeView === 'members' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#121212] rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs truncate">Total VIP Members</p>
                  <p className="text-white text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs truncate">Active Members</p>
                  <p className="text-white text-xl font-bold">{stats.activeMembers}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs truncate">VIP Levels</p>
                  <p className="text-white text-xl font-bold">{Object.keys(stats.levelCounts).length}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs truncate">Filtered Results</p>
                  <p className="text-white text-xl font-bold">{stats.filtered}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Plans', value: stats.total, icon: Crown, color: 'bg-purple-600/20', iconColor: 'text-purple-400' },
              { label: 'Avg Coins Required', value: stats.avgCoins.toLocaleString(), icon: Coins, color: 'bg-yellow-600/20', iconColor: 'text-yellow-400' },
              { label: 'Invisible Mode Plans', value: stats.invisibleCount, icon: Eye, color: 'bg-teal-600/20', iconColor: 'text-teal-400' },
              { label: 'Avg Validity (days)', value: stats.avgValidity, icon: Calendar, color: 'bg-blue-600/20', iconColor: 'text-blue-400' },
            ].map(({ label, value, icon: Icon, color, iconColor }) => (
              <div key={label} className="bg-[#121212] rounded-lg border border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-xs truncate">{label}</p>
                    <p className="text-white text-xl font-bold">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {activeView === 'members' ? (
            <>
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by name, username, or user ID..."
                  id="vip-members-search"
                />
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <Crown className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="flex-1 bg-[#121212] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-[#F72585] focus:outline-none focus:ring-2 focus:ring-[#F72585]/20 transition-all"
                >
                  <option value="all">All Levels</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.planName || plan.name}>
                      {plan.planName || plan.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="relative flex-1">
              <Crown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                className="w-full bg-[#121212] border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-[#F72585] focus:outline-none focus:ring-2 focus:ring-[#F72585]/20 transition-all"
                placeholder="Search plans by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Toggle and Stats Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <ToggleButtonGroup
            options={viewOptions}
            activeOption={activeView}
            onToggle={setActiveView}
            className="w-full sm:w-auto"
          />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm text-gray-400 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span>Showing:</span>
              <span className="text-white font-semibold">
                {activeView === 'members' ? filteredMembers.length : filteredPlans.length} results
              </span>
            </div>
            {activeView === 'members' && (
              <div className="flex items-center gap-2">
                <span>Last Updated:</span>
                <span className="text-white font-semibold">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-[#121212] rounded-lg border border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              {activeView === 'members' ? 'VIP Members' : 'VIP Plans'}
            </h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : activeView === 'members' ? (
            /* VIP Members Table */
            filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">No VIP members found</p>
                <p className="text-gray-600 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search' : 'No VIP members available'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 bg-[#0F0F0F]">
                      <th className="text-left py-3 px-4 pl-6 text-gray-400 font-medium text-sm w-14">#</th>
                      <SortTh field="fullName">Member</SortTh>
                      <SortTh field="username">Username</SortTh>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">User ID</th>
                      <SortTh field="vipLevel">VIP Level</SortTh>
                      <SortTh field="expiryDate">Expiry Date</SortTh>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, idx) => {
                      const expiryDate = new Date(member.expiryDate || member.validUntil);
                      const isExpired = expiryDate < new Date();
                      
                      return (
                        <tr key={member.id || idx} className="border-b border-gray-800 last:border-b-0 hover:bg-[#1A1A1A] transition-colors group">
                          {/* # */}
                          <td className="py-3 px-4 pl-6 text-gray-500 text-sm w-14">{idx + 1}</td>

                          {/* Member */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <img
                                  src={member.avatar || member.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName || member.name || 'User')}&background=F72585&color=fff&size=40`}
                                  alt={member.fullName || member.name}
                                  className="w-9 h-9 rounded-full object-cover border-2 border-gray-700 group-hover:border-[#F72585] transition-colors"
                                  onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName || member.name || 'User')}&background=F72585&color=fff&size=40`;
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium text-sm truncate">{member.fullName || member.name || '—'}</p>
                                <p className="text-xs text-gray-500">{member.country || 'Unknown'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="py-3 px-4">
                            <span className="text-[#F72585] text-sm font-medium">@{member.username || '—'}</span>
                          </td>

                          {/* User ID */}
                          <td className="py-3 px-4">
                            <span className="text-gray-400 font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                              {member.userId || member.id || '—'}
                            </span>
                          </td>

                          {/* VIP Level */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                              <span className={`text-xs px-2 py-1 rounded-full border ${getLevelBadgeColor(member.vipLevel || member.planName)}`}>
                                {member.vipLevel || member.planName || 'Unknown'}
                              </span>
                            </div>
                          </td>

                          {/* Expiry Date */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className={`w-4 h-4 flex-shrink-0 ${isExpired ? 'text-red-400' : 'text-blue-400'}`} />
                              <span className={`text-sm ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                                {expiryDate.toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* VIP Plans Table */
            filteredPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">No VIP plans found</p>
                <p className="text-gray-600 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search' : 'Create your first VIP plan to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 bg-[#0F0F0F]">
                      <th className="text-left py-3 px-4 pl-6 text-gray-400 font-medium text-sm w-14">#</th>
                      <SortTh field="planName">Plan Name</SortTh>
                      <SortTh field="coinsRequired">Coins Required</SortTh>
                      <SortTh field="validFor">Valid For</SortTh>
                      <SortTh field="vipFriendCount">VIP Friends</SortTh>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Invisible</th>
                      <th className="text-left py-3 px-4 pr-6 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan, idx) => (
                      <tr key={plan.id || idx} className="border-b border-gray-800 last:border-b-0 hover:bg-[#1A1A1A] transition-colors group">
                        {/* # */}
                        <td className="py-3 px-4 pl-6 text-gray-500 text-sm w-14">{idx + 1}</td>

                        {/* Plan Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {plan.image || plan.avatar ? (
                              <img src={plan.image || plan.avatar} alt={plan.planName || plan.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Crown className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <span className="text-white font-medium text-sm">{plan.planName || plan.name || '—'}</span>
                          </div>
                        </td>

                        {/* Coins Required */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <span className="text-yellow-400 font-semibold text-sm">
                              {(plan.coinsRequired || plan.coins || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* Valid For */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{plan.validFor || plan.validity || 0} days</span>
                          </div>
                        </td>

                        {/* VIP Friends */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{plan.vipFriendCount || plan.friendCount || 0}</span>
                          </div>
                        </td>

                        {/* Invisible */}
                        <td className="py-3 px-4">
                          {plan.invisibleMode ? (
                            <div className="flex items-center gap-1.5 text-teal-400">
                              <Eye className="w-4 h-4" />
                              <span className="text-xs font-medium">On</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <EyeOff className="w-4 h-4" />
                              <span className="text-xs">Off</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 pr-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(plan)}
                              className="text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg p-1.5 transition-all"
                              title="Edit plan"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingPlan(plan)}
                              className="text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg p-1.5 transition-all"
                              title="Delete plan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl border border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-[#121212] z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#F72585] to-[#7209B7] rounded-lg flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">{editingPlan ? 'Edit VIP Plan' : 'Create VIP Plan'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Plan Name *', field: 'planName', type: 'text', placeholder: 'e.g. Gold Plan' },
                { label: 'Coins Required *', field: 'coinsRequired', type: 'number', placeholder: 'e.g. 200' },
                { label: 'Valid For (days) *', field: 'validFor', type: 'number', placeholder: 'e.g. 30' },
                { label: 'VIP a Friend Count', field: 'vipFriendCount', type: 'number', placeholder: 'e.g. 5' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                  <input
                    type={type}
                    value={formData[field]}
                    onChange={e => setFormData(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
                  />
                </div>
              ))}

              {/* Invisible Mode */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Invisible Mode</label>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, invisibleMode: !f.invisibleMode }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${formData.invisibleMode ? 'bg-gradient-to-r from-[#F72585] to-[#7209B7]' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.invisibleMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar Image</label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="avatar-upload" />
                  <label htmlFor="avatar-upload" className="cursor-pointer block">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 mx-auto rounded-xl object-cover mb-2" />
                    ) : (
                      <div className="w-20 h-20 mx-auto bg-gray-800 rounded-xl flex items-center justify-center mb-2">
                        <Crown className="w-10 h-10 text-gray-600" />
                      </div>
                    )}
                    <p className="text-gray-400 text-sm">Click to upload image</p>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg py-2 border border-gray-700 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg py-2 font-medium text-sm disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deletingPlan}
        title="Delete VIP Plan"
        message={`Are you sure you want to delete "${deletingPlan?.planName || deletingPlan?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingPlan(null)}
      />
    </div>
  );
};

export default VipLevels;
