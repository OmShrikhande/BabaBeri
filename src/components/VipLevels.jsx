import React, { useState, useEffect, useCallback } from 'react';
import {
  Crown, Plus, Edit2, Trash2, Coins, Calendar, Eye, EyeOff, Users,
  X, RefreshCw, Download, AlertCircle, ChevronUp, ChevronDown, Info, Award, TrendingUp, ShieldCheck
} from 'lucide-react';
import authService from '../services/authService';
import services from '../services/services';
import { API_CONFIG } from '../config/api.js';
import ConfirmDialog from './RoleStages/ConfirmDialog';
import SearchBar from './SearchBar';
import ToggleButtonGroup from './ToggleButtonGroup';
import { useAuth } from '../context/AuthContext';

const VipLevels = () => {
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [vipMembers, setVipMembers] = useState([]);
  const [vipStats, setVipStats] = useState({ total: 0, members: 0, friendBadges: 0 });
  const [activeView, setActiveView] = useState('members');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [formData, setFormData] = useState({
    planName: '',
    needCoins: '',
    superadminPercentage: '10',
    validityDays: '30',
    vipAFriend: '',
    validFor: '30',
    invisibleMode: false,
    planStatus: 'ACTIVE',
    avatarImage: null,
  });

  const emptyForm = () => ({
    planName: '',
    needCoins: '',
    superadminPercentage: '10',
    validityDays: '30',
    vipAFriend: '',
    validFor: '30',
    invisibleMode: false,
    planStatus: 'ACTIVE',
    avatarImage: null,
  });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await services.getAllVipPlans();
      if (result.success) {
        setPlans(Array.isArray(result.data) ? result.data : []);
      } else {
        throw new Error(result.error || 'Failed to fetch VIP plans');
      }
    } catch (err) {
      setError(err.message || 'Failed to load VIP plans');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVipMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await services.getVipUsers();
      if (result.success) {
        const data = result.data;
        // API returns: { success, total, members, friendBadges, users: [...] }
        setVipStats({
          total: data.total ?? 0,
          members: data.members ?? 0,
          friendBadges: data.friendBadges ?? 0,
        });
        setVipMembers(Array.isArray(data.users) ? data.users : []);
      } else {
        throw new Error(result.error || 'Failed to load VIP members.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load VIP members.');
      setVipMembers([]);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  const handleRefresh = () => {
    if (activeView === 'members') {
      fetchVipMembers();
    } else {
      fetchPlans();
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (activeView === 'members') {
      fetchVipMembers();
    } else {
      fetchPlans();
    }
  }, [activeView, authLoading, fetchPlans, fetchVipMembers]);

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
      else if (sortField === 'coinsRequired') { av = Number(a.needCoins || a.coins || 0); bv = Number(b.needCoins || b.coins || 0); }
      else if (sortField === 'validFor') { av = Number(a.validFor || a.validity || 0); bv = Number(b.validFor || b.validity || 0); }
      else if (sortField === 'vipFriendCount') { av = Number(a.vipAFriend || a.vipFriendCount || a.friendCount || 0); bv = Number(b.vipAFriend || b.vipFriendCount || b.friendCount || 0); }
      else return 0;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return f;
  }, [plans, searchTerm, sortField, sortDir]);

  const filteredMembers = React.useMemo(() => {
    let filtered = vipMembers.filter(member => {
      const matchesSearch =
        (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.usercode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.planName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.country || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = selectedLevel === 'all' ||
        (member.planName || member.vipType || '').toLowerCase() === selectedLevel.toLowerCase();

      return matchesSearch && matchesLevel;
    });

    filtered.sort((a, b) => {
      let av, bv;
      if (sortField === 'name') {
        av = (a.name || '').toLowerCase();
        bv = (b.name || '').toLowerCase();
      } else if (sortField === 'username') {
        av = (a.username || '').toLowerCase();
        bv = (b.username || '').toLowerCase();
      } else if (sortField === 'planName') {
        av = (a.planName || '').toLowerCase();
        bv = (b.planName || '').toLowerCase();
      } else if (sortField === 'endDate') {
        av = new Date(a.endDate || 0).getTime();
        bv = new Date(b.endDate || 0).getTime();
      } else if (sortField === 'daysLeft') {
        av = Number(a.daysLeft ?? 0);
        bv = Number(b.daysLeft ?? 0);
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
      const planCounts = {};
      vipMembers.forEach(member => {
        const plan = member.planName || 'Unknown';
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      });

      return {
        total: vipStats.total || vipMembers.length,
        members: vipStats.members || vipMembers.length,
        friendBadges: vipStats.friendBadges || 0,
        filtered: filteredMembers.length,
        planCounts,
        activeMembers: vipMembers.filter(m => !m.expired).length
      };
    } else {
      return {
        total: plans.length,
        avgCoins: plans.length ? Math.round(plans.reduce((s, p) => s + Number(p.needCoins || p.coins || 0), 0) / plans.length) : 0,
        invisibleCount: plans.filter(p => p.invisibleMode).length,
        avgValidity: plans.length ? Math.round(plans.reduce((s, p) => s + Number(p.validFor || p.validity || 0), 0) / plans.length) : 0
      };
    }
  }, [plans, vipMembers, vipStats, filteredMembers, activeView]);

  const openCreate = () => {
    setEditingPlan(null);
    setFormData(emptyForm());
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName || plan.name || '',
      needCoins: plan.needCoins ?? plan.coinsRequired ?? plan.coins ?? '',
      superadminPercentage: plan.superadminPercentage ?? '10',
      validityDays: plan.validityDays ?? plan.validFor ?? plan.validity ?? '30',
      vipAFriend: plan.vipAFriend ?? plan.vipFriendCount ?? plan.friendCount ?? '',
      validFor: plan.validFor ?? plan.validityDays ?? plan.validity ?? '30',
      invisibleMode: Boolean(plan.invisibleMode),
      planStatus: String(plan.planStatus || 'ACTIVE').toUpperCase(),
      avatarImage: null,
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
    if (!formData.planName || !formData.needCoins) {
      alert('Please fill in plan name and coins required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingPlan?.id) {
        // PUT /auth/superadmin/{id} — JSON update
        const result = await services.updateVipPlan(editingPlan.id, {
          planName: formData.planName,
          needCoins: Number(formData.needCoins) || 0,
          validityDays: Number(formData.validityDays || formData.validFor) || 30,
          planStatus: String(formData.planStatus || 'ACTIVE').toUpperCase(),
        });
        if (!result.success) throw new Error(result.error || 'Failed to update VIP plan');
      } else {
        // POST /auth/superadmin/create-vip-plan — multipart create
        const result = await services.createVipPlan(
          {
            planName: formData.planName,
            needCoins: formData.needCoins,
            superadminPercentage: formData.superadminPercentage || '10',
            validityDays: formData.validityDays || formData.validFor || '30',
            vipAFriend: formData.vipAFriend || '0',
            validFor: formData.validFor || formData.validityDays || '30',
            invisibleMode: String(Boolean(formData.invisibleMode)),
            planStatus: String(formData.planStatus || 'ACTIVE').toUpperCase(),
          },
          formData.avatarImage || null,
        );
        if (!result.success) throw new Error(result.error || 'Failed to create VIP plan');
      }
      setShowModal(false);
      fetchPlans();
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
        `${API_CONFIG.BASE_URL}/auth/superadmin/delete-vip-plan/${deletingPlan.id}`, { method: 'DELETE' }
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
        ['Plan Name', 'Coins Required', 'Valid (days)', 'VIP Friends', 'Invisible Mode', 'Status'],
        ...plans.map(p => [
          p.planName || p.name,
          p.needCoins || p.coinsRequired || p.coins,
          p.validityDays || p.validFor || p.validity,
          p.vipAFriend || p.vipFriendCount || p.friendCount || 0,
          p.invisibleMode ? 'Yes' : 'No',
          p.planStatus || '',
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
          {/* <div className="bg-[#121212] border border-gray-700 rounded-lg p-4 mb-6">
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
          </div> */}
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
                  <p className="text-white text-xl font-bold">{Object.keys(stats.planCounts || {}).length}</p>
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
                <table className="w-full min-w-[1100px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 bg-[#0F0F0F]">
                      <th className="text-left py-3 px-4 pl-6 text-gray-400 font-medium text-sm w-10">#</th>
                      <SortTh field="name">Member</SortTh>
                      <SortTh field="username">Username</SortTh>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">User Code</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Role</th>
                      <SortTh field="planName">Plan</SortTh>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Start Date</th>
                      <SortTh field="endDate">End Date</SortTh>
                      <SortTh field="daysLeft">Days Left</SortTh>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, idx) => (
                      <tr key={member.usercode || idx} className="border-b border-gray-800 last:border-b-0 hover:bg-[#1A1A1A] transition-colors group">
                        {/* # */}
                        <td className="py-3 px-4 pl-6 text-gray-500 text-sm w-10">{idx + 1}</td>

                        {/* Member */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={member.profilepic || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=F72585&color=fff&size=40`}
                                alt={member.name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-gray-700 group-hover:border-[#F72585] transition-colors"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=F72585&color=fff&size=40`;
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">{member.name || '—'}</p>
                              <p className="text-xs text-gray-500">{member.country || '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="py-3 px-4">
                          <span className="text-[#F72585] text-sm font-medium">@{member.username || '—'}</span>
                        </td>

                        {/* User Code */}
                        <td className="py-3 px-4">
                          <span className="text-gray-400 font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                            {member.usercode || '—'}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/50">
                            {member.role || '—'}
                          </span>
                        </td>

                        {/* Plan */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            <span className={`text-xs px-2 py-1 rounded-full border ${getLevelBadgeColor(member.planName)}`}>
                              {member.planName || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Start Date */}
                        <td className="py-3 px-4">
                          <span className="text-gray-400 text-sm">
                            {member.startDate ? new Date(member.startDate).toLocaleDateString() : '—'}
                          </span>
                        </td>

                        {/* End Date */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className={`w-4 h-4 flex-shrink-0 ${member.expired ? 'text-red-400' : 'text-blue-400'}`} />
                            <span className={`text-sm ${member.expired ? 'text-red-400' : 'text-gray-300'}`}>
                              {member.endDate ? new Date(member.endDate).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </td>

                        {/* Days Left */}
                        <td className="py-3 px-4">
                          <span className={`text-sm font-semibold ${member.expired ? 'text-red-400' :
                            member.daysLeft <= 30 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                            {member.expired ? '—' : `${member.daysLeft ?? '—'}d`}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {member.expired ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-900/40 text-red-300 border border-red-700/50">Expired</span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-900/40 text-green-300 border border-green-700/50">Active</span>
                          )}
                        </td>
                      </tr>
                    ))}
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
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
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
                              {(plan.needCoins || plan.coins || 0).toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* Valid For */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{plan.validityDays || plan.validFor || plan.validity || 0} days</span>
                          </div>
                        </td>

                        {/* VIP Friends */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{plan.vipAFriend || plan.vipFriendCount || plan.friendCount || 0}</span>
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

                        {/* Status */}
                        <td className="py-3 px-4">
                          {String(plan.planStatus || 'ACTIVE').toUpperCase() === 'ACTIVE' ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-900/20 text-green-400 border border-green-500/30">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400 border border-gray-600">
                              {String(plan.planStatus || 'DEACTIVE')}
                            </span>
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
                { label: 'Coins Required *', field: 'needCoins', type: 'number', placeholder: 'e.g. 1000' },
                { label: 'Validity Days *', field: 'validityDays', type: 'number', placeholder: 'e.g. 30' },
                ...(!editingPlan
                  ? [
                    { label: 'Valid For (days)', field: 'validFor', type: 'number', placeholder: 'e.g. 30' },
                    { label: 'VIP a Friend Count', field: 'vipAFriend', type: 'number', placeholder: 'e.g. 3' },
                    { label: 'Superadmin %', field: 'superadminPercentage', type: 'number', placeholder: 'e.g. 10' },
                  ]
                  : []),
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

              {/* Plan Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan Status</label>
                <select
                  value={formData.planStatus}
                  onChange={e => setFormData(f => ({ ...f, planStatus: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DEACTIVE">DEACTIVE</option>
                </select>
              </div>

              {/* Invisible Mode — create only (update API does not accept it) */}
              {!editingPlan && (
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
              )}

              {/* Avatar Upload — create only */}
              {!editingPlan && (
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
              )}
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
