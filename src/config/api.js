// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://proxstream.online',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    USER_PROFILE: '/auth/profile',
    CREATE_ADMIN: '/auth/create-admin',
    CREATE_MASTER_AGENCY: '/auth/create-masteragency', // Accepts adminName field
    CREATE_AGENCY: '/auth/create-agency',
    COUNT_BY_ROLE: '/auth/api/countbyrole',
    // Manual coin recharge by Super Admin
    RECHARGE_MANUAL: '/auth/api/recharge',
    // Recharge plans - create
    RECHARGE_PLAN_CREATE: '/auth/api/saveplan',
    // Approve profile picture (JWT protected)
    APPROVE_PROFILE: '/auth/api/approveprofile',
    // List all pending profile pictures (JWT protected)
    ALL_PENDING_PICS: '/auth/api/allpendingpics',
    // User profile by id (JWT protected)
    GET_USER_BY_ID: '/auth/user/getByid',
    // Fetch master agencies by admin code (JWT protected)
    GET_ALL_MASTER_AGENCY: '/auth/getallMasterAgency',
    // Get all active hosts (JWT protected)
    GET_ACTIVE_HOSTS: '/auth/api/allactivate-deactivate-host',
    // Activate/deactivate seller (Admin/Super Admin only)
    ACTIVE_DEACTIVE_SELLER: '/auth/superadmin/active-deactive-seller',
    // Save diamond by super admin
    SAVE_DIAMOND: '/auth/superadmin/saveDiamond',
    // Get all pending cashout list (Super Admin only)
    GET_ALL_PENDING_CASHOUT: '/auth/superadmin/allpendingcashout',
    // Get pending cashout list (Alternative)
    GET_PENDING_CASHOUT_LIST: '/auth/superadmin/getPendingcashoutList',
    // Get cashout history (Super Admin only)
    GET_CASHOUT_HISTORY: '/auth/superadmin/cashouthistory',
    SUPERADMIN_BALANCE: '/auth/superadmin/balance',
    // Recharge history lookup (Admin/Super Admin only)
    GET_RECHARGE_HISTORY: '/auth/api/gethistory',
    // Add coins to host (Admin/Super Admin only)
    COINS_PLUS: '/auth/api/coinsplus',
    // Get diamond credits (Super Admin only)
    COUNT_CREDIT: '/auth/superadmin/count/CREDIT',
    // Get all percentage methods (Super Admin only)
    GET_ALL_PERCENTAGE_METHOD: '/auth/superadmin/getallpercentageMethod',
    // Get all plans (Super Admin only)
    GET_ALL_PLANS: '/auth/user/getAllPlans',
    // Get pending live users
    PENDING_LIVE_USERS: '/api/liveusers/list',
    // Get host details
    GET_LIVE_FORM_STATUS: '/api/liveusers/getLiveFormStatus',
    // Approve/Reject live form
    APPROVE_REJECT_LIVE_FORM: '/auth/superadmin/approve-reject-live-form'
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3
};

// Super Admin credentials (from API documentation)
export const SUPER_ADMIN_CREDENTIALS = {
  email: 'superadmin@admin.com',
  password: 'superadmin',
  role: 'super-admin'
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
  SUB_ADMIN: 'sub-admin',
  MASTER_AGENCY: 'master-agency'
};

export default API_CONFIG;
