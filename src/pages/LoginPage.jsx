import React from 'react';
import Login from '../components/Login';
import { useAuth } from '../context/AuthContext';
import usePageSEO from '../hooks/usePageSEO';

/**
 * Login page — hosts the animated Login / Forgot Password panels.
 */
const LoginPage = () => {
  const { login } = useAuth();

  usePageSEO({
    title: 'Login to ProxStream Portal | Creator & Agency Access',
    description:
      'Sign in to your ProxStream account. Access creator analytics, agency dashboards, host verification, and wallet management.',
    canonicalPath: '/login',
  });

  return <Login onLogin={login} />;
};

export default LoginPage;
