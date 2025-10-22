import React, { useCallback, useMemo, useState } from 'react';
import UserCodeInput from './components/UserCodeInput';
import UserBanner from './components/UserBanner';
import UserDetails from './components/UserDetails';
import { API_CONFIG, TOKEN_CONFIG } from '../../config/api';

const USER_LOOKUP_ENDPOINT = '/auth/api/getByCode';
const USER_TOGGLE_ENDPOINT = '/auth/superadmin/active-deactive-seller';

const truthyStrings = new Set(['true', '1', 'yes', 'active', 'enabled', 'y']);
const falsyStrings = new Set(['false', '0', 'no', 'inactive', 'disabled', 'n']);

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    if (truthyStrings.has(normalized)) {
      return true;
    }

    if (falsyStrings.has(normalized)) {
      return false;
    }
  }

  return null;
};

const resolveUserActive = (user) => {
  if (!user) {
    return false;
  }

  const candidates = [
    user.isActive,
    user.isseller,
    user.isSeller,
    user.status,
    user.active,
    user.is_active,
    user.IsSeller
  ];

  for (const candidate of candidates) {
    const normalized = normalizeBoolean(candidate);
    if (normalized !== null) {
      return normalized;
    }
  }

  return false;
};

const applyActiveState = (user, active) => {
  if (!user) {
    return user;
  }

  const next = { ...user };
  next.isActive = active;
  next.isseller = active;
  if ('isSeller' in next) {
    next.isSeller = active;
  }
  return next;
};

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_CONFIG.STORAGE_KEY) || null;
};

const UserActivationLayout = () => {
  const [userCode, setUserCode] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const isSubmitDisabled = useMemo(() => loading || !userCode.trim(), [loading, userCode]);
  const userIsActive = useMemo(() => resolveUserActive(userData), [userData]);

  const fetchUser = useCallback(async (code) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setError('Super admin authentication is required to fetch user data.');
      return;
    }

    setLoading(true);
    setError(null);
    setActionError(null);
    setActionMessage(null);
    setUserData(null);

    try {
      const url = new URL(`${API_CONFIG.BASE_URL}${USER_LOOKUP_ENDPOINT}`);
      url.searchParams.set('code', trimmedCode);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      const user = data?.user ?? data;

      if (!user) {
        setError('User not found');
        return;
      }

      const normalizedActive = resolveUserActive(user);
      setUserData(applyActiveState(user, normalizedActive));
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event?.preventDefault();
      if (!isSubmitDisabled) {
        fetchUser(userCode);
      }
    },
    [fetchUser, isSubmitDisabled, userCode]
  );

  const handleToggleActivation = useCallback(async () => {
    if (!userData) {
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setActionError('Super admin authentication is required to update activation status.');
      return;
    }

    const resolvedCode = userData.code || userData.UserCode || userData.userCode || userCode.trim();
    if (!resolvedCode) {
      setActionError('Unable to determine user code for activation.');
      return;
    }

    const currentActive = resolveUserActive(userData);
    const url = new URL(`${API_CONFIG.BASE_URL}${USER_TOGGLE_ENDPOINT}`);
    url.searchParams.set('UserCode', resolvedCode);

    setActionPending(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const payloadText = await response.text();
      let payload = null;

      if (payloadText) {
        try {
          payload = JSON.parse(payloadText);
        } catch (parseError) {
          payload = null;
        }
      }

      const remoteStatus = normalizeBoolean(
        payload?.isseller ??
          payload?.isSeller ??
          payload?.isActive ??
          payload?.status
      );

      const nextStatus = remoteStatus !== null ? remoteStatus : !currentActive;
      setUserData((prev) => applyActiveState(prev, nextStatus));
      setActionMessage(nextStatus ? 'User activated successfully.' : 'User deactivated successfully.');
    } catch (err) {
      setActionError(err?.message || 'Unable to update user status.');
    } finally {
      setActionPending(false);
    }
  }, [userData, userCode]);

  return (
    <div className="h-900 w-full bg-gradient-to-br from-[#050505] via-[#0F0F0F] to-[#050505] text-white py-16 px-4 md:px-8">
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent)] opacity-80" aria-hidden />

        <header className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight">User Activation</h1>
          <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
            Search for a user by their unique code, review their profile, and toggle their activation status securely.
          </p>
        </header>

        <section className="bg-[#101010] border border-white/5 rounded-3xl shadow-2xl p-6 md:p-10">
          <UserCodeInput
            userCode={userCode}
            setUserCode={setUserCode}
            onSubmit={handleSubmit}
            loading={loading}
          />

          {loading && (
            <div className="flex items-center gap-3 text-sm text-gray-300 mb-6">
              <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" aria-hidden />
              Fetching latest user data...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-center text-red-200">
              {error}
            </div>
          )}

          {userData && (
            <div className="space-y-8">
              <UserBanner
                user={userData}
                isActive={userIsActive}
                isProcessing={actionPending}
                onToggleActivation={handleToggleActivation}
              />

              {(actionMessage || actionError) && (
                <div className="space-y-4">
                  {actionMessage && (
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center text-emerald-100">
                      {actionMessage}
                    </div>
                  )}
                  {actionError && (
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-center text-red-200">
                      {actionError}
                    </div>
                  )}
                </div>
              )}

              <UserDetails user={userData} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserActivationLayout;
