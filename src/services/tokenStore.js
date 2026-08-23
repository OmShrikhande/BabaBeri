import { TOKEN_CONFIG } from '../config/api.js';

export function readStoredToken() {
  return sessionStorage.getItem(TOKEN_CONFIG.STORAGE_KEY);
}

export function writeStoredToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_CONFIG.STORAGE_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_CONFIG.STORAGE_KEY);
  }
}

export function clearStoredAuth() {
  sessionStorage.removeItem(TOKEN_CONFIG.STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_CONFIG.USER_INFO_KEY);
}

export function readStoredUserInfo() {
  const raw = sessionStorage.getItem(TOKEN_CONFIG.USER_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeStoredUserInfo(userInfo) {
  if (userInfo && typeof userInfo === 'object') {
    sessionStorage.setItem(TOKEN_CONFIG.USER_INFO_KEY, JSON.stringify(userInfo));
  }
}
