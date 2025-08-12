import React, { useState } from 'react';
import authService from '../services/authService';

const SubAdminForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.createSubAdmin(formData);

      if (result.success) {
        setSuccess('Sub-admin created successfully!');
        setFormData({ name: '', email: '', password: '' });
      } else {
        setError(result.error || 'Failed to create sub-admin.');
      }
    } catch (error) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Create Sub-Admin</h2>
      {error && <div className="bg-red-500 text-white p-2 mb-4">{error}</div>}
      {success && <div className="bg-green-500 text-white p-2 mb-4">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {isLoading ? 'Creating...' : 'Create Sub-Admin'}
        </button>
      </form>
    </div>
  );
};

export default SubAdminForm;
