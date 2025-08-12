import React, { useState } from 'react';
import { Crown, Shield, User, Building } from 'lucide-react';

const RoleTestComponent = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('admin');

  const testRoles = [
    {
      id: 'super-admin',
      label: 'Super Admin',
      icon: Crown,
      color: 'from-[#F72585] to-[#7209B7]',
      description: 'Can access everything',
      username: 'superadmin@admin.com'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      color: 'from-[#7209B7] to-[#4361EE]',
      description: 'Can access everything',
      username: 'admin@test.com'
    },
    {
      id: 'sub-admin',
      label: 'Sub Admin',
      icon: User,
      color: 'from-[#4361EE] to-[#4CC9F0]',
      description: 'Can only access Sub Admin section',
      username: 'subadmin@test.com'
    },
    {
      id: 'master-agency',
      label: 'Master Agency',
      icon: Building,
      color: 'from-[#4CC9F0] to-[#06FFA5]',
      description: 'Can only access Master Agency section',
      username: 'masteragency@test.com'
    }
  ];

  const handleRoleLogin = (role) => {
    const roleData = testRoles.find(r => r.id === role.id);
    
    // Simulate login with role-specific data
    onLogin({
      username: roleData.username,
      userType: role.id,
      token: `demo-token-${role.id}-${Date.now()}`,
      isDemo: true,
      apiData: {
        id: Math.floor(Math.random() * 1000),
        email: roleData.username,
        role: role.id,
        permissions: role.id === 'super-admin' || role.id === 'admin' ? 'all' : [role.id]
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <div className="bg-[#121212] rounded-2xl border border-gray-800 p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Role-Based Access Test</h1>
          <p className="text-gray-400">Select a role to test the access control system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testRoles.map((role) => {
            const IconComponent = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleLogin(role)}
                className={`
                  p-6 rounded-xl border border-gray-700 hover:border-gray-600 
                  transition-all duration-300 text-left group hover:scale-105
                  bg-gradient-to-br ${role.color} bg-opacity-10 hover:bg-opacity-20
                `}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    bg-gradient-to-r ${role.color}
                  `}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-gray-100">
                      {role.label}
                    </h3>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">
                      {role.username}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 group-hover:text-gray-300">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-[#0A0A0A] rounded-lg border border-gray-800">
          <h4 className="text-white font-semibold mb-2">Test Instructions:</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• <strong>Super Admin & Admin:</strong> Can see all menu items and access all features</li>
            <li>• <strong>Sub Admin:</strong> Can only see Dashboard and Sub Admin menu items</li>
            <li>• <strong>Master Agency:</strong> Can only see Dashboard and Master Agency menu items</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoleTestComponent;