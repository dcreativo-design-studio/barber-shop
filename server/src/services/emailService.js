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

// Template HTML condiviso per tutte le email
const createEmailTemplate = (content) => {
  return `
  <!DOCTYPE html>
  <html lang="it">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Style Barber Studio</title>
    <style>
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f7f7f7;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 0;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #1a1a1a;
        color: #fff;
        padding: 25px 20px;
        text-align: center;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        margin-bottom: 0;
      }
      .footer {
        background-color: #1a1a1a;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #eee;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        margin-top: 0;
      }
      h1, h2 {
        color: #1a1a1a;
        margin-top: 0;
      }
      .header h1 {
        color: #fff;
        margin: 0;
        font-size: 28px;
        letter-spacing: 1px;
      }
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #fff;
        text-decoration: none;
        letter-spacing: 1px;
      }
      .content {
        padding: 30px;
      }
      .details {
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 6px;
        margin: 20px 0;
        border-left: 4px solid #1a1a1a;
      }
      .details ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      .details li {
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .details li:last-child {
        border-bottom: none;
      }
      .button {
        display: inline-block;
        background-color: #1a1a1a;
        color: #fff;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 14px;
      }
      .button:hover {
        background-color: #333;
      }
      .address {
        margin-top: 15px;
        font-style: italic;
      }
      .social {
        margin: 20px 0;
      }
      .social a {
        margin: 0 10px;
        color: #fff;
        text-decoration: none;
        transition: color 0.3s;
      }
      .social a:hover {
        color: #ccc;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">YOUR STYLE BARBER STUDIO</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Your Style Barber Studio</p>
        <p class="address">Via Zurigo 2, Lugano, Svizzera</p>
        <p>Tel: +41 78 930 15 99</p>
        <div class="social">
          <a href="https://www.instagram.com/yourstylelugano/">Instagram</a> | <a href="#">Facebook</a> | <a href="https://yourstyle.dcreativo.ch/">Website</a>
        </div>
        <p>&copy; ${new Date().getFullYear()} Your Style Barber Studio. Tutti i diritti riservati.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const sendRegistrationEmail = async ({ to, user }) => {
  const content = `
    <h2>Registrazione completata con successo!</h2>
    <p>Ciao ${user.firstName},</p>
    <p>Grazie per esserti registrato. Ecco le tue credenziali di accesso:</p>
    <div class="details">
      <ul>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Password:</strong> ${user.password}</li>
      </ul>
    </div>
    <p>Accedi per prenotare il tuo appuntamento.</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  const mailOptions = {
    from: {
      name: 'Your Style Barber Studio',
      address: process.env.SMTP_USER
    },
    to: to,
    subject: 'Benvenuto in Your Style Barber Studio',
    html: createEmailTemplate(content)
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

  // Contenuto email per l'amministratore
  const adminContent = `
    <h2>Nuova Prenotazione</h2>
    <p>È stata effettuata una nuova prenotazione:</p>
    <div class="details">
      <ul>
        <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Email Cliente:</strong> ${user.email}</li>
        <li><strong>Telefono:</strong> ${user.phone}</li>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Barbiere:</strong> ${appointment.barber?.firstName} ${appointment.barber?.lastName}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
    </div>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  // Contenuto email per il cliente
  const clientContent = `
    <h2>Conferma Prenotazione</h2>
    <p>Gentile ${user.firstName},</p>
    <p>La tua prenotazione è stata confermata con i seguenti dettagli:</p>
    <div class="details">
      <ul>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Barbiere:</strong> ${appointment.barber?.firstName} ${appointment.barber?.lastName}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
    </div>
    <p class="address">Ti aspettiamo in Via Zurigo 2, Lugano</p>
    <p>Per cancellare o modificare l'appuntamento, accedi al tuo account.</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  // Contenuto email per il barbiere
  const barberContent = `
    <h2>Nuovo Appuntamento Prenotato</h2>
    <p>Ciao ${appointment.barber?.firstName},</p>
    <p>È stato prenotato un nuovo appuntamento con te:</p>
    <div class="details">
      <ul>
        <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
    </div>
    <p>Puoi visualizzare tutti i tuoi appuntamenti accedendo al tuo account.</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  const barberMail = {
    from: process.env.SMTP_USER,
    to: process.env.BARBER_EMAIL,
    subject: 'Nuova Prenotazione - Your Style Barber Studio',
    html: createEmailTemplate(adminContent)
  };

  const clientMail = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Conferma Prenotazione - Your Style Barber Studio',
    html: createEmailTemplate(clientContent)
  };

  // Email al barbiere selezionato (se esiste)
  const barberPersonalMail = {
    from: process.env.SMTP_USER,
    to: appointment.barber?.email,
    subject: 'Nuovo Appuntamento - Your Style Barber Studio',
    html: createEmailTemplate(barberContent)
  };

  try {
    const emailPromises = [
      transporter.sendMail(barberMail),
      transporter.sendMail(clientMail)
    ];

    // Aggiungi l'email al barbiere se è presente l'informazione
    if (appointment.barber && appointment.barber.email) {
      emailPromises.push(transporter.sendMail(barberPersonalMail));
      console.log('Invio email di notifica al barbiere:', appointment.barber.email);
    } else {
      console.log('Nessuna email del barbiere trovata per la notifica');
    }

    const results = await Promise.all(emailPromises);
    console.log('Email di conferma inviate con successo');
    return results;
  } catch (error) {
    console.error('Errore invio email:', error);
    throw new Error('Errore invio email di conferma');
  }
};

// Nuova funzione per l'email di cancellazione al cliente
export const sendCancellationEmailToClient = async (appointment, user) => {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', dateOptions);

  const content = `
    <h2>Cancellazione Appuntamento</h2>
    <p>Gentile ${user.firstName},</p>
    <p>Il tuo appuntamento è stato cancellato:</p>
    <div class="details">
      <ul>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Barbiere:</strong> ${appointment.barber?.firstName} ${appointment.barber?.lastName}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
    </div>
    <p><strong>Motivo:</strong> ${appointment.cancellationReason || 'Non specificato'}</p>
    <p>Puoi prenotare un nuovo appuntamento quando vuoi attraverso il nostro sistema di prenotazione online.</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Prenota nuovo appuntamento</a>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Cancellazione Appuntamento - Your Style Barber Studio',
    html: createEmailTemplate(content)
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

  const content = `
    <h2>Cancellazione Appuntamento</h2>
    <p>Un appuntamento è stato cancellato:</p>
    <div class="details">
      <ul>
        <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Email Cliente:</strong> ${user.email}</li>
        <li><strong>Telefono:</strong> ${user.phone}</li>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Barbiere:</strong> ${appointment.barber?.firstName} ${appointment.barber?.lastName}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
    </div>
    <p><strong>Motivo cancellazione:</strong> ${appointment.cancellationReason || 'Non specificato'}</p>
    <p>Lo slot è ora disponibile per nuove prenotazioni.</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.BARBER_EMAIL,
    subject: 'Cancellazione Appuntamento - Your Style Barber Studio',
    html: createEmailTemplate(content)
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

  const content = `
    <h2>Cancellazione Appuntamento</h2>
    <p>Un appuntamento è stato cancellato:</p>
    <div class="details">
      <ul>
        <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Barbiere:</strong> ${appointment.barber?.firstName} ${appointment.barber?.lastName}</li>
      </ul>
    </div>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  const barberMail = {
    from: process.env.SMTP_USER,
    to: process.env.BARBER_EMAIL,
    subject: 'Cancellazione Appuntamento - Your Style Barber Studio',
    html: createEmailTemplate(content)
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

  const content = `
    <h2>Promemoria Appuntamento</h2>
    <p>Gentile ${user.firstName},</p>
    <p>Ti ricordiamo che hai un appuntamento domani:</p>
    <div class="details">
      <ul>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
        <li><strong>Barbiere:</strong> ${appointment.barber?.firstName} ${appointment.barber?.lastName}</li>
        <li><strong>Prezzo:</strong> CHF${appointment.price}</li>
      </ul>
    </div>
    <p><strong>Indirizzo:</strong> Via Zurigo 2, Lugano</p>
    <p>Se non puoi presentarti, ti preghiamo di cancellare l'appuntamento con almeno 24 ore di anticipo.</p>
    <p>Ti aspettiamo!</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Gestisci Appuntamenti</a>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Promemoria Appuntamento - Your Style Barber Studio',
    html: createEmailTemplate(content)
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

  const content = `
    <h2>Conferma Cambio Password</h2>
    <p>Gentile ${user.firstName},</p>
    <p>La tua password è stata modificata con successo il ${new Date().toLocaleDateString('it-IT', dateOptions)}.</p>
    <p>Se non hai effettuato tu questa modifica, contatta immediatamente il nostro supporto.</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  const htmlContent = createEmailTemplate(content);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Conferma Cambio Password - Your Style Barber Studio',
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email di conferma cambio password inviata con successo a:', user.email);
    return true;
  } catch (error) {
    console.error('Errore invio email conferma cambio password:', error);
    throw new Error('Errore invio email conferma cambio password');
  }
};

export const sendBarberRegistrationEmail = async ({ to, barber, password }) => {
  const content = `
    <h2>Benvenuto in Your Style Barber Studio!</h2>
    <p>Ciao ${barber.firstName},</p>
    <p>Sei stato registrato come barbiere nel nostro sistema.</p>
    <div class="details">
      <ul>
        <li><strong>Email:</strong> ${barber.email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
    </div>
    <p>Ti consigliamo di cambiare la password dopo il primo accesso.</p>
    <p>Nel tuo pannello personale potrai:</p>
    <ul>
      <li>Visualizzare e gestire i tuoi appuntamenti</li>
      <li>Modificare i tuoi orari di lavoro</li>
      <li>Impostare periodi di ferie o vacanza</li>
      <li>Gestire i servizi che offri</li>
    </ul>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  const mailOptions = {
    from: {
      name: 'Your Style Barber Studio',
      address: process.env.SMTP_USER
    },
    to: to,
    subject: 'Benvenuto in Your Style Barber Studio - Credenziali di accesso',
    html: createEmailTemplate(content)
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
  const content = `
    <h2>Aggiornamento Orari Barbiere</h2>
    <p>Il barbiere ${barber.firstName} ${barber.lastName} ha aggiornato i suoi orari di lavoro o periodi di vacanza.</p>
    <p>Accedi al pannello amministrativo per visualizzare i dettagli aggiornati.</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Accedi al pannello</a>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'Aggiornamento Orari Barbiere - Your Style Barber Studio',
    html: createEmailTemplate(content)
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

// Funzione per notificare il barbiere in caso di cancellazione dell'appuntamento
export const sendBarberCancellationNotification = async (appointment, user) => {
  // Verificare che il barbiere esista nell'appuntamento
  if (!appointment.barber || !appointment.barber.email) {
    console.log('Nessuna email del barbiere trovata per la notifica di cancellazione');
    return false;
  }

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', dateOptions);

  const content = `
    <h2>Appuntamento Cancellato</h2>
    <p>Ciao ${appointment.barber.firstName},</p>
    <p>Un appuntamento è stato cancellato:</p>
    <div class="details">
      <ul>
        <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Servizio:</strong> ${appointment.service}</li>
        <li><strong>Data:</strong> ${formattedDate}</li>
        <li><strong>Ora:</strong> ${appointment.time}</li>
      </ul>
    </div>
    <p><strong>Motivo cancellazione:</strong> ${appointment.cancellationReason || 'Non specificato'}</p>
    <p>Lo slot è ora disponibile per nuove prenotazioni.</p>
    <div style="text-align: center;">
      <a href="https://yourstyle.dcreativo.ch/login" class="button">Visualizza Agenda</a>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: appointment.barber.email,
    subject: 'Appuntamento Cancellato - Your Style Barber Studio',
    html: createEmailTemplate(content)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email di cancellazione inviata al barbiere con successo');
    return true;
  } catch (error) {
    console.error('Errore invio email di cancellazione al barbiere:', error);
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
  sendBarberScheduleUpdateEmail,
  sendBarberCancellationNotification
};
