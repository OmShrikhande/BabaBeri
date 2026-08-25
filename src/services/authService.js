import { API_CONFIG, TOKEN_CONFIG, DEFAULT_HEADERS, USER_TYPES } from '../config/api.js';
import { normalizeUserType } from '../utils/roleBasedAccess.js';
import {
  readStoredToken,
  writeStoredToken,
  clearStoredAuth,
  readStoredUserInfo,
  writeStoredUserInfo,
} from './tokenStore.js';

class AuthService {
  constructor() {
    this.token = readStoredToken();
  }

  // Login method
  async login(credentials) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          email: credentials.email || credentials.username,
          password: credentials.password
        })
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      // Handle both JSON and plain text responses
      const responseText = await response.text();
      let data;
      let token;

      try {
        data = JSON.parse(responseText);
        token = data.token || data.accessToken || data.jwt;
      } catch (e) {
        console.error('Failed to parse login response:', e);
        throw new Error('Invalid response format from server');
      }

      if (token && typeof token === 'string' && token.split('.').length === 3) {
        this.token = token;
        writeStoredToken(token);

        // Store user info if available
        if (data.user || data.userInfo || data.profile) {
          const userInfo = data.user || data.userInfo || data.profile;
          writeStoredUserInfo(userInfo);
        }
      } else {
        throw new Error('Invalid token received from server');
      }

      return {
        success: true,
        data: data,
        token: this.token,
        userType: normalizeUserType(this.getUserType())
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  }

  // Logout method
  async logout() {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            ...DEFAULT_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }

    this.token = null;
    clearStoredAuth();
  }

  // Keep in-memory token in sync with sessionStorage (shared across service singletons)
  syncTokenFromStorage() {
    const stored = readStoredToken();
    if (stored) {
      this.token = stored;
    }
    return this.token || stored;
  }

  setToken(token) {
    this.token = token || null;
    writeStoredToken(token || null);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // Get stored token
  getToken() {
    return this.syncTokenFromStorage();
  }

  // Get stored user info
  getUserInfo() {
    return readStoredUserInfo();
  }

  // Extract user code from various payload shapes
  extractUserCode(source) {
    if (!source) return null;

    if (typeof source === 'string') {
      const trimmed = source.trim();
      return trimmed.length ? trimmed : null;
    }

    const possibleKeys = ['userCode', 'UserCode', 'code', 'Code', 'user_code', 'usercode', 'Usercode'];
    for (const key of possibleKeys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const value = source[key];
        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue.length) {
            return trimmedValue;
          }
        } else if (typeof value === 'number') {
          return String(value);
        }
      }
    }

    return null;
  }

  // Ensure we have fresh profile data cached locally (adds userCode when missing)
  async ensureUserProfileCached() {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    const currentInfo = this.getUserInfo();
    if (this.extractUserCode(currentInfo)) {
      return currentInfo;
    }

    try {
      const freshProfile = await this.fetchUserProfile();
      if (freshProfile && typeof freshProfile === 'object') {
        const mergedProfile = { ...(currentInfo || {}), ...freshProfile };
        writeStoredUserInfo(mergedProfile);
        return mergedProfile;
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }

    return currentInfo;
  }

  // Get users by role
  async getUsersByRole(role) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const roleParam = String(role).toUpperCase();
    const url = `${API_CONFIG.BASE_URL}/auth/api/alluserByRole?role=${encodeURIComponent(roleParam)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data: data };
    } catch (error) {
      console.error('Get users by role error:', error);
      return { success: false, error: error.message || `Failed to fetch users for role ${roleParam}.` };
    }
  }

  // Get master agencies by admin code
  async getMasterAgenciesByAdminCode(code) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_MASTER_AGENCY}?code=${encodeURIComponent(code)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch master agencies: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data: data };
    } catch (error) {
      console.error('Get master agencies error:', error);
      return { success: false, error: error.message || 'Failed to fetch master agencies.' };
    }
  }

  // Get master agencies for the logged-in admin
  async getMasterAgenciesForLoggedInAdmin() {
    const userInfo = this.getUserInfo();
    const code = this.extractUserCode(userInfo);
    if (!code) {
      return { success: false, error: 'Admin code not found.' };
    }
    return this.getAllSubUserByCode(code, 'MASTER_AGENCY');
  }


  // Make authenticated API requests
  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();

    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      ...DEFAULT_HEADERS,
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Fetch current user's profile after login
  async fetchUserProfile() {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch profile error:', error);
      throw error;
    }
  }

  async getUserById(user) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const candidates = [];
    if (typeof user === 'object' && user !== null) {
      const extracted = this.extractUserCode(user);
      if (extracted) {
        const trimmed = String(extracted).trim();
        if (trimmed.length) candidates.push(trimmed);
      }
      ['id', 'userId', 'userID', 'uid', 'code'].forEach((key) => {
        const value = user[key];
        if (value !== undefined && value !== null) {
          const trimmed = String(value).trim();
          if (trimmed.length) candidates.push(trimmed);
        }
      });
    } else if (typeof user === 'number' || typeof user === 'string') {
      const trimmed = String(user).trim();
      if (trimmed.length) candidates.push(trimmed);
    }

    const identifier = candidates.find((value) => value.length);
    if (!identifier) {
      return { success: false, error: 'User id is required to fetch profile.' };
    }

    const params = new URLSearchParams();
    ['id', 'userId', 'userid', 'UserCode', 'usercode'].forEach((key) => {
      params.append(key, identifier);
    });
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_USER_BY_ID}?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
      }
      const payload = data?.data ?? data ?? null;
      if (payload && typeof payload === 'object') {
        const existingCode = this.extractUserCode(payload);
        if (!existingCode) {
          payload.userCode = identifier;
        }
      }
      return { success: true, data: payload };
    } catch (error) {
      console.error('Get user by id error:', error);
      return { success: false, error: error.message || 'Failed to fetch user.' };
    }
  }

  // Decode JWT token (basic implementation)
  decodeToken(token = null) {
    const tokenToUse = token || this.getToken();

    if (!tokenToUse) return null;

    try {
      const base64Url = tokenToUse.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token = null) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  // Get user type from token or stored info
  getUserType() {
    const userInfo = this.getUserInfo();
    if (userInfo) {
      // Normalize most common keys from backend profile
      const role = userInfo.userType || userInfo.role || userInfo.type || userInfo.accountType || userInfo.position;
      const normalized = normalizeUserType(role);
      if (normalized) return normalized;
    }

    const decoded = this.decodeToken();
    if (decoded) {
      // Try different possible fields for user type
      const role = decoded.userType || decoded.role || decoded.type || decoded.accountType || decoded.position;
      const normalized = normalizeUserType(role);
      return normalized || 'admin';
    }

    return 'admin'; // Default fallback
  }

  // Count by role
  async countByRole(role) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const roleParam = String(role).toUpperCase();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNT_BY_ROLE}?role=${encodeURIComponent(roleParam)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to fetch count: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Count by role error:', error);
      return { success: false, error: error.message || `Failed to fetch count for role ${roleParam}.` };
    }
  }

  // Get all sub users by code
  async getAllSubUserByCode(code, role = 'MASTER_AGENCY') {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}/auth/api/geAllsubUserByCode?code=${encodeURIComponent(code)}&role=${encodeURIComponent(role)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch sub users: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data: data };
    } catch (error) {
      console.error('Get all sub users by code error:', error);
      return { success: false, error: error.message || 'Failed to fetch sub users.' };
    }
  }

  // Get user by code
  async getUserByCode(code) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_BY_CODE}?code=${encodeURIComponent(code)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data: data };
    } catch (error) {
      console.error('Get user by code error:', error);
      return { success: false, error: error.message || 'Failed to fetch user by code.' };
    }
  }

  // Get diamond credits
  async getDiamondCredits() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNT_CREDIT}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to fetch diamond credits: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Get diamond credits error:', error);
      return { success: false, error: error.message || 'Failed to fetch diamond credits.' };
    }
  }

  // Get all hosts (HOST details)
  async getAllHosts() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}/auth/user/getallhost?role=HOST`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch hosts: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data };
    } catch (error) {
      console.error('Get all hosts error:', error);
      return { success: false, error: error.message || 'Failed to fetch hosts.' };
    }
  }

  // Get pending hosts
  async getPendingHosts() {
    console.log('getPendingHosts - Starting...');
    const token = this.getToken();
    console.log('getPendingHosts - Token exists:', !!token);
    if (!token) {
      console.log('getPendingHosts - No token found');
      return { success: false, error: 'Not authenticated. Please login.' };
    }
    if (this.isTokenExpired(token)) {
      console.log('getPendingHosts - Token expired');
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    console.log('getPendingHosts - User role:', role);
    if (![USER_TYPES.ADMIN, USER_TYPES.SUPER_ADMIN].includes(role)) {
      console.log('getPendingHosts - Access denied for role:', role);
      return { success: false, status: 403, error: 'Forbidden: Only Admin or Super Admin can view pending hosts.' };
    }

    const url = `${API_CONFIG.BASE_URL}/auth/api/alluserByRole?role=HOST`;

    try {
      console.log('getPendingHosts - Making API call to:', url);
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      console.log('getPendingHosts - Response status:', response.status);
      console.log('getPendingHosts - Response ok:', response.ok);
      console.log('getPendingHosts - Response body:', raw.substring(0, 200) + (raw.length > 200 ? '...' : ''));

      if (!response.ok) {
        console.log('getPendingHosts - API call failed');
        throw new Error(`Failed to fetch hosts: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      try {
        data = JSON.parse(raw);
        console.log('getPendingHosts - Parsed data type:', typeof data, Array.isArray(data) ? 'array' : 'object');
      } catch (parseError) {
        console.log('getPendingHosts - JSON parse error:', parseError);
        throw new Error('Invalid response format');
      }

      // Filter for pending hosts on the client side
      const pendingHosts = Array.isArray(data) ? data.filter(host => host.status === 'pending' || host.status === 'PENDING') : [];
      console.log('getPendingHosts - Total hosts:', Array.isArray(data) ? data.length : 'N/A');
      console.log('getPendingHosts - Pending hosts found:', pendingHosts.length);
      return { success: true, data: pendingHosts };
    } catch (error) {
      console.error('Get pending hosts error:', error);
      return { success: false, error: error.message || 'Failed to fetch pending hosts.' };
    }
  }

  // Get sellers (hosts subset)
  async getSellers(options = {}) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const params = new URLSearchParams({ role: 'HOST' });
    if (options.search) {
      params.append('search', options.search);
    }
    if (options.status) {
      params.append('status', options.status);
    }

    const url = `${API_CONFIG.BASE_URL}/auth/user/getallhost?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch sellers: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data };
    } catch (error) {
      console.error('Get sellers error:', error);
      return { success: false, error: error.message || 'Failed to fetch sellers.' };
    }
  }

  // Add coins to host (Admin/Super Admin only)
  async addCoinsToHost(hostId, amount) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    // Only allow for admin/super admin
    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.ADMIN && role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Admin or Super Admin can recharge coins.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COINS_PLUS}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'PUT',
        body: JSON.stringify({
          hostid: hostId,
          ammount: amount
        })
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to add coins: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data: data || { message: 'Coins added successfully' } };
    } catch (error) {
      console.error('Add coins error:', error);
      return { success: false, error: error.message || 'Failed to add coins.' };
    }
  }

  // Update seller activation state (Admin/Super Admin only)
  async updateSellerActivation({ userCode, status }) {
    if (!userCode) {
      return { success: false, error: 'User code is required to update seller status.' };
    }

    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    console.log('Update Seller Activation - Role:', role, 'Expected:', [USER_TYPES.ADMIN, USER_TYPES.SUPER_ADMIN]);

    if (role !== USER_TYPES.ADMIN && role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Admin or Super Admin can update seller activation.' };
    }

    const paramsString = new URLSearchParams({ UserCode: userCode });
    if (status) {
      paramsString.append('status', status);
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACTIVE_DEACTIVE_SELLER}?${paramsString.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');

      if (!response.ok) {
        throw new Error(`Failed to update seller activation: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
      }

      return { success: true, data: data || { message: 'Seller activation updated successfully.' } };
    } catch (error) {
      console.error('Update seller activation error:', error);
      return { success: false, error: error.message || 'Failed to update seller activation.' };
    }
  }

  async getAllPendingProfilePics() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (![USER_TYPES.ADMIN, USER_TYPES.SUPER_ADMIN].includes(role)) {
      return { success: false, status: 403, error: 'Forbidden: Only Admin or Super Admin can view pending profile pictures.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_PENDING_PICS}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch pending profile pictures: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data };
    } catch (error) {
      console.error('Get pending profile pictures error:', error);
      return { success: false, error: error.message || 'Failed to fetch pending profile pictures.' };
    }
  }

  async updateProfilePicStatus(userCode, status) {
    if (!userCode) {
      return { success: false, error: 'User code is required to update profile picture status.' };
    }

    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (![USER_TYPES.ADMIN, USER_TYPES.SUPER_ADMIN].includes(role)) {
      return { success: false, status: 403, error: 'Forbidden: Only Admin or Super Admin can update profile picture status.' };
    }

    const normalizedStatus = String(status || 'APPROVED').trim().toUpperCase();
    const allowedStatuses = ['APPROVED', 'REJECT'];
    const statusParam = allowedStatuses.includes(normalizedStatus) ? normalizedStatus : 'APPROVED';

    const params = new URLSearchParams({ usercode: userCode, status: statusParam });
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPROVE_PROFILE}?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to update profile picture status: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
      }
      return { success: true, data: data || { message: 'Profile picture status updated successfully.' } };
    } catch (error) {
      console.error('Update profile picture status error:', error);
      return { success: false, error: error.message || 'Failed to update profile picture status.' };
    }
  }

  // Get active hosts
  async getActiveHosts({ status } = {}) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (![USER_TYPES.ADMIN, USER_TYPES.SUPER_ADMIN].includes(role)) {
      return { success: false, status: 403, error: 'Forbidden: Only Admin or Super Admin can view active hosts.' };
    }

    const allowedStatuses = ['activate', 'deactivate', 'blocked'];
    const normalizedStatus = String(status || 'activate').trim().toLowerCase();
    const statusParam = allowedStatuses.includes(normalizedStatus) ? normalizedStatus : 'activate';

    const params = new URLSearchParams({ status: statusParam });
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ACTIVE_HOSTS}?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch active hosts: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data };
    } catch (error) {
      const message = error?.message || '';
      if (message.includes('403') || message.toLowerCase().includes('forbidden')) {
        try {
          const fallback = await this.getAllHosts();
          if (fallback.success) {
            const list = Array.isArray(fallback.data) ? fallback.data : fallback.data?.data || [];
            const filtered = list.filter((item) => {
              const value = (item?.status || item?.accountStatus || '').toString().toLowerCase();
              if (statusParam === 'activate') return value === 'activate' || value === 'active';
              if (statusParam === 'deactivate') return value === 'deactivate' || value === 'inactive';
              if (statusParam === 'blocked') return value === 'blocked';
              return false;
            });
            return { success: true, data: filtered };
          }
        } catch (fallbackError) {
          console.error('Active hosts fallback error:', fallbackError);
        }
      }
      console.error('Get active hosts error:', error);
      return { success: false, error: error.message || 'Failed to fetch active hosts.' };
    }
  }

  // Get all pending cashout requests (Super Admin only)
  async getAllPendingCashout() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can view pending cashout requests.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_PENDING_CASHOUT}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch pending cashout requests: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data: data };
    } catch (error) {
      console.error('Get pending cashout error:', error);
      return { success: false, error: error.message || 'Failed to fetch pending cashout requests.' };
    }
  }

  // Get pending cashout list (New API)
  async getPendingCashoutList() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can view pending cashout requests.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_PENDING_CASHOUT_LIST}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch pending cashout requests: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      return { success: true, data: data };
    } catch (error) {
      console.error('Get pending cashout list error:', error);
      return { success: false, error: error.message || 'Failed to fetch pending cashout requests.' };
    }
  }

  /**
   * Approve or reject a cashout request (Super Admin only).
   * PUT /auth/superadmin/approve-reject-cashout?usercode=&status=&transactionno=&role=
   */
  async approveRejectCashout({ usercode, status, transactionno, role }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const userRole = normalizeUserType(this.getUserType());
    if (userRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can approve/reject cashouts.' };
    }

    if (!usercode || !status || !transactionno) {
      return { success: false, error: 'usercode, status, and transactionno are required.' };
    }

    const params = new URLSearchParams({
      usercode: String(usercode).trim(),
      status: String(status).trim().toUpperCase(),
      transactionno: String(transactionno).trim(),
      role: String(role || 'HOST').trim().toUpperCase(),
    });

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPROVE_REJECT_CASHOUT}?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(
          this.formatApiError(response, raw, `Failed to ${status} cashout: ${response.status}`),
        );
      }
      let data = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
      }
      return { success: true, data: data || { message: `Cashout ${status} successful` } };
    } catch (error) {
      console.error('Approve/reject cashout error:', error);
      return { success: false, error: error.message || 'Failed to update cashout request.' };
    }
  }

  async getDiamondWalletSummary() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can view wallet summary.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPERADMIN_BALANCE}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch wallet summary: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }
      }
      const summary = {
        totalCredited: data.totalCredited ?? data.totalCredit ?? 0,
        totalDebited: data.totalDebited ?? data.totalDebit ?? 0,
        currentBalance: data.currentBalance ?? 0,
        diamondBalance: data.diamondBalance ?? 0,
        lastUpdated: data.lastUpdated ?? null
      };
      return { success: true, data: summary };
    } catch (error) {
      console.error('Get wallet summary error:', error);
      return { success: false, error: error.message || 'Failed to fetch wallet summary.' };
    }
  }

  // Superadmin self recharge - get OTP for adding coins
  async superAdminSelfRecharge(coins) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can perform self recharge.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUPERADMIN_SELF_RECHARGE}?coins=${coins}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST'
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to initiate self recharge: ${response.status} ${response.statusText}\n${raw}`);
      }

      // If we get here, the API call was successful (status 200+)
      // The API returns the OTP directly, but we don't need to extract it
      // Just return success since the OTP was sent to the user
      return { success: true, message: 'OTP sent successfully to your registered device' };
    } catch (error) {
      console.error('Superadmin self recharge error:', error);
      return { success: false, error: error.message || 'Failed to initiate self recharge.' };
    }
  }

  // Verify superadmin self recharge OTP
  async verifySuperAdminRechargeOtp(otp) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can verify recharge OTP.' };
    }

    if (!otp || otp.length !== 6) {
      return { success: false, error: 'Invalid OTP format' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_SUPERADMIN_RECHARGE_OTP}?otp=${encodeURIComponent(otp)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'PUT'
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to verify OTP: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          // If not JSON, assume success with plain text response
          data = { message: raw || 'OTP verified successfully' };
        }
      }

      return { success: true, data, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Verify superadmin recharge OTP error:', error);
      return { success: false, error: error.message || 'Failed to verify OTP.' };
    }
  }

  // Send OTP for superadmin wallet operations
  async sendWalletOtp() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can request wallet OTP.' };
    }

    // In a real implementation, this would call an API endpoint to send OTP
    // For now, we'll simulate OTP sending
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'OTP sent successfully to your registered device' };
    } catch (error) {
      console.error('Send wallet OTP error:', error);
      return { success: false, error: 'Failed to send OTP. Please try again.' };
    }
  }

  // Verify OTP for superadmin wallet operations
  async verifyWalletOtp(otp) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can verify wallet OTP.' };
    }

    if (!otp || otp.length !== 6) {
      return { success: false, error: 'Invalid OTP format' };
    }

    // In a real implementation, this would call an API endpoint to verify OTP
    // For now, we'll simulate OTP verification (accepting 123456 as valid)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const isValidOtp = otp === '123456'; // Mock OTP for demo purposes
      if (isValidOtp) {
        return { success: true, message: 'OTP verified successfully' };
      } else {
        return { success: false, error: 'Invalid OTP' };
      }
    } catch (error) {
      console.error('Verify wallet OTP error:', error);
      return { success: false, error: 'Failed to verify OTP. Please try again.' };
    }
  }

  // Save diamond credit/debit
  async saveDiamond({ diamonds, status }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const role = normalizeUserType(this.getUserType());
    if (role !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can save diamond transactions.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_DIAMOND}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify({ diamonds: Number(diamonds), status })
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to save diamond: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }
      }

      return { success: true, data, message: 'Diamond transaction saved successfully' };
    } catch (error) {
      console.error('Save diamond error:', error);
      return { success: false, error: error.message || 'Failed to save diamond transaction.' };
    }
  }

  // Create admin
  async createAdmin({ name, email, password }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_ADMIN}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to create admin: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Create admin error:', error);
      return { success: false, error: error.message || 'Failed to create admin.' };
    }
  }

  // Create sub-admin
  async createSubAdmin({ name, email, password }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_ADMIN}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to create sub-admin: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Create sub-admin error:', error);
      return { success: false, error: error.message || 'Failed to create sub-admin.' };
    }
  }

  // Create master agency
  async createMasterAgency({ name, email, password, code }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_MASTER_AGENCY}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify({ name, email, password, code })
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to create master agency: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Create master agency error:', error);
      return { success: false, error: error.message || 'Failed to create master agency.' };
    }
  }

  parseApiPayload(raw) {
    const trimmed = (raw || '').trim();
    if (!trimmed) return { message: 'Request completed successfully.' };
    try {
      return JSON.parse(trimmed);
    } catch {
      return { message: trimmed };
    }
  }

  formatApiError(response, raw, fallback) {
    const parsed = this.parseApiPayload(raw);
    const message = parsed?.message || parsed?.error || (typeof parsed === 'string' ? parsed : '');
    if (message) return message;
    if (response?.status === 403) {
      return 'Access denied. Your account may not have permission to upgrade this host, or the host is not eligible.';
    }
    return fallback || `Request failed: ${response?.status || 'unknown'} ${response?.statusText || ''}`.trim();
  }

  // Upgrade host to agency (POST /auth/upgrade?hostcode=&agencyname=&macode=&password=)
  async createAgency({ name, userId, masterAgencyCode, password }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const hostcode = String(userId || '').trim();
    const agencyname = String(name || '').trim();
    const macode = String(masterAgencyCode || '').trim();
    const pwd = String(password || '').trim();

    if (!hostcode || !agencyname || !macode) {
      return { success: false, error: 'Host ID, agency name, and master agency code are required.' };
    }

    if (!pwd) {
      return { success: false, error: 'Password is required.' };
    }

    const hostCheck = await this.getUserByCode(hostcode);
    if (!hostCheck.success) {
      return { success: false, error: hostCheck.error || `Host not found: ${hostcode}` };
    }

    const host = hostCheck.data;
    const hostRole = String(host?.role || '').toUpperCase();
    if (hostRole && hostRole !== 'HOST') {
      return { success: false, error: `User ${hostcode} is a ${host.role}, not a host. Only hosts can be upgraded to agencies.` };
    }

    if (host?.owner) {
      return {
        success: false,
        error: `Host ${hostcode} is already assigned to ${host.ownername || host.owner} (${host.owner}). Use Move Host instead, or pick an unassigned host.`
      };
    }

    const params = new URLSearchParams({ hostcode, agencyname, macode, password: pwd });
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPGRADE_HOST_TO_AGENCY}?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'POST' });
      const raw = await response.text().catch(() => '');

      if (!response.ok) {
        return {
          success: false,
          error: this.formatApiError(response, raw, `Failed to upgrade host: ${response.status} ${response.statusText}`)
        };
      }

      return { success: true, data: this.parseApiPayload(raw) };
    } catch (error) {
      console.error('Create agency error:', error);
      return { success: false, error: error.message || 'Failed to create agency.' };
    }
  }

  // Get all admins for dropdown
  async getAdmins() {
    return this.getUsersByRole('ADMIN');
  }

  // Get all master agencies for dropdown
  async getMasterAgencies() {
    return this.getUsersByRole('MASTER_AGENCY');
  }

  // Get master agency hierarchy and current owner
  async getMasterAgencyHierarchy(userId) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/gethierarchy?code=${encodeURIComponent(userId)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to fetch hierarchy: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }
      const structuredData = {
        admin: data.data || data
      };
      return { success: true, data: structuredData };
    } catch (error) {
      console.error('Get master agency hierarchy error:', error);
      return { success: false, error: error.message || 'Failed to fetch hierarchy.' };
    }
  }

  // Move master agency to new admin owner
  async moveMasterAgency({ userId, newAdminId }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/changeowner?code=${encodeURIComponent(userId)}&ownercode=${encodeURIComponent(newAdminId)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to move master agency: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Move master agency error:', error);
      return { success: false, error: error.message || 'Failed to move master agency.' };
    }
  }

  // Get agency hierarchy
  async getAgencyHierarchy(userId) {
    const res = await this.getUserById(userId);
    if (!res.success) return res;

    const user = res.data;
    return {
      success: true,
      data: {
        admin: { name: user.adminName || '—' },
        masterAgency: { name: user.masterAgencyName || user.owner || '—' }
      }
    };
  }

  // Move agency to new master agency
  async moveAgency({ userId, newMasterAgencyId }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };

    // Using the same endpoint as moveMasterAgency: /auth/superadmin/changeowner
    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/changeowner?code=${encodeURIComponent(userId)}&ownercode=${encodeURIComponent(newMasterAgencyId)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to move agency: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Move agency error:', error);
      return { success: false, error: error.message || 'Failed to move agency.' };
    }
  }

  // Get host hierarchy
  async getHostHierarchy(userId) {
    const res = await this.getUserById(userId);
    if (!res.success) return res;

    const user = res.data;
    return {
      success: true,
      data: {
        admin: { name: user.adminName || '—' },
        masterAgency: { name: user.masterAgencyName || '—' },
        agency: { name: user.agencyName || user.owner || '—' }
      }
    };
  }

  // Move host to new agency
  async moveHost({ userId, newAgencyId }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHANGE_OWNER}?code=${encodeURIComponent(userId)}&ownercode=${encodeURIComponent(newAgencyId)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to move host: ${response.status} ${response.statusText}\n${raw}`);
      }
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Move host error:', error);
      return { success: false, error: error.message || 'Failed to move host.' };
    }
  }

  // Get all agencies
  async getAgencies() {
    return this.getUsersByRole('AGENCY');
  }

  // Get rate list by id
  async getRateList(id) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_RATE_LIST}?id=${id}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch rate list: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get rate list error:', error);
      return { success: false, error: error.message || 'Failed to fetch rate list.' };
    }
  }

  // Change rate by id
  async changeRate(id, rate) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHANGE_RATE}?id=${id}&rate=${rate}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to change rate: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Change rate error:', error);
      return { success: false, error: error.message || 'Failed to change rate.' };
    }
  }

  // Deduct coins from host
  async deductCoinsFromHost(hostId, amount) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/api/coinsminus?id=${encodeURIComponent(hostId)}&coins=${encodeURIComponent(amount)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to deduct coins: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Deduct coins error:', error);
      return { success: false, error: error.message || 'Failed to deduct coins.' };
    }
  }

  // Update user status (Active / Pending / Deactivate / Blocked)
  async updateUserStatus(userCode, status) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/api/updatestatus?usercode=${encodeURIComponent(userCode)}&status=${encodeURIComponent(status)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to update status: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Update status error:', error);
      return { success: false, error: error.message || 'Failed to update status.' };
    }
  }

  // Ban user with reason and duration
  async banUser({ userCode, reason, duration }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/api/updatestatus?usercode=${encodeURIComponent(userCode)}&status=Blocked&reason=${encodeURIComponent(reason)}&duration=${encodeURIComponent(duration)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to ban user: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Ban user error:', error);
      return { success: false, error: error.message || 'Failed to ban user.' };
    }
  }

  // Deactivate a user account by email
  async deactivateProfile(email) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/user/deactivate-profile?email=${encodeURIComponent(email)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to deactivate profile: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Deactivate profile error:', error);
      return { success: false, error: error.message || 'Failed to deactivate profile.' };
    }
  }

  // Convert diamonds to coins (super admin only)
  async convertDiamondsToCoins(diamonds) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/convertdiamond_to_coin_for_sa?diamond=${encodeURIComponent(diamonds)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'POST' });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to convert diamonds: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Convert diamonds error:', error);
      return { success: false, error: error.message || 'Failed to convert diamonds to coins.' };
    }
  }

  // Get all role percentages
  async getAllPercentages() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/getallpercentage`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to fetch percentages: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Get percentages error:', error);
      return { success: false, error: error.message || 'Failed to fetch percentages.' };
    }
  }

  // Update role percentage by id
  async updateRolePercentage(id, percent) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/update-percent`;
    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, percent: parseFloat(percent) })
      });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to update percentage: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Update percentage error:', error);
      return { success: false, error: error.message || 'Failed to update percentage.' };
    }
  }

  // Get user list by owner code
  async getUsersByOwnerCode() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/private/getdatabyownercode`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to fetch data: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Get by owner code error:', error);
      return { success: false, error: error.message || 'Failed to fetch user list by owner code.' };
    }
  }

  // Set commission for a user
  async setCommission({ commissionType, commission, userId }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/commission/setcommission`;
    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissiontype: commissionType, commission: parseFloat(commission), userid: userId })
      });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to set commission: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Set commission error:', error);
      return { success: false, error: error.message || 'Failed to set commission.' };
    }
  }

  // Get total available coins
  async getTotalAvailableCoins() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/api/getTotalCoins`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(this.formatApiError(response, raw, `Failed to fetch total coins: ${response.status}`));
      }
      const parsed = this.parseApiPayload(raw);
      const coins = typeof parsed === 'number' ? parsed : Number(parsed?.coins ?? parsed?.total ?? parsed?.message) || 0;
      return { success: true, data: { coins } };
    } catch (error) {
      console.error('Get total coins error:', error);
      return { success: false, error: error.message || 'Failed to fetch total coins.' };
    }
  }

  // Get total sold coins
  async getTotalSellCoins() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/auth/api/getTotalCoinsSell`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(this.formatApiError(response, raw, `Failed to fetch total sell coins: ${response.status}`));
      }
      const parsed = this.parseApiPayload(raw);
      const totalSell = typeof parsed === 'number' ? parsed : Number(parsed?.totalSell ?? parsed?.total ?? parsed?.message) || 0;
      return { success: true, data: { totalSell } };
    } catch (error) {
      console.error('Get total sell coins error:', error);
      return { success: false, error: error.message || 'Failed to fetch total sell coins.' };
    }
  }

  // Get cashout history (all records or filtered by user code)
  async getCashoutHistory(userCode = '') {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const params = userCode ? `?usercode=${encodeURIComponent(userCode)}` : '';
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_CASHOUT_HISTORY}${params}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        return {
          success: false,
          error: this.formatApiError(response, raw, `Failed to fetch cashout history: ${response.status}`)
        };
      }
      return { success: true, data: this.parseApiPayload(raw) };
    } catch (error) {
      console.error('Get cashout history error:', error);
      return { success: false, error: error.message || 'Failed to fetch cashout history.' };
    }
  }

  // Get diamond analytics range for dashboard charts / financial cards
  async getDiamondRange(from, to) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const params = new URLSearchParams({ from, to });
    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/range?${params}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        return {
          success: false,
          error: this.formatApiError(response, raw, `Failed to fetch diamond range: ${response.status}`)
        };
      }
      const data = this.parseApiPayload(raw);
      return { success: true, data: Array.isArray(data) ? data : (data?.data || []) };
    } catch (error) {
      console.error('Get diamond range error:', error);
      return { success: false, error: error.message || 'Failed to fetch diamond range.' };
    }
  }

  // Delete live form from database
  async deleteLiveForm(id) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated.' };
    const url = `${API_CONFIG.BASE_URL}/api/liveusers/delete/${encodeURIComponent(id)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'DELETE' });
      const raw = await response.text().catch(() => '');
      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }
      if (!response.ok) throw new Error(data?.message || `Failed to delete live form: ${response.status}`);
      return { success: true, data };
    } catch (error) {
      console.error('Delete live form error:', error);
      return { success: false, error: error.message || 'Failed to delete live form.' };
    }
  }

  // Get all users (Super Admin only)
  async getAllUsers() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_USERS}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');

      if (!response.ok) {
        throw new Error(`Failed to fetch all users: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }

      // Return the data directly if it's an array, or wrap it if it's inside a property
      const rawList = Array.isArray(data) ? data : (data.data || data.users || []);

      // Map API response to component expected format
      const usersList = rawList.map(item => {
        return {
          ...item,
          id: item.id || item._id,
          name: item.name || item.username || item.fullName || 'Unknown',
          username: item.username || item.name || item.fullName || 'Unknown',
          code: item.code || item.userCode || item.usercode || String(item.id || item._id),
          email: item.email || '',
          role: item.role || item.userType || item.accountType || 'user',
          status: item.status || 'active'
        };
      });

      return { success: true, data: usersList };
    } catch (error) {
      console.error('Get all users error:', error);
      return { success: false, error: error.message || 'Failed to fetch all users.' };
    }
  }

  // Get user full data (Super Admin only)
  async getUserFullData(code) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_FULL_DATA}?code=${encodeURIComponent(code)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');

      if (!response.ok) {
        throw new Error(`Failed to fetch user full data: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get user full data error:', error);
      return { success: false, error: error.message || 'Failed to fetch user full data.' };
    }
  }

  // Block user (Super Admin only)
  // POST /auth/superadmin/block-user?code={hostId}&duration={24h|7d|permanent}&reason={reason}
  async blockUser(code, duration, reason) {
    const userCode = String(code || '').trim();
    if (!userCode) {
      return { success: false, error: 'Host code is required to block a user.' };
    }

    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const allowedDurations = ['24h', '7d', 'permanent'];
    const durationParam = allowedDurations.includes(String(duration || '').trim())
      ? String(duration).trim()
      : 'permanent';
    const reasonParam = String(reason || '').trim();
    if (!reasonParam) {
      return { success: false, error: 'Ban reason is required.' };
    }

    const params = new URLSearchParams({
      code: userCode,
      duration: durationParam,
      reason: reasonParam,
    });
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BLOCK_USER}?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'POST' });
      const raw = await response.text().catch(() => '');

      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Failed to block user: ${response.status}`);
      }

      return { success: true, data: data || { message: 'User blocked successfully.' } };
    } catch (error) {
      console.error('Block user error:', error);
      return { success: false, error: error.message || 'Failed to block user.' };
    }
  }

  /**
   * Block a device (Super Admin only).
   * POST /auth/superadmin/block-user?deviceId=&duration=24h|7d|permanent&reason=
   */
  async blockDevice(deviceId, duration, reason) {
    const id = String(deviceId || '').trim();
    if (!id) {
      return { success: false, error: 'Device ID is required to ban a device.' };
    }

    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const allowedDurations = ['24h', '7d', 'permanent'];
    const durationParam = allowedDurations.includes(String(duration || '').trim())
      ? String(duration).trim()
      : 'permanent';
    const reasonParam = String(reason || '').trim();
    if (!reasonParam) {
      return { success: false, error: 'Ban reason is required.' };
    }

    const params = new URLSearchParams({
      deviceId: id,
      duration: durationParam,
      reason: reasonParam,
    });
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BLOCK_USER}?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'POST' });
      const raw = await response.text().catch(() => '');

      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Failed to ban device: ${response.status}`);
      }

      return { success: true, data: data || { message: 'Device banned successfully.' } };
    } catch (error) {
      console.error('Block device error:', error);
      return { success: false, error: error.message || 'Failed to ban device.' };
    }
  }

  // Unblock user (Super Admin only)
  async unblockUser(code) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UNBLOCK_USER}?code=${encodeURIComponent(code)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'POST' });
      const raw = await response.text().catch(() => '');

      let data = null;
      try { data = JSON.parse(raw); } catch { data = { message: raw }; }

      if (!response.ok) {
        throw new Error(data?.message || `Failed to unblock user: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unblock user error:', error);
      return { success: false, error: error.message || 'Failed to unblock user.' };
    }
  }

  // Get blocked users (Super Admin only)
  // Response shape:
  // { status, total, permanent, timed, records: [{ usercode, name, reason, ... }] }
  async getBlockedUsers() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BLOCKED_USERS}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');

      let payload = null;
      try { payload = JSON.parse(raw); } catch { payload = { message: raw }; }

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || `Failed to fetch blocked users: ${response.status}`);
      }

      const records = Array.isArray(payload?.records)
        ? payload.records
        : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []));

      const normalized = records.map((item) => {
        const usercode = String(item?.usercode || item?.userCode || item?.code || '').trim();
        return {
          ...item,
          blockId: item?.blockId ?? item?.id ?? null,
          usercode,
          code: usercode,
          name: item?.name || item?.username || 'Unknown',
          username: item?.username || item?.name || '',
          role: item?.role || 'HOST',
          reason: item?.reason || '',
          blockedBy: item?.blockedBy || '',
          blockedAt: item?.blockedAt || null,
          permanent: Boolean(item?.permanent),
          hours: item?.hours ?? null,
          durationText: item?.durationText || (item?.permanent ? 'Permanent' : ''),
          blockedUntil: item?.blockedUntil || null,
          blockedUntilText: item?.blockedUntilText || '',
          minutesLeft: item?.minutesLeft ?? null,
          profilepic: item?.profilepic || item?.profilePic || null,
          country: item?.country || '',
        };
      });

      return {
        success: true,
        data: normalized,
        meta: {
          total: payload?.total ?? normalized.length,
          permanent: payload?.permanent ?? normalized.filter((r) => r.permanent).length,
          timed: payload?.timed ?? normalized.filter((r) => !r.permanent).length,
          status: payload?.status || 'success',
        },
      };
    } catch (error) {
      console.error('Get blocked users error:', error);
      return { success: false, error: error.message || 'Failed to fetch blocked users.' };
    }
  }

  async sendForgotPasswordOtp(email) {
    const trimmedEmail = String(email || '').trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Email is required.' };
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD_SEND_OTP}`,
        {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ email: trimmedEmail }),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || `Request failed (${response.status})`);
      }

      return {
        success: true,
        message: data.message || `OTP sent to ${data.email || trimmedEmail}`,
        email: data.email || trimmedEmail,
        expiresInMinutes: data.expiresInMinutes ?? 10,
      };
    } catch (error) {
      console.error('Send forgot password OTP error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send OTP. Please try again.',
      };
    }
  }

  async verifyForgotPasswordOtp(email, otp) {
    const trimmedEmail = String(email || '').trim();
    const trimmedOtp = String(otp || '').trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Email is required.' };
    }
    if (!trimmedOtp) {
      return { success: false, error: 'OTP is required.' };
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD_VERIFY_OTP}`,
        {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ email: trimmedEmail, otp: trimmedOtp }),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || `Request failed (${response.status})`);
      }

      return {
        success: true,
        message: data.message || 'OTP verified. You can set a new password now.',
        email: data.email || trimmedEmail,
        resetToken: data.resetToken || data.token || null,
        tokenExpiresInMinutes: data.tokenExpiresInMinutes ?? 15,
      };
    } catch (error) {
      console.error('Verify forgot password OTP error:', error);
      return {
        success: false,
        error: error.message || 'Invalid or expired OTP. Please try again.',
      };
    }
  }

  async resetForgotPassword({ email, resetToken, newPassword, confirmPassword }) {
    const trimmedEmail = String(email || '').trim();
    const token = String(resetToken || '').trim();
    const password = String(newPassword || '');
    const confirm = String(confirmPassword || '');

    if (!trimmedEmail) {
      return { success: false, error: 'Email is required.' };
    }
    if (!token) {
      return { success: false, error: 'Reset token is missing. Please verify OTP again.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (password !== confirm) {
      return { success: false, error: 'Passwords do not match.' };
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD_RESET}`,
        {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({
            email: trimmedEmail,
            resetToken: token,
            newPassword: password,
            confirmPassword: confirm,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || `Request failed (${response.status})`);
      }

      return {
        success: true,
        message: data.message || 'Password reset successfully. You can sign in now.',
        email: data.email || trimmedEmail,
      };
    } catch (error) {
      console.error('Reset forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reset password. Please try again.',
      };
    }
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;