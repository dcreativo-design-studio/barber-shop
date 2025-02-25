import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import twilio from 'twilio';
import Appointment from '../models/Appointment.js';
import { sendCancellationEmailToAdmin, sendCancellationEmailToClient, transporter } from './emailService.js';

// Debug delle variabili d'ambiente Twilio
console.log('Twilio environment variables check:', {
  ACCOUNT_SID_EXISTS: !!process.env.TWILIO_ACCOUNT_SID,
  ACCOUNT_SID_LENGTH: process.env.TWILIO_ACCOUNT_SID?.length,
  AUTH_TOKEN_EXISTS: !!process.env.TWILIO_AUTH_TOKEN,
  AUTH_TOKEN_LENGTH: process.env.TWILIO_AUTH_TOKEN?.length,
  PHONE_NUMBER_EXISTS: !!process.env.TWILIO_PHONE_NUMBER,
  WHATSAPP_NUMBER_EXISTS: !!process.env.TWILIO_WHATSAPP_NUMBER,
});
// Funzione helper per formattare i numeri di telefono svizzeri
const formatPhoneNumber = (phoneNumber) => {
  let cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '41' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
};

// Configurazione Twilio (condizionale)
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized successfully');
  } else {
    console.log('Twilio credentials not provided - SMS/WhatsApp features will be disabled');
  }
} catch (error) {
  console.log('Error initializing Twilio client:', error.message);
}

export const notificationService = {
  // Funzioni email esistenti...
  async sendCancellationEmail(appointment, user) {
    try {
      await sendCancellationEmailToClient(appointment, user);
    } catch (error) {
      console.error('Error sending cancellation email to client:', error);
    }
  },

  async sendAdminCancellationConfirmation(appointment, admin, client) {
    try {
      await sendCancellationEmailToAdmin(appointment, client);
    } catch (error) {
      console.error('Error sending cancellation email to admin:', error);
    }
  },

  async sendReminderEmail(appointment, user) {
    try {
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', dateOptions);

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'Promemoria Appuntamento - Your Style Barber',
        html: `
          <h2>Promemoria Appuntamento</h2>
          <p>Gentile ${user.firstName},</p>
          <p>Ti ricordiamo che hai un appuntamento domani:</p>
          <ul>
            <li><strong>Servizio:</strong> ${appointment.service}</li>
            <li><strong>Data:</strong> ${formattedDate}</li>
            <li><strong>Ora:</strong> ${appointment.time}</li>
            <li><strong>Barbiere:</strong> ${appointment.barber?.firstName} ${appointment.barber?.lastName}</li>
          </ul>
          <p>Indirizzo: Via Example 123, Lugano</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Reminder email sent successfully to:', user.email);
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  },

  async sendReminderSMS(appointment, user, retries = 3, delayBase = 2000) {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('Skipping SMS reminder - Twilio not configured');
      return false;
    }

    let attempt = 0;
    let lastError = null;

    const formatAppointmentMessage = (appointment) => {
      const date = format(new Date(appointment.date), 'd MMMM yyyy', { locale: it });
      return `Your Style Barber: Promemoria appuntamento per ${date} alle ${appointment.time} ` +
             `con ${appointment.barber?.firstName} per ${appointment.service}. ` +
             `Indirizzo: Via Example 123, Lugano.`;
    };

    while (attempt < retries) {
      try {
        const formattedPhone = this.formatPhoneNumber(user.phone);
        console.log(`Attempt ${attempt + 1}/${retries} - Sending SMS to:`, formattedPhone);

        // Configurazione debug
        console.log('Twilio Configuration:', {
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
          attempt: attempt + 1,
          isTrial: true
        });

        const message = await twilioClient.messages.create({
          body: formatAppointmentMessage(appointment),
          to: formattedPhone,
          from: process.env.TWILIO_PHONE_NUMBER,
          statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL
        });

        console.log('SMS sent successfully:', {
          messageId: message.sid,
          status: message.status,
          attempt: attempt + 1
        });

        return true; // Successo

      } catch (error) {
        lastError = error;
        attempt++;

        console.error(`SMS sending failed - Attempt ${attempt}/${retries}:`, {
          error: error.message,
          code: error.code,
          moreInfo: error.moreInfo,
          status: error.status,
          details: error.details
        });

        // Gestione specifica degli errori
        switch (error.code) {
          case 20003:
            console.error('Authentication error - Check Twilio credentials');
            await Appointment.findByIdAndUpdate(appointment._id, {
              lastReminderAttempt: new Date(),
              reminderError: 'Authentication error'
            });
            return false;

          case 21211:
            console.error('Invalid phone number format');
            await Appointment.findByIdAndUpdate(appointment._id, {
              lastReminderAttempt: new Date(),
              reminderError: 'Invalid phone number format'
            });
            return false;

          case 21608:
            console.error('Phone number not in allowed list (Trial account)');
            await Appointment.findByIdAndUpdate(appointment._id, {
              lastReminderAttempt: new Date(),
              reminderError: 'Phone number not in allowed list'
            });
            return false;

          default:
            // Per altri errori, aspetta prima di riprovare usando exponential backoff
            if (attempt < retries) {
              const delay = delayBase * Math.pow(2, attempt - 1);
              console.log(`Waiting ${delay}ms before next attempt...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
      }
    }

    // Se arriviamo qui, tutti i tentativi sono falliti
    console.error(`Failed to send SMS after ${retries} attempts`);

    await Appointment.findByIdAndUpdate(appointment._id, {
      lastReminderAttempt: new Date(),
      reminderError: lastError?.message || 'Max retries exceeded'
    });

    return false; // Fallimento dopo tutti i tentativi
},

  // Helper per formattare i numeri di telefono
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    let cleaned = phoneNumber.replace(/\D/g, '');

    // Gestione prefisso svizzero
    if (cleaned.startsWith('0')) {
      cleaned = '41' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    // Validazione base del formato
    if (cleaned.length < 11 || cleaned.length > 15) {
      throw new Error('Invalid phone number length');
    }

    return cleaned;
  },

  async sendWhatsAppMessage(appointment, user) {
    if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
      console.log('Skipping WhatsApp reminder - Twilio not configured');
      return false;
    }

    try {
      const formattedPhone = formatPhoneNumber(user.phone);
      console.log('Attempting to send WhatsApp reminder to:', formattedPhone);

      console.log('WhatsApp Configuration:', {
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedPhone}`,
        isTrial: true
      });

      const message = await twilioClient.messages.create({
        body: `Your Style Barber: Promemoria appuntamento domani alle ${appointment.time} con ${appointment.barber?.firstName} per ${appointment.service}. Ti aspettiamo in Via Example 123, Lugano.`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${formattedPhone}`
      });

      console.log('WhatsApp message sent successfully:', {
        messageId: message.sid,
        status: message.status
      });

      return true;  // Successo

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      await Appointment.findByIdAndUpdate(appointment._id, {
        lastReminderAttempt: new Date(),
        reminderError: error.message
      });
      return false;  // Fallimento
    }
},

  async sendAppointmentUpdateEmail(appointment, user) {
    try {
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', dateOptions);

      const emailContent = {
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'Appuntamento Modificato - Your Style Barber',
        html: `
          <h2>Conferma Modifica Appuntamento</h2>
          <p>Gentile ${user.firstName},</p>
          <p>Il tuo appuntamento è stato modificato. Ecco i nuovi dettagli:</p>
          <ul>
            <li><strong>Servizio:</strong> ${appointment.service}</li>
            <li><strong>Data:</strong> ${formattedDate}</li>
            <li><strong>Ora:</strong> ${appointment.time}</li>
            <li><strong>Barbiere:</strong> ${appointment.barber?.firstName} ${appointment.barber?.lastName}</li>
            <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
          </ul>
          <p>Indirizzo: Via Example 123, Lugano</p>
          <p>Ricorda che puoi modificare o cancellare l'appuntamento fino a 24 ore prima.</p>
        `
      };

      const info = await transporter.sendMail(emailContent);
      console.log('Update confirmation email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending update confirmation email:', error);
    }
  },
  async sendPasswordResetNotification(user, newPassword, admin) {
    // Controlla se l'utente ha un'email
    if (!user.email) {
      throw new Error('User email is required for password reset notification');
    }

    const emailSubject = 'La tua password è stata ripristinata';

    // Personalizza il saluto in base al ruolo
    let greeting = 'Gentile Cliente';
    if (user.role === 'barber') {
      greeting = 'Gentile Barbiere';
    } else if (user.role === 'admin') {
      greeting = 'Gentile Amministratore';
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
        <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">${emailSubject}</h2>
        <p>${greeting} ${user.firstName} ${user.lastName},</p>
        <p>Ti informiamo che la tua password è stata ripristinata da un amministratore del sistema.</p>
        <p>Le tue nuove credenziali di accesso sono:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Password:</strong> ${newPassword}</p>
        </div>
        <p>Ti consigliamo di modificare la password al primo accesso per mantenere sicuro il tuo account.</p>
        <p>Se non hai richiesto questo ripristino o hai domande, ti preghiamo di contattarci immediatamente.</p>
        <p style="margin-top: 30px; color: #777; font-size: 12px;">
          Questo è un messaggio automatico, si prega di non rispondere a questa email.
        </p>
      </div>
    `;

    try {
      // Utilizza il tuo sistema di invio email esistente
      await this.sendEmail({
        to: user.email,
        subject: emailSubject,
        html: emailContent
      });

      console.log(`Password reset email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error(`Error sending password reset email to ${user.email}:`, error);
      throw error;
    }
  }
};

export default notificationService;
