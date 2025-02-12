import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import { notificationService } from './notificationService.js';

const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const getHoursRemaining = (appointmentDate, appointmentTime) => {
  const appointmentMinutes = timeToMinutes(appointmentTime);
  const appointmentDateTime = new Date(appointmentDate);
  appointmentDateTime.setHours(Math.floor(appointmentMinutes / 60), appointmentMinutes % 60, 0, 0);
  const now = new Date();
  return (appointmentDateTime - now) / (1000 * 60 * 60);
};

const sendReminders = async (appointment) => {
  try {
    console.log(`Sending reminders for appointment: ${appointment._id}`);

    // Usa findOneAndUpdate per evitare race conditions
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
      console.log(`Reminders already sent or appointment not found: ${appointment._id}`);
      return;
    }

    // Invia le notifiche in parallelo
    await Promise.all([
      notificationService.sendReminderEmail(updatedAppointment, updatedAppointment.client),
      notificationService.sendWhatsAppMessage(updatedAppointment, updatedAppointment.client),
      notificationService.sendReminderSMS(updatedAppointment, updatedAppointment.client)
    ]);

    console.log(`Reminders sent successfully for appointment ${updatedAppointment._id}`);
  } catch (error) {
    console.error(`Error sending reminders for appointment ${appointment._id}:`, error);

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
  // Promemoria appuntamenti (ogni 15 minuti)
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('Running appointment reminder check...');

      const appointments = await Appointment.find({
        status: { $in: ['confirmed', 'pending'] },
        reminderSent: false,
        date: { $gte: new Date() }
      })
      .populate('client', 'firstName lastName email phone')
      .populate('barber', 'firstName lastName')
      .lean();

      console.log(`Found ${appointments.length} appointments to check for reminders`);

      for (const appointment of appointments) {
        const hoursRemaining = getHoursRemaining(appointment.date, appointment.time);

        if (hoursRemaining <= 25 && hoursRemaining > 23) {
          await sendReminders(appointment);
        }
      }
    } catch (error) {
      console.error('Error in appointment scheduler:', error);
    }
  });

  // Conferma automatica appuntamenti (ogni 30 minuti)
  cron.schedule('*/30 * * * *', async () => {
    try {
      const pendingAppointments = await Appointment.find({
        status: 'pending',
        date: { $gte: new Date() }
      }).lean();

      for (const appointment of pendingAppointments) {
        const hoursRemaining = getHoursRemaining(appointment.date, appointment.time);

        if (hoursRemaining <= 24) {
          await Appointment.findByIdAndUpdate(appointment._id, {
            status: 'confirmed',
            updatedAt: new Date()
          });

          console.log(`Appointment ${appointment._id} automatically confirmed`);
        }
      }
    } catch (error) {
      console.error('Error in automatic confirmation scheduler:', error);
    }
  });

  console.log('Appointment scheduler initialized');
};
