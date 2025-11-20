import { API_CONFIG, TOKEN_CONFIG, DEFAULT_HEADERS, USER_TYPES } from '../config/api.js';
import { normalizeUserType } from '../utils/roleBasedAccess.js';

class AuthService {
  constructor() {
    this.token = sessionStorage.getItem(TOKEN_CONFIG.STORAGE_KEY);
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
        sessionStorage.setItem(TOKEN_CONFIG.STORAGE_KEY, token);
        
        // Store user info if available
        if (data.user || data.userInfo || data.profile) {
          const userInfo = data.user || data.userInfo || data.profile;
          sessionStorage.setItem(TOKEN_CONFIG.USER_INFO_KEY, JSON.stringify(userInfo));
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
  logout() {
    this.token = null;
    sessionStorage.removeItem(TOKEN_CONFIG.STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_CONFIG.USER_INFO_KEY);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get stored token
  getToken() {
    return this.token || sessionStorage.getItem(TOKEN_CONFIG.STORAGE_KEY);
  }

  // Get stored user info
  getUserInfo() {
    const userInfo = sessionStorage.getItem(TOKEN_CONFIG.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
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
        localStorage.setItem(TOKEN_CONFIG.USER_INFO_KEY, JSON.stringify(mergedProfile));
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
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
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
    if (!decoded || !decoded.exp) return true;
    
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
        lastUpdated: data.lastUpdated ?? null
      };
      return { success: true, data: summary };
    } catch (error) {
      console.error('Get wallet summary error:', error);
      return { success: false, error: error.message || 'Failed to fetch wallet summary.' };
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
  async createMasterAgency({ name, email, password, adminName }) {
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
        body: JSON.stringify({ name, email, password, adminName })
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

  // Create agency
  async createAgency({ name, userId, masterAgencyCode }) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const params = new URLSearchParams({
      agencycode: userId,
      agencyname: name,
      macode: masterAgencyCode
    });

    const url = `${API_CONFIG.BASE_URL}/auth/upgrade?${params.toString()}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST'
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Failed to create agency: ${response.status} ${response.statusText}\n${raw}`);
      }

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Invalid response format');
      }

      return { success: true, data };
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
}

// Export singleton instance
const authService = new AuthService();
export default authService;