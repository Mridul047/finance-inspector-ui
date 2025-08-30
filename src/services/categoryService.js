import api from './api';
import { createDisplayError } from '../utils/errorHandler';

// Cache configuration
const CACHE_KEY = 'categories_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let memoryCache = new Map();

export const categoryService = {
  // ===== PUBLIC CATEGORY OPERATIONS (Read-only, no authentication required) =====
  
  // Get all global categories
  getAllGlobalCategories: async () => {
    try {
      // Check memory cache first
      const cacheKey = 'global_categories';
      const cached = categoryService._getFromCache(cacheKey);
      
      if (cached) {
        console.log('Using cached global categories, count:', cached.length);
        return cached;
      }

      console.log('Fetching global categories from API...');
      const response = await api.get('/v1/public/categories');
      
      // Cache the result
      categoryService._setCache(cacheKey, response.data);
      console.log('Global categories fetched and cached, count:', response.data.length);
      
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Get category by ID (public endpoint)
  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(`/v1/public/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Get top-level categories (categories with no parent)
  getTopLevelCategories: async () => {
    try {
      const response = await api.get('/v1/public/categories/top-level');
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Get subcategories for a parent category
  getSubcategories: async (parentId) => {
    try {
      const response = await api.get(`/v1/public/categories/${parentId}/subcategories`);
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Search categories by name or description
  searchCategories: async (query, parentOnly = false) => {
    try {
      const response = await api.get('/v1/public/categories/search', {
        params: { query, parentOnly }
      });
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // ===== ADMIN CATEGORY OPERATIONS (Requires authentication) =====

  // Create new global category (admin only)
  createGlobalCategory: async (categoryData) => {
    try {
      const response = await api.post('/v1/admin/categories', categoryData);
      // Clear cache after creating category
      categoryService.clearCache();
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Update global category (admin only)
  updateGlobalCategory: async (categoryId, categoryData) => {
    try {
      const response = await api.put(`/v1/admin/categories/${categoryId}`, categoryData);
      // Clear cache after updating category
      categoryService.clearCache();
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Delete global category (admin only)
  deleteGlobalCategory: async (categoryId) => {
    try {
      await api.delete(`/v1/admin/categories/${categoryId}`);
      // Clear cache after deleting category
      categoryService.clearCache();
      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Activate global category (admin only)
  activateGlobalCategory: async (categoryId) => {
    try {
      const response = await api.put(`/v1/admin/categories/${categoryId}/activate`);
      // Clear cache after activating category
      categoryService.clearCache();
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // ===== BACKWARD COMPATIBILITY METHODS =====
  // These methods maintain the existing interface while using new endpoints
  
  // Legacy method: Get categories (now uses global categories)
  getCategories: async (userId, includeGlobal = true) => {
    try {
      // For backward compatibility, always return global categories
      // The userId and includeGlobal parameters are ignored as the new API doesn't require them
      console.log(`Legacy getCategories called for userId: ${userId}, includeGlobal: ${includeGlobal} - using global categories`);
      return await categoryService.getAllGlobalCategories();
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Legacy method: Create category (now creates global category)
  createCategory: async (userId, categoryData) => {
    try {
      // For backward compatibility, create as global category
      // The userId parameter is ignored as admin operations use authentication context
      console.log('Legacy createCategory called - using admin endpoint');
      return await categoryService.createGlobalCategory(categoryData);
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Legacy method: Update category (now updates global category)
  updateCategory: async (categoryId, userId, categoryData) => {
    try {
      // For backward compatibility, update as global category
      // The userId parameter is ignored as admin operations use authentication context
      console.log('Legacy updateCategory called - using admin endpoint');
      return await categoryService.updateGlobalCategory(categoryId, categoryData);
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Legacy method: Delete category (now deletes global category)
  deleteCategory: async (categoryId, userId) => {
    try {
      // For backward compatibility, delete as global category
      // The userId parameter is ignored as admin operations use authentication context
      console.log(`Legacy deleteCategory called for categoryId: ${categoryId}, userId: ${userId} - using admin endpoint`);
      return await categoryService.deleteGlobalCategory(categoryId);
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // ===== HELPER METHODS =====

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
  clearCache: (cacheKey = null) => {
    if (cacheKey) {
      memoryCache.delete(cacheKey);
    } else {
      memoryCache.clear();
    }
  },

  // Build hierarchical category tree
  buildCategoryTree: async () => {
    try {
      const allCategories = await categoryService.getAllGlobalCategories();
      
      // Create a map for quick lookup
      const categoryMap = new Map();
      allCategories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Build the tree structure
      const rootCategories = [];
      
      categoryMap.forEach(category => {
        if (category.parent && category.parent.id) {
          // This is a subcategory - find parent in map
          const parent = categoryMap.get(category.parent.id);
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
  getCategoryOptions: async () => {
    try {
      const categoryTree = await categoryService.buildCategoryTree();
      
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
            parentId: category.parent?.id || null,
            colorCode: category.colorCode,
            isGlobal: true, // All categories are now global
            isActive: category.isActive
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
  validateCategoryOperation: async (categoryData) => {
    try {
      // Client-side validation to prevent obvious issues
      if (categoryData.parentId === categoryData.id) {
        throw new Error('A category cannot be its own parent');
      }

      // Check if parent exists (if parentId is provided)
      if (categoryData.parentId) {
        await categoryService.getCategoryById(categoryData.parentId);
      }

      return true;
    } catch (error) {
      const displayError = createDisplayError(error, 'category');
      throw displayError;
    }
  },

  // Get category statistics
  getCategoryStatistics: async () => {
    try {
      const categories = await categoryService.getAllGlobalCategories();
      
      const activeCategories = categories.filter(c => c.isActive);
      const inactiveCategories = categories.filter(c => !c.isActive);
      const topLevelCategories = categories.filter(c => !c.parent);
      const subcategories = categories.filter(c => c.parent);

      return {
        totalCategories: categories.length,
        userCategories: 0, // No user-specific categories in new structure
        globalCategories: categories.length,
        activeCategories: activeCategories.length,
        inactiveCategories: inactiveCategories.length,
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