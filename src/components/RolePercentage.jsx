import React, { useState, useEffect } from 'react';
import { Percent, Edit2, Save, X, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import authService from '../services/authService';

const ROLE_LABELS = {
  ADMIN: 'Admin',
  MASTER_AGENCY: 'Master Agency',
  AGENCY: 'Agency',
  HOST: 'Host',
  SUPERADMIN: 'Super Admin',
};

const getRoleColor = (role) => {
  const r = (role || '').toUpperCase();
  if (r.includes('HOST')) return 'from-[#F72585] to-[#7209B7]';
  if (r.includes('MASTER')) return 'from-[#4361EE] to-[#4CC9F0]';
  if (r.includes('AGENCY')) return 'from-[#7209B7] to-[#4361EE]';
  if (r.includes('ADMIN')) return 'from-gray-600 to-gray-500';
  return 'from-gray-700 to-gray-600';
};

const ToastNotif = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm flex items-center gap-3 shadow-2xl">
      {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
      <span>{toast.message}</span>
    </div>
  );
};

const RolePercentage = () => {
  const [percentages, setPercentages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchPercentages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getAllPercentages();
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setPercentages(list);
      } else {
        throw new Error(res.error || 'Failed to load percentages');
      }
    } catch (e) {
      setError(e.message || 'Failed to load role percentages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPercentages(); }, []);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValue(String(item.percent ?? item.percentage ?? item.value ?? ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (item) => {
    const parsed = parseFloat(editValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      showToast('Please enter a valid percentage between 0 and 100.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await authService.updateRolePercentage(item.id, parsed);
      if (res.success) {
        setPercentages(prev => prev.map(p => p.id === item.id ? { ...p, percent: parsed, percentage: parsed, value: parsed } : p));
        showToast(`${ROLE_LABELS[item.role] || item.role || item.name} percentage updated to ${parsed}%`);
        setEditingId(null);
      } else {
        showToast(res.error || 'Failed to update percentage.', 'error');
      }
    } catch {
      showToast('Failed to update percentage.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1A1A1A] p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Role Percentages</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#121212] rounded-xl border border-gray-800 p-6 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1A1A1A] p-6">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
          <button onClick={fetchPercentages} className="text-red-400 hover:text-red-300 text-sm border border-red-800 px-3 py-1 rounded-lg flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1A1A1A]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Role Percentages</h1>
            <p className="text-gray-400 text-sm mt-1">Manage commission percentages for each role</p>
          </div>
          <button onClick={fetchPercentages} className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg px-4 py-2 transition-all border border-gray-700 flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {percentages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <Percent className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No percentage data found</p>
            <p className="text-gray-600 text-sm mt-1">No role percentages configured on the server</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {percentages.map((item) => {
              const roleName = ROLE_LABELS[item.role] || item.role || item.name || `Role ${item.id}`;
              const currentValue = item.percent ?? item.percentage ?? item.value ?? 0;
              const isEditing = editingId === item.id;

              return (
                <div key={item.id} className="bg-[#121212] rounded-xl border border-gray-800 p-6 hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getRoleColor(item.role || item.name)} flex items-center justify-center`}>
                        <Percent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{roleName}</p>
                        <p className="text-gray-500 text-xs">ID: {item.id}</p>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="flex-1 bg-[#0A0A0A] border border-gray-700 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
                          autoFocus
                        />
                        <span className="text-gray-400 text-lg font-bold">%</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item)}
                          disabled={saving}
                          className="flex-1 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="flex-1 text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800 rounded-lg py-2 text-sm flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-white">{Number(currentValue).toFixed(1)}<span className="text-lg text-gray-400">%</span></span>
                      <button
                        onClick={() => startEdit(item)}
                        className="text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800 rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ToastNotif toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default RolePercentage;
