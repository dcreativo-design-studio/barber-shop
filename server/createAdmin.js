import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import User from './src/models/User.js';

// Connessione a MongoDB
mongoose.connect('mongodb+srv://barbershop_admin:acfI8LmMS3mPDxVO@cluster0.zq0j0.mongodb.net/yourstylebarber?retryWrites=true&w=majority');

const createAdmin = async () => {
  try {
    const password = "Admin123!"; // Password per l'admin
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const adminUser = await User.create({
      email: "info@dcreativo.ch",
      password: hashedPassword,
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      phone: "+41123456789",
      isGuest: false
    });

    console.log('Admin user created:', adminUser);
    console.log('Password non hashata (salva questa password):', password);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
