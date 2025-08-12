// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://proxstream.online',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    USER_PROFILE: '/auth/profile'
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3
};

// Super Admin credentials (from API documentation)
export const SUPER_ADMIN_CREDENTIALS = {
  email: 'superadmin@admin.com',
  password: 'superadmin'
};

// JWT Token configuration
export const TOKEN_CONFIG = {
  STORAGE_KEY: 'authToken',
  USER_INFO_KEY: 'userInfo',
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
};

// API Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// User types mapping
export const USER_TYPES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MASTER: 'master'
};

export default API_CONFIG;