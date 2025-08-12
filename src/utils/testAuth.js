// Test utility for Super Admin authentication
import authService from '../services/authService';

// Super Admin credentials from the provided API documentation
const SUPER_ADMIN_CREDENTIALS = {
  email: 'superadmin@admin.com',
  password: 'superadmin'
};

// Test function to verify Super Admin login
export const testSuperAdminLogin = async () => {
  console.log('Testing Super Admin login...');
  
  try {
    const result = await authService.login(SUPER_ADMIN_CREDENTIALS);
    
    if (result.success) {
      console.log('✅ Super Admin login successful!');
      console.log('Token:', result.token);
      console.log('User data:', result.data);
      
      // Test token decoding
      const decoded = authService.decodeToken(result.token);
      console.log('Decoded token:', decoded);
      
      return {
        success: true,
        token: result.token,
        data: result.data,
        decoded: decoded
      };
    } else {
      console.log('❌ Super Admin login failed:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Super Admin login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test function to verify token validation
export const testTokenValidation = (token) => {
  console.log('Testing token validation...');
  
  try {
    const decoded = authService.decodeToken(token);
    const isExpired = authService.isTokenExpired(token);
    const userType = authService.getUserType();
    
    console.log('Token decoded:', decoded);
    console.log('Is expired:', isExpired);
    console.log('User type:', userType);
    
    return {
      decoded,
      isExpired,
      userType,
      isValid: !isExpired && decoded !== null
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};

// Export credentials for easy access
export { SUPER_ADMIN_CREDENTIALS };