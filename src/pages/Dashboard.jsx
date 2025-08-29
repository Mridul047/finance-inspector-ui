import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import config from '../utils/config';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Test API connection on component mount
  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    setLoading(true);
    setConnectionStatus('checking');
    setError(null);

    try {
      // Test the API connection by fetching users
      const userData = await userService.getAllUsers();
      setUsers(userData);
      setConnectionStatus('connected');
      console.log('API Connection successful:', userData);
    } catch (err) {
      setError(err.message || 'Failed to connect to API');
      setConnectionStatus('disconnected');
      console.error('API Connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);
    try {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com'
      };
      const createdUser = await userService.createUser(newUser);
      console.log('User created:', createdUser);
      // Refresh users list
      await testApiConnection();
    } catch (err) {
      setError(err.message || 'Failed to create user');
      console.error('Create user failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Finance Inspector Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to your personal finance management system
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* API Connection Status */}
        <div className="card card-hover">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            API Connection Status
          </h2>
          <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : connectionStatus === 'disconnected'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            <span className="text-lg">
              {connectionStatus === 'connected' && '✅'}
              {connectionStatus === 'disconnected' && '❌'}
              {connectionStatus === 'checking' && '⏳'}
            </span>
            <span className="flex-1">
              {connectionStatus === 'connected' && 'Connected to Spring Boot API'}
              {connectionStatus === 'disconnected' && 'Disconnected from API'}
              {connectionStatus === 'checking' && 'Checking connection...'}
            </span>
          </div>
          <button 
            onClick={testApiConnection} 
            disabled={loading}
            className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {/* Users Overview */}
        <div className="card card-hover">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Users Overview
          </h2>
          <div className="flex flex-col items-center mb-4">
            <span className="text-5xl font-bold text-blue-600 leading-none">
              {users.length}
            </span>
            <span className="text-sm text-gray-500 uppercase tracking-wide font-medium mt-1">
              Total Users
            </span>
          </div>
          <button 
            onClick={testCreateUser} 
            disabled={loading || connectionStatus !== 'connected'}
            className={`btn btn-primary w-full ${
              (loading || connectionStatus !== 'connected') 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            } ${loading ? 'animate-pulse' : ''}`}
          >
            {loading ? 'Creating...' : 'Test Create User'}
          </button>
        </div>

        {/* System Information */}
        <div className="card card-hover">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            System Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">Frontend:</span>
              <span className="text-gray-600 font-mono text-sm">React {React.version}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">Backend:</span>
              <span className="text-gray-600 font-mono text-sm">Spring Boot API</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-700">Version:</span>
              <span className="text-gray-600 font-mono text-sm">{config.app.version}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card card-hover">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
            {users.length > 0 && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                Successfully loaded {users.length} users from API
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                API connection established at {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;