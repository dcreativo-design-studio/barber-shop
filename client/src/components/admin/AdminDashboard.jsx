import { BarChart2, Calendar, Clipboard, Clock, Scissors, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppointmentCalendar from './AppointmentCalendar';
import BarberManager from './BarberManager';
import ServiceManager from './ServiceManager';
import Stats from './Stats';
import UserManager from './UserManager';
import WaitingListManager from './WaitingListManager';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  // Previene il flickering al caricamento iniziale
  useEffect(() => {
    // Breve timeout per permettere al DOM di renderizzarsi correttamente
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Aggiungi un piccolo ritardo per l'effetto di fade in
      setTimeout(() => {
        setContentVisible(true);
      }, 50);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Verifica se l'utente è admin
  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8 animate-fade-in">
        <h2 className="text-2xl text-red-500">Accesso non autorizzato</h2>
        <p className="text-gray-300">Devi essere un amministratore per accedere a questa pagina.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return <AppointmentCalendar />;
      case 'services':
        return <ServiceManager />;
      case 'users':
        return <UserManager />;
      case 'barbers':
        return <BarberManager />;
      case 'waitinglist':
        return <WaitingListManager />;
      case 'stats':
        return <Stats />;
      default:
        return <AppointmentCalendar />;
    }
  };

  // Mostra uno spinner durante il caricamento
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[var(--bg-primary)] p-6 pt-20 transition-opacity duration-300 ${
        contentVisible ? 'opacity-100' : 'opacity-0'
      } admin-panel-container prevent-tilt`}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--accent)] mb-8 flex items-center">
          <Clipboard className="mr-2 h-8 w-8" />
          Pannello Amministrativo
        </h1>

        {/* Tabs - versione migliorata con icone */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
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
            onClick={() => setActiveTab('barbers')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'barbers'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            <span>Barbieri</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'users'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            <span>Utenti</span>
          </button>
          <button
            onClick={() => setActiveTab('waitinglist')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'waitinglist'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Clock className="w-5 h-5 mr-2" />
            <span>Lista d'attesa</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center px-4 py-3 rounded-lg transition-all tab-button ${
              activeTab === 'stats'
                ? 'bg-[var(--accent)] text-white active'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <BarChart2 className="w-5 h-5 mr-2" />
            <span>Statistiche</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6 panel-container transition-all duration-200">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
