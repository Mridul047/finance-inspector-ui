import { useState, useEffect } from 'react';
import incomeService from '../services/incomeService';

export const useIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllIncomes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await incomeService.getAllIncomes();
      setIncomes(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch incomes');
      console.error('Fetch incomes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserIncomes = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await incomeService.getUserIncomes(userId);
      setIncomes(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user incomes');
      console.error('Fetch user incomes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSalaryIncome = async (incomeData) => {
    setLoading(true);
    setError(null);
    try {
      const newIncome = await incomeService.createSalaryIncome(incomeData);
      setIncomes(prev => [...prev, newIncome]);
      return newIncome;
    } catch (err) {
      setError(err.message || 'Failed to create salary income');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSalaryIncome = async (incomeId, incomeData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedIncome = await incomeService.updateSalaryIncome(incomeId, incomeData);
      setIncomes(prev => prev.map(income => income.id === incomeId ? updatedIncome : income));
      return updatedIncome;
    } catch (err) {
      setError(err.message || 'Failed to update salary income');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSalaryIncome = async (incomeId) => {
    setLoading(true);
    setError(null);
    try {
      await incomeService.deleteSalaryIncome(incomeId);
      setIncomes(prev => prev.filter(income => income.id !== incomeId));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete salary income');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSalaryIncomeById = async (incomeId) => {
    setLoading(true);
    setError(null);
    try {
      const income = await incomeService.getSalaryIncomeById(incomeId);
      return income;
    } catch (err) {
      setError(err.message || 'Failed to fetch salary income');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    fetchAllIncomes();
  }, []);

  return {
    incomes,
    loading,
    error,
    fetchAllIncomes,
    fetchUserIncomes,
    createSalaryIncome,
    updateSalaryIncome,
    deleteSalaryIncome,
    getSalaryIncomeById,
    clearError
  };
};

export const useSalaryIncome = (incomeId) => {
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncome = async () => {
    if (!incomeId) return;
    
    setLoading(true);
    setError(null);
    try {
      const incomeData = await incomeService.getSalaryIncomeById(incomeId);
      setIncome(incomeData);
    } catch (err) {
      setError(err.message || 'Failed to fetch salary income');
      console.error('Fetch salary income error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [incomeId]);

  return {
    income,
    loading,
    error,
    refetchIncome: fetchIncome,
    clearError: () => setError(null)
  };
};

export default useIncome;