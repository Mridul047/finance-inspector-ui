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
    activeCategories: 0,
    inactiveCategories: 0,
    topLevelCategories: 0,
    subcategories: 0
  });

  const fetchCategories = async () => {
    // Note: userId and includeGlobal are maintained for backward compatibility
    // but the new API always returns global categories
    console.log(`useCategories called with userId: ${userId}, includeGlobal: ${includeGlobal} - using global categories`);
    setLoading(true);
    setError(null);
    try {
      // Use new global categories endpoint
      const data = await categoryService.getAllGlobalCategories();
      setCategories(data);
      
      // Build category tree
      const tree = await categoryService.buildCategoryTree();
      setCategoryTree(tree);
      
      // Get statistics
      const stats = await categoryService.getCategoryStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate the category operation
      await categoryService.validateCategoryOperation(categoryData);
      
      // Use new admin endpoint for creating categories
      const newCategory = await categoryService.createGlobalCategory(categoryData);
      
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
    setLoading(true);
    setError(null);
    try {
      // Validate the category operation
      await categoryService.validateCategoryOperation({ ...categoryData, id: categoryId });
      
      // Use new admin endpoint for updating categories
      const updatedCategory = await categoryService.updateGlobalCategory(categoryId, categoryData);
      
      // Update the category in the flat list
      setCategories(prev => prev.map(category => 
        category.id === categoryId ? updatedCategory : category
      ));
      
      // Refresh the tree structure
      const tree = await categoryService.buildCategoryTree();
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
    setLoading(true);
    setError(null);
    try {
      // Use new admin endpoint for deleting categories
      await categoryService.deleteGlobalCategory(categoryId);
      
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

  const activateCategory = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      // Use new admin endpoint for activating categories
      const activatedCategory = await categoryService.activateGlobalCategory(categoryId);
      
      // Update the category in the flat list
      setCategories(prev => prev.map(category => 
        category.id === categoryId ? activatedCategory : category
      ));
      
      // Refresh the tree structure
      const tree = await categoryService.buildCategoryTree();
      setCategoryTree(tree);
      
      return activatedCategory;
    } catch (err) {
      setError(err.message || 'Failed to activate category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSubcategories = async (parentId) => {
    try {
      // Use new public endpoint for subcategories
      const subcategories = await categoryService.getSubcategories(parentId);
      return subcategories;
    } catch (err) {
      console.error(`Error fetching subcategories for ${parentId}:`, err);
      return [];
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

  const getCategoryOptions = useCallback(async () => {
    try {
      // Use existing categories data to build options instead of making new API call
      if (categories.length > 0) {
        console.log('Using cached categories for options, count:', categories.length);
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
      }
      
      // Fallback to API call only if no categories are loaded
      console.log('No categories cached, making API call for options');
      const options = await categoryService.getCategoryOptions();
      return options;
    } catch (err) {
      console.error('Error fetching category options:', err);
      return [];
    }
  }, [categories]);

  const findCategoryById = (categoryId) => {
    return categories.find(category => category.id === categoryId);
  };

  const findCategoryPath = (categoryId) => {
    const path = [];
    let currentCategory = findCategoryById(categoryId);
    
    while (currentCategory) {
      path.unshift(currentCategory);
      currentCategory = currentCategory.parent?.id ? findCategoryById(currentCategory.parent.id) : null;
    }
    
    return path;
  };

  const getCategoryDepth = (categoryId) => {
    const path = findCategoryPath(categoryId);
    return path.length - 1; // Root level is depth 0
  };

  const hasSubcategories = (categoryId) => {
    return categories.some(category => category.parent?.id === categoryId);
  };

  const getTopLevelCategories = () => {
    return categories.filter(category => !category.parent);
  };

  const getUserCategories = () => {
    // In the new structure, there are no user-specific categories
    // Return empty array for backward compatibility
    return [];
  };

  const getGlobalCategories = () => {
    // All categories are now global
    return categories;
  };

  const getActiveCategories = () => {
    return categories.filter(category => category.isActive);
  };

  const getInactiveCategories = () => {
    return categories.filter(category => !category.isActive);
  };

  const clearError = () => setError(null);

  // Auto-fetch categories on mount (userId parameter maintained for backward compatibility)
  useEffect(() => {
    fetchCategories();
  }, []); // Remove userId dependency since the new API doesn't require it

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
    activateCategory, // New method for activating categories
    getSubcategories,
    searchCategories, // New method for searching categories
    getCategoryOptions,
    findCategoryById,
    findCategoryPath,
    getCategoryDepth,
    hasSubcategories,
    getTopLevelCategories,
    getUserCategories,
    getGlobalCategories,
    getActiveCategories, // New method
    getInactiveCategories, // New method
    clearError
  };
};

export const useCategory = (categoryId, userId) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subcategories, setSubcategories] = useState([]);

  const fetchCategory = async () => {
    if (!categoryId) return;
    
    console.log(`useCategory called with categoryId: ${categoryId}, userId: ${userId} - using public endpoints`);
    setLoading(true);
    setError(null);
    try {
      // Use new public endpoint (userId parameter maintained for backward compatibility)
      const categoryData = await categoryService.getCategoryById(categoryId);
      setCategory(categoryData);
      
      // Also fetch subcategories if this is a parent category
      const subCats = await categoryService.getSubcategories(categoryId);
      setSubcategories(subCats);
    } catch (err) {
      setError(err.message || 'Failed to fetch category');
      console.error('Fetch category error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (categoryData) => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);
    try {
      // Validate the category operation
      await categoryService.validateCategoryOperation({ ...categoryData, id: categoryId });
      
      // Use new admin endpoint (userId parameter ignored)
      const updatedCategory = await categoryService.updateGlobalCategory(categoryId, categoryData);
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
    if (!categoryId) return;

    setLoading(true);
    setError(null);
    try {
      // Use new admin endpoint (userId parameter ignored)
      await categoryService.deleteGlobalCategory(categoryId);
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

  const activateCategory = async () => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);
    try {
      // Use new admin endpoint
      const activatedCategory = await categoryService.activateGlobalCategory(categoryId);
      setCategory(activatedCategory);
      return activatedCategory;
    } catch (err) {
      setError(err.message || 'Failed to activate category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSubcategories = async () => {
    if (!categoryId) return;

    try {
      const subCats = await categoryService.getSubcategories(categoryId);
      setSubcategories(subCats);
    } catch (err) {
      console.error('Error refreshing subcategories:', err);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [categoryId]); // Remove userId dependency

  return {
    category,
    subcategories,
    loading,
    error,
    refetchCategory: fetchCategory,
    updateCategory,
    deleteCategory,
    activateCategory, // New method
    refreshSubcategories,
    clearError: () => setError(null)
  };
};

export default useCategories;