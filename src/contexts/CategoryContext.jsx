import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import categoryService from '../services/categoryService';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  const userId = 1; // Hardcoded for now, would come from auth context
  const includeGlobal = true;

  const fetchCategories = useCallback(async (force = false) => {
    if (!userId) return [];
    
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
      console.log('Fetching categories from API...');
      const data = await categoryService.getCategories(userId, includeGlobal);
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
  }, [userId, includeGlobal, categories.length, loading]);

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
        if (!category.parentId) { // Only process top-level categories here
          const indent = '  '.repeat(level);
          options.push({
            id: category.id,
            name: `${indent}${category.name}`,
            originalName: category.name,
            level: level,
            parentId: category.parentId,
            colorCode: category.colorCode,
            isGlobal: category.isGlobal
          });
          
          // Add children recursively
          const children = cats.filter(c => c.parentId === category.id);
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
      if (category.parentId && categoryMap[category.parentId]) {
        categoryMap[category.parentId].subcategories.push(categoryMap[category.id]);
      } else {
        rootCategories.push(categoryMap[category.id]);
      }
    });

    return rootCategories;
  }, [categories]);

  const createCategory = async (categoryData) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoryService.createCategory(userId, categoryData);
      
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
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const updatedCategory = await categoryService.updateCategory(categoryId, userId, categoryData);
      
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
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      await categoryService.deleteCategory(categoryId, userId);
      
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

  const findCategoryById = useCallback((categoryId) => {
    return categories.find(category => category.id === categoryId);
  }, [categories]);

  const refreshCategories = () => fetchCategories(true);

  const clearError = () => setError(null);

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
    refreshCategories,
    clearError,
    
    // Computed values
    getCategoryOptions,
    buildCategoryTree,
    findCategoryById,
    
    // Statistics
    totalCategories: categories.length,
    userCategories: categories.filter(cat => !cat.isGlobal).length,
    globalCategories: categories.filter(cat => cat.isGlobal).length,
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