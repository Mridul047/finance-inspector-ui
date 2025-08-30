import api from './api';
import { createDisplayError } from '../utils/errorHandler';

export const expenseService = {
  // Get paginated expenses for a user
  getExpenses: async (userId, page = 0, size = 20, sort = 'expenseDate,desc') => {
    try {
      const response = await api.get('/v1/expenses', {
        params: {
          userId,
          page,
          size,
          sort
        }
      });
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'expense');
      throw displayError;
    }
  },

  // Get expense by ID
  getExpenseById: async (expenseId, userId) => {
    try {
      const response = await api.get(`/v1/expenses/${expenseId}`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'expense');
      throw displayError;
    }
  },

  // Create new expense
  createExpense: async (userId, expenseData) => {
    try {
      const response = await api.post('/v1/expenses', expenseData, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'expense');
      throw displayError;
    }
  },

  // Update expense
  updateExpense: async (expenseId, userId, expenseData) => {
    try {
      const response = await api.put(`/v1/expenses/${expenseId}`, expenseData, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'expense');
      throw displayError;
    }
  },

  // Delete expense
  deleteExpense: async (expenseId, userId) => {
    try {
      await api.delete(`/v1/expenses/${expenseId}`, {
        params: { userId }
      });
      return { success: true, message: 'Expense deleted successfully' };
    } catch (error) {
      const displayError = createDisplayError(error, 'expense');
      throw displayError;
    }
  },

  // Get expenses with filtering options
  getExpensesWithFilter: async (userId, filterOptions = {}) => {
    try {
      const {
        page = 0,
        size = 20,
        sort = 'expenseDate,desc',
        categoryId,
        fromDate,
        toDate,
        minAmount,
        maxAmount,
        currencyCode,
        description
      } = filterOptions;

      const params = {
        userId,
        page,
        size,
        sort
      };

      // Add optional filter parameters
      if (categoryId) params.categoryId = categoryId;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (minAmount !== undefined) params.minAmount = minAmount;
      if (maxAmount !== undefined) params.maxAmount = maxAmount;
      if (currencyCode) params.currencyCode = currencyCode;
      if (description) params.description = description;

      const response = await api.get('/v1/expenses', { params });
      return response.data;
    } catch (error) {
      const displayError = createDisplayError(error, 'expense');
      throw displayError;
    }
  },

  // Get expense statistics for dashboard
  getExpenseStatistics: async (userId) => {
    try {
      // This would be a separate endpoint in the future, for now we'll calculate from paginated data
      const response = await api.get('/v1/expenses', {
        params: {
          userId,
          page: 0,
          size: 1 // Just get total count
        }
      });
      return {
        totalExpenses: response.data.totalElements || 0,
        totalAmount: 0, // Would be calculated by backend
        currentMonthExpenses: 0, // Would be calculated by backend
        categories: [] // Would be calculated by backend
      };
    } catch (error) {
      const displayError = createDisplayError(error, 'expense');
      throw displayError;
    }
  }
};

export default expenseService;