import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCategory } from '../../hooks/useCategories';
import { useExpenses } from '../../hooks/useExpenses';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DeleteConfirmDialog } from '../../components/common/ConfirmDialog';

function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = 1; // Hardcoded for now, would come from auth context
  
  const { category, subcategories, loading, error, deleteCategory } = useCategory(id, userId);
  const {
    expenses,
    loading: expensesLoading,
    error: expensesError
  } = useExpenses(userId, { categoryId: id });
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false });
  const [relatedExpenses, setRelatedExpenses] = useState([]);

  // Get all expenses for this category and its subcategories
  useEffect(() => {
    if (category && expenses) {
      // For now, we'll just show expenses directly in this category
      // In a full implementation, we'd also fetch expenses from subcategories
      setRelatedExpenses(expenses);
    }
  }, [category, expenses]);

  const handleDeleteClick = () => {
    setDeleteDialog({ isOpen: true, loading: false });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteCategory();
      navigate('/categories');
    } catch (error) {
      console.error('Failed to delete category:', error);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, loading: false });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const calculateTotalExpenses = () => {
    return relatedExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  };

  const getExpensesByType = (type) => {
    return relatedExpenses.filter(expense => expense.expenseType === type);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading Category</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-yellow-600 text-xl">❓</span>
            <div>
              <p className="text-yellow-800 font-medium">Category Not Found</p>
              <p className="text-yellow-700 text-sm">The category you're looking for doesn't exist or has been deleted.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/categories"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Categories
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: category.colorCode || '#6b7280' }}
            />
            <h1 className="text-3xl font-bold text-gray-900">
              {category.iconCode && <span className="mr-2">{category.iconCode}</span>}
              {category.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                category.isGlobal 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {category.isGlobal ? 'Global Category' : 'Personal Category'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">
            {category.description || 'View category details and related expenses'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!category.isGlobal && (
            <>
              <Link
                to={`/categories/${category.id}/edit`}
                className="btn btn-primary flex items-center gap-2"
              >
                <span>✏️</span>
                Edit Category
              </Link>
              <button
                onClick={handleDeleteClick}
                className="btn btn-danger flex items-center gap-2"
                disabled={subcategories.length > 0 || relatedExpenses.length > 0}
                title={
                  subcategories.length > 0 
                    ? "Cannot delete category with subcategories"
                    : relatedExpenses.length > 0
                    ? "Cannot delete category with expenses"
                    : "Delete category"
                }
              >
                <span>🗑️</span>
                Delete
              </button>
            </>
          )}
          <Link
            to={`/categories/new?parentId=${category.id}`}
            className="btn btn-outline flex items-center gap-2"
          >
            <span>➕</span>
            Add Subcategory
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Information */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📋</span>
              <h2 className="text-xl font-semibold text-gray-800">Category Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category ID
                </label>
                <p className="font-mono text-sm text-gray-600">#{category.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  category.isGlobal 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {category.isGlobal ? 'Global Category' : 'Personal Category'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: category.colorCode || '#6b7280' }}
                  />
                  <span className="font-mono text-sm text-gray-600">
                    {category.colorCode || 'Default'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategories
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {subcategories.length}
                </p>
              </div>
              
              {category.parentId && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <Link
                    to={`/categories/${category.parentId}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Parent Category →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🗂️</span>
                <h2 className="text-xl font-semibold text-gray-800">Subcategories</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subcategories.map(subcategory => (
                  <Link
                    key={subcategory.id}
                    to={`/categories/${subcategory.id}`}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: subcategory.colorCode || '#6b7280' }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {subcategory.iconCode && <span className="mr-1">{subcategory.iconCode}</span>}
                          {subcategory.name}
                        </h3>
                        {subcategory.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {subcategory.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Expenses */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💳</span>
                <h2 className="text-xl font-semibold text-gray-800">Related Expenses</h2>
              </div>
              <Link
                to={`/expenses/new?categoryId=${category.id}`}
                className="btn btn-outline btn-sm"
              >
                Add Expense
              </Link>
            </div>
            
            {expensesLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : expensesError ? (
              <div className="text-center py-8 text-red-600">
                Error loading expenses: {expensesError}
              </div>
            ) : relatedExpenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💳</div>
                <p className="text-gray-600 mb-4">No expenses in this category yet</p>
                <Link
                  to={`/expenses/new?categoryId=${category.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Add First Expense
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {relatedExpenses.slice(0, 5).map(expense => (
                  <Link
                    key={expense.id}
                    to={`/expenses/${expense.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{expense.description}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{formatDate(expense.expenseDate)}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            expense.expenseType === 'NEED' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {expense.expenseType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          {formatAmount(expense.amount, expense.currencyCode)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {relatedExpenses.length > 5 && (
                  <Link
                    to={`/expenses?categoryId=${category.id}`}
                    className="block text-center p-3 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {relatedExpenses.length} expenses →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="text-lg font-semibold text-gray-800">Statistics</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="font-semibold text-gray-900">{relatedExpenses.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-semibold text-gray-900">
                  ${calculateTotalExpenses().toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Needs</span>
                <span className="font-semibold text-red-600">
                  {getExpensesByType('NEED').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Wants</span>
                <span className="font-semibold text-blue-600">
                  {getExpensesByType('WANT').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subcategories</span>
                <span className="font-semibold text-gray-900">{subcategories.length}</span>
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
                to={`/expenses/new?categoryId=${category.id}`}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <span>💳</span>
                Add Expense
              </Link>
              
              <Link
                to={`/categories/new?parentId=${category.id}`}
                className="w-full btn btn-outline flex items-center justify-center gap-2"
              >
                <span>📁</span>
                Add Subcategory
              </Link>
              
              {!category.isGlobal && (
                <Link
                  to={`/categories/${category.id}/edit`}
                  className="w-full btn btn-outline flex items-center justify-center gap-2"
                >
                  <span>✏️</span>
                  Edit Category
                </Link>
              )}
              
              <Link
                to="/categories"
                className="w-full btn btn-outline flex items-center justify-center gap-2"
              >
                <span>📋</span>
                Back to Categories
              </Link>
              
              {relatedExpenses.length > 0 && (
                <Link
                  to={`/expenses?categoryId=${category.id}`}
                  className="w-full btn btn-outline flex items-center justify-center gap-2"
                >
                  <span>📊</span>
                  View All Expenses
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={category.name}
        itemType="category"
        loading={deleteDialog.loading}
        extraWarning={
          subcategories.length > 0 
            ? `This category has ${subcategories.length} subcategories that must be removed first.`
            : relatedExpenses.length > 0
            ? `This category has ${relatedExpenses.length} expenses that will need to be recategorized.`
            : null
        }
      />
    </div>
  );
}

export default CategoryDetails;