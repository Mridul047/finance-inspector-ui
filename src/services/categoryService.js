import api from './api';
import { createDisplayError } from '../utils/errorHandler';

// Cache configuration
const CACHE_KEY = 'categories_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let memoryCache = new Map();

export const categoryService = {
  // Get categories for a user (with optional global categories)
  getCategories: async (userId, includeGlobal = true) => {
    try {
      // Check memory cache first
      const cacheKey = `${userId}_${includeGlobal}`;
      const cached = categoryService._getFromCache(cacheKey);
      
      if (cached) {
        console.log('Using cached categories, count:', cached.length);
        return cached;
      }

      console.log('Fetching categories from API...');
      const response = await api.get('/v1/categories', {
        params: {
          userId,
          includeGlobal
        }
      });
      
      // Cache the result
      categoryService._setCache(cacheKey, response.data);
      console.log('Categories fetched and cached, count:', response.data.length);
      
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Cache helper methods
  _setCache: (key, data) => {
    memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  _getFromCache: (key) => {
    const cached = memoryCache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      memoryCache.delete(key);
      return null;
    }

    return cached.data;
  },

  // Clear cache
  clearCache: (userId = null, includeGlobal = null) => {
    if (userId !== null && includeGlobal !== null) {
      const cacheKey = `${userId}_${includeGlobal}`;
      memoryCache.delete(cacheKey);
    } else {
      memoryCache.clear();
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId, userId) => {
    try {
      const response = await api.get(`/v1/categories/${categoryId}`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Create new category
  createCategory: async (userId, categoryData) => {
    try {
      const response = await api.post('/v1/categories', categoryData, {
        params: { userId }
      });
      // Clear cache after creating category
      categoryService.clearCache();
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Update category
  updateCategory: async (categoryId, userId, categoryData) => {
    try {
      const response = await api.put(`/v1/categories/${categoryId}`, categoryData, {
        params: { userId }
      });
      // Clear cache after updating category
      categoryService.clearCache();
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Delete category
  deleteCategory: async (categoryId, userId) => {
    try {
      await api.delete(`/v1/categories/${categoryId}`, {
        params: { userId }
      });
      // Clear cache after deleting category
      categoryService.clearCache();
      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Get subcategories for a parent category
  getSubcategories: async (parentId, userId) => {
    try {
      const response = await api.get(`/v1/categories/${parentId}/subcategories`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Get top-level categories (categories with no parent)
  getTopLevelCategories: async (userId, includeGlobal = true) => {
    try {
      const categories = await categoryService.getCategories(userId, includeGlobal);
      // Filter to only top-level categories (no parentId)
      return categories.filter(category => !category.parentId);
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Build hierarchical category tree
  buildCategoryTree: async (userId, includeGlobal = true) => {
    try {
      const allCategories = await categoryService.getCategories(userId, includeGlobal);
      
      // Create a map for quick lookup
      const categoryMap = new Map();
      allCategories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Build the tree structure
      const rootCategories = [];
      
      categoryMap.forEach(category => {
        if (category.parentId) {
          // This is a subcategory
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(category);
          }
        } else {
          // This is a top-level category
          rootCategories.push(category);
        }
      });

      return rootCategories;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Get category options for forms (flattened list with hierarchy indication)
  getCategoryOptions: async (userId, includeGlobal = true) => {
    try {
      const categoryTree = await categoryService.buildCategoryTree(userId, includeGlobal);
      
      const flattenOptions = (categories, level = 0) => {
        let options = [];
        
        categories.forEach(category => {
          // Add indentation for subcategories
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
          if (category.children && category.children.length > 0) {
            options.push(...flattenOptions(category.children, level + 1));
          }
        });
        
        return options;
      };

      return flattenOptions(categoryTree);
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Validate category operation (prevent circular references, etc.)
  validateCategoryOperation: async (categoryData, userId) => {
    try {
      // Client-side validation to prevent obvious issues
      if (categoryData.parentId === categoryData.id) {
        throw new Error('A category cannot be its own parent');
      }

      // Check if parent exists (if parentId is provided)
      if (categoryData.parentId) {
        await categoryService.getCategoryById(categoryData.parentId, userId);
      }

      return true;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Get category statistics
  getCategoryStatistics: async (userId) => {
    try {
      const categories = await categoryService.getCategories(userId, true);
      
      const userCategories = categories.filter(c => !c.isGlobal);
      const globalCategories = categories.filter(c => c.isGlobal);
      const topLevelCategories = categories.filter(c => !c.parentId);
      const subcategories = categories.filter(c => c.parentId);

      return {
        totalCategories: categories.length,
        userCategories: userCategories.length,
        globalCategories: globalCategories.length,
        topLevelCategories: topLevelCategories.length,
        subcategories: subcategories.length
      };
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  }
};

export default categoryService;