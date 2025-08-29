import api from './api';

export const incomeService = {
  // Get all income records
  getAllIncomes: async () => {
    try {
      const response = await api.get('/v1/incomes');
      return response.data;
    } catch (error) {
      console.error('Error fetching all incomes:', error);
      throw error;
    }
  },

  // Get all income records for a user
  getUserIncomes: async (userId) => {
    try {
      const response = await api.get(`/v1/incomes/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching incomes for user ${userId}:`, error);
      throw error;
    }
  },

  // Get specific salary income record by ID
  getSalaryIncomeById: async (incomeId) => {
    try {
      const response = await api.get(`/v1/incomes/salary/${incomeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching salary income ${incomeId}:`, error);
      throw error;
    }
  },

  // Create new salary income
  createSalaryIncome: async (salaryData) => {
    try {
      const response = await api.post('/v1/incomes/salary', salaryData);
      return response.data;
    } catch (error) {
      console.error('Error creating salary income:', error);
      throw error;
    }
  },

  // Update existing salary income
  updateSalaryIncome: async (incomeId, incomeData) => {
    try {
      const response = await api.put(`/v1/incomes/salary/${incomeId}`, incomeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating salary income ${incomeId}:`, error);
      throw error;
    }
  },

  // Delete salary income record
  deleteSalaryIncome: async (incomeId) => {
    try {
      await api.delete(`/v1/incomes/salary/${incomeId}`);
      return { success: true, message: 'Salary income deleted successfully' };
    } catch (error) {
      console.error(`Error deleting salary income ${incomeId}:`, error);
      throw error;
    }
  }
};

export default incomeService;