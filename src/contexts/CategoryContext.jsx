import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import categoryService from '../services/categoryService';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  // Note: Legacy variables maintained for documentation purposes
  // const _LEGACY_USER_ID = 1; // Previously used, now deprecated in favor of auth context
  // const _LEGACY_INCLUDE_GLOBAL = true; // Previously used, now all categories are global

  const fetchCategories = useCallback(async (force = false) => {
    // If already have data and not forcing, return existing data
    if (!force && categories.length > 0) {
      console.log('Using cached categories, count:', categories.length);
      return categories;
    }

    if (loading) {
      console.log('Fetch already in progress, skipping...');
      return categories;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching global categories from API...');
      // Use new global categories endpoint instead of legacy method
      const data = await categoryService.getAllGlobalCategories();
      console.log('Categories fetched successfully, count:', data.length);
      setCategories(data);
      setInitialized(true);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categories.length, loading]);

  // Auto-fetch only once on mount
  useEffect(() => {
    if (!initialized && !loading && categories.length === 0) {
      console.log('Initial category fetch...');
      fetchCategories();
    }
  }, [initialized, loading, categories.length, fetchCategories]);

  const getCategoryOptions = useCallback(() => {
    if (categories.length === 0) {
      console.log('No categories available for options');
      return [];
    }

    console.log('Building category options from cached data');
    const flattenOptions = (cats, level = 0) => {
      let options = [];
      
      cats.forEach(category => {
        if (!category.parent) { // Only process top-level categories here
          const indent = '  '.repeat(level);
          options.push({
            id: category.id,
            name: `${indent}${category.name}`,
            originalName: category.name,
            level: level,
            parentId: category.parent?.id || null,
            colorCode: category.colorCode,
            isGlobal: true, // All categories are now global
            isActive: category.isActive
          });
          
          // Add children recursively
          const children = cats.filter(c => c.parent?.id === category.id);
          if (children.length > 0) {
            options.push(...flattenOptions(children, level + 1));
          }
        }
      });
      
      return options;
    };

    return flattenOptions(categories);
  }, [categories]);

  const buildCategoryTree = useCallback((flatCategories = categories) => {
    const categoryMap = {};
    const rootCategories = [];

    // Create a map for quick lookups
    flatCategories.forEach(category => {
      categoryMap[category.id] = { ...category, subcategories: [] };
    });

    // Build the tree structure
    flatCategories.forEach(category => {
      if (category.parent?.id && categoryMap[category.parent.id]) {
        categoryMap[category.parent.id].subcategories.push(categoryMap[category.id]);
      } else {
        rootCategories.push(categoryMap[category.id]);
      }
    });

    return rootCategories;
  }, [categories]);

  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      // Use new admin endpoint for creating categories
      const newCategory = await categoryService.createGlobalCategory(categoryData);
      
      // Add to flat list
      setCategories(prev => [...prev, newCategory]);
      
      return newCategory;
    } catch (err) {
      setError(err.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      // Use new admin endpoint for updating categories
      const updatedCategory = await categoryService.updateGlobalCategory(categoryId, categoryData);
      
      // Update flat list
      setCategories(prev =>
        prev.map(category =>
          category.id === categoryId
            ? { ...category, ...updatedCategory }
            : category
        )
      );
      
      return updatedCategory;
    } catch (err) {
      setError(err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      // Use new admin endpoint for deleting categories
      await categoryService.deleteGlobalCategory(categoryId);
      
      // Remove from flat list
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateCategory = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      // Use new admin endpoint for activating categories
      const activatedCategory = await categoryService.activateGlobalCategory(categoryId);
      
      // Update flat list
      setCategories(prev =>
        prev.map(category =>
          category.id === categoryId
            ? { ...category, ...activatedCategory }
            : category
        )
      );
      
      return activatedCategory;
    } catch (err) {
      setError(err.message || 'Failed to activate category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchCategories = async (query, parentOnly = false) => {
    try {
      // Use new public search endpoint
      const results = await categoryService.searchCategories(query, parentOnly);
      return results;
    } catch (err) {
      console.error(`Error searching categories with query "${query}":`, err);
      return [];
    }
  };

  const getTopLevelCategories = async () => {
    try {
      // Use new public endpoint for top-level categories
      const topLevel = await categoryService.getTopLevelCategories();
      return topLevel;
    } catch (err) {
      console.error('Error fetching top-level categories:', err);
      // Fallback to filtering cached categories
      return categories.filter(category => !category.parent);
    }
  };

  const getSubcategories = async (parentId) => {
    try {
      // Use new public endpoint for subcategories
      const subcategories = await categoryService.getSubcategories(parentId);
      return subcategories;
    } catch (err) {
      console.error(`Error fetching subcategories for ${parentId}:`, err);
      // Fallback to filtering cached categories
      return categories.filter(category => category.parent?.id === parentId);
    }
  };

  const findCategoryById = useCallback((categoryId) => {
    return categories.find(category => category.id === categoryId);
  }, [categories]);

  const refreshCategories = () => fetchCategories(true);

  const clearError = () => setError(null);

  // Computed statistics
  const getStatistics = useCallback(() => {
    const activeCategories = categories.filter(cat => cat.isActive);
    const inactiveCategories = categories.filter(cat => !cat.isActive);
    const topLevelCategories = categories.filter(cat => !cat.parent);
    const subcategories = categories.filter(cat => cat.parent);

    return {
      totalCategories: categories.length,
      userCategories: 0, // No user-specific categories in new structure
      globalCategories: categories.length,
      activeCategories: activeCategories.length,
      inactiveCategories: inactiveCategories.length,
      topLevelCategories: topLevelCategories.length,
      subcategories: subcategories.length
    };
  }, [categories]);

  const value = {
    // State
    categories,
    loading,
    error,
    
    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    activateCategory, // New method for activating categories
    searchCategories, // New method for searching
    refreshCategories,
    clearError,
    
    // Public API methods
    getTopLevelCategories,
    getSubcategories,
    
    // Computed values
    getCategoryOptions,
    buildCategoryTree,
    findCategoryById,
    getStatistics,
    
    // Legacy computed values (for backward compatibility)
    totalCategories: categories.length,
    userCategories: 0, // No user-specific categories in new structure
    globalCategories: categories.length,
    
    // Enhanced statistics
    ...getStatistics()
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export default CategoryContext;