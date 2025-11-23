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
}

const authService = new AuthService();
export default authService;