import { apiRequest } from '../config/api';

export const barberApi = {
  // Ottiene i dettagli di un barbiere specifico
  getBarberDetails: async (barberId) => {
    try {
      const response = await apiRequest.get(`/barbers/${barberId}`);
      return response;
    } catch (error) {
      console.error('Error fetching barber details:', error);
      throw error;
    }
  },

  // Ottiene gli appuntamenti di un barbiere
  getBarberAppointments: async (barberId, startDate, endDate) => {
    try {
      const response = await apiRequest.get(`/appointments/barber/${barberId}`, {
        params: { startDate, endDate }
      });
      return response;
    } catch (error) {
      console.error('Error fetching barber appointments:', error);
      throw error;
    }
  },

  // Aggiorna gli orari di lavoro di un barbiere
  updateBarberWorkingHours: async (barberId, workingHours) => {
    try {
      const response = await apiRequest.put(`/barbers/${barberId}/working-hours`, { workingHours });
      return response;
    } catch (error) {
      console.error('Error updating barber working hours:', error);
      throw error;
    }
  },

  // Aggiorna le vacanze di un barbiere
  updateBarberVacations: async (barberId, vacations) => {
    try {
      const response = await apiRequest.put(`/barbers/${barberId}/vacations`, { vacations });
      return response;
    } catch (error) {
      console.error('Error updating barber vacations:', error);
      throw error;
    }
  },

  // Aggiorna i servizi di un barbiere
  updateBarberServices: async (barberId, services) => {
    try {
      const response = await apiRequest.put(`/barbers/${barberId}/services`, { services });
      return response;
    } catch (error) {
      console.error('Error updating barber services:', error);
      throw error;
    }
  },

  // Aggiorna il profilo di un barbiere
  updateBarberProfile: async (barberId, profileData) => {
    try {
      const response = await apiRequest.put(`/barbers/${barberId}`, profileData);
      return response;
    } catch (error) {
      console.error('Error updating barber profile:', error);
      throw error;
    }
  },

  // Notifica l'amministratore delle modifiche all'orario
  notifyScheduleUpdate: async (barberId) => {
    try {
      const response = await apiRequest.post(`/notifications/schedule-update`, { barberId });
      return response;
    } catch (error) {
      console.error('Error sending schedule update notification:', error);
      throw error;
    }
  },

  // Cambia la password dell'utente
  changePassword: async ({ userId, currentPassword, newPassword }) => {
    try {
      const response = await apiRequest.post('/auth/change-password', {
        userId,
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Ottiene le statistiche di un barbiere
  getBarberStats: async (barberId, timeframe = 'month') => {
    try {
      const response = await apiRequest.get(`/barbers/${barberId}/stats`, {
        params: { timeframe }
      });
      return response;
    } catch (error) {
      console.error('Error fetching barber stats:', error);
      throw error;
    }
  },

  // Trova un barbiere per email
  findBarberByEmail: async (email) => {
    try {
      const response = await apiRequest.get('/barbers/find-by-email', {
        params: { email }
      });
      return response;
    } catch (error) {
      console.error('Error finding barber by email:', error);
      throw error;
    }
  }
};

export default barberApi;
