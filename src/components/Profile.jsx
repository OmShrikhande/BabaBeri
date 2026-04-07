import React, { useEffect, useMemo, useState, useRef } from 'react';
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

  // Pointer-responsive background state
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });
  const bgRef = useRef(null);

  // Mouse move handler for pointer-responsive background
  const handlePointerMove = (e) => {
    const rect = bgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPointer({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  };

  // Touch move support
  const handleTouchMove = (e) => {
    const rect = bgRef.current?.getBoundingClientRect();
    if (!rect || !e.touches?.[0]) return;
    const x = (e.touches[0].clientX - rect.left) / rect.width;
    const y = (e.touches[0].clientY - rect.top) / rect.height;
    setPointer({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  };

  return (
    <div
      className="relative flex min-h-[100dvh] bg-[#0B0B0B] text-white flex-col h-full overflow-x-hidden"
      ref={bgRef}
      onMouseMove={handlePointerMove}
      onTouchMove={handleTouchMove}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Pointer-responsive SVG-based profile background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <svg
          className="absolute inset-0 w-full h-full"
          width="100%"
          height="100%"
          viewBox="0 0 1920 1080"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ minHeight: '100vh', objectFit: 'cover', transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }}
        >
          {/* Responsive polygons */}
          <polygon
            points={`
              ${0 + pointer.x * 40},${0 + pointer.y * 40}
              ${600 + pointer.x * 60},${0 + pointer.y * 30}
              ${400 + pointer.x * 40},${400 + pointer.y * 60}
              ${0 + pointer.x * 30},${300 + pointer.y * 40}
            `}
            fill="url(#profilePoly1)"
            opacity="0.25"
            style={{ transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }}
          />
          <polygon
            points={`
              ${1920 - pointer.x * 40},${1080 - pointer.y * 40}
              ${1320 - pointer.x * 60},${1080 - pointer.y * 30}
              ${1520 - pointer.x * 40},${680 - pointer.y * 60}
              ${1920 - pointer.x * 30},${780 - pointer.y * 40}
            `}
            fill="url(#profilePoly2)"
            opacity="0.22"
            style={{ transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }}
          />
          {/* Subtle grid lines for structure */}
          <g opacity="0.08">
            {[...Array(20)].map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 96}
                y1="0"
                x2={i * 96}
                y2="1080"
                stroke="#fff"
                strokeWidth="1"
              />
            ))}
            {[...Array(12)].map((_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 90}
                x2="1920"
                y2={i * 90}
                stroke="#fff"
                strokeWidth="1"
              />
            ))}
          </g>
          {/* Decorative circles, pointer responsive */}
          <circle
            cx={320 + pointer.x * 60}
            cy={900 - pointer.y * 40}
            r="120"
            fill="url(#profileCircle1)"
            opacity="0.13"
            style={{ transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }}
          />
          <circle
            cx={1700 - pointer.x * 60}
            cy={200 + pointer.y * 40}
            r="90"
            fill="url(#profileCircle2)"
            opacity="0.16"
            style={{ transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }}
          />
          {/* SVG gradients */}
          <defs>
            <linearGradient id="profilePoly1" x1="0" y1="0" x2="600" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7209B7" />
              <stop offset="1" stopColor="#F72585" />
            </linearGradient>
            <linearGradient id="profilePoly2" x1="1920" y1="1080" x2="1320" y2="680" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3A86FF" />
              <stop offset="1" stopColor="#7209B7" />
            </linearGradient>
            <radialGradient id="profileCircle1" cx="0" cy="0" r="1" gradientTransform="translate(320 900) scale(120)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F72585" />
              <stop offset="1" stopColor="#0B0B0B" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="profileCircle2" cx="0" cy="0" r="1" gradientTransform="translate(1700 200) scale(90)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3A86FF" />
              <stop offset="1" stopColor="#0B0B0B" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B] pointer-events-none" />
        {/* Subtle noise texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;utf8,<svg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><circle cx=\'10\' cy=\'10\' r=\'1.5\' fill=\'%23fff\' fill-opacity=\'0.04\'/><circle cx=\'60\' cy=\'40\' r=\'1\' fill=\'%23fff\' fill-opacity=\'0.03\'/><circle cx=\'80\' cy=\'80\' r=\'1.2\' fill=\'%23fff\' fill-opacity=\'0.04\'/><circle cx=\'30\' cy=\'70\' r=\'1.1\' fill=\'%23fff\' fill-opacity=\'0.03\'/></svg>")',
            opacity: 0.5,
            mixBlendMode: 'overlay',
          }}
        />
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
      <main className="flex-1 min-h-0 p-4 sm:p-6 flex flex-col items-center max-w-3xl mx-auto w-full my-25">
        {loading && (
          <div className="w-full grid grid-cols-1 gap-6 min-h-[40vh]" aria-busy="true" aria-live="polite">
            <LoadingCard />
            <LoadingCard className="h-40" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/20 text-red-300 border border-red-800 p-4 rounded-lg flex items-center justify-between w-full" role="alert">
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
                className={`p-3 rounded-lg border w-full ${saveError ? 'bg-red-900/20 text-red-300 border-red-800' : 'bg-green-900/20 text-green-300 border-green-800'}`}
                role="status"
              >
                {saveError || saveSuccess}
              </div>
            )}

            {/* Profile Avatar and Summary */}
            <div className="flex flex-col items-center w-full relative z-10">
              <div className="relative -mt-12 mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F72585] to-[#7209B7] flex items-center justify-center shadow-xl border-4 border-[#181818]">
                  <User className="w-20 h-20 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white text-center">{displayName}</div>
              <div className="text-base text-gray-400 capitalize text-center">{roleLabel}</div>
              <div className="flex flex-row gap-6 mt-4 mb-2">
                <div className="flex flex-col items-center">
                  <CoinsIcon className="w-6 h-6 text-yellow-400 mb-1" />
                  <span className="font-bold text-yellow-400">{data?.coins ?? 0}</span>
                  <span className="text-xs text-gray-400">Coins</span>
                </div>
                <div className="flex flex-col items-center">
                  <GemIcon className="w-6 h-6 text-cyan-400 mb-1" />
                  <span className="font-bold text-cyan-400">{data?.diamond ?? 0}</span>
                  <span className="text-xs text-gray-400">Diamonds</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="w-6 h-6 text-pink-400 mb-1" />
                  <span className="font-bold text-pink-400">{data?.myfollowers ?? 0}</span>
                  <span className="text-xs text-gray-400">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <Heart className="w-6 h-6 text-red-400 mb-1" />
                  <span className="font-bold text-red-400">{data?.mefollowing ?? 0}</span>
                  <span className="text-xs text-gray-400">Following</span>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <Section className="w-full max-w-2xl mx-auto mt-6 shadow-2xl border-2 border-[#3A86FF]/30 bg-[#18181b]/90 backdrop-blur-lg">
              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <InfoRow label="ID" value={data?.id} />
                  <InfoRow label="Code" value={data?.code} />
                  <InfoRow label="Username" value={data?.username} />
                  <InfoRow label="Name" value={data?.name} />
                  <InfoRow label="Email" value={data?.email} icon={Mail} />
                  <InfoRow label="Status" value={data?.status} icon={Shield} />
                  <InfoRow label="DOB" value={data?.dob} icon={Calendar} />
                  <InfoRow label="Gender" value={data?.gender} />
                  <InfoRow label="Region" value={data?.region} icon={MapPin} />
                  <InfoRow label="State" value={data?.state} />
                  <InfoRow label="Type" value={data?.type} />
                  <InfoRow label="Level" value={data?.level} />
                  <div className="md:col-span-2">
                    <div className="text-gray-400 text-sm mb-2">Bio</div>
                    <div className="text-white bg-[#0A0A0A] border border-gray-800 rounded-lg p-4 min-h-[120px] whitespace-pre-wrap">
                      {data?.bio || '-'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <TextInput id="username" label="Username" value={data?.username || ''} onChange={() => {}} disabled />
                  <TextInput id="code" label="Code" value={data?.code || ''} onChange={() => {}} disabled />
                  <TextInput id="name" label="Name" value={form.name} onChange={onChangeForm('name')} />
                  <TextInput id="email" label="Email" icon={Mail} value={form.email} onChange={onChangeForm('email')} />
                  <TextInput id="dob" label="DOB" icon={Calendar} type="date" value={form.dob} onChange={onChangeForm('dob')} />
                  <TextInput id="region" label="Region" icon={MapPin} value={data?.region || ''} onChange={() => {}} disabled />
                  <TextArea id="bio" label="Bio" value={form.bio} onChange={onChangeForm('bio')} rows={5} className="md:col-span-2" />
                </div>
              )}
            </Section>
          </>
        )}

        {/* Spacer to ensure comfortable bottom padding on tall screens */}
        <div className="h-4" />
      </main>
    </div>
  );
};

export default Profile;