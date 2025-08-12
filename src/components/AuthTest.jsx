import React, { useState } from 'react';
import { testSuperAdminLogin, testTokenValidation, SUPER_ADMIN_CREDENTIALS } from '../utils/testAuth';
import authService from '../services/authService';

const AuthTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAuthTest = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      console.log('🧪 Starting Super Admin authentication test...');
      
      // Test the login
      const loginResult = await testSuperAdminLogin();
      
      let tokenValidation = null;
      if (loginResult.success && loginResult.token) {
        tokenValidation = testTokenValidation(loginResult.token);
      }

      setTestResults({
        login: loginResult,
        tokenValidation: tokenValidation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Test error:', error);
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearTest = () => {
    setTestResults(null);
    authService.logout();
  };

  return (
    <div className="p-6 bg-[#1A1A1A] min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#F72585]">Super Admin Authentication Test</h1>
        
        <div className="bg-[#121212] rounded-lg p-6 border border-gray-800 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Configuration</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p><span className="text-gray-500">API URL:</span> https://proxstream.online</p>
            <p><span className="text-gray-500">Endpoint:</span> /auth/login</p>
            <p><span className="text-gray-500">Email:</span> {SUPER_ADMIN_CREDENTIALS.email}</p>
            <p><span className="text-gray-500">Password:</span> {SUPER_ADMIN_CREDENTIALS.password}</p>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={runAuthTest}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-[#F72585] to-[#7209B7] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Run Authentication Test'}
          </button>
          
          <button
            onClick={clearTest}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
          >
            Clear Results
          </button>
        </div>

        {testResults && (
          <div className="bg-[#121212] rounded-lg p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Test Results</h2>
            
            {testResults.error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 font-semibold">❌ Test Failed</p>
                <p className="text-red-300 text-sm mt-2">{testResults.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Login Test Results */}
                <div className={`border rounded-lg p-4 ${
                  testResults.login?.success 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <h3 className="font-semibold mb-2">
                    {testResults.login?.success ? '✅ Login Test: SUCCESS' : '❌ Login Test: FAILED'}
                  </h3>
                  
                  {testResults.login?.success ? (
                    <div className="text-sm space-y-2">
                      <p><span className="text-gray-400">Token:</span> <span className="text-green-400 font-mono text-xs break-all">{testResults.login.token?.substring(0, 50)}...</span></p>
                      {testResults.login.data && (
                        <div>
                          <p className="text-gray-400">API Response:</p>
                          <pre className="text-xs bg-black/30 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(testResults.login.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-300 text-sm">{testResults.login?.error}</p>
                  )}
                </div>

                {/* Token Validation Results */}
                {testResults.tokenValidation && (
                  <div className={`border rounded-lg p-4 ${
                    testResults.tokenValidation.isValid 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    <h3 className="font-semibold mb-2">
                      {testResults.tokenValidation.isValid ? '✅ Token Validation: VALID' : '⚠️ Token Validation: INVALID'}
                    </h3>
                    
                    <div className="text-sm space-y-2">
                      <p><span className="text-gray-400">Is Expired:</span> <span className={testResults.tokenValidation.isExpired ? 'text-red-400' : 'text-green-400'}>{testResults.tokenValidation.isExpired ? 'Yes' : 'No'}</span></p>
                      <p><span className="text-gray-400">User Type:</span> <span className="text-blue-400">{testResults.tokenValidation.userType}</span></p>
                      
                      {testResults.tokenValidation.decoded && (
                        <div>
                          <p className="text-gray-400">Decoded Token:</p>
                          <pre className="text-xs bg-black/30 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(testResults.tokenValidation.decoded, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-4">Test completed at: {testResults.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTest;