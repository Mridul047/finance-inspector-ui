import api from './api';

export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/v1/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/v1/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/v1/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      await api.delete(`/v1/users/${id}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }
};

export default userService;