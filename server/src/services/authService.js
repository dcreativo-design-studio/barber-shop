import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, role) => {  // Cambiato da userId a id
  return jwt.sign(
    { id, role },  // Cambiato da userId a id
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const authService = {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(userData.password, salt);

    const user = new User({
      ...userData,
      password: hashedPassword
    });

    await user.save();

    const token = generateToken(user._id, user.role);
    return { user: { ...user.toObject(), password: undefined }, token };
  },

  async login(email, password) {
    console.log('Login attempt for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      throw new Error('Email o password non validi');
    }

    console.log('Found user, verifying password');
    console.log('Stored password hash:', user.password);

    const isMatch = await bcryptjs.compare(password, user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      throw new Error('Email o password non validi');
    }

    const token = generateToken(user._id, user.role);
    const userWithoutPassword = { ...user.toObject(), password: undefined };

    console.log('Login successful:', {
      email,
      id: user._id,  // Cambiato da userId a id
      role: user.role
    });

    return { user: userWithoutPassword, token };
  },

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Supporta sia id che userId per retrocompatibilità
      const userId = decoded.id || decoded.userId;
      const user = await User.findById(userId).select('-password');

      if (!user) {
        throw new Error('Utente non trovato');
      }
      return user;
    } catch (error) {
      throw new Error('Token non valido');
    }
  }
};
