import { useState, useEffect } from 'react';
import expenseService from '../services/expenseService';

export const useExpenses = (userId, initialFilters = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  });
  const [filters, setFilters] = useState({
    sort: 'expenseDate,desc',
    ...initialFilters
  });

  const fetchExpenses = async (pageOptions = {}, filterOptions = {}) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const finalFilters = { ...filters, ...filterOptions };
      const finalPagination = { 
        page: pagination.page, 
        size: pagination.size, 
        ...pageOptions 
      };

      const data = await expenseService.getExpensesWithFilter(userId, {
        ...finalFilters,
        ...finalPagination
      });

      setExpenses(data.content || []);
      setPagination({
        page: data.number || 0,
        size: data.size || 20,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        first: data.first || true,
        last: data.last || true
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const newExpense = await expenseService.createExpense(userId, expenseData);
      // Refresh the current page to show the new expense
      await fetchExpenses();
      return newExpense;
    } catch (err) {
      setError(err.message || 'Failed to create expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (expenseId, expenseData) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const updatedExpense = await expenseService.updateExpense(expenseId, userId, expenseData);
      // Update the expense in the current list
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId ? updatedExpense : expense
      ));
      return updatedExpense;
    } catch (err) {
      setError(err.message || 'Failed to update expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      await expenseService.deleteExpense(expenseId, userId);
      // Remove from current list and refresh if needed
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      
      // If this was the last item on the page and not the first page, go to previous page
      if (expenses.length === 1 && pagination.page > 0) {
        await fetchExpenses({ page: pagination.page - 1 });
      } else {
        // Update total count
        setPagination(prev => ({
          ...prev,
          totalElements: Math.max(0, prev.totalElements - 1)
        }));
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 0 && page < pagination.totalPages) {
      fetchExpenses({ page });
    }
  };

  const nextPage = () => {
    if (!pagination.last) {
      goToPage(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (!pagination.first) {
      goToPage(pagination.page - 1);
    }
  };

  const changePageSize = (size) => {
    fetchExpenses({ page: 0, size });
  };

  // Filter controls
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchExpenses({ page: 0 }, updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters = { sort: 'expenseDate,desc' };
    setFilters(defaultFilters);
    fetchExpenses({ page: 0 }, defaultFilters);
  };

  const clearError = () => setError(null);

  // Auto-fetch on userId change
  useEffect(() => {
    if (userId) {
      fetchExpenses();
    }
  }, [userId]);

  return {
    expenses,
    loading,
    error,
    pagination,
    filters,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    updateFilters,
    clearFilters,
    clearError
  };
};

export const useExpense = (expenseId, userId) => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpense = async () => {
    if (!expenseId || !userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const expenseData = await expenseService.getExpenseById(expenseId, userId);
      setExpense(expenseData);
    } catch (err) {
      setError(err.message || 'Failed to fetch expense');
      console.error('Fetch expense error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (expenseData) => {
    if (!expenseId || !userId) return;

    setLoading(true);
    setError(null);
    try {
      const updatedExpense = await expenseService.updateExpense(expenseId, userId, expenseData);
      setExpense(updatedExpense);
      return updatedExpense;
    } catch (err) {
      setError(err.message || 'Failed to update expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async () => {
    if (!expenseId || !userId) return;

    setLoading(true);
    setError(null);
    try {
      await expenseService.deleteExpense(expenseId, userId);
      setExpense(null);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [expenseId, userId]);

  return {
    expense,
    loading,
    error,
    refetchExpense: fetchExpense,
    updateExpense,
    deleteExpense,
    clearError: () => setError(null)
  };
};

export default useExpenses;