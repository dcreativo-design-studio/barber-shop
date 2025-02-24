import { apiRequest } from './api';

export const adminApi = {
  getStats: async (timeframe = 'month', barberId = 'all') => {
    try {
      const response = await apiRequest.get('/admin/stats', {
        params: { timeframe, barberId }
      });
      console.log('Stats response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  getBarbers: async () => {
    try {
      const response = await apiRequest.get('/barbers');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching barbers:', error);
      throw error;
    }
  }
};
