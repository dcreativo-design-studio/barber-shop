import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import { notificationService } from './notificationService.js';

const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Funzione migliorata per calcolare le ore rimanenti
const getHoursRemaining = (appointmentDate, appointmentTime) => {
  try {
    // Assicuriamo che appointmentDate sia un oggetto Date
    const appointmentDateTime = new Date(appointmentDate);
    if (isNaN(appointmentDateTime.getTime())) {
      console.error('Data non valida:', appointmentDate);
      return null;
    }

    // Estrai le ore e i minuti dall'orario dell'appuntamento
    const [hours, minutes] = appointmentTime.split(':').map(Number);

    // Imposta le ore e i minuti nell'oggetto date
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Ottieni il timestamp corrente
    const now = new Date();

    // Calcola la differenza in ore
    const hoursDiff = (appointmentDateTime - now) / (1000 * 60 * 60);

    // Log dettagliato per debugging
    console.log(`Appuntamento: ${appointmentDateTime.toISOString()}, Ora attuale: ${now.toISOString()}, Differenza: ${hoursDiff.toFixed(2)} ore`);

    return hoursDiff;
  } catch (error) {
    console.error('Errore nel calcolo delle ore rimanenti:', error);
    return null;
  }
};

const sendReminders = async (appointment) => {
  try {
    console.log(`Starting reminders for appointment ${appointment._id} (${appointment.service})`);
    console.log(`Client: ${appointment.client?.firstName} ${appointment.client?.lastName}, Phone: ${appointment.client?.phone}`);
    console.log(`Date: ${appointment.date}, Time: ${appointment.time}`);

    // Controllo aggiuntivo per assicurarsi che l'appuntamento non sia già stato notificato
    if (appointment.reminderSent) {
      console.log(`Promemoria già inviato per l'appuntamento ${appointment._id}`);
      return;
    }

    // Usa findOneAndUpdate per evitare race conditions con retry atomico
    const updatedAppointment = await Appointment.findOneAndUpdate(
      {
        _id: appointment._id,
        reminderSent: false
      },
      {
        $set: {
          reminderSent: true,
          lastReminderAttempt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('client', 'firstName lastName email phone')
      .populate('barber', 'firstName lastName');

    if (!updatedAppointment) {
      console.log(`Promemoria già inviati o appuntamento non trovato: ${appointment._id}`);
      return;
    }

    // Controllo che i dati del cliente e del barbiere siano disponibili
    if (!updatedAppointment.client) {
      console.error(`Cliente non trovato per l'appuntamento ${updatedAppointment._id}`);
      await Appointment.findByIdAndUpdate(appointment._id, {
        reminderSent: false,
        reminderError: 'Cliente non trovato'
      });
      return;
    }

    // Invia le notifiche una per una con gestione degli errori per ciascuna
    const notifications = [];

    // 1. Email
    try {
      console.log('Inviando email di promemoria...');
      const emailResult = await notificationService.sendReminderEmail(updatedAppointment, updatedAppointment.client);
      notifications.push({ type: 'email', success: !!emailResult, error: null });
      console.log('Email di promemoria inviata con successo');
    } catch (emailError) {
      console.error('Errore invio email di promemoria:', emailError);
      notifications.push({ type: 'email', success: false, error: emailError.message });
    }

    // 2. WhatsApp
    try {
      console.log('Inviando promemoria WhatsApp...');
      const whatsappResult = await notificationService.sendWhatsAppMessage(updatedAppointment, updatedAppointment.client);
      notifications.push({ type: 'whatsapp', success: whatsappResult, error: null });
      console.log('Promemoria WhatsApp inviato con successo');
    } catch (whatsappError) {
      console.error('Errore invio promemoria WhatsApp:', whatsappError);
      notifications.push({ type: 'whatsapp', success: false, error: whatsappError.message });
    }

    // 3. SMS
    try {
      console.log('Inviando promemoria SMS...');
      const smsResult = await notificationService.sendReminderSMS(updatedAppointment, updatedAppointment.client);
      notifications.push({ type: 'sms', success: smsResult, error: null });
      console.log('Promemoria SMS inviato con successo');
    } catch (smsError) {
      console.error('Errore invio promemoria SMS:', smsError);
      notifications.push({ type: 'sms', success: false, error: smsError.message });
    }

    // Aggiorna l'appuntamento con i risultati delle notifiche
    const allFailed = notifications.every(n => !n.success);
    if (allFailed) {
      console.error(`Tutte le notifiche fallite per l'appuntamento ${updatedAppointment._id}`);
      // Se tutte le notifiche sono fallite, reimposta reminderSent a false per riprovare
      await Appointment.findByIdAndUpdate(appointment._id, {
        reminderSent: false,
        lastReminderAttempt: new Date(),
        reminderError: 'Tutte le notifiche fallite',
        $inc: { reminderRetries: 1 }
      });
    } else {
      console.log(`Promemoria processati per l'appuntamento ${updatedAppointment._id}`);
      // Aggiorna con i dettagli delle notifiche riuscite/fallite
      await Appointment.findByIdAndUpdate(appointment._id, {
        $set: {
          notificationResults: notifications
        }
      });
    }
  } catch (error) {
    console.error(`Errore nell'invio dei promemoria per l'appuntamento ${appointment._id}:`, error);

    // Ripristina lo stato in caso di errore
    await Appointment.findByIdAndUpdate(appointment._id, {
      reminderSent: false,
      lastReminderAttempt: new Date(),
      reminderError: error.message,
      $inc: { reminderRetries: 1 }
    });
  }
};

export const initializeScheduler = () => {
  // Promemoria appuntamenti (ogni 5 minuti)
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Controllo promemoria appuntamenti...');

      // Trova gli appuntamenti non ancora notificati
      const appointments = await Appointment.find({
        status: { $in: ['confirmed', 'pending'] },
        reminderSent: false,
        date: { $gte: new Date() }
      })
      .populate('client', 'firstName lastName email phone')
      .populate('barber', 'firstName lastName')
      .lean();

      console.log(`Trovati ${appointments.length} appuntamenti da controllare per promemoria`);

      for (const appointment of appointments) {
        const hoursRemaining = getHoursRemaining(appointment.date, appointment.time);

        // Log dettagliato per ogni appuntamento
        console.log(`Appuntamento ${appointment._id}: ${appointment.date} ${appointment.time}, ore rimanenti: ${hoursRemaining?.toFixed(2) || 'Errore'}`);

        // Estendi la finestra di tempo per l'invio dei promemoria
        // Invia promemoria se mancano tra 26 e 23 ore all'appuntamento
        if (hoursRemaining !== null && hoursRemaining <= 26 && hoursRemaining > 23) {
          console.log(`Invio promemoria per appuntamento ${appointment._id}, ore rimanenti: ${hoursRemaining.toFixed(2)}`);
          await sendReminders(appointment);
        }
      }
    } catch (error) {
      console.error('Errore nello scheduler dei promemoria:', error);
    }
  });

  // Conferma automatica appuntamenti (ogni 30 minuti)
  cron.schedule('*/30 * * * *', async () => {
    try {
      const pendingAppointments = await Appointment.find({
        status: 'pending',
        date: { $gte: new Date() }
      }).lean();

      console.log(`Trovati ${pendingAppointments.length} appuntamenti in attesa da confermare automaticamente`);

      for (const appointment of pendingAppointments) {
        const hoursRemaining = getHoursRemaining(appointment.date, appointment.time);

        if (hoursRemaining !== null && hoursRemaining <= 24) {
          await Appointment.findByIdAndUpdate(appointment._id, {
            status: 'confirmed',
            updatedAt: new Date()
          });

          console.log(`Appuntamento ${appointment._id} confermato automaticamente`);
        }
      }
    } catch (error) {
      console.error('Errore nello scheduler di conferma automatica:', error);
    }
  });

  console.log('Scheduler degli appuntamenti inizializzato');
};
