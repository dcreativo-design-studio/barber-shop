import { BarChart2, Calendar, ClipboardList, Clock, Scissors, Users } from 'lucide-react';
import React, { useState } from 'react';
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

  // Verifica se l'utente è admin
  if (user?.role !== 'admin') {
    return (
      <div className="text-center p-8">
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 pt-20 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--accent)] mb-8">
          Pannello Amministrativo
        </h1>

        {/* Tabs - versione migliorata */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              activeTab === 'appointments'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            <span>Appuntamenti</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              activeTab === 'services'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Scissors className="w-4 h-4 mr-2" />
            <span>Servizi</span>
          </button>
          <button
            onClick={() => setActiveTab('barbers')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              activeTab === 'barbers'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            <span>Barbieri</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            <span>Utenti</span>
          </button>
          <button
            onClick={() => setActiveTab('waitinglist')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              activeTab === 'waitinglist'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            <span>Lista d'attesa</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              activeTab === 'stats'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
            }`}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            <span>Statistiche</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
