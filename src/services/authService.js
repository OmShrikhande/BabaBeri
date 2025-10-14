// Authentication service for API integration
import { API_CONFIG, TOKEN_CONFIG, DEFAULT_HEADERS, USER_TYPES } from '../config/api.js';
import { normalizeUserType } from '../utils/roleBasedAccess.js';

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

        // Try to fetch user profile to persist accurate role info
        try {
          const profile = await this.fetchUserProfile();
          if (profile) {
            // Normalize role keys: role | userType | type
            const rawRole = profile.role || profile.userType || profile.type;
            const userInfo = { ...profile };
            const normalizedRole = normalizeUserType(rawRole);
            if (normalizedRole) userInfo.userType = normalizedRole;
            localStorage.setItem(TOKEN_CONFIG.USER_INFO_KEY, JSON.stringify(userInfo));
          }
        } catch (e) {
          // Non-fatal: continue with login even if profile fetch fails
          console.warn('Could not fetch user profile after login:', e?.message || e);
        }
      } else {
         throw new Error('Login successful, but no valid token was received from the server.');
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

  // Get users by role
  async getUsersByRole(role) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    const roleParam = String(role).toUpperCase();
    const url = `${API_CONFIG.BASE_URL}/auth/api/alluserByRole?role=${encodeURIComponent(roleParam)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch users for role ${roleParam}: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
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
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_MASTER_AGENCY}?code=${encodeURIComponent(code)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch master agencies for code ${code}: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
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

  // Fetch current user's profile after login
  async fetchUserProfile() {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch profile: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.message);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch profile error:', error);
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
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    // Backend expects uppercase role values: SUPERADMIN, ADMIN, MASTER_AGENCY, AGENCY, HOST
    const roleParam = String(role).toUpperCase();
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNT_BY_ROLE}?role=${encodeURIComponent(roleParam)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      if (!response.ok) {
        let raw = ''; try { raw = await response.text(); } catch {}
        let message = `Failed to fetch count for role ${roleParam}: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        throw new Error(raw ? `${message} | Details: ${raw}` : message);
      }
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Count by role error:', error);
      return { success: false, error: error.message || `Failed to fetch count for role ${roleParam}.` };
    }
  }

  // Get all hosts (HOST details)
  async getAllHosts() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    const url = `https://proxstream.online/auth/user/getallhost?role=HOST`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch hosts: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Get all hosts error:', error);
      return { success: false, error: error.message || 'Failed to fetch hosts.' };
    }
  }

  // Get all active hosts
  async getActiveHosts() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ACTIVE_HOSTS}?status=Activate`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch active hosts: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
     console.error('Get active hosts error:', error);
      return { success: false, error: error.message || 'Failed to fetch active hosts.' };
    }
  }

  // Get all inactive hosts
  async getInactiveHosts() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    const url = `${API_CONFIG.BASE_URL}/auth/api/allactivate-deactivate-host?status=Deactivate`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch inactive hosts: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Get inactive hosts error:', error);
      return { success: false, error: error.message || 'Failed to fetch inactive hosts.' };
    }
  }

  // Get all blocked hosts
  async getBlockedHosts() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    const url = `${API_CONFIG.BASE_URL}/auth/api/allactivate-deactivate-host?status=Blocked`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch blocked hosts: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Get blocked hosts error:', error);
      return { success: false, error: error.message || 'Failed to fetch blocked hosts.' };
    }
  }

  // Create Sub-Admin
  async createSubAdmin(adminData) {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_ADMIN}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to create admin: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.message);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Create admin error:', error);
      return { success: false, error: error.message || 'Failed to create admin.' };
    }
  }

  // Create Master Agency
  async createMasterAgency(agencyData) {
    // Pre-check authentication and role
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated. Please login.' };
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      return { success: false, error: 'Session expired. Please login again.' };
    }

    const callerRole = normalizeUserType(this.getUserType());
    // Enforce permission on client side (backend will still validate)
    const canCreate = callerRole === USER_TYPES.SUPER_ADMIN || callerRole === USER_TYPES.ADMIN;
    if (!canCreate) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin or Admin can create master agencies.' };
    }

    // Validate required fields and build payload
    const base = {
      name: agencyData?.name?.trim(),
      email: agencyData?.email?.trim(),
      password: agencyData?.password,
      adminName: agencyData?.adminName // <-- Add adminName field
    };

    if (!base.name || !base.email || !base.password || !base.adminName) {
      return { success: false, error: 'Name, email, password, and admin name are required.' };
    }

    // Allow additional fields from the form to pass through (e.g., phone, address)
    const { name, email, password, adminName, ...rest } = agencyData || {};
    const payload = {
      ...rest,
      name: base.name,
      email: base.email,
      password: base.password,
      adminName: base.adminName // <-- Send adminName to API
    };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_MASTER_AGENCY}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let raw = '';
        try { raw = await response.text(); } catch (_) {}
        let message = `Failed to create master agency: ${response.status} ${response.statusText}`;
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed?.message) message = parsed.message;
        } catch (_) {}
        // Don't assume the reason for 403; surface server details instead
        throw new Error(raw ? `${message} | Details: ${raw}` : message);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Create master agency error:', error);
      return { success: false, error: error.message || 'Failed to create master agency.' };
    }
  }

  // Manual coin recharge by Super Admin
  async rechargeManualBySuperAdmin(payload) {
    // Auth checks
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    // Role check: only Super Admin allowed
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can perform manual recharge.' };
    }

    // Basic payload validation
    const required = ['usercode', 'rechargeby', 'coins', 'amount', 'paymentmethod', 'transactionid', 'status'];
    const missing = required.filter(k => payload?.[k] === undefined || payload?.[k] === null || String(payload[k]).trim() === '');
    if (missing.length) {
      return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECHARGE_MANUAL}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Recharge failed: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }

      // Try to parse success JSON, fallback to raw text
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}
      return { success: true, data: data || { message: 'Recharge successful' } };
    } catch (error) {
      console.error('Manual recharge error:', error);
      return { success: false, error: error.message || 'Manual recharge failed.' };
    }
  }

  // Approve profile picture (JWT protected)
  async approveProfile(usercode) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    if (!usercode || String(usercode).trim() === '') {
      return { success: false, error: 'usercode is required' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPROVE_PROFILE}?usercode=${encodeURIComponent(usercode)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'PUT' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Approve profile failed: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
      return { success: true, data: data || { message: 'Profile approved' } };
    } catch (error) {
      console.error('Approve profile error:', error);
      return { success: false, error: error.message || 'Approve profile failed.' };
    }
  }

  // Get user by id (JWT protected)
  async getUserById(id) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    if (!id) return { success: false, error: 'User id is required.' };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_USER_BY_ID}?id=${encodeURIComponent(id)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch user: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
      return { success: true, data };
    } catch (error) {
      console.error('Get user by id error:', error);
      return { success: false, error: error.message || 'Failed to fetch user.' };
    }
  }

  // Create Recharge Plan (JWT protected)
  async createRechargePlan(plan) {
    // Auth checks
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    // Role check: Assuming only Super Admin can create plans; adjust if Admins can as well
    const callerRole = normalizeUserType(this.getUserType());
    const canCreate = callerRole === USER_TYPES.SUPER_ADMIN; // change to || USER_TYPES.ADMIN if needed
    if (!canCreate) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can create recharge plans.' };
    }

    // Validate payload fields based on API contract
    const required = ['planename', 'planprice', 'status', 'discription'];
    const missing = required.filter(k => plan?.[k] === undefined || plan?.[k] === null || String(plan[k]).trim() === '');
    if (missing.length) {
      return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECHARGE_PLAN_CREATE}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(plan),
      });

      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to create plan: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }

      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
      return { success: true, data: data || { message: 'Plan created successfully' } };
    } catch (error) {
      console.error('Create recharge plan error:', error);
      return { success: false, error: error.message || 'Failed to create recharge plan.' };
    }
  }

  // Fetch master agencies by admin code (JWT protected)
  async getAllMasterAgenciesByAdminCode(code) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    // Super Admin-only endpoint per your note
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can fetch all master agencies by admin code.' };
    }

    if (!code || String(code).trim() === '') {
      return { success: false, error: 'Admin code is required.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_MASTER_AGENCY}?code=${encodeURIComponent(code)}`;

    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch master agencies: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
      return { success: true, data };
    } catch (error) {
      console.error('getAllMasterAgenciesByAdminCode error:', error);
      return { success: false, error: error.message || 'Failed to fetch master agencies.' };
    }
  }

  // Fetch master agencies for logged-in admin (if backend supports deriving from JWT)
  async getMasterAgenciesForLoggedInAdmin() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Admin can fetch their own master agencies.' };
    }

    // If your backend supports reading admin identity from JWT without code param,
    // you may expose a different endpoint. For now, we require admin code in profile.
    const profile = this.getUserInfo() || await this.fetchUserProfile().catch(() => null);
    const adminCode = profile?.code || profile?.adminCode || profile?.usercode || profile?.id; // heuristic fallbacks
    if (!adminCode) {
      return { success: false, error: 'Admin code not found in profile. Please provide the code explicitly.' };
    }

    return this.getAllMasterAgenciesByAdminCode(adminCode);
  }

  // List all pending profile pics (JWT, Super Admin)
  async getAllPendingProfilePics() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can list pending profile pics.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_PENDING_PICS}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch pending profile pics: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Get pending profile pics error:', error);
      return { success: false, error: error.message || 'Failed to fetch pending profile pics.' };
    }
  }

  // Approve/Reject profile pic (JWT, Super Admin)
  async updateProfilePicStatus(usercode, status = 'APPROVED') {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }

    if (!usercode || String(usercode).trim() === '') {
      return { success: false, error: 'User code is required.' };
    }

    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can update profile pic status.' };
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPROVE_PROFILE}?usercode=${encodeURIComponent(usercode)}`;
    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to update profile pic status: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      // API may return plain text like "Status approved successfully"
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw || { message: 'Updated successfully' }; }
      return { success: true, data };
    } catch (error) {
      console.error('Update profile pic status error:', error);
      return { success: false, error: error.message || 'Failed to update profile pic status.' };
    }
  }

  // Get total available coins (JWT, Super Admin)
  async getTotalAvailableCoins() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can fetch total available coins.' };
    }
    const url = `${API_CONFIG.BASE_URL}/auth/api/getTotalCoins`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch total coins: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Get total available coins error:', error);
      return { success: false, error: error.message || 'Failed to fetch total available coins.' };
    }
  }

  // Get total of all sell coins (JWT, Super Admin)
  async getTotalSellCoins() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can fetch total sell coins.' };
    }
    const url = `${API_CONFIG.BASE_URL}/auth/api/getTotalCoinsSell`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch total sell coins: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Get total sell coins error:', error);
      return { success: false, error: error.message || 'Failed to fetch total sell coins.' };
    }
  }

  // Activate all hosts (Super Admin only)
  async activateAllHosts() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can activate all hosts.' };
    }
    const url = `${API_CONFIG.BASE_URL}/auth/api/allactivate-deactivate-host?status=Activate`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to activate all hosts: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Activate all hosts error:', error);
      return { success: false, error: error.message || 'Failed to activate all hosts.' };
    }
  }

  // Deactivate all hosts (Super Admin only)
  async deactivateAllHosts() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can deactivate all hosts.' };
    }
    const url = `${API_CONFIG.BASE_URL}/auth/api/allactivate-deactivate-host?status=Deactivate`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to deactivate all hosts: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Deactivate all hosts error:', error);
      return { success: false, error: error.message || 'Failed to deactivate all hosts.' };
    }
  }

  // Block all hosts (Super Admin only)
  async blockAllHosts() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can block all hosts.' };
    }
    const url = `${API_CONFIG.BASE_URL}/auth/api/allactivate-deactivate-host?status=Blocked`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to block all hosts: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Block all hosts error:', error);
      return { success: false, error: error.message || 'Failed to block all hosts.' };
    }
  }

  // Get all pending cashout list (Super Admin only)
  async getAllPendingCashout() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can fetch pending cashout list.' };
    }
    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/allpendingcashout`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch pending cashout list: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Get pending cashout error:', error);
      return { success: false, error: error.message || 'Failed to fetch pending cashout list.' };
    }
  }

  // Get cashout history (Super Admin only)
  async getCashoutHistory() {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can fetch cashout history.' };
    }
    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/cashouthistory`;
    try {
      const response = await this.makeAuthenticatedRequest(url, { method: 'GET' });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to fetch cashout history: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
      return { success: true, data };
    } catch (error) {
      console.error('Get cashout history error:', error);
      return { success: false, error: error.message || 'Failed to fetch cashout history.' };
    }
  }

  // Save diamond by super admin (Super Admin only)
  async saveDiamond(payload) {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated. Please login.' };
    if (this.isTokenExpired(token)) { this.logout(); return { success: false, error: 'Session expired. Please login again.' }; }
    const callerRole = normalizeUserType(this.getUserType());
    if (callerRole !== USER_TYPES.SUPER_ADMIN) {
      return { success: false, status: 403, error: 'Forbidden: Only Super Admin can save diamonds.' };
    }
    // Basic payload validation
    if (!payload || typeof payload !== 'object') {
      return { success: false, error: 'Payload must be an object.' };
    }
    const required = ['diamonds', 'status'];
    const missing = required.filter(k => payload[k] === undefined || payload[k] === null || String(payload[k]).trim() === '');
    if (missing.length) {
      return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
    }
    
    // Add usercode if provided
    const requestPayload = {
      diamonds: payload.diamonds,
      status: payload.status
    };
    
    if (payload.usercode) {
      requestPayload.usercode = payload.usercode;
    }
    const url = `${API_CONFIG.BASE_URL}/auth/superadmin/saveDiamond`;
    try {
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        body: JSON.stringify(requestPayload),
      });
      const raw = await response.text().catch(() => '');
      if (!response.ok) {
        let message = `Failed to save diamond: ${response.status} ${response.statusText}`;
        try { const parsed = raw ? JSON.parse(raw) : null; if (parsed?.message) message = parsed.message; } catch {}
        return { success: false, status: response.status, error: raw ? `${message} | Details: ${raw}` : message };
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
      return { success: true, data: data || { message: 'Diamond saved successfully' } };
    } catch (error) {
      console.error('Save diamond error:', error);
      return { success: false, error: error.message || 'Failed to save diamond.' };
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

// Export the class as well for testing purposes
export { AuthService };
