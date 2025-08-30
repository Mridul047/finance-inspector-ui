import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCategories } from '../../contexts/CategoryContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function CategoryForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isEditing = Boolean(id);
  const parentId = searchParams.get('parentId');
  
  const {
    getCategoryOptions,
    createCategory,
    updateCategory,
    findCategoryById,
    loading: contextLoading,
    error: contextError
  } = useCategories();
  
  const category = isEditing ? findCategoryById(parseInt(id)) : null;
  const categoryLoading = contextLoading;
  const categoryError = contextError;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    colorCode: '#3B82F6', // Default blue color
    parentId: parentId || ''
  });
  
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const options = getCategoryOptions();
    // Filter out the current category and its descendants to prevent circular references
    const filteredOptions = isEditing
      ? options.filter(option => option.id !== parseInt(id) && !isDescendant(option.id, parseInt(id), options))
      : options;
    setCategoryOptions(filteredOptions);
  }, [getCategoryOptions, isEditing, id]); // Depend on getCategoryOptions to update when categories change

  // Helper function to check if a category is a descendant of another
  const isDescendant = (categoryId, ancestorId, options) => {
    const category = options.find(opt => opt.id === categoryId);
    if (!category || !category.parentId) return false;
    if (category.parentId === ancestorId) return true;
    return isDescendant(category.parentId, ancestorId, options);
  };

  // Load category data for editing
  useEffect(() => {
    if (isEditing && category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        colorCode: category.colorCode || '#3B82F6',
        parentId: category.parentId ? category.parentId.toString() : ''
      });
    }
  }, [isEditing, category]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    }
    
    if (!formData.colorCode || !/^#[0-9A-F]{6}$/i.test(formData.colorCode)) {
      errors.colorCode = 'Please select a valid color';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        colorCode: formData.colorCode,
        parentId: formData.parentId ? parseInt(formData.parentId) : null
      };
      
      if (isEditing) {
        await updateCategory(parseInt(id), categoryData);
      } else {
        await createCategory(categoryData);
      }
      
      navigate('/categories');
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
      console.error(`${isEditing ? 'Update' : 'Create'} category error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/categories');
  };

  const predefinedColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#F43F5E'  // Rose
  ];

  if (isEditing && categoryLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isEditing && categoryError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading Category</p>
              <p className="text-red-700 text-sm">{categoryError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Update category details and organization' 
            : 'Create a new category to organize your expenses'
          }
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error {isEditing ? 'Updating' : 'Creating'} Category</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter category description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Parent Category */}
          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category (Optional)
            </label>
            <select
              id="parentId"
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None (Top-level category)</option>
              {categoryOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select a parent category to create a subcategory
            </p>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Color *
            </label>
            <div className="space-y-4">
              {/* Color Preview */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: formData.colorCode }}
                />
                <span className="font-mono text-sm text-gray-600">
                  {formData.colorCode}
                </span>
              </div>
              
              {/* Predefined Colors */}
              <div className="grid grid-cols-6 gap-3">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'colorCode', value: color } })}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      formData.colorCode === color 
                        ? 'border-gray-800 shadow-lg' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              
              {/* Custom Color Input */}
              <div>
                <label htmlFor="colorCode" className="block text-sm text-gray-600 mb-1">
                  Or enter custom hex color:
                </label>
                <input
                  type="text"
                  id="colorCode"
                  name="colorCode"
                  value={formData.colorCode}
                  onChange={handleChange}
                  placeholder="#3B82F6"
                  className={`w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                    validationErrors.colorCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.colorCode && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.colorCode}</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
            disabled={loading}
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="card mt-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">👁️</span>
          <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div 
            className="w-6 h-6 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: formData.colorCode }}
          />
          <div>
            <div className="flex items-center gap-2">
              {formData.iconCode && <span>{formData.iconCode}</span>}
              <span className="font-medium text-gray-900">
                {formData.name || 'Category Name'}
              </span>
            </div>
            {formData.description && (
              <p className="text-sm text-gray-600 mt-1">
                {formData.description}
              </p>
            )}
            {formData.parentId && (
              <p className="text-xs text-gray-500 mt-1">
                Subcategory of: {categoryOptions.find(opt => opt.id === parseInt(formData.parentId))?.originalName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryForm;