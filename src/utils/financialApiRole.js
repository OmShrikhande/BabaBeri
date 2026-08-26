import { USER_TYPES } from '../config/api.js';
import { normalizeUserType } from './roleBasedAccess.js';
import authService from '../services/authService.js';

/** Map frontend userType → financialOverview / financialAnalytics role param */
export const toFinancialApiRole = (userType) => {
  const normalized = normalizeUserType(userType);
  switch (normalized) {
    case USER_TYPES.SUPER_ADMIN:
      return 'SUPERADMIN';
    case USER_TYPES.ADMIN:
    case USER_TYPES.SUB_ADMIN:
      return 'ADMIN';
    case USER_TYPES.MASTER_AGENCY:
      return 'MASTERAGENCY';
    case 'agency':
      return 'AGENCY';
    default:
      return null;
  }
};

/**
 * Resolve the logged-in user's role + usercode for financial APIs.
 * role and usercode must match the DB or the API returns 400.
 */
export const resolveFinancialIdentity = async () => {
  const info = (await authService.ensureUserProfileCached()) || authService.getUserInfo();
  const usercode = authService.extractUserCode(info);
  const role = toFinancialApiRole(authService.getUserType());

  if (!role) {
    return { success: false, error: 'Unsupported role for financial APIs.', role: null, usercode: null };
  }
  if (!usercode) {
    return { success: false, error: 'User code not found. Please re-login.', role, usercode: null };
  }

  return { success: true, role, usercode, info };
};
