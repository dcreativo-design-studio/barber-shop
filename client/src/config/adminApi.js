import { apiRequest } from './api';

export const adminApi = {
  getStats: async (timeframe = 'month') => {
    try {
      const response = await apiRequest.get('/api/admin/stats', { // Aggiungi /api/
        params: { timeframe }
      });
      console.log('Stats response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }
};
