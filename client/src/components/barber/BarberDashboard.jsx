import { Calendar, Clipboard, Clock, Scissors, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { barberApi } from '../../config/barberApi';
import { useAuth } from '../../context/AuthContext';
import BarberAppointments from './BarberAppointments';
import BarberProfile from './BarberProfile';
import BarberSchedule from './BarberSchedule';
import BarberServices from './BarberServices';
import BarberStats from './BarberStats';

function BarberDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const { user, logout } = useAuth();
  const [barberId, setBarberId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contentVisible, setContentVisible] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const fetchBarberDetails = async () => {
      try {
        setLoading(true);
        setError('');

        // Verifica che l'utente sia un barbiere o admin
        if (!user) {
          setError('Utente non autenticato.');
          return;
        }

        if (user?.role !== 'barber' && user?.role !== 'admin') {
          setError('Accesso non autorizzato. Questa pagina è riservata ai barbieri e agli amministratori.');
          return;
        }

        // Se l'utente è admin, può accedere senza barberId
        if (user?.role === 'admin') {
          setBarberId('admin-view');
          return;
        }

        if (user?.barberId) {
          console.log("Usando barberId esistente:", user.barberId);
          setBarberId(user.barberId);
        } else {
          // Se il barberId non è ancora collegato all'utente, cerca il barbiere per email
          console.log("Cercando barbiere per email:", user.email);
          try {
            const data = await barberApi.findBarberByEmail(user.email);
            console.log("Risposta findBarberByEmail:", data);

            if (data?._id || data?.id) {
              setBarberId(data._id || data.id);
            } else {
              console.error('Nessun ID barbiere trovato nella risposta:', data);
              setError('Impossibile trovare il profilo barbiere associato a questo account.');
            }
          } catch (findError) {
            console.error('Error in findBarberByEmail:', findError);
            if (findError.response) {
              console.error('Response error:', findError.response.data);
              setError(`Errore nel recupero dei dati del barbiere: ${findError.response.data.message || findError.message}`);
            } else {
              setError('Errore nel recupero dei dati del barbiere per email.');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching barber details:', err);
        setError('Si è verificato un errore nel caricamento dei dati.');
      } finally {
        setLoading(false);
        // Segnala che il caricamento iniziale è completo
        setInitialLoadComplete(true);

        // Aggiungi un breve ritardo per l'animazione di fade-in
        setTimeout(() => {
          setContentVisible(true);
        }, 50);
      }
    };

    if (user) {
      fetchBarberDetails();
    }
  }, [user]);

  const renderContent = () => {
    if (loading && !initialLoadComplete) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500/20 border border-red-500 text-red-500 p-6 rounded-lg my-4">
          <h3 className="text-xl font-bold mb-2">Errore</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={logout}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      );
    }

    if (!barberId && user?.role !== 'admin') {
      return (
        <div className="text-center p-8 bg-[var(--bg-secondary)] rounded-lg">
          <h2 className="text-2xl text-red-500 mb-4">Profilo barbiere non trovato</h2>
          <p className="text-[var(--text-primary)] mb-6">
            Non è stato possibile trovare un profilo barbiere associato al tuo account.
            Contatta l'amministratore per assistenza.
          </p>
          <button
            onClick={logout}
            className="bg-[var(--accent)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      );
    }

    // Usa barberId o 'admin-view' per gli admin
    const effectiveBarberId = barberId || 'admin-view';

    switch (activeTab) {
      case 'appointments':
        return <BarberAppointments barberId={effectiveBarberId} />;
      case 'schedule':
        return <BarberSchedule barberId={effectiveBarberId} />;
      case 'services':
        return <BarberServices barberId={effectiveBarberId} />;
      case 'profile':
        return <BarberProfile barberId={effectiveBarberId} />;
      case 'stats':
        return <BarberStats barberId={effectiveBarberId} />;
      default:
        return <BarberAppointments barberId={effectiveBarberId} />;
    }
  };

  return (
    <div
      className={`min-h-screen bg-[var(--bg-primary)] p-6 pt-20 transition-opacity duration-300 ${
        contentVisible ? 'opacity-100' : 'opacity-0'
      } prevent-tilt`}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--accent)] mb-8 flex items-center">
          <Scissors className="mr-3 h-7 w-7" />
          Pannello Barbiere
          {user && (
            <span className="text-lg ml-3 opacity-70 font-normal">
              {user.firstName} {user.lastName}
            </span>
          )}
        </h1>

        {/* Tabs con miglioramenti */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'appointments'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Calendar className="w-5 h-5 mr-2" />
            <span>Appuntamenti</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'schedule'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Clock className="w-5 h-5 mr-2" />
            <span>Orari e Vacanze</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'services'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Scissors className="w-5 h-5 mr-2" />
            <span>Servizi</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'stats'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Clipboard className="w-5 h-5 mr-2" />
            <span>Statistiche</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'profile'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <User className="w-5 h-5 mr-2" />
            <span>Profilo</span>
          </button>
        </div>

        {/* Content con fade in */}
        <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6 panel-container transition-all duration-200">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default BarberDashboard;
