// Role-based access control utility
import { USER_TYPES } from '../config/api.js';

// Define role permissions
export const ROLE_PERMISSIONS = {
  [USER_TYPES.SUPER_ADMIN]: {
    // Super admin can access everything
    canAccess: () => true,
    allowedRoutes: 'all'
  },
  [USER_TYPES.ADMIN]: {
    // Admin can access everything
    canAccess: () => true,
    allowedRoutes: 'all'
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
    // Master agency can only access master agency related routes
    canAccess: (route) => {
      const allowedRoutes = [
        'dashboard',
        'master-agency'
      ];
      return allowedRoutes.includes(route);
    },
    allowedRoutes: [
      'dashboard',
      'master-agency'
    ]
  }
};

// Get filtered navigation items based on user role
export const getFilteredNavigationItems = (navigationItems, userType) => {
  if (!userType) return [];

  const permissions = ROLE_PERMISSIONS[userType];
  
  if (!permissions) {
    console.warn(`Unknown user type: ${userType}`);
    return [];
  }

  // If user has access to all routes, return all navigation items
  if (permissions.allowedRoutes === 'all') {
    return navigationItems;
  }

  // Filter navigation items based on allowed routes
  return navigationItems.filter(item => 
    permissions.allowedRoutes.includes(item.id)
  );
};

// Check if user can access a specific route
export const canAccessRoute = (route, userType) => {
  if (!userType) return false;

  const permissions = ROLE_PERMISSIONS[userType];
  
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
  const roleNames = {
    [USER_TYPES.SUPER_ADMIN]: 'Super Admin',
    [USER_TYPES.ADMIN]: 'Admin',
    'sub-admin': 'Sub Admin',
    'master-agency': 'Master Agency'
  };

  return roleNames[userType] || userType;
};

// Check if user is admin level (super-admin or admin)
export const isAdminLevel = (userType) => {
  return userType === USER_TYPES.SUPER_ADMIN || userType === USER_TYPES.ADMIN;
};

// Get default route for user type
export const getDefaultRouteForUser = (userType) => {
  const permissions = ROLE_PERMISSIONS[userType];
  
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