import { addDays } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/api.js';
import TimeSlots from './TimeSlots';

function GuestBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    selectedBarber: '',
    selectedService: '',
    selectedDate: '',
    selectedTime: ''
  });

   // Carica i barbieri all'avvio
   useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/appointments/public/barbers`);
        if (!response.ok) {
          throw new Error('Errore nel caricamento dei barbieri');
        }
        const data = await response.json();
        setBarbers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Errore nel caricamento dei barbieri:', error);
        setError('Errore nel caricamento dei barbieri');
      }
    };
    fetchBarbers();
  }, []);

  // Aggiorna l'effetto per i servizi
useEffect(() => {
  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/active`);
      const data = await response.json();

      // Formatta i servizi e aggiornali sia in services che in availableServices
      const formattedServices = data.map(service => ({
        id: service._id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description
      }));

      setServices(formattedServices);
      setAvailableServices(formattedServices); // Aggiungi questa riga
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Errore nel caricamento dei servizi');
    }
  };

  fetchServices();
}, []);

// Aggiorna useEffect per aggiornare i servizi disponibili quando cambia il barbiere
useEffect(() => {
  if (formData.selectedBarber) {
    // Quando viene selezionato un barbiere, mostra tutti i servizi disponibili
    setAvailableServices(services);
  } else {
    // Quando non c'è un barbiere selezionato, resetta i servizi disponibili
    setAvailableServices([]);
  }
}, [formData.selectedBarber, services]);

  // useEffect per fetchAvailableSlots
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.selectedDate || !formData.selectedService || !formData.selectedBarber) {
        setAvailableSlots([]);
        return;
      }

      try {
        const service = services.find(s => s.id === formData.selectedService);
        if (!service) return;

        // Fetch barber details
        const barberResponse = await fetch(
          `${API_BASE_URL}/appointments/public/barbers/${formData.selectedBarber}`
        );
        if (!barberResponse.ok) {
          throw new Error('Errore nel recupero dei dati del barbiere');
        }
        const barberData = await barberResponse.json();

        // Fetch available slots
        const slotsResponse = await fetch(
          `${API_BASE_URL}/appointments/public/available-slots?` +
          new URLSearchParams({
            barberId: formData.selectedBarber,
            date: formData.selectedDate,
            duration: service.duration
          })
        );

        if (!slotsResponse.ok) {
          throw new Error('Errore nel caricamento degli slot disponibili');
        }

        const slots = await slotsResponse.json();

        // Arricchisci gli slot con i dati del barbiere
        const dayOfWeek = new Date(formData.selectedDate)
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase();

        const workingHours = barberData.workingHours.find(wh => wh.day === dayOfWeek);

        const enrichedSlots = slots.map(slot => ({
          ...slot,
          workingHours: {
            hasBreak: workingHours?.hasBreak || false,
            breakStart: workingHours?.breakStart || null,
            breakEnd: workingHours?.breakEnd || null
          }
        }));

        setAvailableSlots(enrichedSlots);
        setError('');
      } catch (error) {
        console.error('Error fetching slots:', error);
        setError(error.message || 'Errore nel caricamento degli slot disponibili');
        setAvailableSlots([]);
      }
    };

    fetchAvailableSlots();
  }, [formData.selectedDate, formData.selectedService, formData.selectedBarber, services]);

  useEffect(() => {
    const fetchBarbersAndServices = async () => {
      try {
        // Fetch barbieri
        const barbersResponse = await fetch(`${API_BASE_URL}/appointments/public/barbers`);
        if (!barbersResponse.ok) throw new Error('Errore nel caricamento dei barbieri');
        const barbersData = await barbersResponse.json();
        setBarbers(Array.isArray(barbersData) ? barbersData : []);

        // Fetch servizi
        const servicesResponse = await fetch(`${API_BASE_URL}/services/active`);
        const servicesData = await servicesResponse.json();
        const formattedServices = servicesData.map(service => ({
          id: service._id,
          name: service.name,
          price: service.price,
          duration: service.duration,
          description: service.description
        }));
        setServices(formattedServices);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Errore nel caricamento dei dati');
      }
    };

    fetchBarbersAndServices();
  }, []);

  // handleSubmit con URL aggiornato
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ... validazione dei dati ...

      const appointmentData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        barberId: formData.selectedBarber,
        service: service.name,
        date: formData.selectedDate,
        time: formData.selectedTime,
        duration: service.duration,
        price: service.price
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await fetch(`${API_BASE_URL}/appointments/public/appointments/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore nella prenotazione');
      }

      setSuccess('Prenotazione effettuata con successo! Controlla la tua email per la conferma.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        selectedBarber: '',
        selectedService: '',
        selectedDate: '',
        selectedTime: ''
      });

    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message || 'Errore nella prenotazione');
    } finally {
      setLoading(false);
    }
  };

  // Date limits
  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = addDays(new Date(), 30).toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20">
      <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--accent)]">
          Prenota come ospite
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--accent)] mb-2">Nome</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
                className="w-full p-3 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent)]"
                placeholder="Il tuo nome"
              />
            </div>

            <div>
              <label className="block text-[var(--accent)] mb-2">Cognome</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
                className="w-full p-3 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent)]"
                placeholder="Il tuo cognome"
              />
            </div>

            <div>
              <label className="block text-[var(--accent)] mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full p-3 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent)]"
                placeholder="La tua email"
              />
            </div>

            <div>
              <label className="block text-[var(--accent)] mb-2">Telefono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                className="w-full p-3 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent)]"
                placeholder="Il tuo numero di telefono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--accent)] mb-2">Barbiere</label>
            <select
              value={formData.selectedBarber}
              onChange={(e) => setFormData({...formData, selectedBarber: e.target.value})}
              required
              className="w-full p-3 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent)]"
            >
              <option value="">Seleziona un barbiere</option>
              {barbers.map(barber => (
                <option key={barber._id} value={barber._id}>
                  {barber.firstName} {barber.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Select per i servizi */}
          <div>
            <label className="block text-[var(--accent)] mb-2">Servizio</label>
            <select
              value={formData.selectedService}
              onChange={(e) => setFormData({...formData, selectedService: e.target.value})}
              required
              disabled={!formData.selectedBarber}
              className="w-full p-3 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent)]"
            >
              <option value="">Seleziona un servizio</option>
              {availableServices.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - CHF{service.price} ({service.duration} min)
                </option>
              ))}
            </select>
            {!formData.selectedBarber && (
              <p className="text-sm text-[var(--accent)] mt-1">
                Seleziona prima un barbiere per vedere i servizi disponibili
              </p>
            )}
          </div>


          <div>
            <label className="block text-[var(--accent)] mb-2">Data</label>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={formData.selectedDate}
              onChange={(e) => setFormData({...formData, selectedDate: e.target.value})}
              required
              className="w-full p-3 rounded bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--accent)]"
            />
          </div>

          {formData.selectedDate && formData.selectedService && formData.selectedBarber && (
            <div>
              <label className="block text-[var(--accent)] mb-2">Orario</label>
              <TimeSlots
                selectedDate={formData.selectedDate}
                selectedService={services.find(s => s.id === formData.selectedService)}
                availableSlots={availableSlots}
                onSelectTime={(time) => setFormData({...formData, selectedTime: time})}
                selectedTime={formData.selectedTime}
                selectedBarber={formData.selectedBarber}
                barbers={barbers}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.selectedTime}
            className="w-full bg-[var(--accent)] text-white font-bold py-3 px-4 rounded transition-all duration-300 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Prenotazione in corso...' : 'Prenota'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuestBooking;
