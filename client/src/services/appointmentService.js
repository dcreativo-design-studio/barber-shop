import { apiRequest } from '../config/api';

export const appointmentService = {
  async getAppointments(params) {
    try {
      const response = await apiRequest.get('/admin/appointments', { params });
      return response.data || response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  async getBarberAppointments(barberId, startDate, endDate) {
    try {
      // Adattato per funzionare con come chiamato dal componente BarberAppointments
      const params = {
        startDate,
        endDate
      };

      const response = await apiRequest.get(`/appointments/barber/${barberId}`, { params });
      return response.data || response;
    } catch (error) {
      console.error('Error fetching barber appointments:', error);
      // Return empty object with valid structure instead of throwing
      return { appointments: {} };
    }
  },

  async getBarbers() {
    try {
      const response = await apiRequest.get('/barbers');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching barbers:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(appointmentId, updateData) {
    try {
      const response = await apiRequest.put(
        `/appointments/${appointmentId}/status`,
        updateData
      );
      return response.data || response;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  async getAppointmentsByRange(startDate, endDate, barberId) {
    try {
      const params = {
        startDate,
        endDate,
        ...(barberId && { barberId })
      };
      const response = await apiRequest.get('/appointments/filtered', { params });
      return response.data || response;
    } catch (error) {
      console.error('Error fetching appointments by range:', error);
      throw error;
    }
  },

  async getAppointmentsByView(viewType, date, barberId) {
    try {
      // Calcola l'intervallo di date in base al tipo di vista
      const startDate = new Date(date);
      let endDate = new Date(date);

      switch (viewType) {
        case 'day':
          // Per la vista giornaliera, usa la stessa data
          endDate = startDate;
          break;
        case 'week':
          // Per la vista settimanale, aggiungi 6 giorni
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'month':
          // Per la vista mensile, vai alla fine del mese
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          break;
        default:
          throw new Error('Tipo di vista non valido');
      }

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        viewType,
        ...(barberId && { barberId })
      };

      console.log('Fetching appointments with params:', params);

      const response = await apiRequest.get('/appointments/filtered', { params });
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching ${viewType} appointments:`, error);
      throw error;
    }
  },

  // Aggiunta per compatibilità con il codice esistente
  async getBarberAppointmentsCalendar(barberId, params) {
    try {
      const response = await apiRequest.get(`/appointments/calendar/barber/${barberId}`, { params });
      return response.data || response;
    } catch (error) {
      console.error('Error fetching barber calendar appointments:', error);
      throw error;
    }
  }
};

export default appointmentService;
