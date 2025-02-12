import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Barber from '../models/Barber.js';
import Service from '../models/Service.js';
import { generateAvailableSlots } from '../utils/slotGenerator.js';

export const barberController = {
  // Ottiene tutti i barbieri attivi
  async getAllBarbers(req, res) {
    try {
      const barbers = await Barber.find({ isActive: true });
      // Rimuovi il .select() per includere tutti i campi
      res.json(barbers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Ottiene un barbiere specifico
  async getBarber(req, res) {
    try {
      const barber = await Barber.findById(req.params.id);
      if (!barber) {
        return res.status(404).json({ message: 'Barbiere non trovato' });
      }
      res.json(barber);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Crea un nuovo barbiere (solo admin)
  async createBarber(req, res) {
    try {
      // Aggiungi orari di lavoro di default se non forniti
      const defaultWorkingHours = [
        { day: 'monday', isWorking: true, startTime: '09:00', endTime: '19:00' },
        { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '19:00' },
        { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '19:00' },
        { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '19:00' },
        { day: 'friday', isWorking: true, startTime: '09:00', endTime: '19:00' },
        { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '17:00' },
        { day: 'sunday', isWorking: false, startTime: '09:00', endTime: '19:00' }
      ];

      const barber = new Barber({
        ...req.body,
        workingHours: req.body.workingHours || defaultWorkingHours,
        isActive: true
      });

      await barber.save();
      res.status(201).json(barber);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Aggiorna un barbiere (solo admin)
  async updateBarber(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Trova il barbiere
      const barber = await Barber.findById(id);
      if (!barber) {
        return res.status(404).json({ message: 'Barbiere non trovato' });
      }

      // Gestisci gli orari di lavoro
      if (updateData.workingHours) {
        // Assicurati che tutti i giorni abbiano i valori corretti per la pausa pranzo
        updateData.workingHours = updateData.workingHours.map(hours => {
          if (hours.hasBreak) {
            // Se la pausa pranzo è attiva, assicurati che ci siano gli orari
            return {
              ...hours,
              breakStart: hours.breakStart || '12:00',
              breakEnd: hours.breakEnd || '12:30'
            };
          } else {
            // Se la pausa pranzo è disattivata, rimuovi gli orari
            const { breakStart, breakEnd, ...rest } = hours;
            return {
              ...rest,
              hasBreak: false
            };
          }
        });
      }

      // Aggiorna il barbiere
      const updatedBarber = await Barber.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      res.json(updatedBarber);
    } catch (error) {
      console.error('Error updating barber:', error);
      res.status(400).json({
        message: 'Errore nell\'aggiornamento del barbiere',
        error: error.message
      });
    }
  },

  // Disattiva un barbiere (soft delete) (solo admin)
  async deactivateBarber(req, res) {
    try {
      const barber = await Barber.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!barber) {
        return res.status(404).json({ message: 'Barbiere non trovato' });
      }
      res.json({ message: 'Barbiere disattivato con successo' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Ottiene gli orari di lavoro di un barbiere
  async getBarberSchedule(req, res) {
    try {
      const barber = await Barber.findById(req.params.id);
      if (!barber) {
        return res.status(404).json({ message: 'Barbiere non trovato' });
      }

      const { date } = req.query;
      const workingHours = barber.getWorkingHoursForDay(date);

      if (!workingHours || !workingHours.isWorking) {
        return res.json({ isWorking: false });
      }

      // Ottieni gli appuntamenti del giorno
      const appointments = await Appointment.find({
        barber: barber._id,
        date: new Date(date),
        status: { $ne: 'cancelled' }
      }).select('time duration');

      res.json({
        isWorking: true,
        workingHours,
        appointments
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Aggiorna gli orari di lavoro di un barbiere (solo admin)
  async updateBarberServices(req, res) {
    try {
      const { id } = req.params;
      const { services } = req.body;

      console.log('Updating services for barber:', { id, services });

      if (!Array.isArray(services)) {
        return res.status(400).json({
          success: false,
          message: 'I servizi devono essere un array'
        });
      }

      const barber = await Barber.findById(id);
      if (!barber) {
        return res.status(404).json({
          success: false,
          message: 'Barbiere non trovato'
        });
      }

      barber.services = services;
      await barber.save();

      console.log('Services updated successfully:', barber.services);

      return res.json({
        success: true,
        message: 'Servizi aggiornati con successo',
        services: barber.services
      });

    } catch (error) {
      console.error('Error updating barber services:', error);
      return res.status(500).json({
        success: false,
        message: 'Errore nell\'aggiornamento dei servizi',
        error: error.message
      });
    }
  },

  async updateWorkingHours(req, res) {
    try {
      const { id } = req.params;
      const { workingHours } = req.body;

      if (!Array.isArray(workingHours)) {
        return res.status(400).json({
          message: 'Gli orari di lavoro devono essere un array'
        });
      }

      // Trova il barbiere
      const barber = await Barber.findById(id);
      if (!barber) {
        return res.status(404).json({
          message: 'Barbiere non trovato'
        });
      }

      // Aggiorna gli orari di lavoro
      barber.workingHours = workingHours.map(hours => ({
        ...hours,
        // Se hasBreak è true, mantieni gli orari della pausa, altrimenti imposta null
        breakStart: hours.hasBreak ? hours.breakStart : null,
        breakEnd: hours.hasBreak ? hours.breakEnd : null
      }));

      await barber.save();

      res.json({
        message: 'Orari di lavoro aggiornati con successo',
        workingHours: barber.workingHours
      });

    } catch (error) {
      console.error('Error updating working hours:', error);
      res.status(500).json({
        message: 'Errore nell\'aggiornamento degli orari',
        error: error.message
      });
    }
  },

  async updateAllWorkingHours(req, res) {
    try {
      const { id } = req.params;
      const { workingHours } = req.body;

      console.log('Updating working hours for barber:', { id, workingHours });

      if (!Array.isArray(workingHours)) {
        return res.status(400).json({
          success: false,
          message: 'Gli orari di lavoro devono essere un array'
        });
      }

      const barber = await Barber.findById(id);
      if (!barber) {
        return res.status(404).json({
          success: false,
          message: 'Barbiere non trovato'
        });
      }

      // Normalizza gli orari prima del salvataggio
      const normalizedHours = workingHours.map(hours => ({
        ...hours,
        breakStart: hours.hasBreak && hours.isWorking ? hours.breakStart : null,
        breakEnd: hours.hasBreak && hours.isWorking ? hours.breakEnd : null
      }));

      barber.workingHours = normalizedHours;
      await barber.save();

      console.log('Working hours updated successfully:', barber.workingHours);

      return res.json({
        success: true,
        message: 'Orari di lavoro aggiornati con successo',
        workingHours: barber.workingHours
      });

    } catch (error) {
      console.error('Error updating working hours:', error);
      return res.status(500).json({
        success: false,
        message: 'Errore nell\'aggiornamento degli orari',
        error: error.message
      });
    }
  },
  async updateVacations(req, res) {
    try {
      const { id } = req.params;
      const { vacations } = req.body;

      // Validazione delle date
      for (const vacation of vacations) {
        const startDate = new Date(vacation.startDate);
        const endDate = new Date(vacation.endDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Date non valide' });
        }

        if (endDate < startDate) {
          return res.status(400).json({
            message: 'La data di fine vacanza deve essere successiva alla data di inizio'
          });
        }
      }

      const barber = await Barber.findById(id);
      if (!barber) {
        return res.status(404).json({ message: 'Barbiere non trovato' });
      }

      barber.vacations = vacations;
      await barber.save();

      res.json({
        success: true,
        message: 'Vacanze aggiornate con successo',
        vacations: barber.vacations
      });
    } catch (error) {
      console.error('Error updating vacations:', error);
      res.status(500).json({
        message: 'Errore nell\'aggiornamento delle vacanze',
        error: error.message
      });
    }
  },

  // Verifica se un barbiere è in vacanza in una data specifica
  async checkVacation(req, res) {
    try {
      const { id } = req.params;
      const { date } = req.query;

      // Normalize input date to start of day
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      if (isNaN(checkDate.getTime())) {
        return res.status(400).json({ message: 'Data non valida' });
      }

      const barber = await Barber.findById(id);
      if (!barber) {
        return res.status(404).json({ message: 'Barbiere non trovato' });
      }

      console.log('Checking date:', checkDate);
      console.log('Barber vacations:', barber.vacations);

      // Find matching vacation period
      const matchingVacation = barber.vacations.find(vacation => {
        const startDate = new Date(vacation.startDate);
        const endDate = new Date(vacation.endDate);

        // Normalize vacation dates to start of day
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        console.log('Comparing with vacation period:', {
          start: startDate,
          end: endDate,
          checkDate: checkDate
        });

        return checkDate >= startDate && checkDate <= endDate;
      });

      const isOnVacation = !!matchingVacation;
      console.log('Is on vacation:', isOnVacation);

      res.json({
        isOnVacation,
        vacationInfo: matchingVacation ? {
          startDate: matchingVacation.startDate,
          endDate: matchingVacation.endDate
        } : null
      });
    } catch (error) {
      console.error('Error checking vacation:', error);
      res.status(500).json({ message: error.message });
    }
  },
  // Ottiene le statistiche di un barbiere
  async getBarberStats(req, res) {
    try {
      const barberId = req.params.id;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const stats = await Appointment.aggregate([
        {
          $match: {
            barber: mongoose.Types.ObjectId(barberId),
            date: { $gte: startDate },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            totalRevenue: { $sum: '$price' },
            averageDuration: { $avg: '$duration' },
            serviceBreakdown: {
              $push: {
                service: '$service',
                price: '$price'
              }
            }
          }
        }
      ]);

      res.json(stats[0] || {
        totalAppointments: 0,
        totalRevenue: 0,
        averageDuration: 0,
        serviceBreakdown: []
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Ottiene la disponibilità di un barbiere per una data specifica
  async getBarberAvailability(req, res) {
    try {
      const { id } = req.params;
      const { date, serviceId } = req.query;

      // Validazione parametri
      if (!id || !date) {
        return res.status(400).json({
          error: 'Parametri mancanti',
          details: 'barberId e date sono richiesti'
        });
      }

      // Converti la data in oggetto Date
      const requestedDate = new Date(date);
      if (isNaN(requestedDate.getTime())) {
        return res.status(400).json({
          error: 'Data non valida',
          details: 'Il formato della data deve essere YYYY-MM-DD'
        });
      }

      // Trova il barbiere
      const barber = await Barber.findById(id);
      if (!barber) {
        return res.status(404).json({
          error: 'Barbiere non trovato',
          details: `Nessun barbiere trovato con id ${id}`
        });
      }

      // Ottieni il giorno della settimana (0-6, dove 0 è domenica)
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = days[requestedDate.getDay()];
      const workingHours = barber.workingHours.find(h => h.day === dayOfWeek);

      if (!workingHours || !workingHours.isWorking) {
        return res.status(200).json({
          slots: [],
          message: 'Il barbiere non lavora in questo giorno'
        });
      }

      // Ottieni la durata del servizio
      let duration = 15; // durata di default
      if (serviceId) {
        const service = await Service.findById(serviceId);
        if (service) {
          duration = service.duration;
        }
      }

      // Genera gli slot disponibili
      const slots = await generateAvailableSlots(
        barber,
        requestedDate,
        workingHours,
        duration
      );

      return res.status(200).json({ slots });

    } catch (error) {
      console.error('Error in getBarberAvailability:', error);
      return res.status(500).json({
        error: 'Errore interno del server',
        details: error.message
      });
    }
  },

  // Ottiene i barbieri attivi
  async getActiveBarbers(req, res) {
    try {
      const barbers = await Barber.find({ isActive: true })
        .select('firstName lastName services workingHours');
      res.json(barbers);
    } catch (error) {
      console.error('Error fetching active barbers:', error);
      res.status(500).json({
        message: 'Errore nel recupero dei barbieri',
        error: error.message
      });
    }
  },

  // Ottiene dettagli pubblici di un singolo barbiere
  async getPublicBarberDetails(req, res) {
    try {
      const barber = await Barber.findById(req.params.id)
        .select('firstName lastName services workingHours isActive');

      if (!barber) {
        return res.status(404).json({ message: 'Barbiere non trovato' });
      }

      if (!barber.isActive) {
        return res.status(404).json({ message: 'Barbiere non disponibile' });
      }

      res.json(barber);
    } catch (error) {
      console.error('Error fetching public barber details:', error);
      res.status(500).json({
        message: 'Errore nel recupero dei dettagli del barbiere',
        error: error.message
      });
    }
  },
  async updateBarberWorkingHours(req, res) {
    try {
      const { id } = req.params;
      const { workingHours } = req.body;

      // Valida l'input
      if (!Array.isArray(workingHours)) {
        return res.status(400).json({
          message: 'Gli orari di lavoro devono essere un array'
        });
      }

      // Trova il barbiere
      const barber = await Barber.findById(id);
      if (!barber) {
        return res.status(404).json({
          message: 'Barbiere non trovato'
        });
      }

      // Valida ogni oggetto orario di lavoro
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const hours of workingHours) {
        if (!validDays.includes(hours.day)) {
          return res.status(400).json({
            message: `Giorno non valido: ${hours.day}`
          });
        }

        // Valida il formato degli orari
        if (hours.isWorking) {
          if (!hours.startTime || !hours.endTime) {
            return res.status(400).json({
              message: `Orari mancanti per il giorno ${hours.day}`
            });
          }

          // Valida il formato HH:mm
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(hours.startTime) || !timeRegex.test(hours.endTime)) {
            return res.status(400).json({
              message: `Formato orario non valido per il giorno ${hours.day}`
            });
          }

          // Valida pausa pranzo se presente
          if (hours.hasBreak) {
            if (!hours.breakStart || !hours.breakEnd) {
              return res.status(400).json({
                message: `Orari pausa pranzo mancanti per il giorno ${hours.day}`
              });
            }
            if (!timeRegex.test(hours.breakStart) || !timeRegex.test(hours.breakEnd)) {
              return res.status(400).json({
                message: `Formato orario pausa pranzo non valido per il giorno ${hours.day}`
              });
            }
          }
        }
      }

      // Aggiorna gli orari
      barber.workingHours = workingHours;
      await barber.save();

      res.json({
        message: 'Orari di lavoro aggiornati con successo',
        workingHours: barber.workingHours
      });

    } catch (error) {
      console.error('Error updating working hours:', error);
      res.status(500).json({
        message: 'Errore nell\'aggiornamento degli orari',
        error: error.message
      });
    }
  }
};

export default barberController;
