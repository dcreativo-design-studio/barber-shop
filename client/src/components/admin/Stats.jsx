import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid,
  Cell,
  Legend, Line, LineChart,
  Pie,
  PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { adminApi } from '../../config/adminApi';

// Colori per i grafici a torta
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Stats() {
  const [stats, setStats] = useState({
    appointmentsByMonth: [],
    revenueByMonth: [],
    serviceStats: [],
    peakHours: [], // Nuovo
    barberPerformance: [], // Nuovo
    customerRetention: [], // Nuovo
    loading: true,
    error: '',
    selectedTimeframe: 'month' // Nuovo: per filtrare i dati
  });

  useEffect(() => {
    fetchStats();
  }, [stats.selectedTimeframe]); // Aggiunto selectedTimeframe come dipendenza

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: '' }));

      const response = await adminApi.getStats(stats.selectedTimeframe);
      console.log('Received stats:', response);

      // Formatta i dati per i grafici
      const formattedStats = {
        appointmentsByMonth: response.appointmentsByMonth.map(item => ({
          name: item.month,
          Appuntamenti: item.count
        })),
        revenueByMonth: response.revenueByMonth.map(item => ({
          name: item.month,
          Ricavi: item.revenue
        })),
        serviceStats: response.serviceStats,
        peakHours: response.peakHours,
        customerRetention: response.customerRetention
      };

      setStats(prev => ({
        ...prev,
        ...formattedStats,
        loading: false,
        error: ''
      }));
    } catch (error) {
      console.error('Error in fetchStats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nel caricamento delle statistiche. Riprova più tardi.'
      }));
    }
  };
  // Funzione per ottenere il titolo corretto per periodo nei grafici
  const getPeriodTitle = () => {
    switch(stats.selectedTimeframe) {
      case 'week':
        return 'Settimana';
      case 'month':
        return 'Mese';
      case 'year':
        return 'Anno';
      default:
        return 'Mese';
    }
  };
  // Nuove funzioni helper per i calcoli


  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
          <p className="mt-4 text-[var(--text-primary)]">Caricamento statistiche...</p>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="bg-red-500 text-white p-4 rounded-lg shadow">
        <h3 className="font-bold mb-2">Errore</h3>
        <p>{stats.error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 bg-white text-red-500 px-4 py-2 rounded hover:bg-red-100 transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--accent)]">Statistiche</h2>
        <div className="flex gap-4">
          <select
            value={stats.selectedTimeframe}
            onChange={(e) => setStats(prev => ({ ...prev, selectedTimeframe: e.target.value }))}
            className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--accent)]"
          >
            <option value="week">Questa settimana</option>
            <option value="month">Questo mese</option>
            <option value="year">Quest'anno</option>
          </select>
          <button
            onClick={fetchStats}
            className="bg-[var(--accent)] text-white px-4 py-2 rounded hover:opacity-90"
          >
            Aggiorna
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-2">Appuntamenti Totali</h3>
          <p className="text-3xl font-bold text-[var(--accent)]">
            {stats.appointmentsByMonth.reduce((acc, curr) => acc + curr.Appuntamenti, 0)}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-2">Ricavo Totale</h3>
          <p className="text-3xl font-bold text-[var(--accent)]">
            CHF {stats.revenueByMonth.reduce((acc, curr) => acc + curr.Ricavi, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold mb-2">Cliente Fidelizzati</h3>
          <p className="text-3xl font-bold text-[var(--accent)]">
            {stats.customerRetention.reduce((acc, curr) => curr.name !== '1 visita' ? acc + curr.value : acc, 0)}
          </p>
        </div>
      </div>

      {/* Grafici esistenti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appuntamenti per Periodo */}
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            {`Appuntamenti per ${getPeriodTitle()}`}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.appointmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Appuntamenti" stroke="var(--accent)" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ricavi per Periodo */}
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            {`Ricavi per ${getPeriodTitle()}`}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `CHF ${value}`} />
                <Legend />
                <Line type="monotone" dataKey="Ricavi" stroke="#4CAF50" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fasce Orarie Popolari (Nuovo) */}
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Fasce Orarie Popolari</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="var(--accent)" name="Appuntamenti" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fidelizzazione Clienti (Nuovo) */}
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Fidelizzazione Clienti</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.customerRetention}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats.customerRetention.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popolarità Servizi (esistente) */}
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Popolarità Servizi</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.serviceStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="var(--accent)" name="Prenotazioni" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
