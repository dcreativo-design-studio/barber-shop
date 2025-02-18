import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email o password non validi');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Mostra l'animazione di successo
      setLoginSuccess(true);
      await login(data.user);

      // Aspetta che l'animazione finisca prima di reindirizzare
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Email o password non validi');
      setLoginSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setResetMessage('');
      setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg relative overflow-hidden">
        {/* Animazione di successo */}
        {loginSuccess && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
              <p className="text-white text-lg font-semibold">
                Accesso effettuato con successo!
              </p>
            </div>
          </div>
        )}

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-cyan-400">
            {showResetForm ? 'Reset Password' : 'Accedi al tuo account'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-center animate-shake">
            {error}
          </div>
        )}

        {resetMessage && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded text-center animate-fade-in">
            {resetMessage}
          </div>
        )}

        {!showResetForm ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  placeholder="Email"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" aria-label="Nascondi password" />
                  ) : (
                    <EyeOff className="h-5 w-5" aria-label="Mostra password" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Accesso in corso...</span>
                  </>
                ) : (
                  <span>Accedi</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                placeholder="Inserisci la tua email"
              />
            </div>
            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Invio in corso...</span>
                  </>
                ) : (
                  <span>Ripristina password</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetForm(false);
                  setError('');
                  setResetMessage('');
                }}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
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
