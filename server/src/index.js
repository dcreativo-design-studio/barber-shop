import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { testCloudinaryConnection } from './config/cloudinary.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import adminRoutes from './routes/adminRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import barberRoutes from './routes/barberRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import waitingListRoutes from './routes/waitingListRoutes.js';
import { initializeScheduler } from './services/appointmentScheduler.js';
import setupSocket from './services/socket.js';

// Carica le variabili d'ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurazione CORS aggiornata con supporto timezone
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-timezone',  // Aggiunto header per timezone
    'Access-Control-Allow-Headers'
  ],
  exposedHeaders: ['x-timezone'] // Espone l'header timezone
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Gestisce le richieste preflight

// Configura i limiti del body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '50mb'
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug middleware in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.file) {
      console.log('File received:', req.file);
    }
    next();
  });
}

// Aggiungi questo log prima della registrazione delle rotte
console.log('Registering routes...');
app.use('/api/appointments', appointmentRoutes);
console.log('Routes registered');

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Your Style Barber API v1.0',
    endpoints: {
      auth: '/api/auth',
      appointments: '/api/appointments',
      admin: '/api/admin',
      users: '/api/users',
      barbers: '/api/barbers',
      waitingList: '/api/waiting-list',
      services: '/api/services'
    },
    docs: 'https://api-docs.yourstylebarber.com' // URL placeholder per futura documentazione
  });
});

// Rotte API
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/waiting-list', waitingListRoutes);
app.use('/api/services', serviceRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});


// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.originalUrl);
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Configurazione MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Avvio del server
const startServer = async () => {
  try {
    await connectDB();

    // Inizializza lo scheduler degli appuntamenti
    initializeScheduler();
    console.log('Appointment scheduler initialized');

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server email pronto!`);
    });

    // Configura Socket.io
    setupSocket(server);

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
};

// Test Cloudinary connection
testCloudinaryConnection()
  .then(success => {
    if (success) {
      console.log('✅ Cloudinary connected successfully');
    } else {
      console.log('❌ Cloudinary connection failed');
    }
  });

startServer();
