import { Scissors } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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
  // Aggiungi questo flag per prevenire il loop
  const initialRenderDone = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    // Imposta il flag a true dopo il primo render
    initialRenderDone.current = true;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Componente HomePage modificato - senza redirect condizionali
  const HomePage = () => {
    // Migliora le performance delle animazioni
    return (
      <div className="animate-fade-in stabilize-render">
        {/* Hero section con effetto parallasse */}
        <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          {/* Overlay semitrasparente */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.7)] to-[var(--bg-primary)] z-0"></div>

          {/* Contenuto hero */}
          <div className="z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-[var(--accent)] hover-scale">
              Your Style <span className="text-white">Barber Studio</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Il tuo stile, la nostra passione. Esperienza di barberia premium per l'uomo moderno.
            </p>

            {/* CTA principale */}
            {user ? (
              <div className="space-y-4">
                <p className="text-lg text-[var(--accent)] mb-6 animate-slide-in">
                  Benvenuto, {user.firstName}!
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="inline-block bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 hover-glow"
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  {user.role === 'barber' && (
                    <Link
                      to="/barber"
                      className="inline-block bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 hover-glow"
                    >
                      Pannello Barbiere
                    </Link>
                  )}
                  {user.role !== 'admin' && user.role !== 'barber' && (
                    <Link
                      to="/booking"
                      className="inline-block bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 hover-glow"
                    >
                      Prenota Subito
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-slide-in">
                <p className="text-xl mb-4 text-gray-300">
                  Esperienza di taglio superiore per ogni cliente
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to="/login"
                    className="bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 hover-glow"
                  >
                    Accedi
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 hover-glow"
                  >
                    Registrati
                  </Link>
                  <Link
                    to="/guest-booking"
                    className="bg-transparent border-2 border-white hover:border-[var(--accent)] text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all duration-300 hover-glow"
                  >
                    Prenota come ospite
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sezione servizi */}
        <div className="py-20 bg-[var(--bg-secondary)]">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[var(--accent)]">
              I Nostri Servizi Premium
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Servizio 1 */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-6 shadow-lg hover-scale transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-[var(--accent)] text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-[var(--accent)]">Taglio Classico</h3>
                <p className="text-center text-[var(--text-primary)] opacity-90">
                  Esperienza di taglio tradizionale con prodotti di alta qualità e attenzione ai dettagli.
                </p>
              </div>

              {/* Servizio 2 */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-6 shadow-lg hover-scale transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-[var(--accent)] text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-[var(--accent)]">Barba e Baffi</h3>
                <p className="text-center text-[var(--text-primary)] opacity-90">
                  Rifinitura e modellatura professionale con trattamenti specifici per la cura della barba.
                </p>
              </div>

              {/* Servizio 3 */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-6 shadow-lg hover-scale transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-[var(--accent)] text-white rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-[var(--accent)]">Trattamenti Speciali</h3>
                <p className="text-center text-[var(--text-primary)] opacity-90">
                  Massaggi, trattamenti con asciugamani caldi e prodotti esclusivi per un'esperienza premium.
                </p>
              </div>
            </div>
          </div>
        </div>

         {/* Call to action */}
         <div className="py-16 bg-[var(--bg-primary)]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--accent)]">
              Pronto a rinnovare il tuo look?
            </h2>
            <p className="text-xl text-[var(--text-primary)] opacity-90 mb-8">
              Prenota subito un appuntamento e affidati ai nostri esperti barbieri
            </p>
            <Link
              to={user ? "/booking" : "/guest-booking"}
              className="inline-block bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 hover-glow"
            >
              Prenota Ora
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 bg-[var(--bg-secondary)] border-t border-gray-700">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-[var(--text-primary)] opacity-70">
              © {new Date().getFullYear()} Your Style Barber Studio. Tutti i diritti riservati.
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <a href="#" className="text-[var(--accent)] hover:opacity-80 transition-opacity">Privacy</a>
              <a href="#" className="text-[var(--accent)] hover:opacity-80 transition-opacity">Termini</a>
              <a href="#" className="text-[var(--accent)] hover:opacity-80 transition-opacity">Contatti</a>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  const renderRoutes = () => {
    // Se siamo al primo render, return null per evitare redirect prematuri
    if (!initialRenderDone.current) {
      return null;
    }

    return (
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
        <Route path="/" element={<HomePage />} />
      </Routes>
    );
  };

  return (
    <TimezoneProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] theme-transition">
        <Navbar onThemeToggle={toggleTheme} isDark={theme === 'dark'} />
        <main className="navbar-offset stabilize-render">
          {renderRoutes()}
        </main>
      </div>
    </TimezoneProvider>
  );
}

export default App;
