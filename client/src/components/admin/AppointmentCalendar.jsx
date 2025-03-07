import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { it } from 'date-fns/locale';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTimezone } from '../../context/TimezoneContext';
import { appointmentService } from '../../services/appointmentService';
import CalendarHeader from '../calendar/CalendarHeader';

const AppointmentCalendar = () => {
  const { timezone } = useTimezone();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewType, setViewType] = useState('day');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [barbers, setBarbers] = useState([]);

  // Refs per monitorare i cambiamenti dei parametri
  const prevParams = useRef({ selectedDate, viewType, selectedBarber, timezone });
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  // Helper functions
  const getStatusBadgeColor = useCallback((status) => ({
    pending: 'bg-yellow-500',
    confirmed: 'bg-green-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500'
  }[status] || 'bg-gray-500'), []); // Default color for unknown status

  const getStatusLabel = useCallback((status) => ({
    pending: 'In attesa',
    confirmed: 'Confermato',
    completed: 'Completato',
    cancelled: 'Cancellato'
  }[status] || 'Sconosciuto'), []); // Default label for unknown status

  // Fetch barbers on component mount
  useEffect(() => {
    isMounted.current = true;

    const fetchBarbers = async () => {
      try {
        if (fetchInProgress.current) return;
        fetchInProgress.current = true;

        const response = await appointmentService.getBarbers();

        if (isMounted.current) {
          setBarbers(response);
        }
      } catch (err) {
        console.error('Error fetching barbers:', err);
        if (isMounted.current) {
          setError('Errore nel caricamento dei barbieri');
        }
      } finally {
        fetchInProgress.current = false;
      }
    };

    fetchBarbers();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const getDateRange = useCallback(() => {
    const date = new Date(selectedDate);
    switch (viewType) {
      case 'week':
        return {
          start: startOfWeek(date, { weekStartsOn: 1 }),
          end: endOfWeek(date, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
      default:
        return {
          start: date,
          end: date
        };
    }
  }, [selectedDate, viewType]);

  const fetchAppointments = useCallback(async () => {
    // Evita chiamate duplicate o non necessarie
    if (
      fetchInProgress.current ||
      (prevParams.current.selectedDate === selectedDate &&
      prevParams.current.viewType === viewType &&
      prevParams.current.selectedBarber === selectedBarber &&
      prevParams.current.timezone === timezone)
    ) {
      return;
    }

    try {
      fetchInProgress.current = true;
      setLoading(true);
      setError('');

      const response = await appointmentService.getAppointmentsByView(
        viewType,
        selectedDate,
        selectedBarber
      );

      if (!isMounted.current) return;

      // Assicurati che stiamo lavorando con un array
      if (Array.isArray(response)) {
        if (viewType === 'day') {
          // Day view - ensure all appointments have the necessary properties
          const safeAppointments = response.map(app => {
            return {
              ...app,
              client: app.client || { firstName: 'Cliente', lastName: 'Sconosciuto', email: 'N/A', phone: 'N/A' },
              barber: app.barber || { firstName: 'Barbiere', lastName: 'Sconosciuto' }
            };
          });
          setAppointments(safeAppointments);
        } else {
          // Week/month view - process grouped data
          try {
            // Safely process array of appointment groups
            const flattenedAppointments = response.reduce((acc, group) => {
              if (group && Array.isArray(group.appointments)) {
                const safeAppointments = group.appointments.map(app => ({
                  ...app,
                  client: app.client || { firstName: 'Cliente', lastName: 'Sconosciuto', email: 'N/A', phone: 'N/A' },
                  barber: app.barber || { firstName: 'Barbiere', lastName: 'Sconosciuto' }
                }));
                return [...acc, ...safeAppointments];
              } else if (group) {
                // If group doesn't have appointments array property
                const safeGroup = {
                  ...group,
                  client: group.client || { firstName: 'Cliente', lastName: 'Sconosciuto', email: 'N/A', phone: 'N/A' },
                  barber: group.barber || { firstName: 'Barbiere', lastName: 'Sconosciuto' }
                };
                return [...acc, safeGroup];
              }
              return acc;
            }, []);

            setAppointments(flattenedAppointments);
          } catch (e) {
            console.error('Error processing appointments:', e);
            setAppointments([]);
          }
        }
      } else if (response && typeof response === 'object') {
        // Handle non-array response formats
        console.log('Non-array response format detected');

        let processedAppointments = [];

        // Check for nested structure like { appointments: {...} }
        if (response.appointments) {
          const appointmentsByDate = response.appointments;
          Object.values(appointmentsByDate).forEach(dateGroup => {
            if (dateGroup && Array.isArray(dateGroup.appointments)) {
              const safeAppointments = dateGroup.appointments.map(app => ({
                ...app,
                client: app.client || { firstName: 'Cliente', lastName: 'Sconosciuto', email: 'N/A', phone: 'N/A' },
                barber: app.barber || { firstName: 'Barbiere', lastName: 'Sconosciuto' }
              }));
              processedAppointments = [...processedAppointments, ...safeAppointments];
            }
          });
        } else {
          console.warn('Unexpected response format, using empty array');
        }

        setAppointments(processedAppointments);
      } else {
        console.error('Unexpected response format:', response);
        setAppointments([]);
      }
    } catch (err) {
      if (!isMounted.current) return;

      console.error('Error fetching appointments:', err);
      setError('Errore nel caricamento degli appuntamenti: ' + (err.message || 'errore sconosciuto'));
      setAppointments([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        // Aggiorna i parametri precedenti
        prevParams.current = { selectedDate, viewType, selectedBarber, timezone };
      }
      fetchInProgress.current = false;
    }
  }, [selectedDate, viewType, selectedBarber, timezone]);

  // Fetch appointments when dependencies change or component mounts
  useEffect(() => {
    // Verifica se è necessario aggiornare i dati
    const paramsChanged =
      prevParams.current.selectedDate !== selectedDate ||
      prevParams.current.viewType !== viewType ||
      prevParams.current.selectedBarber !== selectedBarber ||
      prevParams.current.timezone !== timezone;

    if (paramsChanged && isMounted.current) {
      fetchAppointments();
    }
  }, [selectedDate, viewType, selectedBarber, timezone, fetchAppointments]);

  // API calls and handlers
  const handleStatusChange = async (appointment, newStatus) => {
    try {
      setError('');

      await appointmentService.updateAppointmentStatus(
        appointment._id,
        {
          status: newStatus,
          cancellationReason: 'Cancellato dall\'amministratore'
        }
      );

      // Reload appointments after update
      await fetchAppointments();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Errore nell\'aggiornamento dello stato: ' +
        (err.response?.data?.message || 'Errore sconosciuto'));
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const renderAppointmentCard = useCallback((appointment) => {
    // Safely access nested properties
    const clientFirstName = appointment?.client?.firstName || 'Cliente';
    const clientLastName = appointment?.client?.lastName || 'Sconosciuto';
    const clientEmail = appointment?.client?.email || 'N/A';
    const clientPhone = appointment?.client?.phone || 'N/A';
    const barberFirstName = appointment?.barber?.firstName || 'Barbiere';
    const barberLastName = appointment?.barber?.lastName || 'Sconosciuto';

    return (
      <div key={appointment._id} className="bg-[var(--bg-secondary)] p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-[var(--accent)]">
                {clientFirstName} {clientLastName}
              </h3>
              <p className="text-sm text-gray-400">
                {clientEmail} • {clientPhone}
              </p>
            </div>

            <div>
              <p className="text-lg">{appointment.service || 'Servizio non specificato'}</p>
              <p className="text-sm text-gray-400">
                {appointment.date ? format(new Date(appointment.date), 'EEEE d MMMM yyyy', { locale: it }) : 'Data non specificata'}
                &nbsp;•&nbsp;{appointment.time || 'Orario non specificato'}
              </p>
              <p className="text-sm text-[var(--text-primary)] mt-1">
                Barbiere: {barberFirstName} {barberLastName}
              </p>
              <p className="text-[var(--accent)] font-semibold mt-1">
                CHF{appointment.price || '0'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-sm text-white ${getStatusBadgeColor(appointment.status)}`}>
              {getStatusLabel(appointment.status)}
            </span>

            <select
              value={appointment.status || 'pending'}
              onChange={(e) => handleStatusChange(appointment, e.target.value)}
              className="mt-2 p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)] text-sm"
            >
              <option value="pending">In attesa</option>
              <option value="confirmed">Confermato</option>
              <option value="completed">Completato</option>
              <option value="cancelled">Cancellato</option>
            </select>
          </div>
        </div>
      </div>
    );
  }, [getStatusBadgeColor, getStatusLabel]);

  const renderAppointments = useCallback(() => {
    if (loading) return <div className="text-center py-4">Caricamento...</div>;

    if (!appointments || appointments.length === 0) {
      return (
        <div className="text-center py-4 text-gray-400">
          Nessun appuntamento {selectedBarber ? 'per questo barbiere' : ''} in questo periodo
        </div>
      );
    }

    if (viewType === 'day') {
      return (
        <div className="grid gap-4">
          {appointments.map((appointment) => renderAppointmentCard(appointment))}
        </div>
      );
    }

    // For week/month views, group by date
    try {
      const groupedAppointments = appointments.reduce((groups, appointment) => {
        if (!appointment || !appointment.date) {
          console.warn('Invalid appointment data:', appointment);
          return groups;
        }

        const dateKey = new Date(appointment.date).toISOString().split('T')[0];
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(appointment);
        return groups;
      }, {});

      return (
        <div className="space-y-6">
          {Object.entries(groupedAppointments)
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, dayAppointments]) => (
              <div key={date} className="bg-[var(--bg-primary)] p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4 text-[var(--accent)]">
                  {format(new Date(date), 'EEEE d MMMM yyyy', { locale: it })}
                </h3>
                <div className="space-y-4">
                  {dayAppointments.map((appointment) => renderAppointmentCard(appointment))}
                </div>
              </div>
            ))}
        </div>
      );
    } catch (err) {
      console.error('Error rendering grouped appointments:', err);
      return (
        <div className="bg-red-100 text-red-800 p-3 rounded">
          Errore nella visualizzazione degli appuntamenti. Dettagli: {err.message}
        </div>
      );
    }
  }, [appointments, loading, renderAppointmentCard, selectedBarber, viewType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[var(--accent)]">
          Calendario Appuntamenti
        </h2>
        <CalendarHeader
          viewType={viewType}
          onViewTypeChange={setViewType}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          selectedBarber={selectedBarber}
          onBarberChange={setSelectedBarber}
          barbers={barbers}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded">
          {error}
        </div>
      )}

      {/* Appointments List */}
      {renderAppointments()}
    </div>
  );
};

export default AppointmentCalendar;
