import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      const userInfo = authService.getUserInfo();
      
      if (token && !authService.isTokenExpired(token)) {
        const type = authService.getUserType();
        const user = {
          username: userInfo?.username || userInfo?.email || userInfo?.name || 'User',
          userType: type,
          loginTime: userInfo?.loginTime || new Date().toISOString(),
          token: token,
          isDemo: false
        };
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else if (token) {
        authService.logout();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    const userType = authService.getUserType();
    const formattedUser = {
      username: userData.username,
      userType: userType,
      loginTime: new Date().toISOString(),
      token: userData.token,
      isDemo: userData.isDemo || false,
      apiData: userData.apiData
    };

    if (!userData.isDemo && userData.apiData) {
      const existingProfile = authService.getUserInfo() || {};
      const merged = {
        ...existingProfile,
        username: existingProfile.username || userData.username,
        email: existingProfile.email || userData.username,
        loginTime: existingProfile.loginTime || formattedUser.loginTime,
        ...userData.apiData
      };
      sessionStorage.setItem('userInfo', JSON.stringify(merged));
    }

    setCurrentUser(formattedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
