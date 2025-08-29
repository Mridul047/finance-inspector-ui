import { useState, useEffect } from 'react';
import userService from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.updateUser(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const user = await userService.getUserById(id);
      return user;
    } catch (err) {
      setError(err.message || 'Failed to fetch user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    clearError
  };
};

export const useUser = (id) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const userData = await userService.getUserById(id);
      setUser(userData);
    } catch (err) {
      setError(err.message || 'Failed to fetch user');
      console.error('Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  return {
    user,
    loading,
    error,
    refetchUser: fetchUser,
    clearError: () => setError(null)
  };
};

export default useUsers;