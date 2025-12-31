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

    // Check if token is expired
    isTokenExpired(token = null) {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
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
          // Handle relative paths
          if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('/')) {
            avatarUrl = `${API_CONFIG.BASE_URL}${avatarUrl}`;
          }

          return {
            ...item,
            id: item.id || item._id,
            name: item.name || item.username || item.fullName || 'Unknown',
            email: item.email || '',
            hostId: item.usercode || '0000',
            status: (item.status || 'pending').toLowerCase(), // Normalize status to lowercase
            joinDate: item.joinDate || item.createdAt || item.registeredAt || item.dateOfBirth || new Date().toISOString(),
            avatar: avatarUrl,
            nationality: item.nationality|| 'pak'
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

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_LIVE_FORM_STATUS}?code=${hostId}`;

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

        return { success: true, data: data };
      } catch (error) {
        console.error('Get host details error:', error);
        return { success: false, error: error.message || 'Failed to fetch host details.' };
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
  }

const authService = new AuthService();
export default authService;