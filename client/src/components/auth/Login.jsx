import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Importante per CORS
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email o password non validi');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      await login(data.user);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Email o password non validi');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setResetMessage('');

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore nel reset della password');
      }

      setResetMessage('Password resettata con successo! Controlla la tua email per le istruzioni.');
      setTimeout(() => {
        setShowResetForm(false);
        setResetEmail('');
        setResetMessage('');
      }, 5000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Errore nel reset della password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-cyan-400">
            {showResetForm ? 'Reset Password' : 'Accedi al tuo account'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded text-center">
            {error}
          </div>
        )}

        {resetMessage && (
          <div className="bg-green-500 text-white p-3 rounded text-center">
            {resetMessage}
          </div>
        )}

        {!showResetForm ? (
          // Login Form
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Email"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" aria-label="Nascondi password" />
                ) : (
                  <EyeOff className="h-5 w-5" aria-label="Mostra password" />
                )}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded transition duration-300"
              >
                Accedi
              </button>
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              >
                Password dimenticata?
              </button>
            </div>
          </form>
        ) : (
          // Reset Password Form
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Inserisci la tua email"
              />
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded transition duration-300"
              >
                Ripristina password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetForm(false);
                  setError('');
                  setResetMessage('');
                }}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              >
                Torna al login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
