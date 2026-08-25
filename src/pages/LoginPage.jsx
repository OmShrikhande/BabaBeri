import React from 'react';
import Login from '../components/Login';
import { useAuth } from '../context/AuthContext';

/**
 * Login page — hosts the animated Login / Forgot Password panels.
 */
const LoginPage = () => {
  const { login } = useAuth();

  return <Login onLogin={login} />;
};

export default LoginPage;
