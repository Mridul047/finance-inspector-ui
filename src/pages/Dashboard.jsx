import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import expenseService from '../services/expenseService';
import categoryService from '../services/categoryService';
import config from '../utils/config';

// Currency formatting utility
const formatCurrency = (amount, currencyCode = 'INR') => {
  const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  };
  
  const symbol = currencySymbols[currencyCode] || currencyCode;
  return `${symbol}${parseFloat(amount || 0).toFixed(2)}`;
};

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    needsCount: 0,
    wantsCount: 0,
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    primaryCurrency: 'INR'
  });


  // Test API connection on component mount
  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    setLoading(true);
    setConnectionStatus('checking');
    setError(null);

    try {
      // Test the API connection by fetching all data
      const userId = 1; // Hardcoded for demo
      
      const [userData, expenseData, categoryData] = await Promise.all([
        userService.getAllUsers(),
        expenseService.getExpenses(userId, 0, 100).catch(() => ({ content: [], totalElements: 0 })),
        categoryService.getAllGlobalCategories().catch(() => [])
      ]);
      
      setUsers(userData);
      setExpenses(expenseData.content || []);
      setConnectionStatus('connected');
      
      // Calculate statistics
      const totalExpenses = expenseData.totalElements || expenseData.content?.length || 0;
      const totalAmount = expenseData.content?.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) || 0;
      const needsCount = expenseData.content?.filter(exp => exp.expenseType === 'NEED').length || 0;
      const wantsCount = expenseData.content?.filter(exp => exp.expenseType === 'WANT').length || 0;
      
      // Updated category statistics - using active/inactive instead of personal/global
      const totalCategories = categoryData?.length || 0;
      const activeCategories = categoryData?.filter(cat => cat.isActive !== false).length || 0;
      const inactiveCategories = categoryData?.filter(cat => cat.isActive === false).length || 0;
      
      // Determine primary currency from expenses (most common currency)
      const currencyCounts = expenseData.content?.reduce((acc, exp) => {
        const currency = exp.currencyCode || 'INR';
        acc[currency] = (acc[currency] || 0) + 1;
        return acc;
      }, {}) || {};
      const primaryCurrency = Object.keys(currencyCounts).length > 0
        ? Object.keys(currencyCounts).reduce((a, b) => currencyCounts[a] > currencyCounts[b] ? a : b)
        : 'INR';
      
      setStats({
        totalExpenses,
        totalAmount,
        needsCount,
        wantsCount,
        totalCategories,
        activeCategories,
        inactiveCategories,
        primaryCurrency
      });
      
      console.log('API Connection successful - Users:', userData.length, 'Expenses:', totalExpenses, 'Categories:', totalCategories, 'Active:', activeCategories, 'Inactive:', inactiveCategories);
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
    <div className="container-responsive">
      {/* Dashboard Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Finance Inspector Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to your personal finance management system
        </p>
      </div>

      {/* Quick Actions */}
      <div className="stats-grid mb-8">
        <Link
          to="/expenses/new"
          className="btn btn-primary flex flex-col items-center gap-2 p-6 h-auto"
        >
          <span className="text-3xl">💳</span>
          <span className="text-sm font-medium">Add Expense</span>
        </Link>
        
        <Link
          to="/categories/new"
          className="btn btn-outline flex flex-col items-center gap-2 p-6 h-auto"
        >
          <span className="text-3xl">📁</span>
          <span className="text-sm font-medium">Add Category</span>
        </Link>
        
        <Link
          to="/expenses"
          className="btn btn-outline flex flex-col items-center gap-2 p-6 h-auto"
        >
          <span className="text-3xl">📊</span>
          <span className="text-sm font-medium">View Expenses</span>
        </Link>
        
        <Link
          to="/categories"
          className="btn btn-outline flex flex-col items-center gap-2 p-6 h-auto"
        >
          <span className="text-3xl">🗂️</span>
          <span className="text-sm font-medium">Manage Categories</span>
        </Link>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Expense Statistics */}
        <div className="card-responsive">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Expense Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Expenses</span>
              <span className="font-bold text-2xl text-blue-600">{stats.totalExpenses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-bold text-xl text-red-600">{formatCurrency(stats.totalAmount, stats.primaryCurrency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Needs</span>
              <span className="font-semibold text-red-700">{stats.needsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Wants</span>
              <span className="font-semibold text-blue-700">{stats.wantsCount}</span>
            </div>
          </div>
          <Link to="/expenses" className="btn btn-outline w-full mt-4">
            View All Expenses →
          </Link>
        </div>

        {/* Updated Category Statistics */}
        <div className="card-responsive">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Category Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Categories</span>
              <span className="font-bold text-2xl text-blue-600">{stats.totalCategories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-700">{stats.activeCategories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Inactive</span>
              <span className="font-semibold text-gray-700">{stats.inactiveCategories}</span>
            </div>
          </div>
          <Link to="/categories" className="btn btn-outline w-full mt-4">
            Manage Categories →
          </Link>
        </div>

        {/* API Connection Status */}
        <div className="card-responsive">
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
        <div className="card-responsive">
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

        {/* Recent Expenses */}
        <div className="card-responsive">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Expenses
          </h2>
          {expenses.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">💳</div>
              <p className="text-gray-600 mb-4">No expenses yet</p>
              <Link to="/expenses/new" className="btn btn-primary btn-sm">
                Add First Expense
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 3).map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                    <p className="text-sm text-gray-600">{new Date(expense.expenseDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {expense.currencyCode} {parseFloat(expense.amount || 0).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      expense.expenseType === 'NEED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {expense.expenseType}
                    </span>
                  </div>
                </div>
              ))}
              <Link to="/expenses" className="btn btn-outline btn-sm w-full mt-3">
                View All →
              </Link>
            </div>
          )}
        </div>

        {/* System Information */}
        <div className="card-responsive">
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
        <div className="card-responsive">
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
            {stats.totalCategories > 0 && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                Loaded {stats.totalCategories} categories ({stats.activeCategories} active, {stats.inactiveCategories} inactive)
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
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