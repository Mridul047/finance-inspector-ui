import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BackendPaginatedDataTable } from '../../components/common/DataTable';
import { DeleteConfirmDialog } from '../../components/common/ConfirmDialog';
import { useExpenses } from '../../hooks/useExpenses';
import { useCategories } from '../../hooks/useCategories';

function ExpenseList() {
  // For now, we'll use a hardcoded userId - in a real app, this would come from auth context
  const userId = 1;
  
  const {
    expenses,
    loading,
    error,
    pagination,
    deleteExpense,
    goToPage,
    updateFilters,
    clearFilters,
    clearError
  } = useExpenses(userId);

  const { getCategoryOptions } = useCategories(userId);
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, expense: null, loading: false });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [filterValues, setFilterValues] = useState({
    categoryId: '',
    fromDate: '',
    toDate: '',
    minAmount: '',
    maxAmount: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'expenseDate', direction: 'desc' });

  // Load category options for filter dropdown
  useEffect(() => {
    const loadCategoryOptions = async () => {
      try {
        const options = await getCategoryOptions();
        setCategoryOptions(options);
      } catch (err) {
        console.error('Failed to load category options:', err);
      }
    };
    loadCategoryOptions();
  }, []); // Empty dependency array to load only once

  // Table columns configuration with sorting support
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: false,
      render: (value) => <span className="font-mono text-sm text-gray-600">#{value}</span>
    },
    {
      key: 'expenseDate',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value, row) => (
        <span className="font-semibold text-red-600">
          {getCurrencySymbol(row.currencyCode)}{parseFloat(value).toFixed(2)}
        </span>
      )
    },
    {
      key: 'currencyCode',
      label: 'Currency',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {getCurrencySymbol(value)} {value}
        </span>
      )
    },
    {
      key: 'categoryName',
      label: 'Category',
      sortable: false,
      render: (value, row) => (
        <span
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
          style={{
            backgroundColor: row.categoryColorCode ? `${row.categoryColorCode}20` : '#f3f4f6',
            color: row.categoryColorCode || '#374151'
          }}
        >
          {value || 'Uncategorized'}
        </span>
      )
    },
    {
      key: 'expenseType',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          value === 'NEED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  // Action buttons for each expense row
  const renderActions = (expense) => (
    <div className="flex items-center gap-2">
      <Link
        to={`/expenses/${expense.id}`}
        className="btn btn-outline btn-sm"
        title="View Details"
      >
        👁️ View
      </Link>
      <Link
        to={`/expenses/${expense.id}/edit`}
        className="btn btn-primary btn-sm"
        title="Edit Expense"
      >
        ✏️ Edit
      </Link>
      <button
        onClick={() => handleDeleteClick(expense)}
        className="btn btn-danger btn-sm"
        title="Delete Expense"
      >
        🗑️ Delete
      </button>
    </div>
  );

  const handleDeleteClick = (expense) => {
    setDeleteDialog({ isOpen: true, expense, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.expense) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteExpense(deleteDialog.expense.id);
      setDeleteDialog({ isOpen: false, expense: null, loading: false });
    } catch {
      // Error is handled by the hook
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, expense: null, loading: false });
  };

  const handleFilterChange = (name, value) => {
    setFilterValues(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const activeFilters = {};
    Object.keys(filterValues).forEach(key => {
      if (filterValues[key]) {
        activeFilters[key] = filterValues[key];
      }
    });
    updateFilters(activeFilters);
  };

  const clearAllFilters = () => {
    setFilterValues({
      categoryId: '',
      fromDate: '',
      toDate: '',
      minAmount: '',
      maxAmount: '',
      description: ''
    });
    setSearchTerm('');
    clearFilters();
  };

  // DataTable event handlers
  const handlePageChange = (page) => {
    goToPage(page - 1); // DataTable uses 1-based, backend uses 0-based
  };

  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
    const sortParam = `${newSortConfig.key},${newSortConfig.direction}`;
    updateFilters({ sort: sortParam });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    updateFilters({ description: term });
  };

  const calculateTotalAmount = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  };

  const getExpensesByType = (type) => {
    return expenses.filter(expense => expense.expenseType === type);
  };

  const formatCurrencyAmount = (amount) => {
    if (expenses.length === 0) return '0.00';
    
    // Get the most common currency from current expenses
    const currencyCounts = expenses.reduce((acc, expense) => {
      const currency = expense.currencyCode || 'USD';
      acc[currency] = (acc[currency] || 0) + 1;
      return acc;
    }, {});
    
    const primaryCurrency = Object.keys(currencyCounts).reduce((a, b) =>
      currencyCounts[a] > currencyCounts[b] ? a : b
    );
    
    // Get currency symbol
    const getCurrencySymbol = (code) => {
      const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹',
        'CAD': 'C$',
        'AUD': 'A$'
      };
      return symbols[code] || code;
    };
    
    return `${getCurrencySymbol(primaryCurrency)}${amount.toFixed(2)}`;
  };

  const getCurrencyBreakdown = () => {
    const breakdown = expenses.reduce((acc, expense) => {
      const currency = expense.currencyCode || 'USD';
      acc[currency] = (acc[currency] || 0) + parseFloat(expense.amount || 0);
      return acc;
    }, {});
    
    return breakdown;
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'INR': '₹',
      'CAD': 'C$',
      'AUD': 'A$'
    };
    return symbols[currencyCode] || currencyCode;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense Management
          </h1>
          <p className="text-gray-600">
            Track and manage your expenses with advanced filtering and categorization
          </p>
        </div>
        <Link
          to="/expenses/new"
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <span>💳</span>
          Add New Expense
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading Expenses</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
              <span className="text-2xl">💳</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">{pagination.totalElements}</p>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrencyAmount(calculateTotalAmount())}
              </p>
              <p className="text-sm text-gray-600">Current Page Total</p>
              {/* Show currency breakdown if multiple currencies */}
              {Object.keys(getCurrencyBreakdown()).length > 1 && (
                <div className="mt-1">
                  {Object.entries(getCurrencyBreakdown()).map(([currency, amount]) => (
                    <span key={currency} className="text-xs text-gray-500 mr-2">
                      {currency} {amount.toFixed(2)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">
                {getExpensesByType('NEED').length}
              </p>
              <p className="text-sm text-gray-600">Needs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">
                {getExpensesByType('WANT').length}
              </p>
              <p className="text-sm text-gray-600">Wants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🔍</span>
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterValues.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categoryOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filterValues.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filterValues.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
            <input
              type="number"
              step="0.01"
              value={filterValues.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
            <input
              type="number"
              step="0.01"
              value={filterValues.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              placeholder="1000.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={filterValues.description}
              onChange={(e) => handleFilterChange('description', e.target.value)}
              placeholder="Search description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={applyFilters}
            className="btn btn-primary w-full sm:w-auto"
          >
            Apply Filters
          </button>
          <button
            onClick={clearAllFilters}
            className="btn btn-outline w-full sm:w-auto"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Expenses Data Table with Backend Pagination */}
      <BackendPaginatedDataTable
        data={expenses}
        columns={columns}
        loading={loading}
        actions={renderActions}
        emptyMessage="No expenses found. Create your first expense to get started!"
        searchable={true}
        totalItems={pagination.totalElements}
        currentPage={pagination.page + 1} // DataTable uses 1-based indexing
        itemsPerPage={pagination.size}
        onPageChange={handlePageChange}
        onSort={handleSort}
        onSearch={handleSearch}
        searchTerm={searchTerm}
        sortConfig={sortConfig}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.expense ? deleteDialog.expense.description : ''}
        itemType="expense"
        loading={deleteDialog.loading}
      />
    </div>
  );
}

export default ExpenseList;