import { Router } from 'express';
import twilio from 'twilio';
import { appointmentController } from '../controllers/appointmentController.js';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';
import Barber from '../models/Barber.js';
import { initializeScheduler } from '../services/appointmentScheduler.js';
import { notificationService } from '../services/notificationService.js';

const router = Router();

// Log di debug
console.log('Registering Twilio webhook route...');

// ========= ROTTE PUBBLICHE (senza autenticazione) =========
// Disponibilità e slot
router.get('/public/available-slots', appointmentController.getAvailableSlots);
router.get('/public/barber/:barberId/availability', appointmentController.getBarberAvailability);

// Lista barbieri e dettagli (pubblici)
router.get('/public/barbers', appointmentController.getPublicBarbers);          // Lista barbieri
router.get('/public/barbers/:barberId', async (req, res) => {                  // Dettagli barbiere
  try {
    const barber = await Barber.findById(req.params.barberId)
      .select('firstName lastName services workingHours')
      .lean();

    if (!barber) {
      return res.status(404).json({ message: 'Barbiere non trovato' });
    }

    // Normalizza i dati delle pause
    barber.workingHours = barber.workingHours.map(wh => ({
      ...wh,
      day: wh.day.toLowerCase(),
      hasBreak: Boolean(wh.hasBreak),
      breakStart: wh.hasBreak ? wh.breakStart : null,
      breakEnd: wh.hasBreak ? wh.breakEnd : null
    }));

    res.json(barber);
  } catch (error) {
    console.error('Error fetching barber:', error);
    res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Prenotazioni guest
router.post('/public/appointments/guest', appointmentController.createGuestAppointment);

// Webhook Twilio
router.post('/webhook/twilio-status', (req, res) => {
  console.log('Webhook endpoint hit!');
  console.log('Request body:', req.body);

  try {
    const { MessageSid, MessageStatus, To, From } = req.body;
    console.log('Processing webhook data:', {
      MessageSid,
      MessageStatus,
      To,
      From
    });

    res.status(200).json({
      success: true,
      message: 'Webhook received'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========= MIDDLEWARE DI AUTENTICAZIONE =========
router.use(authenticateUser);

// ========= ROTTE AUTENTICATE =========
// Prenotazioni base
router.post('/', appointmentController.create);
router.get('/my-appointments', appointmentController.getUserAppointments);
router.put('/:id/cancel', appointmentController.cancel);
router.put('/:id/reschedule', appointmentController.reschedule);
router.put('/:id', appointmentController.updateAppointment);

// Disponibilità (versioni autenticate)
router.get('/available-slots', appointmentController.getAvailableSlots);
router.get('/barber/:barberId/availability', appointmentController.getBarberAvailability);

// ========= ROTTE ADMIN =========
// Gestione appuntamenti
router.get('/', requireAdmin, appointmentController.getAll);
router.get('/filtered', requireAdmin, appointmentController.getAllWithDateRange);
router.put('/:id/status', requireAdmin, appointmentController.updateStatus);
router.put('/:id/notes', requireAdmin, appointmentController.updateNotes);
router.get('/stats', requireAdmin, appointmentController.getStats);

// Calendario admin
router.get('/calendar/day', requireAdmin, appointmentController.getDayAppointments);
router.get('/calendar/week', requireAdmin, appointmentController.getWeekAppointments);
router.get('/calendar/month', requireAdmin, appointmentController.getMonthAppointments);
router.get('/calendar/barber/:barberId', requireAdmin, appointmentController.getBarberAppointments);
router.get('/barber/:barberId/schedule', requireAdmin, appointmentController.getBarberSchedule);

// Test e debug (solo admin)
router.post('/test-notification', requireAdmin, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    await notificationService.testWhatsAppNotification(phoneNumber);
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-scheduler', requireAdmin, async (req, res) => {
  try {
    await initializeScheduler();
    res.json({ message: 'Scheduler test triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook Twilio (solo admin)
router.post('/webhook/twilio-status',
  twilio.webhook({ validate: false }), // In produzione, impostare validate: true
  async (req, res) => {
    try {
      const {
        MessageSid,
        MessageStatus,
        To,
        From,
        ErrorCode,
        ErrorMessage
      } = req.body;

      console.log('Twilio Status Update:', {
        messageSid: MessageSid,
        status: MessageStatus,
        to: To,
        from: From,
        errorCode: ErrorCode,
        errorMessage: ErrorMessage
      });

      const appointment = await Appointment.findOne({
        'smsNotifications.messageSid': MessageSid
      });

      if (appointment) {
        appointment.smsNotifications = appointment.smsNotifications || [];
        appointment.smsNotifications.push({
          messageSid: MessageSid,
          status: MessageStatus,
          timestamp: new Date(),
          errorCode: ErrorCode,
          errorMessage: ErrorMessage
        });

        if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
          appointment.reminderSent = false;
          appointment.reminderRetries = (appointment.reminderRetries || 0) + 1;
        }

        await appointment.save();
        console.log(`Updated appointment ${appointment._id} with SMS status ${MessageStatus}`);
      }

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('Error processing Twilio webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error processing webhook'
      });
    }
});

export default router;
