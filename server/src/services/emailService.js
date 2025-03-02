import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',  // servizio predefinito Gmail invece di configurare host e port
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true
});

// Funzione di verifica migliorata
export const verifyEmailConfig = async () => {
  try {
    // Solo verifica della configurazione senza invio email di test
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};

// Funzione generale per l'invio di email
export const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email inviata con successo:', info.messageId);
    return info;
  } catch (error) {
    console.error('Errore invio email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendRegistrationEmail = async ({ to, user }) => {
  const mailOptions = {
    from: {
      name: 'Your Style Barber Studio',
      address: process.env.SMTP_USER
    },
    to: to,
    subject: 'Benvenuto in Your Style Barber Studio',
    html: `
      <h2>Registrazione completata con successo!</h2>
      <p>Ciao ${user.firstName},</p>
      <p>Grazie per esserti registrato. Ecco le tue credenziali di accesso:</p>
      <ul>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Password:</strong> ${user.password}</li>
      </ul>
      <p>Accedi per prenotare il tuo appuntamento.</p>
    `
  };

  try {
    console.log('Attempting to send registration email to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending registration email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });

    // Non bloccare il processo di registrazione se l'invio dell'email fallisce
    return false;
  }
};

export const sendBookingConfirmation = async ({ appointment, user }) => {
 const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
 const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', dateOptions);

 const barberMail = {
   from: process.env.SMTP_USER,
   to: process.env.BARBER_EMAIL,
   subject: 'Nuova Prenotazione - Your Style Barber',
   html: `
     <h2>Nuova Prenotazione</h2>
     <p>È stata effettuata una nuova prenotazione:</p>
     <ul>
       <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
       <li><strong>Email Cliente:</strong> ${user.email}</li>
       <li><strong>Telefono:</strong> ${user.phone}</li>
       <li><strong>Servizio:</strong> ${appointment.service}</li>
       <li><strong>Data:</strong> ${formattedDate}</li>
       <li><strong>Ora:</strong> ${appointment.time}</li>
       <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
     </ul>
   `
 };

 const clientMail = {
   from: process.env.SMTP_USER,
   to: user.email,
   subject: 'Conferma Prenotazione - Your Style Barber',
   html: `
     <h2>Conferma Prenotazione</h2>
     <p>Gentile ${user.firstName},</p>
     <p>La tua prenotazione è stata confermata con i seguenti dettagli:</p>
     <ul>
       <li><strong>Servizio:</strong> ${appointment.service}</li>
       <li><strong>Data:</strong> ${formattedDate}</li>
       <li><strong>Ora:</strong> ${appointment.time}</li>
       <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
     </ul>
     <p>Indirizzo: Via Example 123, Lugano</p>
     <p>Per cancellare o modificare l'appuntamento, accedi al tuo account.</p>
   `
 };

 try {
   const results = await Promise.all([
     transporter.sendMail(barberMail),
     transporter.sendMail(clientMail)
   ]);
   console.log('Email di conferma inviate con successo');
 } catch (error) {
   console.error('Errore invio email:', error);
   throw new Error('Errore invio email di conferma');
 }
};

// Nuova funzione per l'email di cancellazione al cliente
export const sendCancellationEmailToClient = async (appointment, user) => {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', dateOptions);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Cancellazione Appuntamento - Your Style Barber',
    html: `
      <h2>Cancellazione Appuntamento</h2>
      <p>Gentile ${user.firstName},</p>
      <p>Il tuo appuntamento è stato cancellato:</p>
      <ul>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
      <p>Motivo: ${appointment.cancellationReason || 'Non specificato'}</p>
      <p>Puoi prenotare un nuovo appuntamento quando vuoi attraverso il nostro sistema di prenotazione online.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email di cancellazione inviata al cliente con successo');
  } catch (error) {
    console.error('Errore invio email di cancellazione al cliente:', error);
    throw error;
  }
};

// Nuova funzione per l'email di cancellazione all'admin
export const sendCancellationEmailToAdmin = async (appointment, user) => {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', dateOptions);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.BARBER_EMAIL,
    subject: 'Cancellazione Appuntamento - Your Style Barber',
    html: `
      <h2>Cancellazione Appuntamento</h2>
      <p>Un appuntamento è stato cancellato:</p>
      <ul>
        <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Email Cliente:</strong> ${user.email}</li>
        <li><strong>Telefono:</strong> ${user.phone}</li>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
      <p><strong>Motivo cancellazione:</strong> ${appointment.cancellationReason || 'Non specificato'}</p>
      <p>Lo slot è ora disponibile per nuove prenotazioni.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email di cancellazione inviata all\'admin con successo');
  } catch (error) {
    console.error('Errore invio email di cancellazione all\'admin:', error);
    throw error;
  }
};

// Funzione di test per verificare la configurazione email
// Funzione di test per verificare la configurazione email
export const testEmailConfiguration = async () => {
  try {
    // Sostituiamo il test con la semplice verifica della configurazione
    // senza inviare l'email di test
    await transporter.verify();
    console.log('Configurazione email verificata con successo');
    return true;
  } catch (error) {
    console.error('Errore verifica configurazione email:', error);
    throw error;
  }
};

export const sendCancellationNotification = async ({ appointment, user }) => {
 const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
 const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', dateOptions);

 const barberMail = {
   from: process.env.SMTP_USER,
   to: process.env.BARBER_EMAIL,
   subject: 'Cancellazione Appuntamento - Your Style Barber',
   html: `
     <h2>Cancellazione Appuntamento</h2>
     <p>Un appuntamento è stato cancellato:</p>
     <ul>
       <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
       <li><strong>Servizio:</strong> ${appointment.service}</li>
       <li><strong>Data:</strong> ${formattedDate}</li>
       <li><strong>Ora:</strong> ${appointment.time}</li>
     </ul>
   `
 };

 try {
   await transporter.sendMail(barberMail);
   console.log('Email di cancellazione inviata con successo');
 } catch (error) {
   console.error('Errore invio email cancellazione:', error);
   throw new Error('Errore invio email di cancellazione');
 }
};

export const sendReminderEmail = async (appointment, user) => {
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
        <li><strong>Barbiere:</strong> ${appointment.barber.firstName} ${appointment.barber.lastName}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
      <p><strong>Indirizzo:</strong> Via Example 123, Lugano</p>
      <p>Se non puoi presentarti, ti preghiamo di cancellare l'appuntamento con almeno 24 ore di anticipo.</p>
      <p>Ti aspettiamo!</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

// Nuova funzione per l'email di cambio password
export const sendPasswordChangeEmail = async (user) => {
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome'
  };

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Conferma Cambio Password - Your Style Barber',
    html: `
      <h2>Conferma Cambio Password</h2>
      <p>Gentile ${user.firstName},</p>
      <p>La tua password è stata modificata con successo il ${new Date().toLocaleDateString('it-IT', dateOptions)}.</p>
      <p>Se non hai effettuato tu questa modifica, contatta immediatamente il nostro supporto.</p>
      <p>Your Style Barber Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email di conferma cambio password inviata con successo');
  } catch (error) {
    console.error('Errore invio email conferma cambio password:', error);
    throw new Error('Errore invio email conferma cambio password');
  }
};

export const sendBarberRegistrationEmail = async ({ to, barber, password }) => {
  const mailOptions = {
    from: {
      name: 'Your Style Barber Studio',
      address: process.env.SMTP_USER
    },
    to: to,
    subject: 'Benvenuto in Your Style Barber Studio - Credenziali di accesso',
    html: `
      <h2>Benvenuto in Your Style Barber Studio!</h2>
      <p>Ciao ${barber.firstName},</p>
      <p>Sei stato registrato come barbiere nel nostro sistema.</p>
      <p>Ecco le tue credenziali di accesso:</p>
      <ul>
        <li><strong>Email:</strong> ${barber.email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Puoi accedere al tuo pannello personale visitando il nostro sito web e cliccando su "Login".</p>
      <p>Ti consigliamo di cambiare la password dopo il primo accesso.</p>
      <p>Nel tuo pannello personale potrai:</p>
      <ul>
        <li>Visualizzare e gestire i tuoi appuntamenti</li>
        <li>Modificare i tuoi orari di lavoro</li>
        <li>Impostare periodi di ferie o vacanza</li>
        <li>Gestire i servizi che offri</li>
      </ul>
      <p>Per qualsiasi domanda, non esitare a contattarci.</p>
      <p>Cordiali saluti,<br/>Il team di Your Style Barber Studio</p>
    `
  };

  try {
    console.log('Attempting to send barber registration email to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Barber registration email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending barber registration email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};

export const sendBarberScheduleUpdateEmail = async (barber) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'Aggiornamento Orari Barbiere - Your Style Barber',
    html: `
      <h2>Aggiornamento Orari Barbiere</h2>
      <p>Il barbiere ${barber.firstName} ${barber.lastName} ha aggiornato i suoi orari di lavoro o periodi di vacanza.</p>
      <p>Accedi al pannello amministrativo per visualizzare i dettagli aggiornati.</p>
      <p>Cordiali saluti,<br/>Il sistema Your Style Barber Studio</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Schedule update notification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending schedule update notification email:', error);
    return false;
  }
};


export default {
  sendEmail,
  sendRegistrationEmail,
  sendBookingConfirmation,
  sendCancellationEmailToClient,
  sendCancellationEmailToAdmin,
  sendCancellationNotification,
  sendReminderEmail,
  testEmailConfiguration,
  sendPasswordChangeEmail,
  sendBarberRegistrationEmail,
  sendBarberScheduleUpdateEmail
};
