import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useExpense } from '../../hooks/useExpenses';
import { useCategory } from '../../hooks/useCategories';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DeleteConfirmDialog } from '../../components/common/ConfirmDialog';

function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = 1; // Hardcoded for now, would come from auth context
  
  const { expense, loading, error, deleteExpense } = useExpense(id, userId);
  const { category } = useCategory(expense?.categoryId, userId);
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false });

  const handleDeleteClick = () => {
    setDeleteDialog({ isOpen: true, loading: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteExpense();
      navigate('/expenses');
    } catch (error) {
      console.error('Failed to delete expense:', error);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, loading: false });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading Expense</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-yellow-600 text-xl">❓</span>
            <div>
              <p className="text-yellow-800 font-medium">Expense Not Found</p>
              <p className="text-yellow-700 text-sm">The expense you're looking for doesn't exist or has been deleted.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/expenses"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Expenses
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense Details
          </h1>
          <p className="text-gray-600">
            View and manage expense information
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to={`/expenses/${expense.id}/edit`}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>✏️</span>
            Edit Expense
          </Link>
          <button
            onClick={handleDeleteClick}
            className="btn btn-danger flex items-center gap-2"
          >
            <span>🗑️</span>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">💳</span>
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {expense.description}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-2xl font-bold text-red-600">
                  {formatAmount(expense.amount, expense.currencyCode)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <p className="text-lg text-gray-900">
                  {formatDate(expense.expenseDate)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  expense.expenseType === 'NEED' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {expense.expenseType === 'NEED' ? '🚨 Need (Essential)' : '🎯 Want (Optional)'}
                </span>
              </div>
            </div>
          </div>

          {/* Category Information */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📁</span>
              <h2 className="text-xl font-semibold text-gray-800">Category</h2>
            </div>
            
            {category ? (
              <div className="flex items-center gap-4">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: category.colorCode || '#6b7280' }}
                  title={`Category color: ${category.colorCode}`}
                ></div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </p>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      category.isGlobal 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {category.isGlobal ? 'Global Category' : 'Personal Category'}
                    </span>
                    <Link
                      to={`/categories/${category.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Category →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Category information not available
              </div>
            )}
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📝</span>
                <h2 className="text-xl font-semibold text-gray-800">Notes</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {expense.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-semibold text-gray-800">Quick Stats</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expense ID</span>
                <span className="font-mono text-sm text-gray-900">#{expense.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Currency</span>
                <span className="font-medium text-gray-900">{expense.currencyCode}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm text-gray-900">
                  {expense.createdOn ? formatDate(expense.createdOn) : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {expense.updatedOn ? formatDate(expense.updatedOn) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <h3 className="text-lg font-semibold text-gray-800">Actions</h3>
            </div>
            
            <div className="space-y-3">
              <Link
                to={`/expenses/${expense.id}/edit`}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <span>✏️</span>
                Edit Expense
              </Link>
              
              <button
                onClick={handleDeleteClick}
                className="w-full btn btn-danger flex items-center justify-center gap-2"
              >
                <span>🗑️</span>
                Delete Expense
              </button>
              
              <Link
                to="/expenses"
                className="w-full btn btn-outline flex items-center justify-center gap-2"
              >
                <span>📋</span>
                Back to List
              </Link>
              
              {category && (
                <Link
                  to={`/categories/${category.id}`}
                  className="w-full btn btn-outline flex items-center justify-center gap-2"
                >
                  <span>📁</span>
                  View Category
                </Link>
              )}
            </div>
          </div>

          {/* Related Information */}
          {category && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔗</span>
                <h3 className="text-lg font-semibold text-gray-800">Related</h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.colorCode || '#6b7280' }}
                    ></div>
                    <span className="font-medium text-gray-900 text-sm">
                      {category.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {category.isGlobal ? 'Global' : 'Personal'} Category
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={expense.description}
        itemType="expense"
        loading={deleteDialog.loading}
      />
    </div>
  );
}

export default ExpenseDetails;