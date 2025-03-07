import { Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
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
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Check for theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // Update theme when it changes elsewhere in the app
  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    };

    window.addEventListener('storage', handleThemeChange);
    // Optional: listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleThemeChange);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      setIsLoading(false);
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

      // Successful registration
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Errore durante la registrazione');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Dynamic class names based on theme
  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100';
  const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const inputBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorderClass = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const buttonHoverClass = theme === 'dark' ? 'hover:bg-cyan-700' : 'hover:bg-cyan-500';
  const iconColorClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const iconHoverClass = theme === 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-700';
  const titleColorClass = theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600';
  const shadowClass = theme === 'dark' ? 'shadow-lg' : 'shadow-md';
  const errorBgClass = theme === 'dark' ? 'bg-red-900/20' : 'bg-red-100';
  const errorTextClass = theme === 'dark' ? 'text-red-400' : 'text-red-600';
  const errorBorderClass = theme === 'dark' ? 'border-red-700' : 'border-red-300';

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgClass} transition-colors duration-200`}>
      <div className={`max-w-md w-full space-y-6 p-8 ${cardBgClass} rounded-lg ${shadowClass} transition-colors duration-200`}>
        <h2 className={`text-3xl font-bold text-center ${titleColorClass}`}>
          Crea il tuo account
        </h2>

        {error && (
          <div className={`${errorBgClass} ${errorTextClass} border ${errorBorderClass} p-3 rounded text-center`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Nome</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Nome"
                required
                className={`w-full p-3 rounded ${inputBgClass} ${textClass} border ${inputBorderClass} focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all`}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Cognome</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Cognome"
                required
                className={`w-full p-3 rounded ${inputBgClass} ${textClass} border ${inputBorderClass} focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Email"
              required
              className={`w-full p-3 rounded ${inputBgClass} ${textClass} border ${inputBorderClass} focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all`}
            />
          </div>

          <div>
            <label htmlFor="phone" className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Telefono</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Telefono"
              required
              className={`w-full p-3 rounded ${inputBgClass} ${textClass} border ${inputBorderClass} focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all`}
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Password"
                required
                className={`w-full p-3 rounded ${inputBgClass} ${textClass} border ${inputBorderClass} focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${iconColorClass} ${iconHoverClass} transition-colors`}
              >
                {showPassword ? (
                  <Eye className="h-5 w-5" aria-label="Nascondi password" />
                ) : (
                  <EyeOff className="h-5 w-5" aria-label="Mostra password" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>Conferma Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Conferma Password"
                required
                className={`w-full p-3 rounded ${inputBgClass} ${textClass} border ${inputBorderClass} focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${iconColorClass} ${iconHoverClass} transition-colors`}
              >
                {showConfirmPassword ? (
                  <Eye className="h-5 w-5" aria-label="Nascondi password di conferma" />
                ) : (
                  <EyeOff className="h-5 w-5" aria-label="Mostra password di conferma" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-cyan-600 ${buttonHoverClass} text-white font-bold py-3 px-4 rounded transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registrazione in corso...</span>
                </>
              ) : (
                <span>Registrati</span>
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className={textSecondaryClass}>
              Hai già un account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-cyan-500 hover:text-cyan-600 font-medium transition-colors"
              >
                Accedi
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
