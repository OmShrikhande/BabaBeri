import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Heart,
  Users,
  Coins as CoinsIcon,
  Gem as GemIcon,
} from 'lucide-react';
import authService from '../services/authService';
import LoadingCard from './LoadingCard';

// Small label/value row with optional icon. Responsive: stacks on mobile, 2/3 split on sm+
const InfoRow = React.memo(({ label, value, icon: Icon = null }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 py-2">
    <div className="flex items-center text-gray-400 text-sm">
      {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500" />}
      {label}
    </div>
    <div className="sm:col-span-2 text-white font-medium break-all">{value ?? '-'}</div>
  </div>
));

// Compact stat card
const StatCard = ({ label, value, icon: Icon, valueClass = '' }) => (
  <div className="bg-[#0A0A0A] rounded-lg p-3 border border-gray-800 flex items-center justify-between">
    <div className="flex items-center text-gray-400 text-sm">
      {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500" />}
      {label}
    </div>
    <div className={`font-bold ${valueClass}`}>{value}</div>
  </div>
);

const Section = ({ title, children, className = '' }) => (
  <section className={`bg-[#121212] rounded-xl border border-gray-800 p-6 ${className}`}>
    {title && <h2 className="text-lg font-semibold mb-4 text-white/90">{title}</h2>}
    {children}
  </section>
);

// Simple input component
const TextInput = ({ id, label, icon: Icon = null, type = 'text', value, onChange, placeholder = '', disabled = false }) => (
  <label htmlFor={id} className="block">
    <div className="text-gray-400 text-sm mb-1 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500" />}
      {label}
    </div>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7]"
      />
    </div>
  </label>
);

const TextArea = ({ id, label, value, onChange, placeholder = '', rows = 4, disabled = false }) => (
  <label htmlFor={id} className="block">
    <div className="text-gray-400 text-sm mb-1">{label}</div>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="w-full bg-[#0A0A0A] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7209B7] whitespace-pre-wrap"
    />
  </label>
);

const Profile = ({ currentUser, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Form state
  const [form, setForm] = useState({ name: '', email: '', bio: '', dob: '' });

  const roleLabel = useMemo(
    () => String(data?.role || currentUser?.userType || '').toLowerCase(),
    [data?.role, currentUser?.userType]
  );

  const displayName = useMemo(() => data?.name || data?.username || 'User', [data?.name, data?.username]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const userInfo = authService.getUserInfo?.() || {};
      const id = userInfo.id || userInfo.userId || userInfo.userID || userInfo.uid || userInfo.code; // fallback chain
      if (!id) throw new Error('No user id available to fetch profile.');
      const res = await authService.getUserById(id);
      if (res?.success) setData(res.data);
      else throw new Error(res?.error || 'Failed to load profile');
    } catch (e) {
      setError(e?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const userInfo = authService.getUserInfo?.() || {};
        const id = userInfo.id || userInfo.userId || userInfo.userID || userInfo.uid || userInfo.code;
        if (!id) throw new Error('No user id available to fetch profile.');
        const res = await authService.getUserById(id);
        if (!ignore) {
          if (res?.success) setData(res.data);
          else setError(res?.error || 'Failed to load profile');
        }
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load profile');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, []);

  // Initialize form when entering edit mode or when data changes
  useEffect(() => {
    if (data && editMode) {
      setForm({
        name: data?.name || '',
        email: data?.email || '',
        bio: data?.bio || '',
        // Normalize dob to yyyy-mm-dd if possible
        dob: (() => {
          const raw = data?.dob;
          if (!raw) return '';
          // Try to detect if already yyyy-mm-dd
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
          // Try parse common formats
          const d = new Date(raw);
          if (isNaN(d.getTime())) return '';
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        })(),
      });
    }
  }, [data, editMode]);

  const onChangeForm = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      // API: Update Self Profile (PUT, JWT)
      const url = 'https://proxstream.online/auth/user/updateprofile';
      const payload = {
        name: form.name?.trim() || '',
        email: form.email?.trim() || '',
        bio: form.bio || '',
        dob: form.dob || '',
      };

      const response = await authService.makeAuthenticatedRequest(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Update failed: ${response.status} ${response.statusText}`;
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed?.message) message = parsed.message;
        } catch {}
        throw new Error(raw ? `${message} | Details: ${raw}` : message);
      }

      // success: backend may send plain text or JSON
      let successMessage = 'Profile updated successfully';
      try {
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed?.message) successMessage = parsed.message;
        if (parsed?.data) {
          // Optionally merge returned data
          setData((prev) => ({ ...prev, ...parsed.data }));
        }
      } catch {
        if (raw) successMessage = raw;
      }

      // Optimistically update local data with form values
      setData((prev) => ({ ...prev, ...payload }));
      setSaveSuccess(successMessage);
      setEditMode(false);
    } catch (e) {
      setSaveError(e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] bg-[#0B0B0B] text-white flex-col h-full overflow-hidden">
      {/* Decorative page-only background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        {/* Purple glow (top-left) */}
        <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-[#7209B7]/25 blur-[120px]" />
        {/* Pink glow (bottom-right) */}
        <div className="absolute -bottom-32 -right-32 w-[40rem] h-[40rem] rounded-full bg-[#F72585]/20 blur-[140px]" />
        {/* Cyan soft glow (center) */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        {/* Subtle radial vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04), rgba(0,0,0,0))' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#121212]/90 backdrop-blur border-b border-gray-800 p-4 sm:p-6 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>

          {/* Actions */}
          {!loading && !error && data && (
            <div className="flex items-center space-x-3">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-3 py-2 bg-[#222] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setSaveError('');
                      setSaveSuccess('');
                    }}
                    className="px-3 py-2 bg-transparent hover:bg-gray-800 border border-gray-700 rounded-lg text-sm"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    className="px-3 py-2 bg-[#7209B7] hover:bg-[#5e0a97] rounded-lg text-sm disabled:opacity-60"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[40vh]" aria-busy="true" aria-live="polite">
            <LoadingCard />
            <div className="lg:col-span-2">
              <LoadingCard className="h-40" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/20 text-red-300 border border-red-800 p-4 rounded-lg flex items-center justify-between" role="alert">
            <span>{error}</span>
            <button
              onClick={fetchProfile}
              className="ml-4 px-3 py-1.5 rounded-md bg-red-800/40 hover:bg-red-800/60 text-sm text-red-100 border border-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {(saveError || saveSuccess) && (
              <div
                className={`p-3 rounded-lg border ${saveError ? 'bg-red-900/20 text-red-300 border-red-800' : 'bg-green-900/20 text-green-300 border-green-800'}`}
                role="status"
              >
                {saveError || saveSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Left - Summary card */}
              <Section className="space-y-4 h-full">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-[#F72585] to-[#7209B7] flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{displayName}</div>
                    <div className="text-gray-400 text-sm capitalize">{roleLabel}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <StatCard label="Coins" value={data?.coins ?? 0} icon={CoinsIcon} valueClass="text-yellow-400" />
                  <StatCard label="Diamonds" value={data?.diamond ?? 0} icon={GemIcon} valueClass="text-cyan-400" />
                </div>

                {!editMode ? (
                  <div className="space-y-2 pt-2">
                    <InfoRow label="Email" value={data?.email} icon={Mail} />
                    <InfoRow label="Status" value={data?.status} icon={Shield} />
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <TextInput id="name" label="Name" value={form.name} onChange={onChangeForm('name')} />
                    <TextInput id="email" label="Email" icon={Mail} value={form.email} onChange={onChangeForm('email')} />
                  </div>
                )}
              </Section>

              {/* Right - Details */}
              <Section title="Details" className="lg:col-span-2 h-full">
                {!editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="ID" value={data?.id} />
                    <InfoRow label="Code" value={data?.code} />
                    <InfoRow label="Username" value={data?.username} />
                    <InfoRow label="Name" value={data?.name} />
                    <InfoRow label="DOB" value={data?.dob} icon={Calendar} />
                    <InfoRow label="Gender" value={data?.gender} />
                    <InfoRow label="Region" value={data?.region} icon={MapPin} />
                    <InfoRow label="State" value={data?.state} />
                    <InfoRow label="Type" value={data?.type} />
                    <InfoRow label="Followers" value={data?.myfollowers} icon={Users} />
                    <InfoRow label="Following" value={data?.mefollowing} icon={Heart} />
                    <InfoRow label="Level" value={data?.level} />

                    <div className="md:col-span-2">
                      <div className="text-gray-400 text-sm mb-2">Bio</div>
                      <div className="text-white bg-[#0A0A0A] border border-gray-800 rounded-lg p-4 min-h-[120px] whitespace-pre-wrap">
                        {data?.bio || '-'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput id="username" label="Username" value={data?.username || ''} onChange={() => {}} disabled />
                    <TextInput id="code" label="Code" value={data?.code || ''} onChange={() => {}} disabled />
                    <TextInput id="dob" label="DOB" icon={Calendar} type="date" value={form.dob} onChange={onChangeForm('dob')} />
                    <TextInput id="region" label="Region" icon={MapPin} value={data?.region || ''} onChange={() => {}} disabled />
                    <TextArea id="bio" label="Bio" value={form.bio} onChange={onChangeForm('bio')} rows={5} className="md:col-span-2" />
                  </div>
                )}
              </Section>
            </div>
          </>
        )}

        {/* Spacer to ensure comfortable bottom padding on tall screens */}
        <div className="h-4" />
      </main>
    </div>
  );
};

export default Profile;