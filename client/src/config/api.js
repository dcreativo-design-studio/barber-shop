import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';

export const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const headers = {
    'Authorization': token ? `Bearer ${token}` : '',
    'x-timezone': timezone
  };

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  console.log('Request headers:', headers);
  return headers;
};

// Configura gli interceptors globali di axios
axios.interceptors.request.use(
  (config) => {
    // Aggiungi il timezone a tutte le richieste se non è già presente
    if (!config.headers['x-timezone']) {
      config.headers['x-timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API calls di base
export const apiRequest = {
  get: async (endpoint, config = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making GET request to:', url, 'with config:', config);

      const response = await axios({
        method: 'get',
        url: url,
        headers: getHeaders(),
        withCredentials: true,
        ...config,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });

      return response.data;
    } catch (error) {
      console.error('API Request Error:', {
        endpoint,
        error: error.response?.data || error.message
      });
      throw error;
    }
  },

  post: async (endpoint, data, config = {}) => {
    try {
      const isMultipart = data instanceof FormData;
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
        headers: getHeaders(isMultipart),
        withCredentials: true,
        ...config
      });
      return response.data;
    } catch (error) {
      console.error('POST Request Error:', {
        endpoint,
        error: error.response?.data || error.message
      });
      throw error.response?.data || error;
    }
  },

  put: async (endpoint, data, config = {}) => {
    try {
      const isMultipart = data instanceof FormData;
      console.log('Making PUT request:', {
        url: `${API_BASE_URL}${endpoint}`,
        isMultipart,
        dataType: typeof data,
        isFormData: data instanceof FormData
      });

      const response = await axios.put(`${API_BASE_URL}${endpoint}`, data, {
        headers: getHeaders(isMultipart),
        withCredentials: true,
        ...config,
        ...(isMultipart && {
          transformRequest: (data, headers) => {
            return data;
          }
        })
      });

      return response.data;
    } catch (error) {
      console.error('PUT Request Error:', {
        endpoint,
        error: error.response?.data || error.message
      });
      throw error.response?.data || error;
    }
  },

  delete: async (endpoint, config = {}) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders(),
        withCredentials: true,
        ...config
      });
      return response.data;
    } catch (error) {
      console.error('DELETE Request Error:', {
        endpoint,
        error: error.response?.data || error.message
      });
      throw error.response?.data || error;
    }
  }
};

// Nuove API specifiche per i servizi
export const servicesApi = {
  getActiveServices: async () => {
    try {
      const response = await apiRequest.get('/services/active');
      console.log('Fetched active services:', response);
      return response;
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  },

  validateService: async (serviceName) => {
    try {
      const response = await apiRequest.post('/services/validate', { serviceName });
      console.log('Service validation result:', response);
      return response.isValid;
    } catch (error) {
      console.error('Error validating service:', error);
      return false;
    }
  },

  createService: async (serviceData) => {
    try {
      const response = await apiRequest.post('/services', serviceData);
      console.log('Created new service:', response);
      return response;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  updateService: async (serviceId, serviceData) => {
    try {
      const response = await apiRequest.put(`/services/${serviceId}`, serviceData);
      console.log('Updated service:', response);
      return response;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }
};

// Nuove API specifiche per i barbieri
export const barberApi = {
  updateBarberServices: async (barberId, services) => {
    try {
      console.log('Updating barber services:', { barberId, services });
      const response = await apiRequest.put(`/barbers/${barberId}/services`, { services });
      console.log('Update services response:', response);
      return response;
    } catch (error) {
      console.error('Error updating barber services:', error);
      throw error;
    }
  },

  updateBarberWorkingHours: async (barberId, workingHours) => {
    try {
      console.log('Updating working hours:', { barberId, workingHours });
      const response = await apiRequest.put(`/barbers/${barberId}/working-hours`, {
        workingHours: workingHours.map(hours => ({
          ...hours,
          breakStart: hours.hasBreak ? hours.breakStart : null,
          breakEnd: hours.hasBreak ? hours.breakEnd : null
        }))
      });
      console.log('Update working hours response:', response);
      return response;
    } catch (error) {
      console.error('Error updating working hours:', error);
      throw error;
    }
  },

  getBarberAvailability: async (barberId, date, duration) => {
    try {
      if (!barberId || !date || !duration) {
        console.error('Missing required parameters:', { barberId, date, duration });
        throw new Error('Parametri mancanti per la richiesta di disponibilità');
      }

      console.log('Requesting availability with params:', {
        barberId,
        date,
        duration
      });

      // Ottieni prima i dettagli del barbiere inclusi gli orari di lavoro
      const barberResponse = await apiRequest.get(`/barbers/${barberId}`);

      // Costruisci query params in modo sicuro
      const queryParams = new URLSearchParams({
        barberId: barberId.toString(),
        date: date.toString(),
        duration: duration.toString()
      }).toString();

      // Ottieni gli slot disponibili
      const slotsResponse = await apiRequest.get(
        `/appointments/public/available-slots?${queryParams}`
      );

      // Trova gli orari di lavoro per il giorno selezionato
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const workingHours = barberResponse.workingHours?.find(h => h.day === dayOfWeek);

      // Arricchisci gli slot con le informazioni sulla pausa pranzo
      const enrichedSlots = slotsResponse.map(slot => ({
        ...slot,
        workingHours: {
          hasBreak: workingHours?.hasBreak || false,
          breakStart: workingHours?.breakStart || null,
          breakEnd: workingHours?.breakEnd || null
        }
      }));

      console.log('Enriched slots with break times:', enrichedSlots);
      return enrichedSlots;

    } catch (error) {
      console.error('Error in getBarberAvailability:', error);
      throw new Error('Errore nel caricamento della disponibilità');
    }
  },
  updateBarberVacations: async (barberId, vacations) => {
    try {
      console.log('Updating barber vacations:', { barberId, vacations });
      const response = await apiRequest.put(`/barbers/${barberId}/vacations`, { vacations });
      console.log('Update vacations response:', response);
      return response;
    } catch (error) {
      console.error('Error updating barber vacations:', error);
      throw error;
    }
  },

  checkVacation: async (barberId, date) => {
    try {
      const response = await apiRequest.get(`/barbers/${barberId}/check-vacation`, {
        params: { date }
      });
      return response;
    } catch (error) {
      console.error('Error checking vacation:', error);
      throw error;
    }
  }
};

// Aggiungi un interceptor per gestire le risposte e gli errori
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Gestisci errori di autenticazione
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiRequest;
