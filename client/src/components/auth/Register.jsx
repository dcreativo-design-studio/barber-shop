import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Errore durante la registrazione');
      }

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Errore durante la registrazione');
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-cyan-400">
         Crea il tuo account
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Nome"
              required
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Cognome"
              required
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400"
            />
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Email"
            required
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400"
          />

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="Telefono"
            required
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Password"
              required
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
            >
              {showPassword ? (
                <Eye className="h-5 w-5" aria-label="Nascondi password" />
              ) : (
                <EyeOff className="h-5 w-5" aria-label="Mostra password" />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Conferma Password"
              required
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
            >
              {showConfirmPassword ? (
                <Eye className="h-5 w-5" aria-label="Nascondi password di conferma" />
              ) : (
                <EyeOff className="h-5 w-5" aria-label="Mostra password di conferma" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded transition-all duration-300"
          >
            Registrati
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
