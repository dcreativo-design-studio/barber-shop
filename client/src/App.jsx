import { SpeedInsights } from '@vercel/speed-insights/react'; // Import for React (not Next.js)
import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BarberDashboard from './components/barber/BarberDashboard';
import BookingCalendar from './components/BookingCalendar';
import GuestBooking from './components/GuestBooking';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { TimezoneProvider } from './context/TimezoneContext';
import UserProfile from './pages/UserProfile';
import WaitingList from './pages/WaitingList';

function App() {
  const [theme, setTheme] = useState('dark');
  const { user } = useAuth();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const renderRoutes = () => (
    <Routes>
      {/* Route pubbliche - accessibili a tutti */}
      <Route path="/guest-booking" element={<GuestBooking />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Route protette - richiedono autenticazione */}
      <Route
        path="/booking"
        element={user ? <BookingCalendar /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/waiting-list"
        element={user ? <WaitingList /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin"
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />}
      />
      {/* Nuova rotta per il pannello barbiere */}
      <Route
        path="/barber"
        element={
          user?.role === 'barber' || user?.role === 'admin'
            ? <BarberDashboard />
            : <Navigate to="/" replace />
        }
      />
      <Route
        path="/profile"
        element={user ? <UserProfile /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/"
        element={
          <div className="text-center pt-20 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-[var(--accent)] hover-scale">
              Your Style Barber Studio
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-6">
              Il tuo stile, la nostra passione
            </p>
            {user ? (
              <div className="space-y-4">
                <p className="text-lg text-[var(--accent)] mb-6 animate-slide-in">
                  Benvenuto, {user.firstName}!
                </p>
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="inline-block bg-[var(--accent)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover-glow"
                  >
                    Dashboard Admin
                  </Link>
                ) : user.role === 'barber' ? (
                  <Link
                    to="/barber"
                    className="inline-block bg-[var(--accent)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover-glow"
                  >
                    Pannello Barbiere
                  </Link>
                ) : (
                  <BookingCalendar />
                )}
              </div>
            ) : (
              <div className="space-y-4 mt-8 animate-slide-in">
                <p className="text-lg mb-6">
                  Accedi, registrati o prenota come ospite
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    to="/login"
                    className="bg-[var(--accent)] hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover-glow"
                  >
                    Accedi
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover-glow"
                  >
                    Registrati
                  </Link>
                  <Link
                    to="/guest-booking"
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 hover-glow"
                  >
                    Prenota come ospite
                  </Link>
                </div>
              </div>
            )}
          </div>
        }
      />
    </Routes>
  );

  return (
    <TimezoneProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] theme-transition">
        <Navbar onThemeToggle={toggleTheme} isDark={theme === 'dark'} />
        <main className="container mx-auto px-4 navbar-offset">
          {renderRoutes()}
        </main>
        {/* Add the SpeedInsights component */}
        <SpeedInsights />
      </div>
    </TimezoneProvider>
  );
}

export default App;
