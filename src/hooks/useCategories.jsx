import { useState, useEffect, useCallback } from 'react';
import categoryService from '../services/categoryService';

export const useCategories = (userId, includeGlobal = true) => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalCategories: 0,
    userCategories: 0,
    globalCategories: 0,
    topLevelCategories: 0,
    subcategories: 0
  });

  const fetchCategories = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories(userId, includeGlobal);
      setCategories(data);
      
      // Build category tree
      const tree = await categoryService.buildCategoryTree(userId, includeGlobal);
      setCategoryTree(tree);
      
      // Get statistics
      const stats = await categoryService.getCategoryStatistics(userId);
      setStatistics(stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      // Validate the category operation
      await categoryService.validateCategoryOperation(categoryData, userId);
      
      const newCategory = await categoryService.createCategory(userId, categoryData);
      
      // Refresh categories to get updated tree structure
      await fetchCategories();
      
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
      // Validate the category operation
      await categoryService.validateCategoryOperation({ ...categoryData, id: categoryId }, userId);
      
      const updatedCategory = await categoryService.updateCategory(categoryId, userId, categoryData);
      
      // Update the category in the flat list
      setCategories(prev => prev.map(category => 
        category.id === categoryId ? updatedCategory : category
      ));
      
      // Refresh the tree structure
      const tree = await categoryService.buildCategoryTree(userId, includeGlobal);
      setCategoryTree(tree);
      
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
      
      // Refresh the tree structure and statistics
      await fetchCategories();
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSubcategories = async (parentId) => {
    if (!userId) return [];

    try {
      const subcategories = await categoryService.getSubcategories(parentId, userId);
      return subcategories;
    } catch (err) {
      console.error(`Error fetching subcategories for ${parentId}:`, err);
      return [];
    }
  };

  const getCategoryOptions = useCallback(async () => {
    if (!userId) return [];

    try {
      // Use existing categories data to build options instead of making new API call
      if (categories.length > 0) {
        console.log('Using cached categories for options, count:', categories.length);
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
      }
      
      // Fallback to API call only if no categories are loaded
      console.log('No categories cached, making API call for options');
      const options = await categoryService.getCategoryOptions(userId, includeGlobal);
      return options;
    } catch (err) {
      console.error('Error fetching category options:', err);
      return [];
    }
  }, [userId, categories, includeGlobal]);

  const findCategoryById = (categoryId) => {
    return categories.find(category => category.id === categoryId);
  };

  const findCategoryPath = (categoryId) => {
    const path = [];
    let currentCategory = findCategoryById(categoryId);
    
    while (currentCategory) {
      path.unshift(currentCategory);
      currentCategory = currentCategory.parentId ? findCategoryById(currentCategory.parentId) : null;
    }
    
    return path;
  };

  const getCategoryDepth = (categoryId) => {
    const path = findCategoryPath(categoryId);
    return path.length - 1; // Root level is depth 0
  };

  const hasSubcategories = (categoryId) => {
    return categories.some(category => category.parentId === categoryId);
  };

  const getTopLevelCategories = () => {
    return categories.filter(category => !category.parentId);
  };

  const getUserCategories = () => {
    return categories.filter(category => !category.isGlobal);
  };

  const getGlobalCategories = () => {
    return categories.filter(category => category.isGlobal);
  };

  const clearError = () => setError(null);

  // Auto-fetch only on userId change to prevent excessive API calls
  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId]);

  return {
    categories,
    categoryTree,
    loading,
    error,
    statistics,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getSubcategories,
    getCategoryOptions,
    findCategoryById,
    findCategoryPath,
    getCategoryDepth,
    hasSubcategories,
    getTopLevelCategories,
    getUserCategories,
    getGlobalCategories,
    clearError
  };
};

export const useCategory = (categoryId, userId) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subcategories, setSubcategories] = useState([]);

  const fetchCategory = async () => {
    if (!categoryId || !userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const categoryData = await categoryService.getCategoryById(categoryId, userId);
      setCategory(categoryData);
      
      // Also fetch subcategories if this is a parent category
      const subCats = await categoryService.getSubcategories(categoryId, userId);
      setSubcategories(subCats);
    } catch (err) {
      setError(err.message || 'Failed to fetch category');
      console.error('Fetch category error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (categoryData) => {
    if (!categoryId || !userId) return;

    setLoading(true);
    setError(null);
    try {
      // Validate the category operation
      await categoryService.validateCategoryOperation({ ...categoryData, id: categoryId }, userId);
      
      const updatedCategory = await categoryService.updateCategory(categoryId, userId, categoryData);
      setCategory(updatedCategory);
      return updatedCategory;
    } catch (err) {
      setError(err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async () => {
    if (!categoryId || !userId) return;

    setLoading(true);
    setError(null);
    try {
      await categoryService.deleteCategory(categoryId, userId);
      setCategory(null);
      setSubcategories([]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSubcategories = async () => {
    if (!categoryId || !userId) return;

    try {
      const subCats = await categoryService.getSubcategories(categoryId, userId);
      setSubcategories(subCats);
    } catch (err) {
      console.error('Error refreshing subcategories:', err);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [categoryId, userId]);

  return {
    category,
    subcategories,
    loading,
    error,
    refetchCategory: fetchCategory,
    updateCategory,
    deleteCategory,
    refreshSubcategories,
    clearError: () => setError(null)
  };
};

export default useCategories;