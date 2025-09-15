// Role-based access control utility
import { USER_TYPES } from '../config/api.js';

// Normalize various role strings from API/token to our canonical USER_TYPES
export const normalizeUserType = (value) => {
  if (!value) return null;
  const v = String(value).trim().toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
  if ([
    'super-admin', 'superadmin', 'super-administrator', 'sa'
  ].includes(v)) return USER_TYPES.SUPER_ADMIN;
  if ([
    'admin', 'administrator'
  ].includes(v)) return USER_TYPES.ADMIN;
  if ([
    'sub-admin', 'subadmin', 'sub-administrator'
  ].includes(v)) return USER_TYPES.SUB_ADMIN;
  if ([
    'master-agency', 'master', 'masteragency'
  ].includes(v)) return USER_TYPES.MASTER_AGENCY;
  return v; // fallback to normalized raw string
};

// Define role permissions
export const ROLE_PERMISSIONS = {
  [USER_TYPES.SUPER_ADMIN]: {
    // Super admin can access everything
    canAccess: () => true,
    allowedRoutes: 'all'
  },
  [USER_TYPES.ADMIN]: {
    // Admin lands on SubAdminDetail directly; no sidebar tab for it
    canAccess: (route) => {
      const allowedRoutes = ['admin-subadmin-detail']; // synthetic route, not in sidebar
      return allowedRoutes.includes(route);
    },
    allowedRoutes: ['admin-subadmin-detail']
  },
  'sub-admin': {
    // Sub-admin can only access sub-admin related routes
    canAccess: (route) => {
      const allowedRoutes = [
        'dashboard',
        'sub-admins'
      ];
      return allowedRoutes.includes(route);
    },
    allowedRoutes: [
      'dashboard',
      'sub-admins'
    ]
  },
  'master-agency': {
    // Master agency can only access master agency; no dashboard
    canAccess: (route) => {
      const allowedRoutes = ['agency-dashboard', 'agencies', 'add-agency'];
      return allowedRoutes.includes(route);
    },
    allowedRoutes: ['agencies']
  }
};

// Get filtered navigation items based on user role
export const getFilteredNavigationItems = (navigationItems, userType) => {
  const normalized = normalizeUserType(userType);
  if (!normalized) return [];

  const permissions = ROLE_PERMISSIONS[normalized];
  
  if (!permissions) {
    console.warn(`Unknown user type: ${userType}`);
    return [];
  }

  // If user has access to all routes, return all navigation items
  if (permissions.allowedRoutes === 'all') {
    // Only Super Admin should see Role Stages in sidebar per requirement
    const withRoleStages = navigationItems;
    return withRoleStages;
  }

  // Filter navigation items based on allowed routes
  return navigationItems.filter(item => 
    permissions.allowedRoutes.includes(item.id)
  );
};

// Check if user can access a specific route
export const canAccessRoute = (route, userType) => {
  const normalized = normalizeUserType(userType);
  if (!normalized) return false;

  const permissions = ROLE_PERMISSIONS[normalized];
  
  if (!permissions) {
    console.warn(`Unknown user type: ${userType}`);
    return false;
  }

  // If user has access to all routes
  if (permissions.allowedRoutes === 'all') {
    return true;
  }

  // Check specific route access
  return permissions.canAccess(route);
};

// Get user role display name
export const getUserRoleDisplayName = (userType) => {
  const normalized = normalizeUserType(userType);
  const roleNames = {
    [USER_TYPES.SUPER_ADMIN]: 'Super Admin',
    [USER_TYPES.ADMIN]: 'Admin',
    'sub-admin': 'Sub Admin',
    'master-agency': 'Master Agency'
  };

  return roleNames[normalized] || userType;
};

// Check if user is admin level (super-admin or admin)
export const isAdminLevel = (userType) => {
  const normalized = normalizeUserType(userType);
  return normalized === USER_TYPES.SUPER_ADMIN || normalized === USER_TYPES.ADMIN;
};

// Get default route for user type
export const getDefaultRouteForUser = (userType) => {
  const normalized = normalizeUserType(userType);
  const permissions = ROLE_PERMISSIONS[normalized];
  
  if (!permissions) return 'dashboard';
  
  if (permissions.allowedRoutes === 'all') {
    return 'dashboard';
  }

  // Return the first allowed route (excluding dashboard if there are other options)
  const routes = permissions.allowedRoutes.filter(route => route !== 'dashboard');
  return routes.length > 0 ? routes[0] : 'dashboard';
};

export default {
  ROLE_PERMISSIONS,
  getFilteredNavigationItems,
  canAccessRoute,
  getUserRoleDisplayName,
  isAdminLevel,
  getDefaultRouteForUser
};