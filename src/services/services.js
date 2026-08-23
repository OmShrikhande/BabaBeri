import { API_CONFIG, TOKEN_CONFIG, DEFAULT_HEADERS, USER_TYPES } from '../config/api.js';
import { normalizeUserType } from '../utils/roleBasedAccess.js';
import {
  readStoredToken,
  writeStoredToken,
  clearStoredAuth,
  readStoredUserInfo,
  writeStoredUserInfo,
} from './tokenStore.js';
import {
  normalizeLiveFormRecord,
  parseApiErrorMessage,
} from '../utils/liveUserUtils.js';

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
    logout() {
      this.token = null;
      clearStoredAuth();
    }

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

    // Check if token is expired
    isTokenExpired(token = null) {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return false;

      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
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

    // Get pending hosts (live users with pending form)
    async getPendingHosts() {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PENDING_LIVE_USERS}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pending hosts: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }

        // Return the data directly if it's an array, or wrap it if it's inside a property
        // The component expects { success: true, data: [...] }
        const rawList = Array.isArray(data) ? data : (data.data || data.users || []);
        
        // Map API response to component expected format
        const hostsList = rawList.map(item => {
          let avatarUrl = item.avatar || item.profilePic || item.image || item.photo || item.document1Path || '';
          if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('/')) {
            avatarUrl = `${API_CONFIG.BASE_URL}${avatarUrl}`;
          }

          const usercode = String(item.usercode || item.userCode || item.code || '').trim();

          return {
            ...item,
            id: item.id || item._id,
            name: item.name || item.username || item.fullName || 'Unknown',
            email: item.email || '',
            usercode,
            hostId: usercode || String(item.id || ''),
            status: item.status?.toLowerCase() === 'reject' ? 'rejected' : item.status?.toLowerCase(),
            joinDate: item.joinDate || item.createdAt || item.registeredAt || item.joiningDate || item.dateOfBirth || new Date().toISOString(),
            avatar: avatarUrl,
            nationality: item.nationality || 'Unknown'
          };
        });
        
        return { success: true, data: hostsList };
      } catch (error) {
        console.error('Get pending hosts error:', error);
        return { success: false, error: error.message || 'Failed to fetch pending hosts.' };
      }
    }

    // Get host details by host code
    async getHostDetails(hostId) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_LIVE_FORM_STATUS}?code=${encodeURIComponent(hostId)}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');

        if (!response.ok) {
           throw new Error(`Failed to fetch host details: ${response.status} ${response.statusText}\n${raw}`);
        }

        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }

        if (data && !data.usercode) {
          data.usercode = hostId;
        }

        return { success: true, data: normalizeLiveFormRecord(data, hostId) };
      } catch (error) {
        console.error('Get host details error:', error);
        return { success: false, error: error.message || 'Failed to fetch host details.' };
      }
    }

    // Approve or Reject Host
    async approveRejectHost(hostId, status) {
      const usercode = String(hostId || '').trim();
      if (!usercode) {
        return { success: false, error: 'Host user code is required.' };
      }

      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const normalizedStatus = String(status || '').trim().toUpperCase();
      const statusParam = normalizedStatus === 'REJECT' || normalizedStatus === 'REJECTED'
        ? 'REJECT'
        : 'APPROVED';

      const params = new URLSearchParams({
        usercode,
        status: statusParam,
      });
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPROVE_REJECT_LIVE_FORM}?${params.toString()}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
        const raw = await response.text().catch(() => '');

        if (!response.ok) {
          let message = parseApiErrorMessage(
            raw,
            `Failed to update host status: ${response.status} ${response.statusText}`
          );

          if (response.status === 500 && statusParam === 'APPROVED') {
            message = 'Server error while approving this host. Reject still works, but approval is failing on the backend — please ask the backend team to fix /auth/superadmin/approve-reject-live-form for pending hosts.';
          } else if (response.status === 400 && message.toLowerCase().includes('not found')) {
            message = `Host form not found for user code "${usercode}". Make sure you are using the host user code (e.g. PX926), not the numeric row id.`;
          }

          throw new Error(message);
        }

        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }

        return { success: true, data: data || { message: 'Host status updated successfully.' } };
      } catch (error) {
        console.error('Approve/Reject host error:', error);
        return { success: false, error: error.message || 'Failed to update host status.' };
      }
    }

    // Permanent Reject/Clear Form Host
    async permanentRejectHost(hostId) {
      console.log('Services: permanentRejectHost called', { hostId });
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERMANENT_REJECT}?usercode=${encodeURIComponent(hostId)}&status=REJECT`;
      console.log('Services: Making request to', url);

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
        console.log('Services: Response status:', response.status);
        const raw = await response.text().catch(() => '');
        console.log('Services: Response body:', raw);

        if (!response.ok) {
           throw new Error(`Failed to permanently reject host: ${response.status} ${response.statusText}\n${raw}`);
        }

        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
           data = { message: raw };
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('Permanent reject host error:', error);
        return { success: false, error: error.message || 'Failed to permanently reject host.' };
      }
    }

    // Get all plans
    async getAllPlans() {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_PLANS}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');
        if (!response.ok) {
          throw new Error(`Failed to fetch plans: ${response.status} ${response.statusText}\n${raw}`);
        }
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }
        return { success: true, data: data };
      } catch (error) {
        console.error('Get all plans error:', error);
        return { success: false, error: error.message || 'Failed to fetch plans.' };
      }
    }

    // Save a new recharge plan
    async savePlan(planData) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECHARGE_PLAN_CREATE}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'POST',
          body: JSON.stringify(planData)
        });

        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to save plan: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Save plan error:', error);
        return { success: false, error: error.message || 'Failed to save plan.' };
      }
    }

    // Update an existing recharge plan
    async updatePlan(planData) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECHARGE_PLAN_UPDATE}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'PUT',
          body: JSON.stringify(planData)
        });

        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to update plan: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Update plan error:', error);
        return { success: false, error: error.message || 'Failed to update plan.' };
      }
    }

    // Delete a recharge plan by ID
    async deletePlan(planId) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECHARGE_PLAN_DELETE}?id=${planId}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'DELETE'
        });

        const raw = await response.text().catch(() => '');

        if (response.status === 403) {
          return { success: false, error: 'Permission denied: the server has not granted delete access for this endpoint. Please contact the backend administrator.' };
        }

        if (!response.ok) {
          throw new Error(`Failed to delete plan: ${response.status} ${response.statusText}\n${raw}`);
        }

        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('Delete plan error:', error);
        return { success: false, error: error.message || 'Failed to delete plan.' };
      }
    }
    // Save Tiers (Goals)
    async saveTiers(tierData) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_TIERS}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'POST',
          body: JSON.stringify(tierData)
        });

        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to save tier: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Save tiers error:', error);
        return { success: false, error: error.message || 'Failed to save tier.' };
      }
    }

    // Get all goals (Tiers)
    async getAllGoals() {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_GOALS}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');

        if (!response.ok) {
          throw new Error(`Failed to fetch goals: ${response.status} ${response.statusText}\n${raw}`);
        }

        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }

        return { success: true, data: data };
      } catch (error) {
        console.error('Get all goals error:', error);
        return { success: false, error: error.message || 'Failed to fetch goals.' };
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

    // Get all VIP users (Super Admin only)
    async getVipUsers() {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_VIP_USERS}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');

        if (!response.ok) {
          throw new Error(`Failed to fetch VIP users: ${response.status} ${response.statusText}\n${raw}`);
        }

        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }

        // data shape: { success, total, members, friendBadges, users: [...] }
        return { success: true, data };
      } catch (error) {
        console.error('Get VIP users error:', error);
        return { success: false, error: error.message || 'Failed to fetch VIP users.' };
      }
    }


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

    // Delete Tier
    async deleteTier(id, tierData) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_TIER}/${id}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'DELETE',
          body: JSON.stringify(tierData)
        });

        const raw = await response.text().catch(() => '');
        
        // Some APIs return 400 but actually succeed (as seen in "Tier (goal) deleted successful")
        if (!response.ok && !raw.toLowerCase().includes('deleted successful')) {
          throw new Error(`Failed to delete tier: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Delete tier error:', error);
        return { success: false, error: error.message || 'Failed to delete tier.' };
      }
    }

    // Update Tier
    async updateTier(id, tierData) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_TIER}/${id}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'PUT',
          body: JSON.stringify(tierData)
        });

        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to update tier: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Update tier error:', error);
        return { success: false, error: error.message || 'Failed to update tier.' };
      }
    }

    // Get pending cashout list
    async getPendingCashoutList() {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_PENDING_CASHOUT_LIST}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch cashout requests: ${response.status} ${response.statusText}\n${raw}`);
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
        return { success: false, error: error.message || 'Failed to fetch cashout requests.' };
      }
    }

    // Get all gifts
    async getAllGifts() {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_GIFTS}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch gifts: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Get all gifts error:', error);
        return { success: false, error: error.message || 'Failed to fetch gifts.' };
      }
    }

    // Save gift
    async saveGift(formData) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_GIFT}`;

      try {
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: formData
        });

        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to save gift: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Save gift error:', error);
        return { success: false, error: error.message || 'Failed to save gift.' };
      }
    }

    async getAllBanners() {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_BANNERS}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch banners: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Get all banners error:', error);
        return { success: false, error: error.message || 'Failed to fetch banners.' };
      }
    }

    async saveBanner(formData) {
      const token = this.getToken();
      if (!token) {
        console.error('No token available for saveBanner');
        return { success: false, error: 'Not authenticated. Please login.' };
      }

      if (this.isTokenExpired()) {
        console.error('Token expired for saveBanner');
        this.logout();
        return { success: false, error: 'Session expired. Please login again.' };
      }

      const decoded = this.decodeToken();
      console.log('User type:', this.getUserType());
      console.log('Token payload:', decoded);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_BANNER}`;
      
      console.log('Saving banner to:', url);
      console.log('Token available:', !!token);
      console.log('Token preview:', token.substring(0, 20) + '...');
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], typeof pair[1] === 'object' ? pair[1].name || pair[1] : pair[1]);
      }

      try {
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: formData
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const raw = await response.text().catch(() => '');
        console.log('Response body:', raw);
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error(`Access forbidden. Please check your permissions or login again. Server response: ${raw}`);
          }
          throw new Error(`Failed to save banner: ${response.status} ${response.statusText}\n${raw}`);
        }
        
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
        
        return { success: true, data: data };
      } catch (error) {
        console.error('Save banner error:', error);
        return { success: false, error: error.message || 'Failed to save banner.' };
      }
    }

    async getTopHostRanking(type, date) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOP_HOST_RANKING}?type=${type}&date=${date}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const raw = await response.text().catch(() => '');
        if (!response.ok) {
          throw new Error(`Failed to fetch top host ranking: ${response.status} ${response.statusText}\n${raw}`);
        }
        let data = null;
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Invalid response format');
        }
        return { success: true, data: data };
      } catch (error) {
        console.error('Get top host ranking error:', error);
        return { success: false, error: error.message || 'Failed to fetch top host ranking.' };
      }
    }

    async parseJsonResponse(response) {
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}\n${raw}`);
      }
      try {
        return JSON.parse(raw);
      } catch {
        return { message: raw };
      }
    }

    // Get diamond count by duration (public)
    async getDiamondCount({ from, to, id }) {
      const params = new URLSearchParams({ from, to, id });
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DIAMOND_COUNT}?${params}`;

      try {
        const response = await fetch(url, { method: 'GET', headers: DEFAULT_HEADERS });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get diamond count error:', error);
        return { success: false, error: error.message || 'Failed to fetch diamond count.' };
      }
    }

    // Save live tracking session (public)
    async saveLiveTracking({ endDateTime, userLiveToken, maxUsers }) {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_LIVE_TRACKING}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ endDateTime, userLiveToken, maxUsers })
        });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Save live tracking error:', error);
        return { success: false, error: error.message || 'Failed to save live tracking.' };
      }
    }

    // Get all live tracking sessions (public)
    async getAllLiveTracking() {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_LIVE_TRACKING}`;

      try {
        const response = await fetch(url, { method: 'GET', headers: DEFAULT_HEADERS });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get all live tracking error:', error);
        return { success: false, error: error.message || 'Failed to fetch live tracking sessions.' };
      }
    }

    // Get live tracking session by id (public)
    async getLiveTrackingById(id) {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_LIVE_TRACKING_BY_ID}/${id}`;

      try {
        const response = await fetch(url, { method: 'GET', headers: DEFAULT_HEADERS });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get live tracking by id error:', error);
        return { success: false, error: error.message || 'Failed to fetch live tracking session.' };
      }
    }

    // Start live session
    async startLiveSession({ room_name }) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_START_SESSION}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'POST',
          body: JSON.stringify({ room_name })
        });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Start live session error:', error);
        return { success: false, error: error.message || 'Failed to start live session.' };
      }
    }

    // End live session
    async endLiveSession({ session_id }) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_END_SESSION}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'POST',
          body: JSON.stringify({ session_id })
        });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('End live session error:', error);
        return { success: false, error: error.message || 'Failed to end live session.' };
      }
    }

    // Recover live session
    async recoverLiveSession({ room_name }) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_RECOVER_SESSION}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'POST',
          body: JSON.stringify({ room_name })
        });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Recover live session error:', error);
        return { success: false, error: error.message || 'Failed to recover live session.' };
      }
    }

    // Send gift during live session
    async sendGift({ session_id, receiver_id, gift_id, quantity, idempotency_key }) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GIFTS_SEND}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, {
          method: 'POST',
          body: JSON.stringify({ session_id, receiver_id, gift_id, quantity, idempotency_key })
        });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Send gift error:', error);
        return { success: false, error: error.message || 'Failed to send gift.' };
      }
    }

    // Get live session stats
    async getSessionStats(sessionId) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_SESSION_STATS}/${sessionId}/stats`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get session stats error:', error);
        return { success: false, error: error.message || 'Failed to fetch session stats.' };
      }
    }

    // Get live session gifters
    async getSessionGifters(sessionId, { limit = 50, offset = 0 } = {}) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_SESSION_GIFTERS}/${sessionId}/gifters?${params}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get session gifters error:', error);
        return { success: false, error: error.message || 'Failed to fetch session gifters.' };
      }
    }

    // Get host live history
    async getHostLiveHistory({ page = 1, limit = 20 } = {}) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_HOST_HISTORY}?${params}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get host live history error:', error);
        return { success: false, error: error.message || 'Failed to fetch host live history.' };
      }
    }

    // Get host daily stats
    async getHostDailyStats({ from, to }) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const params = new URLSearchParams({ from, to });
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_HOST_DAILY_STATS}?${params}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get host daily stats error:', error);
        return { success: false, error: error.message || 'Failed to fetch host daily stats.' };
      }
    }

    // Get gifts catalog
    async getGiftsCatalog() {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GIFTS_CATALOG}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get gifts catalog error:', error);
        return { success: false, error: error.message || 'Failed to fetch gifts catalog.' };
      }
    }

    // Get admin live sessions
    async getAdminLiveSessions({ host_id, status, date } = {}) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const params = new URLSearchParams();
      if (host_id) params.set('host_id', host_id);
      if (status) params.set('status', status);
      if (date) params.set('date', date);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_ADMIN_SESSIONS}?${params}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get admin live sessions error:', error);
        return { success: false, error: error.message || 'Failed to fetch admin live sessions.' };
      }
    }

    // Get admin gift transactions
    async getAdminGiftTransactions({ page = 1, limit = 20 } = {}) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GIFTS_ADMIN_TRANSACTIONS}?${params}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get admin gift transactions error:', error);
        return { success: false, error: error.message || 'Failed to fetch gift transactions.' };
      }
    }

    // Get admin host analytics
    async getAdminHostAnalytics(hostId) {
      const token = this.getToken();
      if (!token) return { success: false, error: 'Not authenticated. Please login.' };

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_ADMIN_HOST_ANALYTICS}/${hostId}`;

      try {
        const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
        const data = await this.parseJsonResponse(response);
        return { success: true, data };
      } catch (error) {
        console.error('Get admin host analytics error:', error);
        return { success: false, error: error.message || 'Failed to fetch host analytics.' };
      }
    }

  }

const authService = new AuthService();
export default authService;