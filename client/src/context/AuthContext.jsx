import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../config/api';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minuti
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minuti

// Lista delle route pubbliche che non richiedono autenticazione
const PUBLIC_ROUTES = ['/', '/login', '/register', '/guest-booking'];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  // Aggiungi un riferimento per prevenire renderizzazioni multiple
  const isInitialized = useRef(false);
  const refreshTokenTimeoutRef = useRef(null);
  const sessionTimeoutRef = useRef(null);

  // Memoizza le funzioni per evitare di ricrearle a ogni render
  const isPublicRoute = useCallback((path) => PUBLIC_ROUTES.includes(path), []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!isPublicRoute(location.pathname)) {
      navigate('/login');
    }
  }, [navigate, location.pathname, isPublicRoute]);

  // Carica utente dal localStorage all'avvio
  useEffect(() => {
    const checkAuth = async () => {
      // Evita check multipli durante la navigazione
      if (isInitialized.current && user) {
        return;
      }

      if (isPublicRoute(location.pathname)) {
        setLoading(false);
        return;
      }

      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser && token) {
          const response = await apiRequest.get('/auth/me');
          // Imposta lo stato solo se è cambiato, evitando render inutili
          if (JSON.stringify(response) !== JSON.stringify(user)) {
            setUser(response);
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      } finally {
        setLoading(false);
        isInitialized.current = true;
      }
    };

    checkAuth();
  }, [location.pathname, isPublicRoute, handleLogout, navigate, user]);

  // Gestione del timeout di sessione solo per utenti autenticati
  useEffect(() => {
    if (!user) return;

    const checkTimeout = () => {
      if (Date.now() - lastActivity > TIMEOUT_DURATION) {
        handleLogout();
      }
    };

    // Pulisci il timeout precedente
    if (sessionTimeoutRef.current) {
      clearInterval(sessionTimeoutRef.current);
    }

    sessionTimeoutRef.current = setInterval(checkTimeout, 1000);
    return () => {
      if (sessionTimeoutRef.current) {
        clearInterval(sessionTimeoutRef.current);
      }
    };
  }, [user, lastActivity, handleLogout]);

  // Aggiorna lastActivity solo per utenti autenticati
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => setLastActivity(Date.now());

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, [user]);

  // Refresh token solo per utenti autenticati
  useEffect(() => {
    if (!user) return;

    const refreshToken = async () => {
      try {
        const response = await apiRequest.post('/auth/refresh-token');
        localStorage.setItem('token', response.token);

        // Evita aggiornamenti non necessari dello stato
        if (JSON.stringify(response.user) !== JSON.stringify(user)) {
          setUser(response.user);
        }
      } catch (error) {
        if (error.response?.status === 401 && !isPublicRoute(location.pathname)) {
          handleLogout();
        }
      }
    };

    // Pulisci l'intervallo precedente
    if (refreshTokenTimeoutRef.current) {
      clearInterval(refreshTokenTimeoutRef.current);
    }

    refreshTokenTimeoutRef.current = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
    return () => {
      if (refreshTokenTimeoutRef.current) {
        clearInterval(refreshTokenTimeoutRef.current);
      }
    };
  }, [user, location.pathname, isPublicRoute, handleLogout]);

  // Memoizza anche questa funzione
  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setLastActivity(Date.now());
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  // Evita ri-renderizzazioni memoizzando il valore del contesto
  const contextValue = {
    user,
    login,
    logout: handleLogout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
