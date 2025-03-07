import { Scissors } from 'lucide-react';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

// Componente di caricamento
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--accent)]"></div>
  </div>
);

function App() {
  const [theme, setTheme] = useState(() => {
    // Recupera il tema dal localStorage o usa 'dark' come default
    return localStorage.getItem('theme') || 'dark';
  });
  const { user } = useAuth();
  const initialRenderRef = useRef(true);
  const location = useLocation();
  const [appReady, setAppReady] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Imposta il tema e assicurati che sia applicato subito
  useEffect(() => {
    // Imposta il tema al primo caricamento
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Imposta un timer per garantire che il contenuto appaia
    const timer = setTimeout(() => {
      setAppReady(true);

      // Ulteriore timer per garantire che la transizione sia fluida
      setTimeout(() => {
        setPageLoaded(true);
        initialRenderRef.current = false;
      }, 100);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Effetto aggiuntivo per resettare lo stato della pagina quando cambia la location
  useEffect(() => {
    if (!initialRenderRef.current) {
      // Reset dello stato per evitare sfarfallio tra pagine
      setPageLoaded(false);
      setTimeout(() => setPageLoaded(true), 50);
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Componente HomePage migliorato
  const HomePage = () => {
    return (
      <div className={`w-full transition-opacity duration-300 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Hero section principale */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.7)] to-[var(--bg-primary)] z-0"></div>

          {/* Contenuto hero */}
          <div className="z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-[var(--accent)] hover-scale">
              Your Style <span className="text-white">Barber Studio</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Il tuo stile, la nostra passione. Esperienza di barberia premium per l'uomo moderno.
            </p>

            {/* CTA principale - Logica condizionale semplificata */}
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
        </section>

        {/* Sezione servizi */}
        <section className="py-20 bg-[var(--bg-secondary)]">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[var(--accent)]">
              I Nostri Servizi Premium
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Servizio 1 */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-6 shadow-lg hover-scale transform hover:-translate-y-1 transition-all duration-300 service-card">
                <div className="w-16 h-16 bg-[var(--accent)] text-white rounded-full flex items-center justify-center mb-4 mx-auto service-icon">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-[var(--accent)]">Taglio Classico</h3>
                <p className="text-center text-[var(--text-primary)] opacity-90">
                  Esperienza di taglio tradizionale con prodotti di alta qualità e attenzione ai dettagli.
                </p>
              </div>

              {/* Servizio 2 */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-6 shadow-lg hover-scale transform hover:-translate-y-1 transition-all duration-300 service-card">
                <div className="w-16 h-16 bg-[var(--accent)] text-white rounded-full flex items-center justify-center mb-4 mx-auto service-icon">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-[var(--accent)]">Barba e Baffi</h3>
                <p className="text-center text-[var(--text-primary)] opacity-90">
                  Rifinitura e modellatura professionale con trattamenti specifici per la cura della barba.
                </p>
              </div>

              {/* Servizio 3 */}
              <div className="bg-[var(--bg-primary)] rounded-lg p-6 shadow-lg hover-scale transform hover:-translate-y-1 transition-all duration-300 service-card">
                <div className="w-16 h-16 bg-[var(--accent)] text-white rounded-full flex items-center justify-center mb-4 mx-auto service-icon">
                  <Scissors className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-[var(--accent)]">Trattamenti Speciali</h3>
                <p className="text-center text-[var(--text-primary)] opacity-90">
                  Massaggi, trattamenti con asciugamani caldi e prodotti esclusivi per un'esperienza premium.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-16 bg-[var(--bg-primary)]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--accent)]">
              Pronto a rinnovare il tuo look?
            </h2>
            <p className="text-xl text-[var(--text-primary)] opacity-90 mb-8">
              Prenota subito un appuntamento e affidati ai nostri esperti barbieri
            </p>
            <Link
              to={user ? "/booking" : "/guest-booking"}
              className="inline-block bg-[var(--accent)] hover:opacity-90 text-white font-bold py-4 px-10 rounded-lg shadow-lg transition-all duration-300 hover-glow button-3d"
            >
              Prenota Ora
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-[var(--bg-secondary)] border-t border-gray-700">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-[var(--accent)] mb-2">Your Style Barber Studio</h3>
                <p className="text-[var(--text-primary)] opacity-70">
                  © {new Date().getFullYear()} Tutti i diritti riservati.
                </p>
              </div>

              <div className="flex flex-wrap justify-center space-x-4">
                <a href="#" className="text-[var(--accent)] hover:opacity-80 transition-opacity">Privacy</a>
                <a href="#" className="text-[var(--accent)] hover:opacity-80 transition-opacity">Termini</a>
                <a href="#" className="text-[var(--accent)] hover:opacity-80 transition-opacity">Contatti</a>
              </div>

              <div className="mt-4 md:mt-0">
                <div className="flex space-x-4">
                  <a href="#" className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  // Componente avvolto per prevenire sfarfallio
  const RouteWrapper = ({ children }) => (
    <div className={`w-full transition-opacity duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );

  return (
    <TimezoneProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] theme-transition">
        {appReady ? (
          <>
            <Navbar onThemeToggle={toggleTheme} isDark={theme === 'dark'} />
            <main className="navbar-offset stabilize-render content-stable">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Route pubbliche */}
                  <Route
                    path="/guest-booking"
                    element={
                      <RouteWrapper>
                        <GuestBooking />
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <RouteWrapper>
                        {user ? <Navigate to="/" replace /> : <Login />}
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <RouteWrapper>
                        {user ? <Navigate to="/" replace /> : <Register />}
                      </RouteWrapper>
                    }
                  />

                  {/* Route protette */}
                  <Route
                    path="/booking"
                    element={
                      <RouteWrapper>
                        {user ? <BookingCalendar /> : <Navigate to="/login" replace />}
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="/waiting-list"
                    element={
                      <RouteWrapper>
                        {user ? <WaitingList /> : <Navigate to="/login" replace />}
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <RouteWrapper>
                        {user?.role === 'admin' ? (
                          <AdminDashboard />
                        ) : (
                          <Navigate to="/" replace />
                        )}
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="/barber"
                    element={
                      <RouteWrapper>
                        {user?.role === 'barber' || user?.role === 'admin' ? (
                          <BarberDashboard />
                        ) : (
                          <Navigate to="/" replace />
                        )}
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RouteWrapper>
                        {user ? <UserProfile /> : <Navigate to="/login" replace />}
                      </RouteWrapper>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <RouteWrapper>
                        <HomePage />
                      </RouteWrapper>
                    }
                  />
                </Routes>
              </Suspense>
            </main>
          </>
        ) : (
          // Visualizza uno spinner mentre l'app si inizializza
          <LoadingSpinner />
        )}
      </div>
    </TimezoneProvider>
  );
}

export default App;
