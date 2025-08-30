import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { DeleteConfirmDialog } from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function CategoryList() {
  const userId = 1; // Hardcoded for now, would come from auth context
  
  const {
    categoryTree,
    loading,
    error,
    statistics,
    deleteCategory,
    clearError
  } = useCategories(userId);
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, category: null, loading: false });
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleExpanded = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (category) => {
    setDeleteDialog({ isOpen: true, category, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteCategory(deleteDialog.category.id);
      setDeleteDialog({ isOpen: false, category: null, loading: false });
    } catch {
      // Error is handled by the hook
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, category: null, loading: false });
  };

  const CategoryTreeItem = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const indent = level * 24; // 24px per level

    return (
      <div className="border border-gray-200 rounded-lg mb-2 bg-white shadow-sm">
        <div
          className="p-4 sm:p-6"
          style={{ marginLeft: level > 0 ? `${Math.min(indent, 48)}px` : '0px' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              {!hasChildren && <div className="w-8 hidden sm:block" />}

              {/* Category Color */}
              <div
                className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: category.colorCode || '#6b7280' }}
                title={`Category color: ${category.colorCode || 'Default'}`}
              />

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate text-lg">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      category.isGlobal
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {category.isGlobal ? 'Global' : 'Personal'}
                    </span>
                    {hasChildren && (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category.children.length} subcategorie{category.children.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:ml-4">
              <Link
                to={`/categories/${category.id}`}
                className="btn btn-outline btn-sm flex-shrink-0"
                title="View Details"
              >
                <span className="hidden sm:inline">👁️ View</span>
                <span className="sm:hidden">👁️</span>
              </Link>
              {!category.isGlobal && (
                <>
                  <Link
                    to={`/categories/${category.id}/edit`}
                    className="btn btn-primary btn-sm flex-shrink-0"
                    title="Edit Category"
                  >
                    <span className="hidden sm:inline">✏️ Edit</span>
                    <span className="sm:hidden">✏️</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="btn btn-danger btn-sm flex-shrink-0"
                    title="Delete Category"
                    disabled={hasChildren}
                  >
                    <span className="hidden sm:inline">🗑️ Delete</span>
                    <span className="sm:hidden">🗑️</span>
                  </button>
                </>
              )}
              <Link
                to={`/categories/new?parentId=${category.id}`}
                className="btn btn-outline btn-sm flex-shrink-0"
                title="Add Subcategory"
              >
                <span className="hidden sm:inline">➕ Add Sub</span>
                <span className="sm:hidden">➕</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {hasChildren && isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50/50">
            {category.children.map(child => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Category Management
          </h1>
          <p className="text-gray-600">
            Organize your expenses with hierarchical categories
          </p>
        </div>
        <Link
          to="/categories/new"
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <span>📁</span>
          Add New Category
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading Categories</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
              <span className="text-2xl">📁</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">{statistics.totalCategories}</p>
              <p className="text-sm text-gray-600">Total Categories</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full flex-shrink-0">
              <span className="text-2xl">👤</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">{statistics.userCategories}</p>
              <p className="text-sm text-gray-600">Personal</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full flex-shrink-0">
              <span className="text-2xl">🌐</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">{statistics.globalCategories}</p>
              <p className="text-sm text-gray-600">Global</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full flex-shrink-0">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">{statistics.topLevelCategories}</p>
              <p className="text-sm text-gray-600">Top Level</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full flex-shrink-0">
              <span className="text-2xl">🔗</span>
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">{statistics.subcategories}</p>
              <p className="text-sm text-gray-600">Subcategories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌳</span>
            <h3 className="text-lg font-semibold text-gray-800">Category Tree</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setExpandedCategories(new Set(categoryTree.map(cat => cat.id)))}
              className="btn btn-outline btn-sm w-full sm:w-auto"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedCategories(new Set())}
              className="btn btn-outline btn-sm w-full sm:w-auto"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Category Tree */}
      <div className="space-y-2">
        {categoryTree.length > 0 ? (
          categoryTree.map(category => (
            <CategoryTreeItem key={category.id} category={category} />
          ))
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-6">
              Create your first category to start organizing your expenses.
            </p>
            <Link
              to="/categories/new"
              className="btn btn-primary"
            >
              Create First Category
            </Link>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Tips for Category Management</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Global categories</strong> are system-wide and cannot be edited or deleted</li>
              <li>• <strong>Personal categories</strong> are your custom categories that you can modify</li>
              <li>• Use subcategories to create detailed expense organization (e.g., Food → Restaurants, Groceries)</li>
              <li>• Categories with subcategories cannot be deleted until all subcategories are removed</li>
              <li>• Color-code your categories for easy visual identification in expense lists</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.category ? deleteDialog.category.name : ''}
        itemType="category"
        loading={deleteDialog.loading}
        extraWarning={
          deleteDialog.category && deleteDialog.category.children?.length > 0 
            ? `This category has ${deleteDialog.category.children.length} subcategories that will also be affected.`
            : null
        }
      />
    </div>
  );
}

export default CategoryList;