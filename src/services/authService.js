// Authentication service for API integration
import { API_CONFIG, TOKEN_CONFIG, DEFAULT_HEADERS } from '../config/api.js';

class AuthService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_CONFIG.STORAGE_KEY);
  }

  // Login method

  // Login method
  async login(credentials) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          email: credentials.email || credentials.username, // Support both email and username
          password: credentials.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Login failed: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.message);
      }

      // Handle both JSON and plain text responses
      const responseText = await response.text();
      let data;
      let token;

      try {
        // First, try to parse as JSON
        data = JSON.parse(responseText);
        token = data.token || data.jwt || data.accessToken;
        
        // Store user info if provided in the JSON response
        if (data.user) {
          localStorage.setItem(TOKEN_CONFIG.USER_INFO_KEY, JSON.stringify(data.user));
        }
      } catch (e) {
        // If JSON parsing fails, assume the raw response text is the token
        token = responseText;
        data = { token }; // Create a data object for consistency
      }
      
      if (token && typeof token === 'string' && token.split('.').length === 3) { // Basic JWT validation
        this.token = token;
        localStorage.setItem(TOKEN_CONFIG.STORAGE_KEY, token);
      } else {
         throw new Error('Login successful, but no valid token was received from the server.');
      }

      return {
        success: true,
        data: data,
        token: this.token
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
    localStorage.removeItem(TOKEN_CONFIG.STORAGE_KEY);
    localStorage.removeItem(TOKEN_CONFIG.USER_INFO_KEY);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get stored token
  getToken() {
    return this.token || localStorage.getItem(TOKEN_CONFIG.STORAGE_KEY);
  }

  // Get stored user info
  getUserInfo() {
    const userInfo = localStorage.getItem(TOKEN_CONFIG.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
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
        // Token expired or invalid
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
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
    if (userInfo && userInfo.userType) {
      return userInfo.userType;
    }

    const decoded = this.decodeToken();
    if (decoded) {
      // Try different possible fields for user type
      return decoded.userType || decoded.role || decoded.type || 'admin';
    }

    return 'admin'; // Default fallback
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

// Export the class as well for testing purposes
export { AuthService };